# 🎓 CampusIQ+ — Complete Setup Guide

> **AI-Powered Smart Campus Management Platform**  
> Spring Boot 3.2 · Java 17 · React 18 · MySQL 8 · Ollama AI

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1 — Database Setup](#step-1--database-setup)
3. [Step 2 — Backend Setup](#step-2--backend-setup-spring-boot)
4. [Step 3 — Ollama AI Setup](#step-3--ollama-ai-setup-optional)
5. [Step 4 — Frontend Setup](#step-4--frontend-setup-react-18)
6. [Startup Order](#startup-order)
7. [Demo Login Credentials](#demo-login-credentials)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Install all of the following before starting:

| Software | Version | Download | Verify |
|---|---|---|---|
| Java JDK | 17 or higher | [adoptium.net](https://adoptium.net) | `java -version` |
| Apache Maven | 3.8+ | [maven.apache.org](https://maven.apache.org) | `mvn -version` |
| MySQL Server | 8.0+ | [dev.mysql.com](https://dev.mysql.com/downloads/mysql) | `mysql -V` |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) | `node -v` |
| npm | 9+ | bundled with Node.js | `npm -v` |
| Git | Any | [git-scm.com](https://git-scm.com) | `git --version` |
| Ollama (AI) | Latest | [ollama.com/download](https://ollama.com/download) | `ollama --version` |

---

## Step 1 — Database Setup

### 1.1 Create the Database

Open your terminal and connect to MySQL:

```bash
mysql -u root -p
```

Run these commands inside the MySQL shell:

```sql
CREATE DATABASE campusiq_v6 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 1.2 Run the Schema Script

From the project root folder:

```bash
mysql -u root -p campusiq_v6 < database/campusiq_schema.sql
```

### 1.3 Run the CGPA Migration

```bash
mysql -u root -p campusiq_v6 < "database/student cgpa.sql"
```

> **Note:** The schema script drops and recreates all tables. Demo data is **auto-seeded** on first backend startup by `DataInitializer.java` — you do NOT need to insert any data manually.

---

## Step 2 — Backend Setup (Spring Boot)

### 2.1 Configure application.properties

Open `backend/src/main/resources/application.properties` and update these values:

| Property | Default | What to Change |
|---|---|---|
| `spring.datasource.password` | `Kalki@12345` | Your MySQL root password |
| `spring.datasource.url` | `localhost:3306` | If MySQL is on a different host/port |
| `spring.mail.username` | `kalkitarun04@gmail.com` | Your Gmail address for OTP emails |
| `spring.mail.password` | *(app password)* | Your 16-char Gmail App Password |
| `razorpay.key.id` | `rzp_test_SI50pw3ScFGRcS` | Your Razorpay test key (optional) |
| `razorpay.key.secret` | *(secret)* | Your Razorpay secret (optional) |
| `ollama.base-url` | `http://localhost:11434` | Change if Ollama runs on another host |
| `ollama.model` | `llama3` | Change to `llama3.2`, `mistral`, etc. |

### 2.2 Gmail App Password Setup (for OTP emails)

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification**
3. Go to **App Passwords** → Select "Mail" → Generate
4. Copy the 16-character password into `spring.mail.password`

### 2.3 Build and Start the Backend

```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

**Backend starts on:** `http://localhost:8080/api`

> **First startup** may take 60–90 seconds as Maven downloads dependencies. All tables and demo data are created automatically.

---

## Step 3 — Ollama AI Setup (Optional)

Ollama runs `llama3` locally for the CampusMate AI chatbot. If Ollama is not running, the chatbot still works using the **built-in keyword engine** — it never breaks.

### 3.1 Install Ollama

**Windows / macOS** — Download the installer from [ollama.com/download](https://ollama.com/download) and run it.

**Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 3.2 Pull the AI Model

```bash
ollama pull llama3
```

> Downloads ~4 GB once. Takes 5–10 minutes depending on your connection.

### 3.3 Start Ollama Server

```bash
ollama serve
```

Keep this terminal open while the app is running.

### 3.4 Verify It Works

```bash
curl http://localhost:11434/api/generate \
  -d '{"model":"llama3","prompt":"hello","stream":false}'
```

You should receive a JSON response with a `"response"` field.

> **Tip:** The chatbot automatically detects whether Ollama is running. If unavailable, it falls back to the built-in engine which answers all campus data questions (attendance, CGPA, exams, fees) without any AI.

---

## Step 4 — Frontend Setup (React 18)

### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

### 4.2 Check Environment File

The file `frontend/.env` is pre-configured with these defaults:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SI50pw3ScFGRcS
REACT_APP_APP_NAME=CampusIQ+
REACT_APP_VERSION=2.0.0
```

Only change `REACT_APP_API_BASE_URL` if your backend runs on a different host.

### 4.3 Start the Frontend

```bash
npm start
```

**Frontend starts on:** `http://localhost:3000`  
The browser opens automatically.

---

## Startup Order

Always start services in this sequence:

| # | Service | Command | Expected Output |
|---|---|---|---|
| 1 | MySQL | `mysqld` (or system service) | Port 3306 active |
| 2 | Ollama AI | `ollama serve` | Listening on port 11434 |
| 3 | Spring Boot | `cd backend && mvn spring-boot:run` | Started on port 8080 |
| 4 | React | `cd frontend && npm start` | Opens localhost:3000 |

---

## Demo Login Credentials

**Password for ALL accounts: `campusiq@1234`**

| Role | Username | Name | Email | Notes |
|---|---|---|---|---|
| `ADMIN` | `admin` | System Admin | admin@campusiq.com | Full system access |
| `FACULTY` | `faculty1` | Prof. Ramesh Kumar | faculty1@campusiq.com | CS Department |
| `FACULTY` | `faculty2` | Dr. Priya Lakshmi | faculty2@campusiq.com | Electronics Dept |
| `STUDENT` | `ravi2268` | Ravi Kumar | ravi@campusiq.com | Low attendance 68%, pending fees |
| `STUDENT` | `priya2269` | Priya Sharma | priya@campusiq.com | Good performance A+ |
| `STUDENT` | `anjali2270` | Anjali Reddy | anjali@campusiq.com | Average performance |
| `STUDENT` | `farhan2271` | Mohammed Farhan | farhan@campusiq.com | Demo student |
| `STUDENT` | `sneha2272` | Sneha Patel | sneha@campusiq.com | Demo student |

---

## API Reference

**Base URL:** `http://localhost:8080/api`  
All endpoints require a `Bearer <JWT>` header **except** `/auth/login` and `/auth/register`.

### Auth

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/auth/login` | Login — returns JWT token | Public |
| `POST` | `/auth/register` | Register new user | Public |
| `GET` | `/auth/me` | Get current user profile | All roles |

### Users

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/users/students` | All students | Admin, Faculty |
| `GET` | `/users/faculty` | All faculty | Admin |
| `GET` | `/users/me` | Own profile | All roles |
| `GET` | `/users/stats` | System statistics | Admin |
| `POST` | `/users/students` | Create student account | Admin |
| `POST` | `/users/faculty` | Create faculty account | Admin |
| `PUT` | `/users/{id}` | Update user | Admin |
| `DELETE` | `/users/{id}` | Delete user | Admin |

### Courses

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/courses` | All courses | All roles |
| `GET` | `/courses/my` | My courses | Faculty |
| `GET` | `/courses/{id}` | Course by ID | All roles |
| `POST` | `/courses` | Create course | Admin |
| `PUT` | `/courses/{id}` | Update course | Admin |
| `DELETE` | `/courses/{id}` | Delete course | Admin |

### Attendance

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/attendance/mark` | Mark attendance | Faculty, Admin |
| `GET` | `/attendance/my` | My attendance records | Student |
| `GET` | `/attendance/student/{id}` | Student attendance | Admin, Faculty |
| `GET` | `/attendance/student/{id}/course/{cid}/percentage` | Attendance % | Admin, Faculty |
| `GET` | `/attendance/course/{cid}/date/{date}` | Course attendance by date | Faculty, Admin |

### Exams

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/exams` | All exams | All roles |
| `GET` | `/exams/upcoming` | Upcoming exams | All roles |
| `GET` | `/exams/{id}` | Exam by ID | All roles |
| `GET` | `/exams/course/{id}` | Exams for a course | All roles |
| `POST` | `/exams` | Create exam | Admin, Faculty |
| `PUT` | `/exams/{id}` | Update exam | Admin, Faculty |
| `DELETE` | `/exams/{id}` | Delete exam | Admin |

### Results

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/results/publish/mid` | Publish mid-term marks | Faculty, Admin |
| `POST` | `/results/publish/sem` | Publish semester marks | Admin |
| `GET` | `/results/my` | My results | Student |
| `GET` | `/results/my/mid` | My mid-term results | Student |
| `GET` | `/results/my/sem` | My semester results | Student |
| `GET` | `/results/my/gpa` | My CGPA / SGPA | Student |
| `GET` | `/results/student/{id}` | Student results | Admin, Faculty |
| `GET` | `/results/student/{id}/gpa` | Student GPA | Admin, Faculty |
| `GET` | `/results/student/{id}/semester/{sem}` | Results by semester | Admin, Faculty |
| `GET` | `/results/exam/{id}` | All results for an exam | Admin, Faculty |
| `GET` | `/results/all` | All results | Admin |

### Fees

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/fees/my` | My fees | Student |
| `GET` | `/fees/my/pending-amount` | My total pending amount | Student |
| `GET` | `/fees/all` | All student fees | Admin |
| `POST` | `/fees` | Create fee record | Admin |
| `PUT` | `/fees/{id}` | Update fee | Admin |
| `PATCH` | `/fees/{id}/status` | Update payment status | Admin |
| `DELETE` | `/fees/{id}` | Delete fee | Admin |
| `POST` | `/fees/{id}/create-order` | Create Razorpay order | Student |
| `POST` | `/fees/verify-payment` | Verify payment | Student |

### CGPA

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/cgpa/publish` | Bulk publish CGPA | Admin |
| `GET` | `/cgpa/student/{id}` | Student CGPA records | Admin, Faculty |
| `GET` | `/cgpa/all` | All CGPA records | Admin |

### Notifications

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/notifications` | All notifications | All roles |
| `GET` | `/notifications/unread` | Unread notifications | All roles |
| `GET` | `/notifications/unread/count` | Unread count | All roles |
| `PATCH` | `/notifications/{id}/read` | Mark as read | All roles |
| `PATCH` | `/notifications/read-all` | Mark all as read | All roles |
| `POST` | `/notifications/broadcast` | Broadcast message | Admin |

### Announcements

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/announcements/send` | Send announcement | Admin, Faculty |
| `POST` | `/announcements/send/holiday` | Holiday announcement | Admin |
| `POST` | `/announcements/send/exam` | Exam announcement | Admin, Faculty |
| `POST` | `/announcements/send/event` | Event announcement | Admin |

### Schedule

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/schedule` | Add topic taught | Faculty |
| `GET` | `/schedule/my` | My teaching schedule | Faculty |
| `GET` | `/schedule/faculty/{id}` | Faculty schedule | Admin |
| `GET` | `/schedule/course/{id}` | Schedule by course | Admin, Faculty |
| `GET` | `/schedule/my/date/{date}` | My schedule by date | Faculty |
| `DELETE` | `/schedule/{id}` | Delete entry | Faculty, Admin |

### Chatbot / AI

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/chatbot/chat` | Ask CampusMate AI `{ message: "..." }` | All roles |
| `GET` | `/analytics/performance/my` | My performance analytics | Student |
| `GET` | `/analytics/performance/student/{id}` | Student analytics | Admin, Faculty |

---

## Troubleshooting

### Backend won't start — Port 8080 already in use

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <pid> /F

# Linux / macOS
lsof -ti:8080 | xargs kill -9
```

### Database connection failed

- Verify MySQL is running: `mysqladmin -u root -p status`
- Check the password in `application.properties` matches your MySQL root password
- Ensure the database exists: run `SHOW DATABASES;` in the MySQL shell — you should see `campusiq_v6`

### Maven build failure

```bash
# Check Java version — must be 17+
java -version

# Clean build
mvn clean install -DskipTests
```

### Frontend shows blank page or 403 on API calls

- Verify the backend is running on port 8080
- Check `frontend/.env` has `REACT_APP_API_BASE_URL=http://localhost:8080/api`
- Clear browser `localStorage` (DevTools → Application → Local Storage → Clear All) and log in again
- JWT token may have expired (default 24 hours) — log out and back in

### Chatbot always returns the same welcome message

- Ensure you have the latest `AIChatbotService.java` (v2 — built-in engine runs first)
- Restart the Spring Boot backend after replacing any service files
- The built-in engine works without Ollama — no AI dependency required for campus data queries

### Ollama not responding

```bash
# Start server (keep terminal open)
ollama serve

# Pull model if not done yet (~4 GB)
ollama pull llama3

# Test
curl http://localhost:11434/api/generate \
  -d '{"model":"llama3","prompt":"hello","stream":false}'
```

The app works perfectly without Ollama — the chatbot uses the built-in keyword engine automatically.

### Email OTP not working

1. Go to your Google Account → **Security** → **App Passwords**
2. Generate a 16-character App Password for "Mail"
3. Set it as `spring.mail.password` in `application.properties`
4. Use the 16-char App Password, **not** your regular Gmail password

### 403 Forbidden on API calls

- Clear `localStorage` in DevTools and log in again
- JWT token likely expired — re-login generates a fresh 24h token
- Verify `SecurityConfig.java` permits the endpoint for your role

---

## Port Reference

| Port | Service | URL |
|---|---|---|
| `3000` | React Frontend | http://localhost:3000 |
| `8080` | Spring Boot API | http://localhost:8080/api |
| `3306` | MySQL Database | jdbc:mysql://localhost:3306/campusiq_v6 |
| `11434` | Ollama AI | http://localhost:11434 |

---

*CampusIQ+ · Spring Boot 3 + React 18 + MySQL 8 + Ollama AI · Default password: `campusiq@1234`*
