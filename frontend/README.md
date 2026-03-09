# CampusIQ+ Frontend — Complete Setup Guide
> React 18 | MUI v5 | React Router v6 | Chart.js | Axios

---

## 🔧 Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | (comes with Node.js) |
| VS Code | Latest | https://code.visualstudio.com |

### VS Code Extensions (Recommended):
1. **ES7+ React/Redux/React-Native snippets** — `dsznajder.es7-react-js-snippets`
2. **Prettier - Code formatter** — `esbenp.prettier-vscode`
3. **ESLint** — `dbaeumer.vscode-eslint`

> ⚠️ **Backend must be running first!** See `campusiq-backend/README.md`

---

## 🚀 Quick Start (3 commands)

```bash
# Navigate to frontend folder
cd campusiq-frontend

# Install dependencies (~2-3 minutes first time)
npm install

# Start the app
npm start
```

App opens at: **http://localhost:3000**

---

## 🔑 Login Credentials

The login form uses **Username** (not email):

| Username | Password | Role | Dashboard |
|----------|----------|------|-----------|
| **admin** | Admin@1234 | Admin | /admin/dashboard |
| **faculty1** | Admin@1234 | Faculty | /faculty/dashboard |
| **faculty2** | Admin@1234 | Faculty | /faculty/dashboard |
| **ravi2268** | Student@1234 | Student | /student/dashboard |
| **priya2269** | Student@1234 | Student | /student/dashboard |
| **anjali2270** | Student@1234 | Student | /student/dashboard |
| **farhan2271** | Student@1234 | Student | /student/dashboard |
| **sneha2272** | Student@1234 | Student | /student/dashboard |

💡 **Quick Login:** Use the Demo Account buttons on the login page!

---

## 📁 Project Structure

```
campusiq-frontend/
├── public/
│   └── index.html              ← Razorpay SDK included
├── src/
│   ├── App.js                  ← Routes
│   ├── index.js                ← Entry point with ThemeProvider
│   ├── components/
│   │   ├── ProtectedRoute.jsx  ← Auth guard
│   │   ├── layout/
│   │   │   └── AppLayout.jsx   ← Sidebar + nav
│   │   └── shared/             ← Reusable components
│   ├── context/
│   │   └── AuthContext.js      ← JWT auth state
│   ├── pages/
│   │   ├── auth/LoginPage.jsx  ← Login with email
│   │   ├── student/            ← Student dashboard
│   │   ├── faculty/            ← Faculty attendance marking
│   │   ├── admin/              ← Admin overview
│   │   ├── attendance/         ← Attendance tracker
│   │   ├── exams/              ← Exam schedule
│   │   ├── results/            ← Academic results
│   │   ├── fees/               ← Fee management + Razorpay
│   │   └── ai/                 ← AI insights + chatbot
│   ├── services/
│   │   └── api.js              ← All Axios API calls (FIXED)
│   └── theme/
│       └── theme.js            ← MUI theme + design system
└── .env                        ← Environment variables
```

---

## ⚙️ Environment Variables (.env)

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SI50pw3ScFGRcS
REACT_APP_VERSION=2.0.0
```

If your backend runs on a different port, update `REACT_APP_API_BASE_URL`.

---

## 📡 Frontend → Backend API Mapping

| Page | API Called | Backend Endpoint |
|------|-----------|-----------------|
| Login | authAPI.login | POST /api/auth/login |
| Student Dashboard | getMyAttendance, getMyResults, getMyFees, getMyPerformance | Multiple |
| Attendance | getStudentAttendance | GET /api/attendance/student/{id} |
| Results | getMyResults | GET /api/results/my |
| Fees | getMyFees, createPaymentOrder | GET /api/fees/my, POST /api/fees/{id}/create-order |
| Exams | getUpcoming | GET /api/exams/upcoming |
| AI Insights | getMyPerformance | GET /api/analytics/performance/my |
| Chatbot | sendMessage | POST /api/chatbot/chat |
| Faculty | markAttendance | POST /api/attendance/mark |

---

## 🐛 Bugs Fixed (from original zip)

1. ✅ `attendanceAPI.getSummary()` → `attendanceAPI.getStudentAttendance()` — method didn't exist
2. ✅ `resultAPI.getByStudent()` → `resultAPI.getMyResults()` — method didn't exist
3. ✅ `feeAPI.getHistory()` → `feeAPI.getMyFees()` — method didn't exist
4. ✅ `aiAPI.performance()` → `aiAPI.getMyPerformance()` — method didn't exist
5. ✅ `notifAPI.getCount()` → `notifAPI.getUnreadCount()` — method didn't exist
6. ✅ `examAPI.getUpcoming(60)` → `examAPI.getUpcoming()` — backend takes no param
7. ✅ `studentAPI` import in AdminDashboard — didn't exist, removed
8. ✅ Fee field `feeName` → `feeType`, `paidAt` → `paidDate` (entity mismatch)
9. ✅ Fee status `SUCCESS` → `PAID` (entity enum mismatch)
10. ✅ Result fields `marks/maxMarks` → `marksObtained/exam.totalMarks`, `percentage`
11. ✅ Exam fields `examDate/startTime/subject` → `scheduledDate/course`
12. ✅ Attendance summary computed from raw records (no summary endpoint exists)
13. ✅ Analytics response normalized (backend fields ≠ component field names)
14. ✅ Demo login buttons fixed to use real email credentials
15. ✅ `ProtectedRoute` added `<Outlet />` support for nested routes

---

## 🧪 Running Both Together

**Terminal 1 — Backend:**
```bash
cd campusiq-fixed/backend
mvn spring-boot:run
# Backend: http://localhost:8080
```

**Terminal 2 — Frontend:**
```bash
cd campusiq-frontend
npm start
# Frontend: http://localhost:3000
```

Open **http://localhost:3000** — login with any credentials above!

---

## 🐛 Troubleshooting

### "npm install" fails / ERESOLVE error
```bash
npm install --legacy-peer-deps
```

### App starts but shows blank / login doesn't work
Check browser console (F12) — if you see CORS errors:
1. Make sure backend is running: `http://localhost:8080/api/auth/login` should respond
2. Backend application.properties has CORS configured for `http://localhost:3000`

### "Network Error" on API calls
Backend is not running. Start it first with `mvn spring-boot:run`

### Login says "Invalid username or password"
Make sure you've run the database schema: `mysql -u root -p < database/campusiq_schema.sql`
The demo credentials only exist after running the SQL seed data.

### Charts not rendering
Open VS Code terminal and run: `npm install chart.js react-chartjs-2 --legacy-peer-deps`

---

## 🎨 UI Features by Role

### Student
- Dashboard with attendance radar chart + marks bar chart
- Attendance page with subject-wise breakdown
- Results page with grade table
- Fee management with Razorpay integration
- Exam schedule
- AI Performance Insights
- Study Plan generator
- CampusMate AI Chatbot

### Faculty
- Dashboard with attendance marking tool
- Mark bulk attendance per course per date
- View results and exams

### Admin
- System overview with student risk analysis
- Student performance comparison charts
- Upcoming exams management

---

*CampusIQ+ Frontend | React 18 + MUI v5 | Fixed & Connected to Backend*
