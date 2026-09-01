import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, Alert, CircularProgress, InputAdornment, IconButton,
  Divider, Container, Paper, Avatar
} from '@mui/material';
import {
  School, Person, Email, Phone, Badge, Lock, Visibility,
  VisibilityOff, CheckCircle, ArrowForward, Login, QrCodeScanner,
  Domain, Class, CalendarMonth
} from '@mui/icons-material';
import { registrationAPI } from '../../services/api';
import { COLORS } from '../../theme/theme';
import { anim } from '../../theme/animations';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical & Electronics',
  'Mathematics', 'Physics', 'Humanities & Sciences'
];

const SEMESTERS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D'];

export default function PublicStudentRegistrationPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    enrollmentNumber: '',
    email: '',
    phoneNumber: '',
    department: 'Computer Science',
    course: 'B.Tech Computer Science & Engineering',
    year: '1st Year',
    semester: '1-1',
    section: 'Section A',
    dateOfBirth: '',
    gender: 'Male',
    guardianName: '',
    guardianPhone: '',
    address: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [successData,  setSuccessData]  = useState(null);

  const handleChange = (field, value) => {
    setError('');
    const updated = { ...form, [field]: value };
    // Auto-populate username with enrollment number if username was empty
    if (field === 'enrollmentNumber' && (!form.username || form.username === form.enrollmentNumber.toLowerCase())) {
      updated.username = value.trim().toLowerCase();
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!form.enrollmentNumber.trim()) {
      setError('Please enter your enrollment / roll number.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!form.username.trim()) {
      setError('Please provide a username.');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setLoading(true);
    try {
      const res = await registrationAPI.submitPublicRegistration({
        name: form.name.trim(),
        enrollmentNumber: form.enrollmentNumber.trim().toUpperCase(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        department: form.department,
        course: form.course,
        year: form.year,
        semester: form.semester,
        section: form.section,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        guardianName: form.guardianName.trim(),
        guardianPhone: form.guardianPhone.trim(),
        address: form.address.trim(),
        username: form.username.trim(),
        password: form.password,
      });

      setSuccessData(res.data.data || { username: form.username, name: form.name });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2.5,
      }}>
        <Card sx={{
          maxWidth: 520,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          border: `1px solid ${COLORS.borderLight}`,
          textAlign: 'center',
          p: { xs: 2.5, sm: 4 },
          ...anim.fadeInUp(0.1)
        }}>
          <Avatar sx={{
            bgcolor: '#ecfdf5',
            color: '#059669',
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 2.5,
            border: '2px solid #a7f3d0'
          }}>
            <CheckCircle sx={{ fontSize: 44 }} />
          </Avatar>

          <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.textPrimary, mb: 1 }}>
            Registration Successful!
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 3 }}>
            Welcome, <strong>{successData.name || form.name}</strong>! Your student account has been created and registered with CampusIQ+.
          </Typography>

          <Paper sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, border: `1px solid ${COLORS.borderLight}`, mb: 3, textAlign: 'left' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.textMuted, display: 'block', mb: 1 }}>
              YOUR LOGIN CREDENTIALS
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2" color="textSecondary">Enrollment No:</Typography>
              <Typography variant="body2" fontWeight={700}>{form.enrollmentNumber.toUpperCase()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2" color="textSecondary">Username:</Typography>
              <Typography variant="body2" fontWeight={700} color={COLORS.primary}>{form.username}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2" color="textSecondary">Department:</Typography>
              <Typography variant="body2" fontWeight={700}>{form.department}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2" color="textSecondary">Semester / Section:</Typography>
              <Typography variant="body2" fontWeight={700}>Sem {form.semester} ({form.section})</Typography>
            </Box>
          </Paper>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            endIcon={<Login />}
            sx={{
              background: COLORS.gradBlue,
              borderRadius: 3,
              py: 1.5,
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
            }}
          >
            Go to Student Login
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      py: { xs: 3, sm: 6 },
      px: { xs: 2, sm: 3 },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Container maxWidth="md">
        {/* Header Branding */}
        <Box sx={{ textAlign: 'center', mb: 3.5, ...anim.fadeInUp(0.05) }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              background: COLORS.gradBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 8px 18px rgba(37,99,235,0.35)'
            }}>
              <QrCodeScanner sx={{ fontSize: 26 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.textPrimary, letterSpacing: '-0.02em' }}>
              CampusIQ<span style={{ color: COLORS.primary }}>+</span> Registration
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: COLORS.textMuted, maxWidth: 500, mx: 'auto' }}>
            Quick Student Onboarding Form. Fill in your details below to register your student account.
          </Typography>
        </Box>

        {/* Registration Form Card */}
        <Card sx={{
          borderRadius: 4,
          border: `1px solid ${COLORS.borderLight}`,
          boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          ...anim.fadeInUp(0.15)
        }}>
          <Box sx={{
            p: 2.5,
            bgcolor: '#ffffff',
            borderBottom: `1px solid ${COLORS.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <School sx={{ color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: COLORS.textPrimary }}>
                Student Registration Details
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => navigate('/login')}
              startIcon={<Login fontSize="small" />}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Already Registered? Login
            </Button>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5, fontWeight: 600 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2.5}>
                {/* Full Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Full Name"
                    placeholder="e.g. Alex Johnson"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: COLORS.textMuted, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Enrollment Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Enrollment / Roll Number"
                    placeholder="e.g. 21CS045"
                    value={form.enrollmentNumber}
                    onChange={e => handleChange('enrollmentNumber', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge sx={{ color: COLORS.textMuted, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Email Address */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    type="email"
                    label="Email Address"
                    placeholder="student@campus.edu"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: COLORS.textMuted, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Phone Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mobile Number"
                    placeholder="e.g. +1 555-0199"
                    value={form.phoneNumber}
                    onChange={e => handleChange('phoneNumber', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: COLORS.textMuted, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Department */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Department"
                    value={form.department}
                    onChange={e => handleChange('department', e.target.value)}
                  >
                    {DEPARTMENTS.map(d => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Course / Program */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Course / Branch"
                    placeholder="e.g. B.Tech Computer Science"
                    value={form.course}
                    onChange={e => handleChange('course', e.target.value)}
                  />
                </Grid>

                {/* Year */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Year of Study"
                    value={form.year}
                    onChange={e => handleChange('year', e.target.value)}
                  >
                    {YEARS.map(y => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Semester */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Semester (1-1 to 4-2)"
                    value={form.semester}
                    onChange={e => handleChange('semester', e.target.value)}
                  >
                    {SEMESTERS.map(s => (
                      <MenuItem key={s} value={s}>Semester {s}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Section */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Class Section"
                    value={form.section}
                    onChange={e => handleChange('section', e.target.value)}
                  >
                    {SECTIONS.map(sec => (
                      <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Date of Birth */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Date of Birth"
                    placeholder="YYYY-MM-DD"
                    value={form.dateOfBirth}
                    onChange={e => handleChange('dateOfBirth', e.target.value)}
                  />
                </Grid>

                {/* Gender */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Gender"
                    value={form.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>

                {/* Guardian Name */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Father / Guardian Name"
                    placeholder="e.g. Robert Johnson"
                    value={form.guardianName}
                    onChange={e => handleChange('guardianName', e.target.value)}
                  />
                </Grid>

                {/* Guardian Phone */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Guardian Contact Number"
                    placeholder="e.g. +91 9848012345"
                    value={form.guardianPhone}
                    onChange={e => handleChange('guardianPhone', e.target.value)}
                  />
                </Grid>

                {/* Address */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Residential Address"
                    placeholder="City, State"
                    value={form.address}
                    onChange={e => handleChange('address', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700 }}>
                      ACCOUNT CREDENTIALS
                    </Typography>
                  </Divider>
                </Grid>

                {/* Username */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Username"
                    placeholder="e.g. 21cs045"
                    value={form.username}
                    onChange={e => handleChange('username', e.target.value)}
                    helperText="Used for system login"
                  />
                </Grid>

                {/* Password */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: COLORS.textMuted, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    value={form.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      background: COLORS.gradBlue,
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 800,
                      fontSize: '1rem',
                      boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
