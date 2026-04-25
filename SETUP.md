# Expense Tracker — Setup Guide

## Project Structure
```
expense-tracker/
├── backend/      → Node.js + Express + MongoDB
└── frontend/     → React + Vite PWA
```

---

## Step 1 — Google OAuth Setup (5 mins)

1. Go to https://console.cloud.google.com
2. Create a new project (e.g. "Expense Tracker")
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://your-netlify-url.netlify.app` (production — add after deploying)
7. Copy the **Client ID** — you'll need it in both `.env` files

---

## Step 2 — MongoDB Atlas Setup (5 mins)

1. Go to https://cloud.mongodb.com and sign up (free)
2. Create a free **M0 cluster**
3. Under **Database Access**, create a user with read/write access
4. Under **Network Access**, add `0.0.0.0/0` (allow all IPs — needed for Render)
5. Click **Connect → Drivers** and copy the connection string
   - Replace `<password>` with your DB user password

---

## Step 3 — Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your .env values:
#   MONGODB_URI=your_atlas_connection_string
#   JWT_SECRET=any_long_random_string
#   GOOGLE_CLIENT_ID=your_google_client_id
#   FRONTEND_URL=http://localhost:5173

npm install
npm run dev
# Server runs at http://localhost:5000
```

---

## Step 4 — Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in:
#   VITE_API_URL=http://localhost:5000/api
#   VITE_GOOGLE_CLIENT_ID=your_google_client_id

npm install
npm run dev
# App runs at http://localhost:5173
```

---

## Step 5 — Deploy Backend to Render (free)

1. Push your code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your repo, select the `backend` folder as root
4. Build command: `npm install`
5. Start command: `npm start`
6. Add your environment variables (same as `.env` but with production values):
   - `FRONTEND_URL` = your Netlify URL
7. Deploy — copy the Render URL (e.g. `https://expense-tracker-xxx.onrender.com`)

---

## Step 6 — Deploy Frontend to Netlify (free)

1. Go to https://netlify.com → New site → Import from Git
2. Set base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/dist`
5. Add environment variables:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID` = your Google Client ID
6. Deploy

---

## Step 7 — Update Google OAuth Origins

Go back to Google Cloud Console and add your Netlify URL to the
**Authorized JavaScript origins** for your OAuth client.

---

## Installing as a PWA on Android

1. Open your Netlify URL in Chrome on Android
2. Tap the **three-dot menu → Add to Home screen**
3. The app installs like a native app — opens fullscreen, no browser bar

---

## Security Notes

- JWT tokens are stored in `sessionStorage` (cleared when browser closes)
- All API routes require a valid JWT — no anonymous access
- MongoDB queries are always filtered by `userId` — users can't see each other's data
- CORS is restricted to your frontend URL only
- Rate limiting: 100 requests per 15 minutes per IP
- Helmet adds security headers automatically
