# AI Workplace Monitor - End-to-End SaaS Platform

A production-ready AI-powered surveillance and monitoring system built with Next.js, Node.js, and Python FastAPI.

## 🚀 Features

- **Live Detection**: Real-time worker monitoring (Sleeping, Idle, Active) via WebSockets.
- **Face Recognition**: Automated employee identification and check-in.
- **Role-Based Access**: Specialized dashboards for Admins and Operators.
- **Smart Alerts**: Multi-channel notifications via Socket.io and Email.
- **Secure Architecture**: Internal API keys for service-to-service communication.
- **Premium Design**: Dark-mode glassmorphism UI with smooth animations.
- **SaaS Ready**: Integrated Razorpay subscriptions and plan management.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Lucide Icons, Framer Motion, Zustand.
- **Backend**: Node.js, Express, Socket.io, Neon DB (PostgreSQL), MongoDB Atlas.
- **AI Service**: Python FastAPI, OpenCV, YOLOv8, InsightFace.
- **Storage**: Cloudinary (Screenshots/Profiles).

## 📦 Project Structure

```text
├── frontend/        # Next.js Application (Port 3000)
├── backend/         # Node.js API Service (Port 5000)
├── ai-service/      # Python AI Engine (Port 8000)
└── package.json    # Root Workspace scripts
```

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB & PostgreSQL (Neon) instances
- Cloudinary & Razorpay Keys

### 2. Environment Configuration
Create `.env` files in each service:

**Frontend (`frontend/.env.local`)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

**Backend (`backend/.env`)**:
```env
DATABASE_URL=your_neon_db_url
MONGODB_URI=your_mongo_atlas_url
INTERNAL_API_KEY=your_shared_secret
AI_SERVICE_URL=http://localhost:8000
CLOUDINARY_URL=your_cloudinary_url
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**AI Service (`ai-service/.env`)**:
```env
BACKEND_URL=http://localhost:5000
INTERNAL_API_KEY=your_shared_secret
CLOUDINARY_URL=your_cloudinary_url
```

### 3. Running Locally
Run everything with a single command from the root:
```bash
npm install
npm run dev
```

## 🚢 Deployment

1. **Frontend**: Deploy to **Vercel**.
2. **Backend**: Deploy to **Railway** (using `railway.json`).
3. **AI Service**: Deploy to **Railway** (using `railway.json`).

*Note: Ensure `FRONTEND_URL` and `BACKEND_URL` are set in production environment variables to handle CORS.*