# PlantCare AI 🌿

A farmer-friendly web application for AI-powered plant disease detection. Built with React.js frontend and Node.js/Express backend.

![PlantCare AI](https://img.shields.io/badge/PlantCare-AI-green)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## Features

- 🌱 **Easy Plant Scanning** - Take photos or upload from gallery
- 🔬 **AI-Powered Analysis** - Get instant disease detection results
- 💡 **Expert Recommendations** - Actionable advice for plant care
- 🌍 **Multilingual Support** - Interface supports multiple languages
- 📱 **Mobile-Friendly** - Designed for use in the field
- ☀️ **High Contrast** - Readable in bright sunlight

## Design Philosophy

Built specifically for farmers with:
- **48px minimum touch targets** - Easy to tap with gloves or rough hands
- **Rounded, friendly shapes** - Comfortable visual design
- **High contrast colors** - Visible in sunlight
- **Simple icons** - Reduces text load
- **Plant illustrations** - Visual comfort and context

## Tech Stack

- **Frontend**: React.js 18
- **Backend**: Node.js, Express
- **Database**: MongoDB (optional) + Supabase (optional, used for scan history persistence)
- **Styling**: Custom CSS with farmer-friendly color palette
- **AI Detection**: Gemini API (image-based disease detection)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SCSBalaji/project-interface.git
cd project-interface
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
npm install
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your settings
```

5. **Start the backend server**
```bash
npm start
```

6. **Start the frontend (in a new terminal)**
```bash
cd ../frontend
npm start
```

7. **Open the app**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Demo Mode

The app works in demo mode without a database:
- Use OTP **123456** for any phone number
- Image analysis uses live Gemini when quota is available
- If Gemini is unavailable/quota-limited, backend returns a clearly labeled temporary fallback response
- Scan history persistence is disabled unless Supabase is configured
- Perfect for testing and development

## Frontend-Backend Integration

- Development:
	- Frontend dev server runs on port 3000 and proxies API calls to backend 5000 via CRA proxy.
	- API requests can be written as `/api/...`.
- Docker/Production:
	- Frontend is served by nginx and proxies `/api` and `/uploads` to backend service.
	- Default production API URL is same-origin `/api` (no localhost coupling).

Optional frontend env:
- `REACT_APP_API_ORIGIN` (recommended, example: `https://leafai-backend.onrender.com`)
- `REACT_APP_API_URL` (legacy override; if set, it should include `/api`)

Frontend env template:
- `frontend/.env.example`

## Deploy (Docker Compose)

From project root:

```bash
docker compose up --build -d
```

Then verify:
- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:5000/api/health`

## Project Structure

```
project-interface/
├── frontend/                 # React frontend
│   ├── public/              # Static files
│   └── src/
│       ├── components/      # Reusable components
│       ├── pages/           # Page components
│       ├── services/        # API services
│       └── styles/          # CSS styles
├── backend/                  # Express backend
│   ├── controllers/         # Route handlers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   └── uploads/             # Uploaded images
├── plan.md                   # Implementation plan
└── README.md                 # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP for login/signup
- `GET /api/auth/me` - Get current authenticated user

### Plant Scanning
- `POST /api/scan/analyze` - Analyze plant image
- `GET /api/scan/history` - Get recent scan history (supports `?limit=30`)

### Health Check
- `GET /api/health` - Check API status

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Forest Green | #228B22 | Primary buttons, headers |
| Earth Brown | #8B4513 | Secondary elements |
| Sunflower Yellow | #FFD700 | Accents, highlights |
| Cream | #FFF8DC | Background |

## Gemini Configuration

Set these backend environment variables:

- `GEMINI_API_KEY` (required)
- `GEMINI_MODEL` (optional, default: `gemini-2.5-flash`)

## Supabase History Setup

Set these backend environment variables to enable persistent scan history:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PUBLISHABLE_KEY` (required for phone OTP auth flow)
- `SUPABASE_SCAN_HISTORY_TABLE` (optional, default: `scan_history`)

Create this table in Supabase SQL editor:

```sql
create table if not exists public.scan_history (
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	plant_name text,
	disease_name text,
	confidence double precision,
	severity text,
	analysis_mode text,
	reason_code text,
	image_mime_type text,
	result jsonb not null
);

create index if not exists scan_history_created_at_idx
	on public.scan_history (created_at desc);
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Designed with farmers in mind
- Color palette inspired by nature
- Icons from emoji standards for universal compatibility

---

Made with 💚 for farmers worldwide