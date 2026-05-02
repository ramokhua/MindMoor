"""
/api/training  –  endpoints to manage fine-tuning

POST /api/training/start   – kick off fine-tuning (async thread)
GET  /api/training/status  – poll progress
POST /api/training/upload  – upload JSONL training data
"""
import os
import json
import threading
import logging
from pathlib import Path
from flask import Blueprint, request, jsonify

logger = logging.getLogger(__name__)
training_bp = Blueprint("training", __name__)

DATA_DIR   = Path(os.getenv("TRAINING_DATA_DIR", "./data"))
MODELS_DIR = Path(os.getenv("FINE_TUNED_DIR", "./models/moira-finetuned"))

_training_status = {"running": False, "progress": 0, "message": "Idle", "error": None}


# ── Upload training data ───────────────────────────────────────────────────────
@training_bp.route("/training/upload", methods=["POST"])
def upload_data():
    """
    Accepts JSONL file or raw JSON array.
    Each line should be: {"input": "user text", "output": "moira reply"}
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    dest = DATA_DIR / "training_data.jsonl"

    if "file" in request.files:
        f = request.files["file"]
        f.save(dest)
        return jsonify({"message": f"Saved {dest.name}"})

    raw = request.get_json(silent=True)
    if isinstance(raw, list):
        with open(dest, "w") as fh:
            for item in raw:
                fh.write(json.dumps(item) + "\n")
        return jsonify({"message": f"Saved {len(raw)} examples to {dest.name}"})

    return jsonify({"error": "Send a JSONL file or a JSON array."}), 400


# ── Start fine-tuning ──────────────────────────────────────────────────────────
@training_bp.route("/training/start", methods=["POST"])
def start_training():
    global _training_status

    if _training_status["running"]:
        return jsonify({"error": "Training already in progress."}), 409

    config = request.get_json(silent=True) or {}
    epochs      = int(config.get("epochs", 3))
    batch_size  = int(config.get("batch_size", 4))
    lr          = float(config.get("learning_rate", 5e-5))
    use_lora    = bool(config.get("use_lora", True))   # LoRA keeps VRAM low

    thread = threading.Thread(
        target=_run_training,
        kwargs=dict(epochs=epochs, batch_size=batch_size, lr=lr, use_lora=use_lora),
        daemon=True,
    )
    thread.start()

    return jsonify({"message": "Training started", "config": {
        "epochs": epochs, "batch_size": batch_size,
        "learning_rate": lr, "use_lora": use_lora,
    }})


# ── Poll status ────────────────────────────────────────────────────────────────
@training_bp.route("/training/status", methods=["GET"])
def training_status():
    return jsonify(_training_status)


# ── Background fine-tuning task ────────────────────────────────────────────────
def _run_training(epochs: int, batch_size: int, lr: float, use_lora: bool):
    global _training_status
    _training_status = {"running": True, "progress": 0, "message": "Loading base model…", "error": None}

    try:
        import torch
        from transformers import (
            AutoTokenizer, AutoModelForSeq2SeqLM,
            Seq2SeqTrainer, Seq2SeqTrainingArguments,
            DataCollatorForSeq2Seq,
        )
        from datasets import load_dataset

        base_model = os.getenv("BASE_MODEL", "facebook/blenderbot-400M-distill")
        data_path  = str(DATA_DIR / "training_data.jsonl")

        _training_status["message"] = f"Loading model: {base_model}"
        tokenizer = AutoTokenizer.from_pretrained(base_model)
        model     = AutoModelForSeq2SeqLM.from_pretrained(base_model)

        # Optional LoRA for memory-efficient fine-tuning
        if use_lora:
            from peft import get_peft_model, LoraConfig, TaskType
            lora_cfg = LoraConfig(
                task_type=TaskType.SEQ_2_SEQ_LM,
                r=16, lora_alpha=32, lora_dropout=0.1,
                target_modules=["q_proj", "v_proj"],
            )
            model = get_peft_model(model, lora_cfg)
            logger.info("LoRA applied")

        _training_status.update({"progress": 10, "message": "Loading dataset…"})
        raw_ds = load_dataset("json", data_files=data_path, split="train")

        def tokenize(example):
            model_in  = tokenizer(example["input"],  max_length=128, truncation=True, padding="max_length")
            model_out = tokenizer(example["output"], max_length=128, truncation=True, padding="max_length")
            model_in["labels"] = model_out["input_ids"]
            return model_in

        ds = raw_ds.map(tokenize, batched=True, remove_columns=raw_ds.column_names)

        _training_status.update({"progress": 20, "message": "Starting training…"})
        MODELS_DIR.mkdir(parents=True, exist_ok=True)

        args = Seq2SeqTrainingArguments(
            output_dir=str(MODELS_DIR),
            num_train_epochs=epochs,
            per_device_train_batch_size=batch_size,
            learning_rate=lr,
            warmup_steps=50,
            save_strategy="epoch",
            logging_steps=10,
            predict_with_generate=True,
            fp16=torch.cuda.is_available(),
            report_to="none",
        )

        trainer = Seq2SeqTrainer(
            model=model,
            args=args,
            train_dataset=ds,
            tokenizer=tokenizer,
            data_collator=DataCollatorForSeq2Seq(tokenizer, model=model),
        )

        # Patch trainer to update our status
        original_log = trainer.log
        def patched_log(logs, **kwargs):
            original_log(logs, **kwargs)
            if "epoch" in logs:
                pct = min(90, 20 + int((logs["epoch"] / epochs) * 70))
                _training_status.update({"progress": pct, "message": f"Epoch {logs['epoch']:.1f}/{epochs}"})

        trainer.log = patched_log

        trainer.train()

        model.save_pretrained(str(MODELS_DIR))
        tokenizer.save_pretrained(str(MODELS_DIR))

        # Reload the model in the chat pipeline
        from models import model_loader
        model_loader._pipeline = None   # force reload on next request

        _training_status.update({"running": False, "progress": 100, "message": "✅ Training complete. Model reloaded."})

    except Exception as exc:
        logger.error(f"Training failed: {exc}", exc_info=True)
        _training_status.update({"running": False, "progress": 0, "message": "Failed", "error": str(exc)})