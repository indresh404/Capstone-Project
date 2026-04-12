# Schedula: Technical Summary & System Architecture

Schedula is a premium, AI-powered academic scheduling and analytics platform built for modern educational institutions. This document provides a detailed technical overview of the system's architecture, stack, and deployment requirements.

## 1. System Architecture
Schedula follows a traditional Client-Server architecture with a cloud-based persistence layer.

### Frontend (Client)
- **Framework**: React 18+ (Vite)
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)
- **Styling**: TailwindCSS (Pure CSS foundations)
- **Animations**: Framer Motion (premium fluid transitions)
- **Data Visualization**: Recharts (Dynamic academic analytics)
- **Icons**: Lucide React
- **Animations**: Lottie (JSON-based premium loaders)

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Token) with secure password hashing
- **Environment**: Dotenv for secret management

### Intelligence Layer (AI)
- **Engine**: Groq Cloud API
- **Model**: `llama-3.3-70b-versatile`
- **Functionality**: Real-time institutional data analysis, workload optimization suggestions, and syllabus completion predictions.

### Persistence Layer (Database)
- **Provider**: Supabase (PostgreSQL)
- **Storage**: Real-time table structures for Timetables, Faculty, Subjects, and Attendance.

---

## 2. Key Technical Features

### AI Analytical Intelligence
- **Prompt Engineering**: Uses sophisticated system instructions to ensure institutional tone and structured Markdown output.
- **Dynamic Context**: The AI receives targeted selection filters (Subjects, Divisions) to provide contextualized insights.
- **Typewriter Rendering**: Custom word-by-word reveal engine with blurry-to-clear entrance transitions.

### Smart Timetable Management
- **Clash Detection**: Real-time validation of faculty and room double-bookings.
- **Drag-and-Drop Editor**: Intuitive scheduling with automatic cloud synchronization.
- **Split Session Support**: Capability to handle laboratory batches or simultaneous elective sessions.

### Live Analytics Dashboard
- **Institutional KPI Tracking**: Monitoring total planned vs. scheduled hours.
- **Faculty Workload Analysis**: Visual overload detection (threshold-based highlighting).
- **Curriculum Progress Monitoring**: Subject-wise completion tracking.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | Core application shell |
| **Backend** | Express, Node.js | API Middleware |
| **Logic** | Groq AI (Llama 3.3) | Analytical Intelligence |
| **Database** | PostgreSQL (Supabase) | Data Storage |
| **UI/UX** | Framer Motion, Tailwind | Aesthetics & Animations |
| **HTTP Client** | Axios, Fetch | API Communication |

---

## 4. Deployment & Environment Configuration

### Environment Variables (.env)
The system requires the following variables to be configured in both the root and backend environments.

#### Backend (`/backend/.env`)
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
JWT_SECRET=your_secure_jwt_secret
```

#### Frontend (`/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000  # Change to your production domain
VITE_GROQ_API_KEY=your_groq_api_key      # Required for emergency client-side fallbacks
```

### Installation
1. Install dependencies: `npm install` (Root & Backend)
2. Configure `.env` files.
3. Start development: `npm run dev`
4. Build for production: `npm run build`

---

## 6. Render Deployment Guide (Recommended)

### Backend Deployment (Render Web Service)
1. **Build Command**: `npm install`
2. **Start Command**: `npm start`
3. **Root Directory**: `backend` (or leave empty if deploying just the backend repo)
4. **Environment Variables**:
   - `PORT`: 5000 (Render will override this)
   - `DATABASE_URL`: Your Supabase URI
   - `GROQ_API_KEY`: Your API Key
   - `JWT_SECRET`: A long random string
   - `FRONTEND_URL`: URL of your deployed frontend (e.g., `https://schedula.vercel.app`)

### Frontend Deployment (Render Static Site)
1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g., `https://schedula-api.onrender.com`)
   - `VITE_GROQ_API_KEY`: Same as backend
