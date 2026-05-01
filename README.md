# CURIFY — AI Healthcare Navigator & Pre-Underwriting Platform

> Helping patients find the right care at the right cost — and giving lenders the clinical risk intelligence they need.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688)
![React](https://img.shields.io/badge/React-19-61DAFB)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Usage](#usage)
- [License](#license)

---

## Overview

**CURIFY** is a dual-interface AI platform that bridges the gap between patients and healthcare financing.

- **Patients** can search hospitals by procedure, city, and budget — with transparent cost breakdowns and an interactive location map.
- **Lenders** get professional-grade pre-underwriting reports with risk-adjusted cost projections, ICU likelihood indices, and confidence scoring — all generated on demand.

---

## Features

### For Patients
| Feature | Description |
|---|---|
| Hospital Discovery | Search by procedure, city, and budget |
| Cost Estimation | Transparent surgical and general treatment breakdowns |
| Location Mapping | Interactive map of nearby medical facilities (Leaflet) |
| Profile Management | Secure storage of health info and emergency contacts |

### For Lenders
| Feature | Description |
|---|---|
| Pre-Underwriting Engine | Risk-adjusted cost projections and ICU likelihood indices |
| PDF Report Generation | Professional, lender-grade underwriting reports via ReportLab |
| Confidence Scoring | Intelligent reliability assessment per procedure |
| Trust Dashboard | Institutional control panel for financial assessments |

---

## Tech Stack

### Frontend
- **React 19** (Vite) — Component framework
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Animations and transitions
- **Leaflet** — Interactive hospital maps
- **Clerk** — Authentication and user management
- **Lucide React** — Icon system

### Backend
- **FastAPI** — High-performance async Python framework
- **SQLite** — Local database with seeding capabilities
- **ReportLab** — PDF generation for underwriting reports
- **Pydantic** — Request/response data validation

---

## Project Structure

```
prototype_v1/
├── backend/
│   ├── engines/            # Scoring & underwriting logic
│   ├── routes/             # API endpoint definitions
│   ├── services/           # PDF generation & data services
│   ├── database.py         # DB schema & seed data
│   └── main.py             # FastAPI entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth & global state (Clerk)
│   │   └── pages/          # Application views/routes
│   ├── tailwind.config.js  # Design tokens
│   └── vite.config.js      # Vite configuration
└── README.md
```

---

## Getting Started

### Prerequisites

- Python **3.9+**
- Node.js **18+**
- npm or yarn

---

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# Unix / macOS
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn reportlab pydantic

# Start the server
python main.py
```

Backend runs at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:8000
```

> **Note:** Sign up at [clerk.com](https://clerk.com) to get your publishable key for authentication.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/hospitals` | List hospitals with optional filters |
| `GET` | `/hospitals/search` | Search by procedure, city, budget |
| `POST` | `/underwriting/report` | Generate a pre-underwriting PDF report |
| `GET` | `/underwriting/score` | Get risk score for a procedure |
| `GET` | `/docs` | Interactive Swagger UI (FastAPI auto-generated) |

> Full API reference is available at `/docs` when the backend is running.

---

## Usage

1. **Patient flow:** Log in → Search for a hospital by procedure and city → View cost breakdown → Check the map → Save to profile.
2. **Lender flow:** Log in → Open Trust Dashboard → Enter patient/procedure details → Generate underwriting report → Download PDF.

---

## License

MIT License. Built for the CURIFY AI prototype.