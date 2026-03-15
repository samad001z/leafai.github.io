# Deployment Guide

This project has two deployable services:

- Frontend: React static build
- Backend: Node.js API

## Local verification checklist

1. Start backend:

   cd backend
   npm start

2. Start frontend:

   cd frontend
   npm start

3. Verify health endpoint:

   - Backend: http://localhost:5000/api/health

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
   - Env: REACT_APP_API_URL=https://<backend-domain>/api

2. Backend web service
   - Root directory: backend
   - Start command: npm start
   - Env:
     - PORT=5000
     - FRONTEND_URL=https://<frontend-domain>
     - MONGODB_URI=<optional>
         - GEMINI_API_KEY=<required for translation and disease detection>
         - GEMINI_MODEL=gemini-2.5-flash

## Vercel + Render split

- Deploy frontend on Vercel with REACT_APP_API_URL set to backend URL.
- Deploy backend on Render/Railway.

## Notes

- If backend returns timeout, verify Gemini API key/model and internet reachability.
