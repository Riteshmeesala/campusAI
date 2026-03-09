# 🎓 CampusIQ+

**AI-Powered Smart Campus Management Platform**

> Full-stack university management system with role-based dashboards, live AI chatbot, Razorpay payments, and Firebase push notifications.

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.3-6DB33F?style=flat&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat&logo=openjdk&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-v5-007FFF?style=flat&logo=mui&logoColor=white)

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Features by Role](#features-by-role)
4. [Project Structure](#project-structure)
5. [Quick Start](#quick-start)
6. [Demo Credentials](#demo-credentials)
7. [CampusMate AI Chatbot](#campusmate-ai-chatbot)
8. [API Overview](#api-overview)
9. [Key Technical Details](#key-technical-details)
10. [Port Reference](#port-reference)

---

## Overview

CampusIQ+ is a complete university management system built as a full-stack web application. It supports three user roles — **Admin**, **Faculty**, and **Student** — each with a tailored dashboard and feature set.

The platform provides:

- **Real-time campus data** — attendance, results, fees, exams, CGPA all in one place
- **AI chatbot (CampusMate AI)** — answers questions using live database data, enhanced by a local Ollama LLM
- **Razorpay payment integration** — students can pay fees online via UPI, card, or netbanking
- **Firebase push notifications** — optional real-time notifications to mobile/browser
- **JWT-secured REST API** — stateless authentication with role-based access control
- **Email OTP** — optional two-factor authentication via Gmail SMTP

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.2.3 | REST API framework |
| Java | 17 LTS | Primary language |
| Spring Security | (Boot managed) | JWT auth, RBAC |
| Spring Data JPA | (Boot managed) | ORM, database access |
| Hibernate | (Boot managed) | Auto DDL, JPQL |
| MySQL Connector/J | (Boot managed) | Database driver |
| jjwt | 0.11.5 | JWT creation and validation |
| Lombok | (Boot managed) | Boilerplate reduction |
| Razorpay Java SDK | 1.4.3 | Payment processing |
| Firebase Admin SDK | 9.2.0 | Push notifications |
| OkHttp | 4.12.0 | HTTP client |
| Jackson | (Boot managed) | JSON serialization |
| Spring Boot Mail | (Boot managed) | Email / OTP |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | SPA framework |
| React Router | v6.22 | Client-side routing |
| MUI (Material UI) | v5.15 | UI component library |
| Axios | 1.6.7 | HTTP client |
| Chart.js | 4.4.2 | Analytics charts |
| react-chartjs-2 | 5.2 | Chart.js React wrapper |
| react-hot-toast | 2.6 | Toast notifications |
| dayjs | 1.11 | Date formatting |

### Infrastructure

| Component | Technology |
|---|---|
| Local AI | Ollama + llama3 (4 GB model, runs offline) |
| Database | MySQL 8.0 with utf8mb4 charset |
| Build Tool | Apache Maven 3.8+ |
| Package Manager | npm 9+ |

---

## Features by Role

### 🔴 Admin

- **System Dashboard** — real-time stats: total students, faculty count, fees collected, upcoming exams
- **Student Management** — full CRUD: add, edit, delete students with enrollment number tracking
- **Faculty Management** — full CRUD with department assignment
- **Fee Management** — view ALL student fees, update status (PAID / PENDING / OVERDUE), bulk manage
- **CGPA Publishing** — bulk upload CGPA/SGPA values for all students
- **Result Publishing** — publish mid-term and semester marks for any exam
- **Exam Management** — create, update, cancel exams with venue and timing
- **Announcements** — send email announcements (holiday, exam alert, event types)
- **AI Chatbot** — campus-wide queries: students at risk, fee collection summary, result overview
- **Analytics** — AI-powered performance insights for any student

### 🟡 Faculty

- **Faculty Dashboard** — course stats, student count, topics covered this week
- **Attendance Marking** — mark PRESENT / ABSENT / LATE per student per course per date
- **Schedule / Topics** — log topics taught with date, method, sub-topics
- **Result Publishing** — publish mid-term marks for assigned courses
- **Student View** — see attendance percentage and results for all enrolled students
- **AI Chatbot** — queries about students at risk, student performance, upcoming exams

### 🟢 Student

- **Student Dashboard** — attendance %, CGPA, upcoming exams, pending fees at a glance
- **Attendance Page** — course-wise attendance with 75% calculator (classes to attend or miss)
- **Results & GPA** — exam results with grades, CGPA / SGPA per semester, trend chart
- **Fees Page** — view all fee records, pay online via Razorpay (UPI, card, netbanking)
- **AI Insights** — full performance analysis with personalized study suggestions
- **AI Chatbot** — ask about your own attendance, marks, fees, exams in natural language
- **Study Plan** — AI-generated study schedule based on upcoming exams

---

## Project Structure

```
final_campus/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/campusiq/
│       │   ├── CampusIQApplication.java       # Spring Boot entry point
│       │   ├── config/
│       │   │   ├── DataInitializer.java        # Seeds demo data on first run
│       │   │   ├── SecurityConfig.java         # JWT filter, CORS, RBAC rules
│       │   │   └── FirebaseConfig.java         # Push notification setup
│       │   ├── controller/                     # One controller per domain
│       │   │   ├── AuthController.java
│       │   │   ├── UserController.java
│       │   │   ├── AttendanceController.java
│       │   │   ├── ExamController.java
│       │   │   ├── ResultController.java
│       │   │   ├── FeeController.java
│       │   │   ├── CgpaController.java
│       │   │   ├── ChatbotController.java
│       │   │   ├── AnalyticsController.java
│       │   │   ├── NotificationController.java
│       │   │   ├── AnnouncementController.java
│       │   │   ├── FacultyScheduleController.java
│       │   │   └── CourseController.java
│       │   ├── service/                        # Business logic
│       │   │   ├── AIChatbotService.java       # Main chatbot logic + built-in engine
│       │   │   ├── OllamaService.java          # Ollama HTTP client (local AI)
│       │   │   ├── AuthService.java
│       │   │   ├── ResultService.java
│       │   │   ├── FeeService.java
│       │   │   ├── AttendanceService.java
│       │   │   └── ...
│       │   ├── repository/                     # Spring Data JPA interfaces
│       │   ├── entity/                         # JPA entities
│       │   │   ├── User.java
│       │   │   ├── Course.java
│       │   │   ├── Exam.java
│       │   │   ├── Result.java
│       │   │   ├── Attendance.java
│       │   │   ├── Fee.java
│       │   │   ├── StudentCgpa.java
│       │   │   └── ...
│       │   ├── dto/
│       │   │   ├── request/                    # Input DTOs with @Valid annotations
│       │   │   └── response/                   # ApiResponse<T> wrapper
│       │   ├── security/                       # JWT filter, UserPrincipal
│       │   └── exception/                      # GlobalExceptionHandler
│       └── resources/
│           └── application.properties
│
├── frontend/
│   ├── .env                                    # API URL + Razorpay key
│   ├── package.json
│   └── src/
│       ├── App.js                              # Routes + ProtectedRoute wiring
│       ├── index.js
│       ├── context/
│       │   └── AuthContext.js                  # JWT state management
│       ├── services/
│       │   └── api.js                          # All Axios API calls
│       ├── theme/
│       │   └── theme.js                        # MUI theme (navy + blue palette)
│       ├── components/
│       │   ├── layout/AppLayout.jsx            # Sidebar + top nav
│       │   └── shared/                         # StatCard, PageHeader, etc.
│       └── pages/
│           ├── auth/LoginPage.jsx
│           ├── admin/
│           │   ├── AdminDashboard.jsx
│           │   ├── StudentsList.jsx
│           │   ├── FacultyList.jsx
│           │   └── PublishCGPAPage.jsx
│           ├── faculty/
│           │   ├── FacultyDashboard.jsx
│           │   └── FacultySchedulePage.jsx
│           ├── student/
│           │   ├── StudentDashboard.jsx
│           │   ├── GPAPage.jsx
│           │   └── StudentDetails.jsx
│           ├── ai/
│           │   ├── ChatbotPage.jsx             # CampusMate AI chat UI
│           │   ├── AIInsightsPage.jsx
│           │   └── StudyPlanPage.jsx
│           ├── attendance/AttendancePage.jsx
│           ├── results/
│           │   ├── ResultPage.jsx
│           │   └── PublishResultPage.jsx
│           ├── fees/FeePage.jsx
│           └── exams/ExamPage.jsx
│
└── database/
    ├── campusiq_schema.sql                     # Full schema (all tables + indexes)
    └── student cgpa.sql                        # Migration: student_cgpa table
```

---

## Quick Start

```bash
# 1. Create and populate the database
mysql -u root -p -e "CREATE DATABASE campusiq_v6 CHARACTER SET utf8mb4;"
mysql -u root -p campusiq_v6 < database/campusiq_schema.sql
mysql -u root -p campusiq_v6 < "database/student cgpa.sql"

# 2. Start Ollama AI (optional — keep terminal open)
ollama pull llama3
ollama serve

# 3. Start backend (new terminal)
cd backend
# Edit src/main/resources/application.properties — set your MySQL password
mvn clean install -DskipTests
mvn spring-boot:run

# 4. Start frontend (new terminal)
cd frontend
npm install
npm start
```

Open `http://localhost:3000` and log in with any demo credential below.

---

## Demo Credentials

**Password for all accounts: `campusiq@1234`**

| Role | Username | Name | Email |
|---|---|---|---|
| `ADMIN` | `admin` | System Admin | admin@campusiq.com |
| `FACULTY` | `faculty1` | Prof. Ramesh Kumar | faculty1@campusiq.com |
| `FACULTY` | `faculty2` | Dr. Priya Lakshmi | faculty2@campusiq.com |
| `STUDENT` | `ravi2268` | Ravi Kumar | ravi@campusiq.com |
| `STUDENT` | `priya2269` | Priya Sharma | priya@campusiq.com |
| `STUDENT` | `anjali2270` | Anjali Reddy | anjali@campusiq.com |
| `STUDENT` | `farhan2271` | Mohammed Farhan | farhan@campusiq.com |
| `STUDENT` | `sneha2272` | Sneha Patel | sneha@campusiq.com |

---

## CampusMate AI Chatbot

CampusMate AI is a context-aware chatbot that reads live data from MySQL and responds in natural language.

### How It Works

```
User message
     │
     ▼
Intent Detector
(is this a campus question?)
     │
     ├── Campus Question ──► DatabaseContextBuilder
     │                            │
     │                       Fetches attendance, CGPA,
     │                       fees, exams from MySQL
     │                            │
     └── General Question ◄───────┘
                  │
                  ▼
         Built-in Engine (always runs — no external deps)
                  │
                  ▼ (if Ollama is available)
         OllamaService.askAI() — llama3 enhances the answer
                  │
                  ▼
         Response + Suggestions → Frontend
```

### Campus Data Questions (Built-in Engine)

| Query keyword | Response |
|---|---|
| `attendance`, `present`, `absent` | Course-wise attendance % with 75% calculator |
| `cgpa`, `cumulative gpa` | CGPA with grade point breakdown |
| `sgpa`, `semester gpa` | SGPA for current semester |
| `result`, `marks`, `score`, `grade` | All exam marks with pass/fail status |
| `fee`, `pending`, `payment`, `due` | Fee records with outstanding amount |
| `exam`, `upcoming`, `timetable` | Next scheduled exams with dates and venues |
| `profile`, `my detail` | User profile information |
| `summary`, `dashboard`, `how am i` | Full academic overview |
| `risk`, `below 75` | Students below attendance threshold (Admin/Faculty) |

### General Knowledge Questions (Ollama AI)

When Ollama (`llama3`) is running, all other questions — coding concepts, career advice, study tips, general knowledge — are answered by the local AI model.

The chatbot **never breaks**: if Ollama is offline, the built-in engine handles everything.

---

## API Overview

**Base URL:** `http://localhost:8080/api`

| Group | Base Path | Key Endpoints |
|---|---|---|
| Auth | `/auth` | POST `/login`, POST `/register`, GET `/me` |
| Users | `/users` | CRUD students & faculty, GET `/stats` |
| Attendance | `/attendance` | POST `/mark`, GET `/my`, GET `/student/{id}` |
| Exams | `/exams` | Full CRUD, GET `/upcoming` |
| Results | `/results` | POST `/publish/mid`, POST `/publish/sem`, GET `/my/gpa` |
| Fees | `/fees` | Full CRUD + Razorpay `/create-order`, `/verify-payment` |
| CGPA | `/cgpa` | POST `/publish`, GET `/student/{id}`, GET `/all` |
| Chatbot | `/chatbot` | POST `/chat` — `{ message: "..." }` |
| Analytics | `/analytics` | GET `/performance/my`, GET `/performance/student/{id}` |
| Notifications | `/notifications` | GET `/unread/count`, PATCH `/{id}/read` |
| Announcements | `/announcements` | POST `/send`, `/send/holiday`, `/send/exam` |
| Schedule | `/schedule` | POST, GET `/my`, GET `/course/{id}` |

All endpoints return a consistent response envelope:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-03-09T16:30:00"
}
```

---

## Key Technical Details

### Security

- Stateless JWT authentication with 24-hour token expiry
- `JwtAuthenticationFilter` intercepts every request and injects `UserPrincipal`
- Role-based access via `@PreAuthorize` and `SecurityConfig` request matchers
- BCrypt password hashing (Spring Security default)
- CORS configured for `http://localhost:3000` and `http://localhost:4200`

### Database

- Hibernate `ddl-auto=update` — tables are created/updated automatically on startup
- All demo data seeded by `DataInitializer.java` on first run (skipped if data exists)
- Cascading deletes on all foreign keys — deleting a student removes all their data
- All queries use JPQL (`@Query`) — no raw SQL strings

### API Design

- Every endpoint returns `ApiResponse<T>` — consistent shape across all responses
- `GlobalExceptionHandler` catches all exceptions and returns structured error JSON
- Input validated with `@Valid` + Jakarta Bean Validation annotations
- `@AuthenticationPrincipal UserPrincipal` injects the current user without DB lookup

### Frontend Architecture

- `AuthContext` stores JWT in `localStorage` and provides `user` and `logout` to all components
- Axios instance in `api.js` has an interceptor that attaches `Authorization: Bearer <token>` automatically
- `ProtectedRoute` component checks role before rendering — redirects to `/login` if not authorized
- All API methods are exported from a single `api.js` file for easy maintenance

---

## Port Reference

| Port | Service | URL |
|---|---|---|
| `3000` | React Frontend | http://localhost:3000 |
| `8080` | Spring Boot API | http://localhost:8080/api |
| `3306` | MySQL Database | `campusiq_v6` |
| `11434` | Ollama AI | http://localhost:11434 |

---

## Environment Variables

### Backend — `application.properties`

```properties
server.port=8080
server.servlet.context-path=/api
spring.datasource.url=jdbc:mysql://localhost:3306/campusiq_v6
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
app.jwt.secret=CampusIQPlusSecretKey2024SuperSecureJWTSigningKey256BitsOrMoreForHMACSHA
app.jwt.expiration-ms=86400000
spring.mail.username=your@gmail.com
spring.mail.password=your_16char_app_password
razorpay.key.id=rzp_test_xxxxxxxxxxxxxxxx
razorpay.key.secret=your_razorpay_secret
ollama.base-url=http://localhost:11434
ollama.model=llama3
ollama.timeout-seconds=60
app.cors.allowed-origins=http://localhost:3000
```

### Frontend — `.env`

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
REACT_APP_APP_NAME=CampusIQ+
REACT_APP_VERSION=2.0.0
```

---

*Built with Spring Boot 3 · React 18 · MySQL 8 · Ollama llama3*
