import axios from 'axios';

// Backend runs at :8080/api  (server.servlet.context-path=/api in application.properties)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// ── REQUEST INTERCEPTOR: attach JWT to every request ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusiq_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR: handle 401 globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // If 401 on a non-auth endpoint → token expired/invalid → logout
    if (status === 401 && !url.includes('/auth/')) {
      localStorage.removeItem('campusiq_token');
      localStorage.removeItem('campusiq_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ══════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// Each maps to a Spring Boot @RestController endpoint
// Base path: http://localhost:8080/api/...
// ══════════════════════════════════════════════════════════════════════════

// POST /auth/login  → { username, password } → { accessToken, userId, username, name, email, role }
// POST /auth/register
export const authAPI = {
  login:      (data)  => api.post('/auth/login', data),
  register:   (data)  => api.post('/auth/register', data),
  verifyOtp:  (data)  => api.post('/auth/verify-otp', data),
  resendOtp:  (email) => api.post(`/auth/resend-otp?email=${email}`),
  enable2FA:  ()      => api.post('/auth/2fa/enable'),
  disable2FA: ()      => api.post('/auth/2fa/disable'),
};

// GET /attendance/my          → student sees own attendance
// GET /attendance/student/{id}
// POST /attendance/mark
export const attendanceAPI = {
  getMyAttendance:      ()                    => api.get('/attendance/my'),
  getStudentAttendance: (studentId)           => api.get(`/attendance/student/${studentId}`),
  getStudentCoursePct:  (studentId, courseId) => api.get(`/attendance/student/${studentId}/course/${courseId}/percentage`),
  markAttendance:       (data)                => api.post('/attendance/mark', data),
  getByDateAndCourse:   (courseId, date)      => api.get(`/attendance/course/${courseId}/date/${date}`),
};

// GET /fees/my
// GET /fees/student/{id}
export const feeAPI = {
  getMyFees:          ()      => api.get('/fees/my'),
  getStudentFees:     (id)    => api.get(`/fees/student/${id}`),
  getAllFees:          ()      => api.get('/fees/all'),
  createFee:          (data)  => api.post('/fees', data),
  getMyPendingAmount: ()      => api.get('/fees/my/pending-amount'),
  createPaymentOrder: (feeId) => api.post(`/fees/${feeId}/create-order`),
  verifyPayment:      (data)  => api.post('/fees/verify-payment', data),
  updateFee:          (id, data) => api.put(`/fees/${id}`, data),
  updateFeeStatus:    (id, status) => api.patch(`/fees/${id}/status`, { status }),
  deleteFee:          (id)    => api.delete(`/fees/${id}`),
};

// GET /exams/upcoming
// GET /exams
export const examAPI = {
  createExam:   (data)       => api.post('/exams', data),
  getAllExams:   ()           => api.get('/exams'),
  getUpcoming:  ()           => api.get('/exams/upcoming'),
  getExamById:  (id)         => api.get(`/exams/${id}`),
  updateExam:   (id, data)   => api.put(`/exams/${id}`, data),
  updateStatus: (id, status) => api.patch(`/exams/${id}/status?status=${status}`),
  deleteExam:   (id)         => api.delete(`/exams/${id}`),
  getByCourse:  (cid)        => api.get(`/exams/course/${cid}`),
  getMyExams:   ()           => api.get('/exams/my'),
};

// GET /results/my
// GET /results/student/{id}
export const resultAPI = {
  publishResults:    (data)      => api.post('/results/publish', data),
  getMyResults:      ()          => api.get('/results/my'),
  getStudentResults: (studentId) => api.get(`/results/student/${studentId}`),
  getExamResults:    (examId)    => api.get(`/results/exam/${examId}`),
};

// GET /analytics/performance/my
export const analyticsAPI = {
  getMyPerformance:      ()          => api.get('/analytics/performance/my'),
  getStudentPerformance: (studentId) => api.get(`/analytics/performance/student/${studentId}`),
};

// GET /notifications
export const notificationAPI = {
  getAll: (page = 0, size = 20) =>
  api.get('/notifications', { params: { page, size } })
     .then(res => res.data.content),
  getUnread:     () =>
                    api.get('/notifications/unread'),

  // ✅ ADD THIS FUNCTION
  getUnreadCount: () =>
                    api.get('/notifications/unread/count'),

  markRead:      (id) =>
                    api.patch(`/notifications/${id}/read`),

  markAllRead:   () =>
                    api.patch('/notifications/read-all'),
};

// POST /chatbot/chat
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/chat', { message }),
};

// GET/POST/PUT/DELETE /courses
export const courseAPI = {
  getAll:       ()        => api.get('/courses'),
  getMyCourses: ()        => api.get('/courses/my'),           // faculty's own courses
  getById:      (id)      => api.get(`/courses/${id}`),
  getByFaculty: (fid)     => api.get(`/courses/faculty/${fid}`),
  create:       (data)    => api.post('/courses', data),       // admin only
  update:       (id, d)   => api.put(`/courses/${id}`, d),    // admin only
  delete:       (id)      => api.delete(`/courses/${id}`),    // admin only
};

// ── Aliases for backward compatibility with page components ──────────────
export const aiAPI = {
  getMyPerformance:      ()          => api.get('/analytics/performance/my'),
  getStudentPerformance: (studentId) => api.get(`/analytics/performance/student/${studentId}`),
  chat:                  (message, history) => api.post('/chatbot/chat', { message, history: history || [] }),
  generateStudyPlan:     ()          => api.get('/analytics/performance/my'),
};

export const notifAPI = notificationAPI;


// GET /users/students, /users/faculty, /users/{id}, /users/stats
export const userAPI = {
  getStudents:   ()          => api.get('/users/students'),
  getFaculty:    ()          => api.get('/users/faculty')
  getById:       (id)        => api.get(`/users/${id}`),
  getMyProfile:  ()          => api.get('/users/me'),
  getMyFull:     ()          => api.get('/users/me/full'),
  getStats:      ()          => api.get('/users/stats'),
  // ── ADMIN CREATE ──
  createStudent: (data)      => api.post('/users/students', data),
  createFaculty: (data)      => api.post('/users/faculty', data),
  // ── ADMIN UPDATE/DELETE ──
  updateUser:    (id, data)  => api.put(`/users/${id}`, data),
  deleteUser:    (id)        => api.delete(`/users/${id}`),
};

// GET /schedule/my, /schedule/course/{id}, /schedule/faculty/{id}
export const scheduleAPI = {
  addSchedule:    (data)     => api.post('/schedule', data),
  getMySchedules: ()         => api.get('/schedule/my'),
  getCourseSchedules: (id)   => api.get(`/schedule/course/${id}`),
  getFacultySchedules: (id)  => api.get(`/schedule/faculty/${id}`),
  deleteSchedule: (id)       => api.delete(`/schedule/${id}`),
};

// GPA endpoints
export const gpaAPI = {
  getMyGpa:        ()            => api.get('/results/my/gpa'),
  getStudentGpa:   (id)          => api.get(`/results/student/${id}/gpa`),
  getSemesterGpa:  (id, sem)     => api.get(`/results/student/${id}/semester/${sem}`), 
};

// CGPA publish — ADMIN ONLY
// POST /cgpa/publish          → bulk upload CGPA values
// GET  /cgpa/student/{id}     → view a student's CGPA history
// GET  /cgpa/all              → all CGPA records
export const cgpaUploadAPI = {
  publishCgpa:    (data) => api.post('/cgpa/publish', data),
  getStudentCgpa: (id)   => api.get(`/cgpa/student/${id}`),
  getAllCgpa:      ()     => api.get('/cgpa/all'),
};

export default api;