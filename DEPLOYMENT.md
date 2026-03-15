# Deployment Guide

This project has two deployable services:

- Frontend: React static build
- Backend: Node.js API

## Required backend environment variables

- `PORT` (default `5000`)
- `FRONTEND_URL` (comma-separated allowed origins)
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, default `gemini-2.5-flash`)

Optional persistence/auth variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SCAN_HISTORY_TABLE` (optional, default `scan_history`)

Optional direct Twilio OTP mode:

- `OTP_DIRECT_TWILIO=true|false`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_MESSAGING_SERVICE_SID`

## Local verification checklist

1. Start backend:

   ```bash
   cd backend
   npm start
   ```

2. Start frontend:

   ```bash
   cd frontend
   npm start
   ```

3. Verify health endpoint:

   - Backend: http://localhost:5000/api/health

4. Verify frontend production build:

   ```bash
   cd frontend
   npm run build
   ```

## Docker deployment (recommended)

From project root:

1. Build images:

   docker compose build

2. Start services:

   docker compose up -d

3. Verify:

   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/api/health

## Render style deployment

Deploy as two services:

1. Frontend static/web service
   - Build command: npm install && npm run build
   - Publish directory: frontend/build
   - Env (recommended): REACT_APP_API_ORIGIN=https://<backend-domain>

2. Backend web service
   - Root directory: backend
   - Start command: npm start
   - Env:
     - PORT=5000
     - FRONTEND_URL=https://<frontend-domain>
     - MONGODB_URI=<optional>
      - JWT_SECRET=<required>
      - GEMINI_API_KEY=<required for translation and disease detection>
      - GEMINI_MODEL=gemini-2.5-flash
      - SUPABASE_URL=<optional but recommended>
      - SUPABASE_SERVICE_ROLE_KEY=<optional but recommended>
      - SUPABASE_PUBLISHABLE_KEY=<required for Supabase phone OTP>

3. Optional direct Twilio OTP fallback
   - Set `OTP_DIRECT_TWILIO=true` on backend
   - Add Twilio credentials listed in "Required backend environment variables"

## Vercel + Render split

- Deploy frontend on Vercel with `REACT_APP_API_ORIGIN` set to backend URL.
- Deploy backend on Render/Railway.

## Notes

- If backend returns timeout, verify Gemini API key/model and internet reachability.
- Never commit `.env` files to GitHub. Use `.env.example` templates for shared config.
