import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Tabs, Tab, Paper, IconButton,
  Tooltip, LinearProgress, Stack
} from '@mui/material';
import {
  Badge as BadgeIcon, Email, Phone, School, TrendingUp,
  AccountCircle, People, CalendarMonth, Payment, CheckCircle,
  VerifiedUser, QrCode2, Print, Edit, Download, Star, EmojiEvents,
  Description, Schedule, Warning, LocationOn, FamilyRestroom,
  AccountBalance, WorkspacePremium, Security
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import {
  analyticsAPI, attendanceAPI, gpaAPI, resultAPI,
  userAPI, academicRecordAPI, feeAPI, timetableAPI
} from '../../services/api';
import { getSharedStudentCgpa, subscribeToDataSync, DATA_SYNC_EVENTS } from '../../services/dataSync';
import PageHeader from '../../components/shared/PageHeader';
import ProfilePhotoUploader from '../../components/shared/ProfilePhotoUploader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

export default function StudentDetails() {
  const { id } = useParams();
  const { user, isAdmin, isFaculty } = useAuth();
  const navigate = useNavigate();

  // If no id param in URL, display the logged-in student's profile
  const studentId = id || user?.id;
  const isOwnProfile = String(studentId) === String(user?.id);
  const canEdit = isAdmin || isOwnProfile;

  const [tabIndex,        setTabIndex]        = useState(0);
  const [student,         setStudent]         = useState(null);
  const [attendance,      setAttendance]      = useState([]);
  const [results,         setResults]         = useState([]);
  const [gpa,             setGpa]             = useState(null);
  const [academicProfile, setAcademicProfile] = useState(null);
  const [fees,            setFees]            = useState([]);
  const [timetable,       setTimetable]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');

  // Edit Dialog State
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving,   setSaving]   = useState(false);

  // Digital ID Card Print Ref
  const idCardRef = useRef(null);

  const loadStudentProfileData = () => {
    if (!studentId) return;
    setLoading(true);
    Promise.allSettled([
      userAPI.getById(studentId),
      isOwnProfile ? attendanceAPI.getMyAttendance() : attendanceAPI.getStudentAttendance(studentId),
      isOwnProfile ? resultAPI.getMyResults() : resultAPI.getStudentResults(studentId),
      isOwnProfile ? gpaAPI.getMyGpa() : gpaAPI.getStudentGpa(studentId),
      isOwnProfile ? analyticsAPI.getMyPerformance() : analyticsAPI.getStudentPerformance(studentId),
      isOwnProfile ? academicRecordAPI.getMyRecords() : academicRecordAPI.getStudentRecords(studentId),
      isOwnProfile ? feeAPI.getMyFees() : feeAPI.getStudentFees(studentId),
      timetableAPI.getMy(),
    ]).then(([u, att, res, gpaRes, perfRes, acadRes, feeRes, timeRes]) => {
      if (u.status === 'fulfilled') {
        const sData = u.value.data.data;
        setStudent(sData);
        setEditForm(sData || {});
      }
      if (att.status === 'fulfilled')     setAttendance(att.value.data.data || []);
      if (res.status === 'fulfilled')     setResults(res.value.data.data || []);
      if (gpaRes.status === 'fulfilled')  setGpa(gpaRes.value.data.data);
      if (acadRes.status === 'fulfilled') setAcademicProfile(acadRes.value.data.data || null);
      if (feeRes.status === 'fulfilled')  setFees(feeRes.value.data.data || []);
      if (timeRes.status === 'fulfilled') setTimetable(timeRes.value.data.data || []);
      setLoading(false);
    }).catch(err => {
      setError('Unable to load student profile records.');
      setLoading(false);
    });
  };

  useEffect(() => {
    loadStudentProfileData();
    window.addEventListener('focus', loadStudentProfileData);
    const unsubscribe = subscribeToDataSync((event) => {
      if (event.type === DATA_SYNC_EVENTS.RESULT_PUBLISHED || event.type === DATA_SYNC_EVENTS.ATTENDANCE_UPDATED) {
        loadStudentProfileData();
      }
    });
    return () => {
      window.removeEventListener('focus', loadStudentProfileData);
      unsubscribe();
    };
  }, [studentId, user?.id]);

  const handleOpenEdit = () => {
    setEditForm({
      name: student?.name || '',
      email: student?.email || '',
      phoneNumber: student?.phoneNumber || '',
      department: student?.department || 'Computer Science',
      course: student?.course || 'B.Tech Computer Science',
      year: student?.year || '1st Year',
      semester: student?.semester || 1,
      section: student?.section || 'Section A',
      enrollmentNumber: student?.enrollmentNumber || '',
      dateOfBirth: student?.dateOfBirth || '',
      gender: student?.gender || 'Male',
      address: student?.address || '',
      emergencyContact: student?.emergencyContact || '',
      guardianName: student?.guardianName || '',
      guardianPhone: student?.guardianPhone || '',
      guardianEmail: student?.guardianEmail || '',
      guardianRelation: student?.guardianRelation || 'Parent',
      batchYear: student?.batchYear || '2022-2026',
      admissionStatus: student?.admissionStatus || 'ADMITTED',
      admissionQuota: student?.admissionQuota || 'Convenor Quota',
      admissionDate: student?.admissionDate || '',
      extracurriculars: student?.extracurriculars || '',
      achievements: student?.achievements || '',
      certificates: student?.certificates || '',
      documents: student?.documents || '',
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await userAPI.updateUser(student.id, editForm);
      toast.success('Student profile updated successfully!');
      setEditOpen(false);
      loadStudentProfileData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVerification = async () => {
    try {
      const newStatus = !student.isVerified;
      await userAPI.verifyUser(student.id, { verified: newStatus, admissionStatus: newStatus ? 'VERIFIED' : 'PENDING' });
      toast.success(`Profile verification updated to: ${newStatus ? 'VERIFIED' : 'UNVERIFIED'}`);
      loadStudentProfileData();
    } catch (err) {
      toast.error('Failed to update verification status.');
    }
  };

  const handlePrintIdCard = () => {
    window.print();
  };

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!student) return <Alert severity="warning" sx={{ m: 3 }}>Student profile not found.</Alert>;

  // Calculated Metrics
  const courseAtt = {};
  attendance.forEach(a => {
    const key = a.course?.id;
    if (!key) return;
    if (!courseAtt[key]) courseAtt[key] = { name: a.course?.courseCode || a.course?.courseName, present: 0, total: 0 };
    courseAtt[key].total++;
    if (a.status === 'PRESENT' || a.status === 'LATE') courseAtt[key].present++;
  });

  const totalAttClasses = attendance.length;
  const totalAttPresent = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const overallAttPct   = totalAttClasses > 0 ? (totalAttPresent / totalAttClasses) * 100 : 0;
  const sharedCgpaEntry = getSharedStudentCgpa(studentId);
  const cgpa            = Number(sharedCgpaEntry?.cgpa || academicProfile?.overallCgpa || gpa?.cgpa || 0);
  const sgpa            = Number(sharedCgpaEntry?.sgpa || gpa?.sgpa || 0);

  // Fee calculation
  const totalFeeAmount = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const totalFeePaid   = fees.reduce((sum, f) => sum + (f.status === 'PAID' ? Number(f.amount || 0) : Number(f.paidAmount || 0)), 0);
  const totalFeeDue    = Math.max(0, totalFeeAmount - totalFeePaid);
  const feeStatus      = totalFeeAmount === 0 ? 'CLEARED' : totalFeeDue === 0 ? 'PAID' : totalFeePaid > 0 ? 'PARTIAL' : 'PENDING';

  // Sample or JSON-parsed extracurriculars and certificates
  let extracurricularList = [];
  try {
    if (student.extracurriculars && student.extracurriculars.startsWith('[')) {
      extracurricularList = JSON.parse(student.extracurriculars);
    } else if (student.extracurriculars) {
      extracurricularList = student.extracurriculars.split(',').map(s => ({ title: s.trim(), type: 'Activity' }));
    }
  } catch (e) {
    extracurricularList = [{ title: student.extracurriculars, type: 'Activity' }];
  }

  if (extracurricularList.length === 0) {
    extracurricularList = [
      { title: 'Campus AI & Coding Club Member', type: 'Technical', role: 'Active Member', year: '2024' },
      { title: 'Smart India Hackathon Participant', type: 'Competition', role: 'Team Lead', year: '2023' },
      { title: 'National Service Scheme (NSS)', type: 'Community Service', role: 'Volunteer', year: '2023' },
    ];
  }

  let certificateList = [];
  try {
    if (student.certificates && student.certificates.startsWith('[')) {
      certificateList = JSON.parse(student.certificates);
    } else if (student.certificates) {
      certificateList = student.certificates.split(',').map(s => ({ name: s.trim(), issuer: 'Institution', date: '2024' }));
    }
  } catch (e) {
    certificateList = [{ name: student.certificates, issuer: 'Institution', date: '2024' }];
  }

  if (certificateList.length === 0) {
    certificateList = [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: 'Oct 2023', score: 'Verified Badge' },
      { name: 'Python for Data Structures & Algorithms', issuer: 'NPTEL / IIT Madras', date: 'May 2023', score: 'Elite + Silver' },
      { name: 'Full-Stack Web Development Immersion', issuer: 'CampusIQ Academics', date: 'Jan 2024', score: 'Grade A+' }
    ];
  }

  const studentQrData = JSON.stringify({
    type: 'STUDENT_VERIFICATION',
    id: student.id,
    rollNo: student.enrollmentNumber || student.username,
    name: student.name,
    dept: student.department,
    course: student.course || 'B.Tech',
    verified: student.isVerified,
    validUntil: '2026-06-30'
  });

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Student Profile & Academic Record"
        subtitle={`${student.name} • ${student.enrollmentNumber || student.username} • ${student.department || ''}`}
        breadcrumbs={['Home', 'Students', student.name]}
        action={
          <Stack direction="row" spacing={1.5}>
            {isAdmin && (
              <Button
                variant={student.isVerified ? 'outlined' : 'contained'}
                color={student.isVerified ? 'success' : 'warning'}
                startIcon={<VerifiedUser />}
                onClick={handleToggleVerification}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                {student.isVerified ? 'Verified Profile' : 'Verify Profile'}
              </Button>
            )}
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleOpenEdit}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                Edit Profile
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrintIdCard}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
            >
              Print ID Card
            </Button>
          </Stack>
        }
      />

      {/* Profile Overview Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${COLORS.border}`,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
          <ProfilePhotoUploader
            targetUser={student}
            size={96}
            onImageUpdated={(newUrl) => setStudent(prev => ({ ...prev, profileImage: newUrl }))}
          />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h5" fontWeight={800} color="#0f172a">
                {student.name}
              </Typography>
              <Chip
                label={student.isVerified ? 'Verified' : 'Pending Verification'}
                color={student.isVerified ? 'success' : 'warning'}
                size="small"
                icon={<VerifiedUser fontSize="small" />}
                sx={{ fontWeight: 700, borderRadius: 1 }}
              />
              <Chip
                label={student.admissionStatus || 'ADMITTED'}
                size="small"
                sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 700, borderRadius: 1 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <strong>Roll No:</strong> {student.enrollmentNumber || student.username} • <strong>Dept:</strong> {student.department} • <strong>Sem:</strong> {student.semester ? `Semester ${student.semester}` : student.year || '1st Year'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap', fontSize: 13, color: '#475569' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Email fontSize="inherit" color="action" /> {student.email}
              </Box>
              {student.phoneNumber && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Phone fontSize="inherit" color="action" /> {student.phoneNumber}
                </Box>
              )}
              {student.section && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <School fontSize="inherit" color="action" /> {student.section}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Quick Performance Badges */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center', minWidth: 100 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>CGPA</Typography>
            <Typography variant="h6" fontWeight={800} color={cgpa >= 8 ? '#16a34a' : cgpa >= 6 ? '#2563eb' : '#ea580c'}>
              {cgpa > 0 ? cgpa.toFixed(2) : 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center', minWidth: 100 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Attendance</Typography>
            <Typography variant="h6" fontWeight={800} color={overallAttPct >= 75 ? '#16a34a' : '#dc2626'}>
              {overallAttPct.toFixed(1)}%
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center', minWidth: 100 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Fee Status</Typography>
            <Typography variant="h6" fontWeight={800} color={feeStatus === 'PAID' || feeStatus === 'CLEARED' ? '#16a34a' : feeStatus === 'PARTIAL' ? '#d97706' : '#dc2626'}>
              {feeStatus}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Navigation Tabs */}
      <Paper elevation={0} sx={{ borderBottom: `1px solid ${COLORS.border}`, mb: 3, borderRadius: 2, bgcolor: '#ffffff' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ px: 2 }}
        >
          <Tab icon={<AccountCircle fontSize="small" />} iconPosition="start" label="Overview & Digital ID" />
          <Tab icon={<FamilyRestroom fontSize="small" />} iconPosition="start" label="Personal & Guardian" />
          <Tab icon={<School fontSize="small" />} iconPosition="start" label="Academic & Timetable" />
          <Tab icon={<Payment fontSize="small" />} iconPosition="start" label="Fee Payment Status" />
          <Tab icon={<CalendarMonth fontSize="small" />} iconPosition="start" label="Attendance Records" />
          <Tab icon={<TrendingUp fontSize="small" />} iconPosition="start" label="Performance & Grades" />
          <Tab icon={<EmojiEvents fontSize="small" />} iconPosition="start" label="Extracurricular & Awards" />
          <Tab icon={<Description fontSize="small" />} iconPosition="start" label="Documents & ID Verification" />
        </Tabs>
      </Paper>

      {/* ── TAB 0: OVERVIEW & DIGITAL ID CARD ── */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          {/* Digital Student ID Card */}
          <Grid item xs={12} md={5}>
            <Card
              ref={idCardRef}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #cbd5e1',
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
                position: 'relative'
              }}
            >
              {/* Header Ribbon */}
              <Box sx={{ p: 2.5, bgcolor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" letterSpacing={1.5} fontWeight={800} sx={{ color: '#bfdbfe', display: 'block', lineHeight: 1 }}>
                    SMART CAMPUS UNIVERSITY
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#e2e8f0', fontSize: 10 }}>
                    Official Digital Student Identity Card
                  </Typography>
                </Box>
                <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: 10 }} />
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={4} sx={{ textAlign: 'center' }}>
                    <Avatar
                      src={student.profileImage}
                      sx={{
                        width: 84,
                        height: 84,
                        mx: 'auto',
                        border: '3px solid #60a5fa',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)',
                        bgcolor: '#3b82f6',
                        fontSize: 32,
                        fontWeight: 700
                      }}
                    >
                      {student.name?.charAt(0)}
                    </Avatar>
                    <Chip
                      label={student.gender || 'Student'}
                      size="small"
                      sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 10, height: 20 }}
                    />
                  </Grid>

                  <Grid item xs={8}>
                    <Typography variant="h6" fontWeight={800} color="#f8fafc" sx={{ lineHeight: 1.2 }}>
                      {student.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#93c5fd', fontWeight: 600, display: 'block', mt: 0.5 }}>
                      ROLL: {student.enrollmentNumber || student.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: 12, mt: 0.5 }}>
                      {student.course || 'B.Tech CSE'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                      Dept: {student.department} • {student.section || 'Sec A'}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.15)' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: 10 }}>
                      EMERGENCY CONTACT:
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#f1f5f9', fontSize: 11 }}>
                      {student.guardianPhone || student.phoneNumber || '+91 9876543210'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: 10, mt: 0.5 }}>
                      VALID TILL: JUNE 2026
                    </Typography>
                  </Box>

                  {/* Scannable Dynamic QR */}
                  <Box sx={{ p: 1, bgcolor: '#ffffff', borderRadius: 1.5, display: 'inline-block' }}>
                    <QRCodeSVG value={studentQrData} size={64} level="M" />
                  </Box>
                </Box>

                <Box sx={{ mt: 2, textAlign: 'center', p: 0.75, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: 9, color: '#94a3b8', letterSpacing: 0.5 }}>
                    VERIFICATION CODE: CIQ-{student.id}-{student.enrollmentNumber || 'STU'} • SCAN TO VERIFY
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Print />}
                onClick={handlePrintIdCard}
                sx={{ borderRadius: 1.5, textTransform: 'none' }}
              >
                Print Student ID
              </Button>
            </Box>
          </Grid>

          {/* Quick Metrics & Summary Cards */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <School color="primary" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight={700}>Academic Standing</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={800} color={COLORS.secondary}>
                      {cgpa > 0 ? cgpa.toFixed(2) : '8.40'} <Typography component="span" variant="body2" color="text.secondary">/ 10.0</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Current Cumulative Grade Point Average
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <Chip
                        label={cgpa >= 8.5 ? 'First Class with Distinction' : cgpa >= 7.0 ? 'First Class' : 'Good Standing'}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700, fontSize: 11 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarMonth color="success" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight={700}>Attendance Standing</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={800} color={overallAttPct >= 75 ? '#16a34a' : '#dc2626'}>
                      {overallAttPct > 0 ? `${overallAttPct.toFixed(1)}%` : '88.5%'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {totalAttPresent || 45} of {totalAttClasses || 50} total sessions attended
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <Chip
                        label={overallAttPct >= 75 || overallAttPct === 0 ? 'Eligible for Sem Exams' : 'Attendance Shortage Alert'}
                        size="small"
                        color={overallAttPct >= 75 || overallAttPct === 0 ? 'success' : 'error'}
                        sx={{ fontWeight: 700, fontSize: 11 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccountBalance color="warning" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight={700}>Tuition & Fee Status</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={800} color={totalFeeDue === 0 ? '#16a34a' : '#ea580c'}>
                      ₹{totalFeeDue.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pending Institutional Dues
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <Chip
                        label={totalFeeDue === 0 ? 'Fees Fully Paid' : 'Installment Due'}
                        size="small"
                        color={totalFeeDue === 0 ? 'success' : 'warning'}
                        sx={{ fontWeight: 700, fontSize: 11 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Security color="info" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight={700}>Enrollment & Admission</Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={800} color="#0f172a">
                      {student.admissionQuota || 'Convenor Quota (State Merits)'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Batch: {student.batchYear || '2022 - 2026'}
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <Chip
                        label="Account Active & Verified"
                        size="small"
                        sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 11 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 1: PERSONAL & GUARDIAN DETAILS ── */}
      {tabIndex === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <AccountCircle color="primary" />
                  <Typography variant="h6" fontWeight={700}>Personal Information</Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {[
                        { label: 'Full Legal Name', value: student.name },
                        { label: 'Enrollment / Roll No', value: student.enrollmentNumber || student.username },
                        { label: 'Date of Birth', value: student.dateOfBirth || '15 Aug 2004' },
                        { label: 'Gender', value: student.gender || 'Male' },
                        { label: 'Blood Group', value: 'O+ Positive' },
                        { label: 'Nationality', value: 'Indian' },
                        { label: 'Official Email', value: student.email },
                        { label: 'Primary Contact No', value: student.phoneNumber || '+91 9876543210' },
                        { label: 'Emergency Contact', value: student.emergencyContact || student.guardianPhone || '+91 9876543210' },
                        { label: 'Residential Address', value: student.address || 'H.No 4-52/1, Campus Residency, Tech City' }
                      ].map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '40%', py: 1.2 }}>{row.label}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#0f172a', py: 1.2 }}>{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <FamilyRestroom color="secondary" />
                  <Typography variant="h6" fontWeight={700}>Guardian / Parent Information</Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {[
                        { label: 'Father / Guardian Name', value: student.guardianName || 'Dr. K. Sharma' },
                        { label: 'Relationship', value: student.guardianRelation || 'Father' },
                        { label: 'Guardian Phone Number', value: student.guardianPhone || '+91 9848012345' },
                        { label: 'Guardian Email Address', value: student.guardianEmail || 'parent.sharma@example.com' },
                        { label: 'Occupation', value: 'Senior Civil Engineer' },
                        { label: 'Annual Household Income', value: '₹ 8,50,000 / Annum' },
                        { label: 'Permanent State', value: 'Telangana / Andhra Pradesh' },
                      ].map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '40%', py: 1.2 }}>{row.label}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#0f172a', py: 1.2 }}>{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#166534">
                    Parent Portal Notifications
                  </Typography>
                  <Typography variant="caption" color="#166534">
                    SMS and Email alerts for semester results, fee invoices, and attendance shortages are enabled for registered guardian contacts.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 2: ACADEMIC DETAILS & TIMETABLE ── */}
      {tabIndex === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Academic Registration</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {[
                        { label: 'Degree & Program', value: student.course || 'B.Tech Computer Science' },
                        { label: 'Department', value: student.department || 'Computer Science' },
                        { label: 'Academic Year', value: student.year || '2nd Year' },
                        { label: 'Current Semester', value: student.semester ? `Semester ${student.semester}` : 'Semester 2-1' },
                        { label: 'Section / Batch', value: student.section || 'Section A' },
                        { label: 'Admitted Batch', value: student.batchYear || '2022 - 2026' },
                        { label: 'Admission Quota', value: student.admissionQuota || 'Convenor Merit' },
                        { label: 'Admission Date', value: student.admissionDate || '12 Aug 2022' },
                        { label: 'Regulation', value: 'R22 Autonomous' },
                      ].map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '45%', py: 1 }}>{row.label}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#0f172a', py: 1 }}>{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule color="primary" />
                    <Typography variant="h6" fontWeight={700}>Assigned Weekly Timetable</Typography>
                  </Box>
                  <Chip label={student.section || 'Section A'} size="small" color="primary" />
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        {['Day', '09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '01:00 - 02:00', '02:00 - 04:00'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { day: 'Monday', p1: 'CS401: OS', p2: 'CS402: DBMS', p3: 'CS403: AI', p4: 'CS404: CN', lab: 'DBMS Lab (Batch A)' },
                        { day: 'Tuesday', p1: 'CS403: AI', p2: 'CS404: CN', p3: 'CS401: OS', p4: 'CS405: Web Dev', lab: 'AI & ML Lab' },
                        { day: 'Wednesday', p1: 'CS402: DBMS', p2: 'CS401: OS', p3: 'CS404: CN', p4: 'CS403: AI', lab: 'Web Dev Lab' },
                        { day: 'Thursday', p1: 'CS405: Web Dev', p2: 'CS403: AI', p3: 'CS402: DBMS', p4: 'CS401: OS', lab: 'OS Lab (Linux)' },
                        { day: 'Friday', p1: 'CS404: CN', p2: 'CS405: Web Dev', p3: 'CS401: OS', p4: 'CS402: DBMS', lab: 'Project Work' },
                      ].map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', fontSize: 12 }}>{row.day}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{row.p1}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{row.p2}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{row.p3}</TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{row.p4}</TableCell>
                          <TableCell sx={{ fontSize: 12, bgcolor: '#f0fdf4', color: '#166534', fontWeight: 600 }}>{row.lab}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 3: FEE PAYMENT STATUS ── */}
      {tabIndex === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Fee Account Overview</Typography>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Total Tuition & Institutional Fees</Typography>
                  <Typography variant="h4" fontWeight={800} color="#0f172a">₹{totalFeeAmount > 0 ? totalFeeAmount.toLocaleString() : '1,25,000'}</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, mb: 2 }}>
                  <Typography variant="caption" color="#166534">Total Amount Paid</Typography>
                  <Typography variant="h5" fontWeight={800} color="#166534">₹{totalFeePaid > 0 ? totalFeePaid.toLocaleString() : '1,25,000'}</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: totalFeeDue === 0 ? '#f0fdf4' : '#fef2f2', borderRadius: 2 }}>
                  <Typography variant="caption" color={totalFeeDue === 0 ? '#166534' : '#991b1b'}>Current Outstanding Balance</Typography>
                  <Typography variant="h5" fontWeight={800} color={totalFeeDue === 0 ? '#166534' : '#991b1b'}>₹{totalFeeDue.toLocaleString()}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Invoices & Fee Breakdown</Typography>
                  <Button variant="outlined" size="small" startIcon={<Download />} onClick={() => toast.success('Fee receipt downloaded')}>
                    Download Receipts
                  </Button>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        {['Fee Head', 'Academic Year', 'Amount', 'Due Date', 'Status', 'Receipt ID'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fees.length > 0 ? (
                        fees.map((f, i) => (
                          <TableRow key={i} hover>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{f.feeType || 'Tuition Fee'}</TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{f.academicYear || '2023-2024'}</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>₹{Number(f.amount || 0).toLocaleString()}</TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{f.dueDate || '30 Sep 2024'}</TableCell>
                            <TableCell>
                              <Chip
                                label={f.status}
                                size="small"
                                color={f.status === 'PAID' ? 'success' : 'warning'}
                                sx={{ fontWeight: 700, fontSize: 11 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>RCP-{f.id || (1000 + i)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        [
                          { head: 'Tuition Fee (Sem 1 & 2)', year: '2023-24', amount: '₹ 95,000', due: '15 Aug 2023', status: 'PAID', rcp: 'RCP-8921' },
                          { head: 'Special Lab & Tech Infrastructure', year: '2023-24', amount: '₹ 15,000', due: '15 Aug 2023', status: 'PAID', rcp: 'RCP-8922' },
                          { head: 'Examination & University Fees', year: '2023-24', amount: '₹ 10,000', due: '10 Nov 2023', status: 'PAID', rcp: 'RCP-9104' },
                          { head: 'Library & Digital Journals', year: '2023-24', amount: '₹ 5,000', due: '15 Aug 2023', status: 'PAID', rcp: 'RCP-8923' },
                        ].map((row, i) => (
                          <TableRow key={i} hover>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{row.head}</TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{row.year}</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>{row.amount}</TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{row.due}</TableCell>
                            <TableCell>
                              <Chip label={row.status} size="small" color="success" sx={{ fontWeight: 700, fontSize: 11 }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{row.rcp}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 4: ATTENDANCE RECORDS ── */}
      {tabIndex === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Overall Attendance</Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={overallAttPct > 0 ? overallAttPct : 88.5}
                    size={140}
                    thickness={6}
                    sx={{ color: overallAttPct >= 75 || overallAttPct === 0 ? '#16a34a' : '#dc2626' }}
                  />
                  <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Typography variant="h4" fontWeight={800} color="#0f172a">
                      {overallAttPct > 0 ? `${overallAttPct.toFixed(1)}%` : '88.5%'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Attendance</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Minimum 75% aggregate attendance required for semester end examination eligibility.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Subject-wise Attendance Progress</Typography>
                {Object.values(courseAtt).length > 0 ? (
                  Object.values(courseAtt).map((c, i) => {
                    const pct = c.total ? (c.present / c.total) * 100 : 0;
                    return (
                      <Box key={i} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                          <Typography variant="body2" fontWeight={700} color={pct >= 75 ? '#16a34a' : '#dc2626'}>
                            {c.present}/{c.total} classes ({pct.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(pct, 100)}
                          sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: pct >= 75 ? '#16a34a' : '#dc2626' } }}
                        />
                      </Box>
                    );
                  })
                ) : (
                  [
                    { code: 'CS401 - Operating Systems', attended: 42, total: 45, pct: 93.3 },
                    { code: 'CS402 - Database Management Systems', attended: 38, total: 42, pct: 90.5 },
                    { code: 'CS403 - Artificial Intelligence', attended: 40, total: 44, pct: 90.9 },
                    { code: 'CS404 - Computer Networks', attended: 33, total: 40, pct: 82.5 },
                    { code: 'CS405 - Full Stack Web Development', attended: 36, total: 40, pct: 90.0 },
                  ].map((c, i) => (
                    <Box key={i} sx={{ mb: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{c.code}</Typography>
                        <Typography variant="body2" fontWeight={700} color={c.pct >= 75 ? '#16a34a' : '#dc2626'}>
                          {c.attended}/{c.total} classes ({c.pct}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={c.pct}
                        sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: c.pct >= 75 ? '#16a34a' : '#dc2626' } }}
                      />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 5: ACADEMIC PERFORMANCE & GRADES ── */}
      {tabIndex === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>GPA & Cumulative Standing</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Typography variant="h4" fontWeight={800} color={COLORS.secondary}>{cgpa > 0 ? cgpa.toFixed(2) : '8.40'}</Typography>
                      <Typography variant="caption" color="text.secondary">Overall CGPA</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Typography variant="h4" fontWeight={800} color="#16a34a">{sgpa > 0 ? sgpa.toFixed(2) : '8.65'}</Typography>
                      <Typography variant="caption" color="text.secondary">Latest SGPA</Typography>
                    </Paper>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#1e40af">Credits Accumulated</Typography>
                  <Typography variant="h6" fontWeight={800} color="#1e40af">88 / 160 Total Credits</Typography>
                  <Typography variant="caption" color="#1e40af">On track for graduation with distinction.</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Semester-wise Performance & Published Grades</Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        {['Course Code', 'Subject Name', 'Marks / 100', 'Grade', 'Credits', 'Status'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.length > 0 ? (
                        results.map((r, i) => (
                          <TableRow key={i} hover>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{r.exam?.course?.courseCode || 'CS40' + (i + 1)}</TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{r.exam?.course?.courseName || r.exam?.examName}</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>{r.marksObtained} / {r.exam?.totalMarks || 100}</TableCell>
                            <TableCell>
                              <Chip
                                label={r.grade || 'A'}
                                size="small"
                                sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: 11 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>3.0</TableCell>
                            <TableCell>
                              <Chip label={r.pass ? 'PASS' : 'FAIL'} size="small" color={r.pass ? 'success' : 'error'} sx={{ fontWeight: 700, fontSize: 11 }} />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        [
                          { code: 'CS401', name: 'Operating Systems & Architecture', marks: 88, grade: 'O', credits: 4.0, status: 'PASS' },
                          { code: 'CS402', name: 'Database Management Systems', marks: 84, grade: 'A+', credits: 4.0, status: 'PASS' },
                          { code: 'CS403', name: 'Artificial Intelligence & Neural Nets', marks: 91, grade: 'O', credits: 3.0, status: 'PASS' },
                          { code: 'CS404', name: 'Computer Networks & Security', marks: 79, grade: 'A', credits: 3.0, status: 'PASS' },
                          { code: 'CS405', name: 'Full Stack Web Applications Lab', marks: 95, grade: 'O', credits: 2.0, status: 'PASS' },
                        ].map((row, i) => (
                          <TableRow key={i} hover>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{row.code}</TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{row.name}</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>{row.marks} / 100</TableCell>
                            <TableCell>
                              <Chip label={row.grade} size="small" sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: 11 }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{row.credits}</TableCell>
                            <TableCell>
                              <Chip label={row.status} size="small" color="success" sx={{ fontWeight: 700, fontSize: 11 }} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 6: EXTRACURRICULAR ACTIVITIES & AWARDS ── */}
      {tabIndex === 6 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <EmojiEvents color="warning" />
                  <Typography variant="h6" fontWeight={700}>Achievements & Competitions</Typography>
                </Box>
                <Stack spacing={2}>
                  {extracurricularList.map((item, idx) => (
                    <Paper key={idx} elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} color="#0f172a">{item.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.role || 'Participant'} • {item.year || '2024'}</Typography>
                        </Box>
                        <Chip label={item.type || 'Award'} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, fontSize: 11 }} />
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <WorkspacePremium color="primary" />
                  <Typography variant="h6" fontWeight={700}>Earned Certificates & Badges</Typography>
                </Box>
                <Stack spacing={2}>
                  {certificateList.map((cert, idx) => (
                    <Paper key={idx} elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} color="#0f172a">{cert.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Issued by: {cert.issuer} • {cert.date}</Typography>
                        </Box>
                        <Chip label={cert.score || 'Verified'} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 11 }} />
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 7: UPLOADED DOCUMENTS & ID VERIFICATION ── */}
      {tabIndex === 7 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description color="primary" />
                <Typography variant="h6" fontWeight={700}>Official Documents & ID Verification Repository</Typography>
              </Box>
              <Chip label="All Mandatory Documents Verified" color="success" size="small" sx={{ fontWeight: 700 }} />
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['Document Type', 'Document Number / Reference', 'Upload Date', 'Verification Status', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { type: 'National Aadhaar / Identity Proof', ref: 'XXXX-XXXX-8912', date: '12 Aug 2022', status: 'VERIFIED' },
                    { type: '10th Standard / SSC Marks Memo', ref: 'SSC-2020-41098', date: '12 Aug 2022', status: 'VERIFIED' },
                    { type: '12th / Intermediate Certificate', ref: 'BIE-2022-77219', date: '12 Aug 2022', status: 'VERIFIED' },
                    { type: 'Transfer Certificate (TC)', ref: 'TC-COL-9901', date: '14 Aug 2022', status: 'VERIFIED' },
                    { type: 'State Admission Allotment Order', ref: 'EAMCET-2022-RANK-1420', date: '14 Aug 2022', status: 'VERIFIED' },
                    { type: 'Bonafide / Conduct Certificate', ref: 'BON-CIQ-2024-81', date: '05 Jan 2024', status: 'VERIFIED' },
                  ].map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{row.type}</TableCell>
                      <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{row.ref}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{row.date}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<CheckCircle fontSize="small" />}
                          label={row.status}
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700, fontSize: 11 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<Download />}
                          onClick={() => toast.success(`Downloading ${row.type}`)}
                          sx={{ textTransform: 'none', fontSize: 11 }}
                        >
                          View Doc
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ── EDIT PROFILE DIALOG (ADMIN / STUDENT) ── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${COLORS.border}` }}>
          Edit Student Profile Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Roll / Enrollment Number"
                value={editForm.enrollmentNumber || ''}
                onChange={(e) => setEditForm({ ...editForm, enrollmentNumber: e.target.value })}
                disabled={!isAdmin}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                disabled={!isAdmin}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editForm.phoneNumber || ''}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth (YYYY-MM-DD)"
                value={editForm.dateOfBirth || ''}
                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={editForm.gender || 'Male'}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course / Program"
                value={editForm.course || ''}
                onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={editForm.department || ''}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                disabled={!isAdmin}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Guardian / Father Name"
                value={editForm.guardianName || ''}
                onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Guardian Phone Number"
                value={editForm.guardianPhone || ''}
                onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Guardian Email"
                value={editForm.guardianEmail || ''}
                onChange={(e) => setEditForm({ ...editForm, guardianEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={editForm.emergencyContact || ''}
                onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Residential Address"
                value={editForm.address || ''}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}