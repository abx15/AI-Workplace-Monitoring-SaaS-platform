# 🚀 AI Workplace Monitoring - Deployment & Run Guide

Ye document aapko locally project run karne aur production (Render/Vercel) par deploy karne ka step-by-step process batayega.

## 💻 1. Locally Kaise Run Karein? (Local Setup)

Local environment mein 3 alag-alag services (Frontend, Backend, AI Service) run karni hoti hain.

### Step 1: Redis Server Start Karein
Backend queues (BullMQ), socket streaming aur scaling ke liye Redis zaroori hai.
- Windows/Mac/Linux me Redis server start karein (`redis-server`).
- Default port (6379) use hoga. (Make sure Redis is running!)

### Step 2: Backend Start Karein (Node.js)
Ek naya terminal kholiye aur run karein:
```bash
cd backend
npm install
npm run dev
```
> Backend `http://localhost:5000` par start ho jayega.

### Step 3: AI Engine Start Karein (Python FastAPI)
Ek aur naya terminal kholiye aur run karein:
```bash
cd ai-service
# Virtual environment set karein (Optional but recommended)
python -m venv venv
venv\Scripts\activate  # (Windows ke liye)
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> AI Service `http://localhost:8000` par start ho jayegi.

### Step 4: Frontend Start Karein (Next.js)
Ek teesra terminal kholiye aur run karein:
```bash
cd frontend
npm install
npm run dev
```
> Frontend `http://localhost:3000` par chalne lagega. Sabhi services aapas connect ho jayengi!

---

## 🌍 2. Render Par Deployment (Production)

Aapne pucha tha ki **Backend** aur **AI Engine** ko Render par kaise deploy karna hai. Ye rahe uske exact steps:

### A Backend (Node.js) on Render
1. Render dashboard par jayein aur **"New -> Web Service"** select karein.
2. Apna GitHub repository connect karein.
3. Settings aise rakhein:
   - **Name**: `ai-monitor-backend`
   - **Root Directory**: `backend` *(Ye check karna bahut zaroori hai!)*
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables (.env)** section mein ye add karein:
   - `NODE_ENV` = `production`
   - `NEON_DATABASE_URL` = `<Aapka Neon DB URL>`
   - `MONGODB_URI` = `<Aapka MongoDB URL>`
   - `JWT_SECRET` = `<Apne secrets dalein>`
   - `JWT_REFRESH_SECRET` = `<Apne secrets dalein>`
   - `INTERNAL_API_KEY` = `internal_secret_123` *(Same key jo AI service mein use hogi)*
   - `REDIS_URL` = `<Render ka Redis URL ya Upstash URL>`
   - `FRONTEND_URL` = `<Aapka Vercel Frontend URL>`
   - `AI_SERVICE_URL` = `<Render AI Engine ka live URL>`

### B AI Engine (Python FastAPI) on Render
1. Phir se **"New -> Web Service"** select karein.
2. Wahi git repo connect karein.
3. Settings aise rakhein:
   - **Name**: `ai-monitor-engine`
   - **Root Directory**: `ai-service` *(Zaroor add karein!)*
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - *(Note: Free tier me machine learning models load hone me time lagta hai ya Out of Memory (OOM) error aa sakta hai. Isliye Render par at least **Starter/Pro Tier** (2GB+ RAM) recommended hai InsightFace aur YOLOv8 ke processing ke liye).*
4. **Environment Variables (.env)** add karein:
   - `INTERNAL_API_KEY` = `internal_secret_123` *(Same as Backend)*
   - `BACKEND_URL` = `<Render Backend ka live URL>`
   - `FRONTEND_URL` = `<Vercel Frontend URL>`
   - `REDIS_URL` = `<Same Redis URL>`

### C Redis Setup (Render)
Kyunki humne BullMQ, caching aur Socket.io adapter use kiya hai, Render par ek **"New -> Redis"** instance create karein (Free tier chal jayega) aur uska **Internal Redis URL** copy karke, Backend aur AI Engine ke `REDIS_URL` me add kar dein.

---

## 🚀 3. Frontend Deployment (Vercel)

Next.js frontend ke liye Vercel best option hai.
1. Vercel dashboard par jayein aur apna GitHub repo import karein.
2. **Root Directory**: `frontend` set karein.
3. **Build Command**: `npm run build`
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `<Aapka Render Backend URL (Example: https://ai-monitor-backend.onrender.com)>`
   - `NEXT_PUBLIC_SOCKET_URL` = `<Aapka Render Backend URL>`
5. **Deploy** click karein! 🎉

---

## 💡 Important Tips for Production:
1. **Model Weights**: AI models (`yolov8n-pose.pt` aur face recognition data) files badi hoti hain. Make sure wo properly GitHub par upload ho jayein, ya Render start hone par cloud se automatically download hon.
2. **CORS Issues**: Jab Render aur Vercel live ho jayenge, Make sure dono me ek-dusre ka sahi URL `.env` file mein update ho taaki CORS block na ho.
3. **Queue Monitoring**: Humne jo background queues banaye hain, unhe track karne ke liye baadme aap BullMQ UI (Bull MQ Dashboard) active kar sakte hain production logs ke liye.

Aapka highly scalable SaaS platform deploy hone ke liye poori tarah ready hai! All the best! 🚀
