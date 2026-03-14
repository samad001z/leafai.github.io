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
- **Database**: MongoDB (optional, app works in demo mode)
- **Styling**: Custom CSS with farmer-friendly color palette
- **ML Model**: Placeholder ready for integration

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
cd frontend
npm start
```

7. **Open the app**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Demo Mode

The app works in demo mode without a database:
- Use OTP **123456** for any phone number
- Image analysis returns mock results
- Perfect for testing and development

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
├── ML_INTEGRATION.md         # ML model integration guide
└── README.md                 # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login existing user

### Plant Scanning
- `POST /api/scan/analyze` - Analyze plant image
- `GET /api/scan/history` - Get scan history (coming soon)

### Health Check
- `GET /api/health` - Check API status

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Forest Green | #228B22 | Primary buttons, headers |
| Earth Brown | #8B4513 | Secondary elements |
| Sunflower Yellow | #FFD700 | Accents, highlights |
| Cream | #FFF8DC | Background |

## ML Model Integration

See [ML_INTEGRATION.md](./ML_INTEGRATION.md) for detailed instructions on integrating a machine learning model for plant disease detection.

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