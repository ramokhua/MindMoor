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
│   ├── package.json
│   ├── vite.config.js         # Vite config
│   └── .nvmrc                 # Node version lock
│
├── backend/                   # Flask API
│   ├── app.py                 # App factory
│   ├── routes/
│   │   ├── chat.py            # POST /api/chat
│   │   ├── health.py          # GET  /api/health
│   │   └── training.py        # POST /api/training/start|upload
│   ├── models/
│   │   └── model_loader.py    # Lazy model singleton
│   ├── utils/
│   │   ├── prompt.py          # Prompt builder + cleaner
│   │   └── safety.py          # Crisis detection
│   ├── train.py               # Standalone fine-tuning script
│   ├── requirements.txt
│   ├── .env.example
│   └── data/
│       └── training_data.jsonl  # Seed training examples
│
├── netlify.toml               # Netlify deployment config
├── vercel.json                # Vercel deployment config
├── render.yaml                # Render deployment config
└── README.md
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

### Frontend (React + Vite)

#### **Vercel** (Recommended for React)
- Automatic deployments from `main` branch
- **Settings:**
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Root Directory: `frontend`
  - Install Command: `npm install`
- Environment variables: `VITE_API_URL` → your backend URL

#### **Netlify** (Alternative)
- Auto-detects `netlify.toml` in repo root
- **Settings:**
  - Build command: `npm run build` (base: frontend)
  - Publish directory: `dist`
- Environment variables: `VITE_API_URL` → your backend URL

#### **Production Build (local)**
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Backend (Flask + Gunicorn)

#### **Render** (Recommended for Python)
- Connect repo, select `backend` as root directory
- **Settings:**
  - Build command: `pip install -r requirements.txt`
  - Start command: `gunicorn -w 4 -b 0.0.0.0 app:create_app()`
  - Runtime: Python 3.9+
- Environment variables: Add all from `.env.example`

#### **Railway / Fly.io** (Alternatives)
- Similar setup, ensure `gunicorn` is in `requirements.txt`
- Set `PORT` env var (usually auto-detected)

#### **Production Check (local)**
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0 app:create_app()
# Test: curl http://localhost:8000/api/health
```

---

## Deployment Checklist

- [ ] **Frontend**
  - [ ] `.nvmrc` specifies Node 18.x
  - [ ] `npm run build` creates `frontend/dist/`
  - [ ] `VITE_API_URL` env var points to backend
  - [ ] Netlify/Vercel config file present (`netlify.toml` or `vercel.json`)

- [ ] **Backend**
  - [ ] `requirements.txt` includes `gunicorn`
  - [ ] `.env.example` documents all env vars
  - [ ] `FRONTEND_URL` env var set in production
  - [ ] `app.py` uses `create_app()` factory pattern
  - [ ] Render/Railway/Fly.io config file present (`render.yaml`, etc.)

- [ ] **Repository**
  - [ ] `node_modules/` is **not** committed (check `.gitignore`)
  - [ ] `venv/` is **not** committed
  - [ ] `.env` files are **not** committed
  - [ ] `frontend/dist/` is **not** committed

---

## Troubleshooting Deployments

### Netlify: "frontend/dist does not exist"
- ✅ Ensure `netlify.toml` has `base = "frontend"` and `publish = "dist"`
- ✅ Run `npm run build` locally and verify `frontend/dist/` is created
- ✅ Check Node version: should be 18.x (use `.nvmrc`)

### Vercel: Build fails
- ✅ Check `vercel.json` has `root: "frontend"`
- ✅ Run `cd frontend && npm run build` locally first
- ✅ Verify `outputDirectory: "dist"` (not `frontend/dist`)

### Render: Backend won't start
- ✅ Ensure `render.yaml` has `startCommand: gunicorn -w 4 -b 0.0.0.0 app:create_app()`
- ✅ Check all env vars are set in Render dashboard
- ✅ Verify `FRONTEND_URL` matches your frontend deployment URL

### CORS errors
- ✅ Backend `FRONTEND_URL` must match frontend deployment URL exactly
- ✅ Update in `backend/.env` or platform env var settings

---

## Common Issues

**Q: Netlify says "Build script returned non-zero exit code"**  
A: Check build logs. Usually missing dependencies. Run `npm ci` instead of `npm install` in `netlify.toml`.

**Q: "frontend/node_modules" in git keeps coming back**  
A: Run:
```bash
git rm -r --cached frontend/node_modules
git commit -m "Remove node_modules from tracking"
```

**Q: Backend model downloads are slow / timing out on deploy**  
A: Model downloads (~700 MB) during first request. On Render/Railway, increase build timeout or pre-download models in build step.

---

## Next Steps

1. ✅ Clean repo (remove committed `node_modules`)
2. ✅ Deploy frontend first (Vercel or Netlify)
3. ✅ Deploy backend (Render)
4. ✅ Set `VITE_API_URL` to backend URL in frontend env vars
5. ✅ Set `FRONTEND_URL` to frontend URL in backend env vars
6. ✅ Test `/api/health` endpoint
