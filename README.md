
#  Schedula

<div align="center" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
  <!-- Empty left div for balance -->
  <div style="width: 100px;"></div>
  
  <!-- Centered Logo -->
  <div>
    <img src="public/logo.svg" alt="Schedula Logo" width="150" />
  </div>
  
  <!-- Right side text with design font -->
  <div style="width: 100px; text-align: right;">
    <span style="font-family: 'Poppins', 'Segoe UI', cursive; font-size: 1.2rem; font-weight: 600; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; background-clip: text; color: transparent;">
      Smart Scheduling
    </span>
  </div>
</div>
<br>

**Schedula** is an AI-powered academic timetable management system that automates scheduling, detects real-time clashes, enables faculty lecture swaps, and provides intelligent analytics for institutional optimization.

🔗 **Repository**: [github.com/indresh404/Capstone-Project](https://github.com/indresh404/Capstone-Project.git)

TEST USERS:
FACULTY : vaishali@gmail.com / faculty123*
ADMIN : bhushan@gmail.com / admin123*

---

## 📖 Table of Contents

- [Abstract](#abstract)
- [Problem Statement](#problem-statement)
- [Proposed Idea](#proposed-idea)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Core Scheduling Engine](#core-scheduling-engine)
- [Database Structure](#database-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Impact](#impact)
- [Innovation Highlights](#innovation-highlights)
- [Challenges Faced](#challenges-faced)
- [What I Learned](#what-i-learned)
- [Conclusion](#conclusion)
- [Topics](#topics)

---

## 🧩 Abstract

**SCHEDULA** is an AI-assisted academic scheduling system designed to automate and optimize timetable generation in colleges and universities. It eliminates manual scheduling inefficiencies using a **constraint-based intelligent engine**, real-time conflict detection, faculty swap workflows, AI-driven analytics, and a complete cloud + DevOps deployment pipeline.

The system is built as a **scalable full-stack distributed application** with modern backend architecture and container orchestration.

---

## ❗ Problem Statement

In educational institutions:

- Timetable creation is manual and time-consuming.
- Scheduling takes weeks of administrative effort.
- Frequent issues: faculty/room/batch clashes, last-minute changes, uneven workload distribution.
- No intelligent optimization or analytics system exists.

👉 **Result**: Inefficient scheduling, resource wastage, and high administrative overhead.

---

## 💡 Proposed Idea

**SCHEDULA** is an intelligent scheduling platform that:

> Automatically generates optimized timetables using constraint-based AI logic while ensuring zero conflicts and enabling dynamic faculty collaboration.

---

## 🚀 Features

- 🧠 AI-based timetable analysis (Groq API – LLaMA 3)
- 📅 Smart timetable generation engine
- ⚠️ Real-time clash detection (faculty, room, batch)
- 🔄 Faculty lecture swap system with approval workflow
- 📊 Analytics dashboard (workload, rooms, subjects utilization)
- 👨‍🏫 Faculty personal timetable view
- 🏫 Division & batch-based scheduling
- 🗄️ PostgreSQL (Supabase) database integration
- ☁️ Scalable cloud deployment with Docker & Kubernetes

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- TailwindCSS
- Framer Motion
- Recharts (analytics)

### Backend
- Node.js
- Express.js
- REST APIs
- JWT authentication

### Database
- PostgreSQL (Supabase)

### AI
- Groq API (LLaMA 3 for optimization insights)

### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes (pods, services, ingress, auto-scaling)
- **CI/CD**: GitHub Actions
- **Hosting**:
  - Frontend: Vercel
  - Backend: Render

---

## 🏛️ System Architecture

### Frontend (React + Tailwind)
- User dashboards (Admin, Faculty)
- Real‑time updates via REST APIs

### Backend (Node.js + Express)
- Constraint‑based scheduling engine
- Clash detection & swap management
- AI integration layer

### Database (Supabase/PostgreSQL)
- Stores users, subjects, rooms, timetables, swap requests, attendance

### AI Layer (Groq API)
- Provides optimization suggestions
- Workload balancing insights
- Pattern detection

### DevOps Pipeline

```
Git Push → GitHub Actions → Docker Build → Push to Registry → Kubernetes Deploy → Vercel (FE) + Render (BE)
```

#### Kubernetes in SCHEDULA
- Backend containers run as **pods**
- **Service** (LoadBalancer) distributes traffic
- **Ingress** routes external requests
- **Horizontal scaling** based on CPU/memory
- **Self-healing** (failed pods auto-restart)

```
User Request
   ↓
Ingress Controller
   ↓
Service (Load Balancer)
   ↓
Backend Pods (Node.js API)
   ↓
Supabase (PostgreSQL)
```

Benefits achieved:
- Zero‑downtime architecture
- Scalable backend deployment
- Fault tolerance and recovery
- Production‑ready for large institutions

---

## ⚙️ Core Scheduling Engine

**Type**: Constraint Satisfaction Problem (CSP) with greedy + randomized optimization

### Scheduling Rules
- No faculty overlap
- No room overlap
- No batch overlap
- Labs require 2 consecutive slots
- Tests scheduled weekly
- Balanced workload distribution

### Backend Engine Flow

```
Load Data → Schedule Tests → Schedule Labs → Schedule Theory → Validate Constraints → Post Process → Fill Gaps → Insert Breaks → Save to DB
```

## Intelligent Timetable Engine

Schedula is an AI-assisted academic scheduling system that automatically generates clash-free timetables using a constraint-based scheduling engine built with Node.js, Express, and PostgreSQL.

---

## 🚀 Overview

The Timetable Engine is the core backend module of Schedula that:
- Automatically assigns lectures, labs, and tests
- Ensures zero scheduling conflicts
- Balances faculty workload
- Optimizes room and batch utilization

---

## 🧠 Core Concepts Used

- Constraint Satisfaction Problem (CSP)
- Greedy Scheduling Algorithm
- Heuristic Optimization
- Occupancy Matrix (O(1) conflict checking)
- Randomized Scheduling (shuffle-based fairness)
- Block Scheduling (for labs)

---

## ⚙️ Algorithm Flow

1. Load data from database (rooms, faculty, subjects, batches)
2. Initialize occupancy tracking system
3. Schedule tests (1 per batch per week)
4. Schedule labs (2-slot blocks, multi-batch)
5. Schedule theory lectures (balanced distribution)
6. Post-process timetable (remove conflicts, fix ordering)
7. Fill empty slots (FREE periods)
8. Insert breaks and finalize timetable

---

## 🧩 Key Features

- ⚡ Real-time clash detection
- 📅 Automatic timetable generation
- 👨‍🏫 Faculty-aware scheduling
- 🏫 Room & batch optimization
- 🔄 Lab block scheduling system
- 📊 Balanced workload distribution
- 🧠 AI-ready structure for optimization

---

## 🏗️ Architecture

Frontend → API (Express.js) → Timetable Engine → PostgreSQL (Supabase)

---

## 🗄️ Database Support

- Users (Admin / Faculty)
- Subjects
- Rooms
- Divisions
- Batches
- Timetable entries

---

## ⚡ Performance Optimizations

- O(1) conflict detection using occupancy matrices
- Precomputed lookup maps for fast access
- Reduced DB calls using in-memory processing
- Efficient greedy assignment strategy

---

## 🎯 Output

Generates a fully structured weekly timetable with:
- No clashes
- Balanced distribution
- Faculty-wise assignments
- Room optimization

---

## 🏆 Summary

A rule-based intelligent scheduling engine that uses constraint satisfaction and greedy optimization to generate conflict-free academic timetables in real-time.

---

## 🗄️ Database Structure

Main tables:
- **Users** (admin, faculty)
- **Subjects** (with credit hours, type)
- **Rooms** (capacity, type)
- **Timetable** (slots, assignments)
- **SwapRequests** (from/to faculty, status)
- **Attendance** (optional extension)

All operations are transaction‑safe.

---

## 📦 Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Docker (optional, for containerized backend)
- Kubernetes cluster (minikube or cloud) – optional for orchestration

### Clone the repository

```bash
git clone https://github.com/indresh404/Capstone-Project.git
cd Capstone-Project
```

### Backend setup

```bash
cd backend
npm install
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### Docker (optional)

```bash
cd backend
docker build -t schedula-backend .
docker run -p 5000:5000 schedula-backend
```

### Kubernetes (optional)

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## 🔐 Environment Variables

Create `.env` files for backend and frontend.

### Backend `.env`

```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
```

### Frontend `.env`

```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📈 Impact

### Institutional
- Reduces timetable creation time from **weeks → minutes**
- Eliminates human errors
- Improves room & faculty utilization

### Faculty
- Transparent personal schedule
- Easy swap handling
- Balanced workload distribution

### Admin
- AI‑driven insights & recommendations
- Automated scheduling with real‑time control
- Analytics dashboard for resource planning

---

## 💡 Innovation Highlights

- AI‑assisted timetable optimization (Groq LLM)
- Real‑time conflict detection system
- Constraint‑based scheduling engine
- Faculty swap automation with approval
- Full DevOps pipeline (CI/CD)
- Kubernetes‑based scalable deployment
- Production‑grade, cloud‑native design

---

## 🧠 Challenges Faced

- Handling multiple scheduling constraints simultaneously
- Avoiding conflicts in real‑time system updates
- Designing scalable, loosely coupled architecture
- Ensuring fair workload distribution across faculty
- Managing distributed deployment (Docker + Kubernetes)
- Integrating AI suggestions without breaking constraints

---

## 📚 What I Learned

### Technical Skills
- Full‑stack development (React + Node.js)
- REST API design & JWT authentication
- Database modeling in PostgreSQL
- AI integration with LLM APIs

### DevOps Skills
- Docker containerization
- CI/CD pipelines (GitHub Actions)
- Cloud deployment (Vercel + Render)
- **Kubernetes orchestration** (scaling, self‑healing, load balancing)

### System Design
- Distributed systems architecture
- Constraint Satisfaction Problems (CSP)
- Scalable backend design patterns

### Problem Solving
- Real‑world scheduling logic
- Constraint optimization techniques
- System performance tuning

---

## 🏁 Conclusion

**SCHEDULA** is a complete AI‑powered academic scheduling platform that replaces manual timetable creation with an intelligent, scalable, and cloud‑native system.

It integrates full‑stack development, AI analytics, and modern DevOps practices including **Docker and Kubernetes orchestration**, making it a production‑ready, enterprise‑grade solution for educational institutions.

---

## 🏆 Final One‑Line Summary

> SCHEDULA is an AI‑powered, cloud‑native timetable optimization system that automates scheduling, resolves conflicts, balances workload, and scales using Kubernetes‑based infrastructure.

---

## 👨‍💻 Team Members

- **Indresh** – [indresh404](https://github.com/indresh404)  
  Full-stack development, AI integration, DevOps & Kubernetes orchestration

- **Komal Pandey** – [Komal2008](https://github.com/Komal2008) • Collaborator  
  Contributed to frontend development, UI/UX design, and testing

---
