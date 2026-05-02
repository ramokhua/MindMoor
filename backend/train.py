"""
train.py — standalone fine-tuning script for Moira.

Usage:
    python train.py \
        --model facebook/blenderbot-400M-distill \
        --data ./data/training_data.jsonl \
        --output ./models/moira-finetuned \
        --epochs 3 \
        --batch-size 4 \
        --use-lora
"""
import argparse
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
logger = logging.getLogger(__name__)


def parse_args():
    p = argparse.ArgumentParser(description="Fine-tune Moira chatbot")
    p.add_argument("--model",      default="facebook/blenderbot-400M-distill")
    p.add_argument("--data",       default="./data/training_data.jsonl")
    p.add_argument("--output",     default="./models/moira-finetuned")
    p.add_argument("--epochs",     type=int,   default=3)
    p.add_argument("--batch-size", type=int,   default=4)
    p.add_argument("--lr",         type=float, default=5e-5)
    p.add_argument("--max-len",    type=int,   default=128)
    p.add_argument("--use-lora",   action="store_true")
    return p.parse_args()


def main():
    args = parse_args()
    logger.info(f"Config: {vars(args)}")

    import torch
    from transformers import (
        AutoTokenizer, AutoModelForSeq2SeqLM,
        Seq2SeqTrainer, Seq2SeqTrainingArguments,
        DataCollatorForSeq2Seq,
    )
    from datasets import load_dataset

    # ── Load model & tokenizer ──────────────────────────────────────────────────
    logger.info(f"Loading base model: {args.model}")
    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model     = AutoModelForSeq2SeqLM.from_pretrained(args.model)

    # ── Optional LoRA ───────────────────────────────────────────────────────────
    if args.use_lora:
        from peft import get_peft_model, LoraConfig, TaskType
        lora_cfg = LoraConfig(
            task_type=TaskType.SEQ_2_SEQ_LM,
            r=16, lora_alpha=32, lora_dropout=0.1,
            target_modules=["q_proj", "v_proj"],
        )
        model = get_peft_model(model, lora_cfg)
        model.print_trainable_parameters()

    # ── Load & tokenise dataset ─────────────────────────────────────────────────
    logger.info(f"Loading dataset: {args.data}")
    raw_ds = load_dataset("json", data_files=args.data, split="train")

    def tokenize(examples):
        model_in  = tokenizer(examples["input"],  max_length=args.max_len, truncation=True, padding="max_length")
        model_out = tokenizer(examples["output"], max_length=args.max_len, truncation=True, padding="max_length")
        # Replace padding token IDs in labels with -100 so they're ignored in loss
        labels = [
            [(l if l != tokenizer.pad_token_id else -100) for l in label]
            for label in model_out["input_ids"]
        ]
        model_in["labels"] = labels
        return model_in

    ds = raw_ds.map(tokenize, batched=True, remove_columns=raw_ds.column_names)
    logger.info(f"Dataset size: {len(ds)} examples")

    # ── Training arguments ──────────────────────────────────────────────────────
    Path(args.output).mkdir(parents=True, exist_ok=True)

    training_args = Seq2SeqTrainingArguments(
        output_dir=args.output,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        learning_rate=args.lr,
        warmup_ratio=0.1,
        weight_decay=0.01,
        save_strategy="epoch",
        logging_steps=5,
        predict_with_generate=True,
        fp16=torch.cuda.is_available(),
        report_to="none",
        load_best_model_at_end=False,
    )

    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=ds,
        tokenizer=tokenizer,
        data_collator=DataCollatorForSeq2Seq(tokenizer, model=model, padding=True),
    )

    # ── Train ───────────────────────────────────────────────────────────────────
    logger.info("🚀 Starting fine-tuning…")
    trainer.train()

    # ── Save ────────────────────────────────────────────────────────────────────
    logger.info(f"💾 Saving to {args.output}")
    model.save_pretrained(args.output)
    tokenizer.save_pretrained(args.output)
    logger.info("✅ Done! Your fine-tuned Moira model is ready.")
    logger.info(f"   Set FINE_TUNED_DIR={args.output} in your .env to use it.")


if __name__ == "__main__":
    main()