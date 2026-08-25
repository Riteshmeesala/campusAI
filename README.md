# 🎓 CampusIQ+

**AI-Powered Smart Campus Management & Enterprise ERP Platform**

> Modern, full-stack university management platform with role-based dashboards, cloud AI intelligence, Razorpay payments, attendance tracking, and comprehensive academic workflows.

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.3-6DB33F?style=flat&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=flat&logo=openjdk&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=black)
![MUI](https://img.shields.io/badge/MUI-v5-007FFF?style=flat&logo=mui&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)
![Groq AI](https://img.shields.io/badge/AI-Groq%20Cloud-F55036?style=flat)
![UI Theme](https://img.shields.io/badge/Theme-Light%20%7C%20Roboto-2563EB?style=flat)

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Features by Role](#features-by-role)
4. [Project Structure](#project-structure)
5. [Quick Start (1-Click)](#quick-start-1-click)
6. [Manual Startup](#manual-startup)
7. [Demo Credentials](#demo-credentials)
8. [CampusMate AI Intelligence](#campusmate-ai-intelligence)
9. [API Overview](#api-overview)
10. [Port & Configuration Reference](#port--configuration-reference)

---

## Overview

CampusIQ+ is an institutional Academic ERP & Student Information System (SIS) built as a full-stack modern web application. It features a clean **Enterprise Light Theme** powered by **Roboto typography**, tailored for three distinct user roles: **Admin**, **Faculty**, and **Student**.

### Key Highlights
- **Unified Academic Workflows**: Real-time attendance, results, fees, exams, GPA calculation, and timetables.
- **CampusMate AI**: Fast Cloud LLM integration (Groq Cloud API) providing student advising, cohort analytics, and smart queries.
- **Enterprise Light Theme**: Clean, responsive layout with high-contrast Roboto typography, refined navigation, and collapsible drawers.
- **Razorpay Payments**: Direct student tuition and fee payments via UPI, card, and netbanking.
- **JWT & Role-Based Security**: Stateless authentication with granular permission guards.
- **Email OTP Verification**: Optional two-factor authentication via Gmail SMTP.
- **One-Click Launchers**: Batch and PowerShell scripts for zero-friction local development.

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.2.3 | REST API framework & microservices |
| Java JDK | 17+ (supports 17, 21, 25) | Primary language & runtime |
| Spring Security | 6.2 | JWT authentication & RBAC |
| Spring Data JPA | 3.2 | ORM, Repository abstraction |
| Hibernate | 6.4 | SQL dialect & schema updates |
| MySQL Connector/J | 8.3 | High-performance DB driver |
| JJWT | 0.11.5 | HMAC-SHA256 JWT tokens |
| Groq Cloud API / OkHttp | 4.12.0 | Ultra-fast cloud LLM inference |
| Razorpay Java SDK | 1.4.3 | Payment order creation & signature verification |
| Spring Boot Mail | 3.2 | SMTP email delivery & OTP codes |
| Lombok | Latest | Boilerplate reduction |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | Single Page Application framework |
| React Router | 6.22 | Client-side routing with auth guards |
| Material-UI (MUI) | 5.15 | UI component library (Light Theme + Roboto) |
| Axios | 1.6.7 | HTTP client with automatic JWT interceptors |
| Chart.js & react-chartjs-2 | 4.4 / 5.2 | Analytics visualizations & radar graphs |
| React Toastify | 10.0 | Toast feedback notifications |
| Dayjs | 1.11 | Date calculation & formatting |

### Database & Infrastructure
| Component | Specification |
|---|---|
| Database | MySQL 8.0+ (`campusiq_v6`, utf8mb4) |
| AI Inference | Groq Cloud LLM (`qwen/qwen3.6-27b`) |
| Build Tools | Maven 3.8+ / Node.js 18+ (npm 9+) |

---

## Features by Role

### 🔴 Admin (Executive Operations)
- **Executive Dashboard**: Real-time KPI cards for enrollment, revenue collection, staff count, and exams.
- **Student Directory**: Add, update, and manage student profiles, roll numbers, and academic status.
- **Faculty Registry**: Manage professors, assigned departments, and academic credentials.
- **Tuition & Billing**: Global fee tracking, mark payments as PAID/PENDING, invoice generation.
- **Exam Management**: Schedule mid-term and semester examinations with venues and timings.
- **CGPA Release**: Batch calculate and publish semester GPA and overall CGPA scores.
- **Campus Bulletins**: Broadcast announcements to students, faculty, or entire campus.

### 🟡 Faculty (Academic Instruction)
- **Faculty Dashboard**: Overview of teaching load, upcoming sessions, and recent announcements.
- **Attendance Tracker**: Single-click session attendance marking with instant percentage calculations.
- **Weekly Timetable Matrix**: Interactive weekly class schedule management.
- **Grades & Evaluation**: Enter and publish student marks for quizzes, mid-terms, and final exams.
- **Course Catalog**: Curriculum and syllabus tracking.
- **Cohort Analytics**: AI performance categories (Excellent, Strong, Moderate, At Risk).

### 🟢 Student (Self-Service Portal)
- **Student Dashboard**: Attendance percentages, GPA progression, fee status, and exam reminders.
- **Attendance Monitor**: Subject-wise attendance breakdown with warning alerts if below 75%.
- **Fee Management**: View pending tuition/hostel fees and pay instantly via Razorpay.
- **Results & Transcript**: View published semester grades, SGPA, and cumulative CGPA.
- **Exam Schedule**: View date-sheets, timing, and classroom allocations.
- **AI CampusMate**: Floating 24/7 AI assistant for instant academic help.
- **Profile Photo Management**: Upload and update profile pictures.

---

## Project Structure

```
campusAI/
├── start-dev.bat             ← 1-Click launcher (starts Backend & Frontend)
├── start-dev.ps1             ← PowerShell 1-Click launcher
├── stop-dev.bat              ← 1-Click shutdown (frees ports 8080 & 3000)
├── README.md                 ← Main project documentation
├── SETUP-GUIDE.md            ← Step-by-step installation manual
│
├── backend/                  ← Spring Boot 3.2 Backend
│   ├── pom.xml               ← Maven dependencies & build configuration
│   └── src/
│       └── main/
│           ├── java/com/campusiq/
│           │   ├── CampusIQApplication.java
│           │   ├── config/   ← Security, CORS, DataInitializer
│           │   ├── controller/← REST API Controllers
│           │   ├── entity/   ← JPA Entities (User, Course, Fee, Result...)
│           │   ├── repository/← Spring Data JPA Repositories
│           │   └── service/  ← Business logic & Groq AI Service
│           └── resources/
│               └── application.properties ← Database, JWT, Mail, AI keys
│
├── frontend/                 ← React 18 SPA Frontend
│   ├── package.json          ← Frontend dependencies & scripts
│   ├── .env                  ← Environment variables (PORT=3000, BROWSER=none)
│   ├── public/
│   │   └── index.html        ← Roboto font & Razorpay SDK
│   └── src/
│       ├── App.js            ← Route definitions
│       ├── index.js          ← ThemeProvider & React DOM mount
│       ├── components/
│       │   ├── layout/       ← AppLayout (Light Theme Sidebar & Topbar)
│       │   └── shared/       ← FloatingCampusBot, StatCard, PerformanceBadge...
│       ├── context/          ← AuthContext (JWT session management)
│       ├── pages/            ← Auth, Student, Faculty, Admin, AI pages
│       ├── services/         ← Axios API client
│       └── theme/            ← Enterprise Light Theme (Roboto typography)
│
└── database/                 ← Database Schemas & Migrations
    ├── campusiq_schema.sql   ← Base schema
    └── student cgpa.sql      ← CGPA migration script
```

---

## Quick Start (1-Click)

### Windows (Batch):
Double-click `start-dev.bat` or run:
```cmd
start-dev.bat
```

### Windows (PowerShell):
```powershell
.\start-dev.ps1
```

> This automatically opens two separate dedicated windows for the **Backend** (:8080) and **Frontend** (:3000).

### Stop All Services:
```powershell
.\stop-dev.bat
```

---

## Manual Startup

### 1. Start Backend:
```powershell
cd backend
mvn spring-boot:run
```
*API live at:* `http://localhost:8080/api`

### 2. Start Frontend:
```powershell
cd frontend
npm start
```
*Web App live at:* `http://localhost:3000`

---

## Demo Credentials

The database is auto-seeded with test accounts on first launch:

| Role | Username | Password | Default Dashboard |
|---|---|---|---|
| **Admin** | `admin` | `Admin@1234` | `/admin/dashboard` |
| **Faculty** | `faculty1` | `Admin@1234` | `/faculty/dashboard` |
| **Faculty** | `faculty2` | `Admin@1234` | `/faculty/dashboard` |
| **Student** | `ravi2268` | `Student@1234` | `/student/dashboard` |
| **Student** | `priya2269` | `Student@1234` | `/student/dashboard` |
| **Student** | `anjali2270` | `Student@1234` | `/student/dashboard` |

---

## CampusMate AI Intelligence

CampusIQ+ uses **Groq Cloud API** for ultra-fast, high-accuracy conversational AI.
- **Provider**: Groq Cloud (`https://api.groq.com/openai`)
- **Default Model**: `qwen/qwen3.6-27b`
- **Features**:
  - Live campus query answering (schedules, attendance policies, syllabus).
  - Floating widget accessible across all pages with speech-to-text voice input.
  - Dedicated fullscreen AI chat workspace at `/chatbot`.

---

## Port & Configuration Reference

| Service | Port / URL | Notes |
|---|---|---|
| **Frontend** | `http://localhost:3000` | React Web App (Enterprise Light Theme) |
| **Backend API** | `http://localhost:8080/api` | Spring Boot REST Endpoints |
| **MySQL Database** | `localhost:3306` | Database: `campusiq_v6` |
| **Actuator Health**| `http://localhost:8080/api/actuator/health` | Health & monitoring |

---

## License
MIT License — Copyright (c) 2026 CampusIQ+ Team.
