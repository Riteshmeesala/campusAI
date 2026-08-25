# CampusIQ+ Frontend — Development & User Guide

> **Enterprise Light Theme · React 18 · Material-UI v5 · Roboto Typography · Chart.js · Axios**

---

## 🎨 UI & Design System

The CampusIQ+ frontend has been upgraded to a modern **Enterprise Light Theme** built with institutional precision:

- **Typography**: Google Font **Roboto** (`300`, `400`, `500`, `700`, `900`) across all headings, body text, inputs, and tables.
- **Color Palette**:
  - Primary Canvas: `#f8fafc` (Slate 50)
  - Cards & Paper: `#ffffff`
  - Sidebar: Clean `#ffffff` with architectural `#e2e8f0` borders
  - Active Accents: Soft Blue `#eff6ff` with `#2563eb` indicator highlights
  - Status Indicators: Enterprise Emerald (`#047857`), Amber (`#b45309`), and Crimson (`#b91c1c`)
- **CampusMate AI Widget**: Global floating assistant and fullscreen `/chatbot` workspace in matching light theme.

---

## 🚀 Quick Start

### Option 1: Using the 1-Click Launchers (from Root Folder)
```powershell
# From campusAI root folder:
.\start-dev.ps1
```
*(Or double-click `start-dev.bat`)*

### Option 2: Starting Directly in Frontend Folder
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

- **Local URL**: [http://localhost:3000](http://localhost:3000)
- **Backend Proxy**: Configured to proxy API calls to `http://localhost:8080`

---

## 🔑 Demo Login Credentials

| Username | Password | Role | Landing Route |
|---|---|---|---|
| **admin** | `Admin@1234` | Admin | `/admin/dashboard` |
| **faculty1** | `Admin@1234` | Faculty | `/faculty/dashboard` |
| **faculty2** | `Admin@1234` | Faculty | `/faculty/dashboard` |
| **ravi2268** | `Student@1234` | Student | `/student/dashboard` |
| **priya2269** | `Student@1234` | Student | `/student/dashboard` |
| **anjali2270** | `Student@1234` | Student | `/student/dashboard` |

---

## 📁 Frontend Directory Structure

```
frontend/
├── public/
│   └── index.html              ← Roboto Google Fonts & Razorpay Checkout SDK
├── src/
│   ├── App.js                  ← Route declarations & guards
│   ├── index.js                ← Root entry with ThemeProvider & AuthProvider
│   ├── components/
│   │   ├── ProtectedRoute.jsx  ← Role-based route authorization guard
│   │   ├── layout/
│   │   │   └── AppLayout.jsx   ← Light Theme Sidebar, Header, & Profile Bar
│   │   └── shared/
│   │       ├── FloatingCampusBot.jsx  ← Global Floating AI Assistant
│   │       ├── StatCard.jsx           ← Animated metric cards
│   │       ├── PerformanceBadge.jsx   ← Performance categorization badges
│   │       ├── ProfilePhotoUploader.jsx← Profile avatar uploader
│   │       └── PageHeader.jsx         ← Standardized page headers
│   ├── context/
│   │   └── AuthContext.js      ← JWT token management & session state
│   ├── pages/
│   │   ├── auth/LoginPage.jsx  ← Authentication & OTP verification
│   │   ├── student/            ← Student Dashboard, Profile, AI Insights
│   │   ├── faculty/            ← Timetable, Curriculum, Attendance, Grading
│   │   ├── admin/              ← Executive Dashboard, CGPA Release, Directory
│   │   ├── attendance/         ← Attendance tracking modules
│   │   ├── exams/              ← Exam date-sheet and scheduling
│   │   ├── results/            ← Grade and transcript view
│   │   ├── fees/               ← Fee payment portal + Razorpay checkout
│   │   └── ai/ChatbotPage.jsx  ← Dedicated AI Chatbot workspace
│   ├── services/
│   │   └── api.js              ← Axios API services with JWT interceptors
│   └── theme/
│       ├── theme.js            ← MUI theme overrides (Light Theme + Roboto)
│       └── animations.js       ← Micro-animations and transition helpers
├── .env                        ← PORT=3000, BROWSER=none, FAST_REFRESH=true
└── package.json
```

---

## ⚙️ Environment Variables (`.env`)

```env
BROWSER=none
PORT=3000
FAST_REFRESH=true
```

---

## 🛠️ Available Scripts

- **`npm start`**: Runs the app in development mode on port 3000.
- **`npm run build`**: Builds optimized production assets to the `build/` folder.
- **`npm test`**: Runs unit test suite via Jest.
