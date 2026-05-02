# MindMoor — React + Flask Rebuild

A modular React frontend with a Python Flask backend powering the Moira AI chatbot (fine-tuned HuggingFace model).

---

## Project Structure

```
mindmoor/
├── frontend/                  # React (Vite) app
│   ├── src/
│   │   ├── App.jsx            # Router root
│   │   ├── components/
│   │   │   ├── layout/        # Header, nav, footer
│   │   │   └── pages/         # One file per page
│   │   └── styles/globals.css # Design tokens + shared styles
│   └── vite.config.js         # Dev proxy → Flask :5000
│
└── backend/                   # Flask API
    ├── app.py                 # App factory
    ├── routes/
    │   ├── chat.py            # POST /api/chat
    │   ├── health.py          # GET  /api/health
    │   └── training.py        # POST /api/training/start|upload
    ├── models/
    │   └── model_loader.py    # Lazy model singleton
    ├── utils/
    │   ├── prompt.py          # Prompt builder + cleaner
    │   └── safety.py          # Crisis detection
    ├── train.py               # Standalone fine-tuning script
    └── data/
        └── training_data.jsonl  # Seed training examples
```

---

## Quick Start

### 1. Frontend

```bash
cd frontend
npm install
npm run dev          # → http://localhost:3000
```

### 2. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                              # edit as needed
python app.py        # → http://localhost:5000
```

> The first `/api/chat` request will download the base model (~700 MB for BlenderBot-400M).
> Subsequent requests use the cached model.

---

## Fine-Tuning Moira

### Option A — Command line (recommended)

```bash
cd backend

# 1. Add your training data (JSONL: {"input": "...", "output": "..."})
#    A seed file is already at data/training_data.jsonl

# 2. Run fine-tuning (LoRA keeps VRAM under 6 GB)
python train.py \
  --model facebook/blenderbot-400M-distill \
  --data  ./data/training_data.jsonl \
  --output ./models/moira-finetuned \
  --epochs 3 \
  --use-lora

# 3. Set env var and restart Flask — it auto-loads the fine-tuned model
export FINE_TUNED_DIR=./models/moira-finetuned
python app.py
```

### Option B — API (trigger from your app)

```bash
# Upload data
curl -X POST http://localhost:5000/api/training/upload \
     -H "Content-Type: application/json" \
     -d '[{"input":"I feel anxious","output":"I hear you..."}]'

# Start training
curl -X POST http://localhost:5000/api/training/start \
     -H "Content-Type: application/json" \
     -d '{"epochs": 3, "use_lora": true}'

# Poll status
curl http://localhost:5000/api/training/status
```

---

## Training Data Format

Each line in `training_data.jsonl`:
```json
{"input": "user message", "output": "Moira's ideal response"}
```

Tips for quality data:
- 100+ diverse examples minimum
- Cover: anxiety, depression, stress, loneliness, anger, sleep issues
- Keep Moira's tone: warm, concise, non-diagnostic, empathetic

---

## Adding a New Page

1. Create `frontend/src/components/pages/MyPage.jsx` + `MyPage.css`
2. Add a route in `App.jsx`:  `<Route path="mypage" element={<MyPage />} />`
3. Add a nav link in `Layout.jsx` if needed

---

## Environment Variables (backend)

| Variable            | Default                                | Description |
|---------------------|----------------------------------------|-------------|
| `BASE_MODEL`        | `facebook/blenderbot-400M-distill`     | HuggingFace model ID |
| `FINE_TUNED_DIR`    | `./models/moira-finetuned`             | Local fine-tuned model path |
| `MAX_NEW_TOKENS`    | `200`                                  | Max response length |
| `MODEL_TEMPERATURE` | `0.75`                                 | Sampling temperature |
| `RATE_LIMIT`        | `30`                                   | Requests per window per IP |
| `RATE_WINDOW`       | `60`                                   | Window in seconds |
| `FRONTEND_URL`      | `http://localhost:3000`                | CORS origin |

---

## Deployment

- **Frontend** → Netlify / Vercel: `npm run build` → deploy `dist/`
- **Backend** → Railway / Render / Fly.io: `gunicorn app:create_app()`
- Update `FRONTEND_URL` in `.env` and the `proxy` target in `vite.config.js` → `VITE_API_URL`