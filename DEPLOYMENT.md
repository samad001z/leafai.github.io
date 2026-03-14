# Deployment Guide

This project has three deployable services:

- Frontend: React static build
- Backend: Node.js API
- ML Service: Python Flask predictor

## Local verification checklist

1. Start ML service:

   cd ml-service
   python predict_service.py

2. Start backend:

   cd backend
   npm start

3. Start frontend:

   cd frontend
   npm start

4. Verify health endpoints:

   - Backend: http://localhost:5000/api/health
   - ML: http://localhost:5001/health

## Docker deployment (recommended)

From project root:

1. Build images:

   docker compose build

2. Start services:

   docker compose up -d

3. Verify:

   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/api/health
   - ML: http://localhost:5001/health

## Render style deployment

Deploy as three services:

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
     - ML_SERVICE_URL=https://<ml-domain>/predict
     - MONGODB_URI=<optional>
     - GEMINI_API_KEY=<required for translation>
     - GEMINI_MODEL=gemini-2.0-flash

3. ML web service
   - Root directory: ml-service
   - Start command: python predict_service.py
   - Ensure these files are deployed:
     - predict_service.py
     - requirements.txt
     - labels.json
     - plant_disease_model.h5

## Vercel + Render split

- Deploy frontend on Vercel with REACT_APP_API_URL set to backend URL.
- Deploy backend and ML on Render/Railway.

## Notes

- Do not deploy the training dataset folder; it is ignored in .gitignore.
- Keep plant_disease_model.h5 in ml-service for inference deployments.
- If backend returns timeout, verify ML service URL and reachability.
