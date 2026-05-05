import json
import pandas as pd
from datasets import load_dataset
import random
import re
from pathlib import Path

# Set paths - look in the 'data' subfolder
DATA_DIR = Path(__file__).parent / "data"

print(f"Looking for data in: {DATA_DIR.absolute()}")

# -------------------------------
# 1. LOAD YOUR LOCAL FILES
# -------------------------------

# --- a) intents.json ---
intents_path = DATA_DIR / "intents.json"
if not intents_path.exists():
    print(f"ERROR: {intents_path} not found!")
    print("Make sure your files are in backend/data/")
    exit(1)

with open(intents_path, "r", encoding="utf-8") as f:
    intents_data = json.load(f)

intent_rows = []
for intent in intents_data["intents"]:
    tag = intent["tag"]
    for pattern in intent["patterns"]:
        for response in intent["responses"]:
            if pattern.strip() == "":
                continue
            intent_rows.append({
                "input": pattern.strip(),
                "output": response.strip()
            })

print(f"✅ Loaded {len(intent_rows)} rows from intents.json")

# --- b) Combined Data.csv ---
csv_path = DATA_DIR / "Combined Data.csv"
csv_rows = []
if csv_path.exists():
    try:
        df = pd.read_csv(csv_path)
        for _, row in df.iterrows():
            statement = str(row["statement"]).strip()
            status = str(row["status"]).strip()
            if statement and status and statement != "nan":
                if status == "Anxiety":
                    output = f"I notice you're feeling anxious. Would you like to talk about what's making you feel this way?"
                elif status == "Depression":
                    output = f"It sounds like you're going through a difficult time. I'm here to listen. Would you like to share more?"
                elif status == "Suicidal":
                    output = f"I'm really sorry you're feeling this way. Please know that you matter. Would you like to talk to someone who can help right now?"
                elif status == "Normal":
                    output = f"Thank you for sharing. How are you feeling about that?"
                else:
                    output = f"Tell me more about that."
                csv_rows.append({"input": statement, "output": output})
        print(f"✅ Loaded {len(csv_rows)} rows from Combined Data.csv")
    except Exception as e:
        print(f"⚠️ Error reading CSV: {e}")
else:
    print(f"⚠️ {csv_path} not found, skipping...")

# --- c) training_data.json ---
training_path = DATA_DIR / "training_data.json"
training_rows = []
if training_path.exists():
    try:
        with open(training_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    item = json.loads(line)
                    training_rows.append({
                        "input": item.get("input", ""),
                        "output": item.get("output", "")
                    })
        print(f"✅ Loaded {len(training_rows)} rows from training_data.json")
    except Exception as e:
        print(f"⚠️ Error reading training_data.json: {e}")
else:
    print(f"⚠️ {training_path} not found, skipping...")

# -------------------------------
# 2. LOAD HUGGING FACE DATASETS
# -------------------------------

hf_rows = []

# --- Dataset 1: nbertagnolli/counsel-chat ---
print("\n🔄 Loading counsel-chat from Hugging Face...")
try:
    counsel = load_dataset("nbertagnolli/counsel-chat", split="train")
    counsel_count = 0
    for example in counsel:
        question = example.get("questionText", "").strip()
        answer = example.get("answerText", "").strip()
        if question and answer and len(question) > 10 and len(answer) > 10:
            hf_rows.append({"input": question, "output": answer})
            counsel_count += 1
    print(f"✅ Loaded {counsel_count} rows from counsel-chat")
except Exception as e:
    print(f"⚠️ Could not load counsel-chat: {e}")

# --- Dataset 2: hope_therapy_conversation_transcripts ---
print("\n🔄 Loading hope_therapy_conversation_transcripts from Hugging Face...")
try:
    hope = load_dataset("aizenSosuke/hope_therapy_conversation_transcripts", split="train")
    hope_count = 0
    for example in hope:
        raw_query = example.get("Query", "")
        response = example.get("Response", "")
        
        match = re.search(r"<query>(.*?)</query>", raw_query, re.DOTALL)
        if match:
            user_input = match.group(1).strip()
        else:
            user_input = raw_query.strip()
        
        clean_response = re.sub(r"</?response>", "", response).strip()
        
        if user_input and clean_response and len(user_input) > 5 and len(clean_response) > 5:
            hf_rows.append({"input": user_input, "output": clean_response})
            hope_count += 1
    print(f"✅ Loaded {hope_count} rows from hope_therapy_conversation_transcripts")
except Exception as e:
    print(f"⚠️ Could not load hope_therapy_conversation_transcripts: {e}")

print(f"\n📊 Total rows from Hugging Face datasets: {len(hf_rows)}")

# -------------------------------
# 3. MERGE EVERYTHING
# -------------------------------

all_data = []
all_data.extend(intent_rows)
all_data.extend(csv_rows)
all_data.extend(training_rows)
all_data.extend(hf_rows)

# Remove exact duplicates
unique_data = []
seen = set()
for item in all_data:
    key = (item["input"], item["output"])
    if key not in seen:
        seen.add(key)
        unique_data.append(item)

print(f"\n🎯 Total unique rows after merging: {len(unique_data)}")

# Shuffle
random.shuffle(unique_data)

# -------------------------------
# 4. SAVE TO JSON FILES
# -------------------------------

# Save full dataset
output_file = DATA_DIR / "moira_training_data.json"
with open(output_file, "w", encoding="utf-8") as f:
    for item in unique_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")
print(f"\n💾 Saved full dataset to {output_file}")

# Split into train/val (80/20)
split_idx = int(0.8 * len(unique_data))
train_data = unique_data[:split_idx]
val_data = unique_data[split_idx:]

train_file = DATA_DIR / "moira_train.json"
val_file = DATA_DIR / "moira_val.json"

with open(train_file, "w", encoding="utf-8") as f:
    for item in train_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")

with open(val_file, "w", encoding="utf-8") as f:
    for item in val_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")

print(f"\n📊 Train: {len(train_data)} examples → {train_file}")
print(f"📊 Val: {len(val_data)} examples → {val_file}")
print("\n✅ Done! Your dataset is ready for training Moira.")
print(f"\n📍 Files saved in: {DATA_DIR.absolute()}")