import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Tabs, Tab, Paper, IconButton,
  Tooltip, LinearProgress, Stack
} from '@mui/material';
import {
  Email, Phone, School, Work, WorkspacePremium, EmojiEvents,
  MenuBook, Schedule, EventNote, VerifiedUser, Edit, Print,
  Download, AccountBalance, Science, Description, CheckCircle,
  AccountCircle, LocalLibrary, AssignmentTurnedIn, AccountBalanceWallet,
  Badge, Fingerprint, OpenInNew, Code, Psychology, MilitaryTech,
  Lock, CardMembership, AssignmentInd, Add, Delete
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import ProfilePhotoUploader from '../../components/shared/ProfilePhotoUploader';
import { COLORS } from '../../theme/theme';
import { toast } from 'react-toastify';

export default function FacultyDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const facultyId = id || user?.id;
  const isOwnProfile = String(facultyId) === String(user?.id);
  const canEdit = isAdmin || isOwnProfile;

  // Read tab index from URL query params (e.g. ?tab=3 for Payroll)
  const queryParams = new URLSearchParams(location.search);
  const initialTab = parseInt(queryParams.get('tab') || '0', 10);

  const [tabIndex,    setTabIndex]    = useState(initialTab);
  const [faculty,     setFaculty]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  // ── State for all 11 sections (persisted in localStorage) ──
  const storageKey = `faculty_data_${facultyId || 'me'}`;

  const [personalInfo, setPersonalInfo] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_personal`);
    return saved ? JSON.parse(saved) : {
      code: 'EMP-1042',
      title: 'Dr.',
      dob: '14 May 1982',
      gender: 'Male',
      bloodGroup: 'O+ Positive',
      maritalStatus: 'Married',
      nationality: 'Indian',
      personalEmail: 'prof.sharma.research@gmail.com',
      emergencyContactName: 'Mrs. Sunita Sharma (Spouse)',
      emergencyContactPhone: '+91 98480 98765',
      cabin: 'Academic Block A, Cabin 304 (3rd Floor)',
      intercom: 'Ext. 3404',
      address: 'Flat 402, Faculty Enclave, Smart Campus Road'
    };
  });

  const [educations, setEducations] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_educations`);
    return saved ? JSON.parse(saved) : [
      { id: 1, degree: 'Doctor of Philosophy (Ph.D.)', spec: 'Computer Science & Engineering (AI / Edge ML)', uni: 'Indian Institute of Technology (IIT), Madras', year: '2019', score: '9.2 / 10.0', div: 'Awarded with Distinction' },
      { id: 2, degree: 'Master of Technology (M.Tech)', spec: 'Computer Science & Engineering', uni: 'National Institute of Technology (NIT), Warangal', year: '2014', score: '9.45 CGPA', div: 'First Class with Distinction (Gold Medalist)' },
      { id: 3, degree: 'Bachelor of Technology (B.Tech)', spec: 'Computer Science & Engineering', uni: 'Jawaharlal Nehru Technological University (JNTU)', year: '2010', score: '82.4%', div: 'First Class with Distinction' },
      { id: 4, degree: 'Higher Secondary (12th / Intermediate)', spec: 'Mathematics, Physics, Chemistry (MPC)', uni: 'State Board of Intermediate Education', year: '2006', score: '94.2%', div: 'State Ranker' },
    ];
  });

  const [experiences, setExperiences] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_experiences`);
    return saved ? JSON.parse(saved) : [
      { id: 1, role: 'Professor & Associate Dean', org: 'Smart Campus Institute of Technology', period: 'July 2021 – Present (3 Years)', nature: 'Full-Time Academic & Research' },
      { id: 2, role: 'Associate Professor', org: 'National Institute of Technology & Science', period: 'July 2017 – June 2021 (4 Years)', nature: 'Full-Time Teaching & Guided 4 M.Tech Theses' },
      { id: 3, role: 'Assistant Professor', org: 'College of Engineering & Technology', period: 'August 2013 – June 2017 (4 Years)', nature: 'Full-Time Faculty & Lab In-charge' },
      { id: 4, role: 'Software Development Engineer (R&D)', org: 'Oracle India Development Center', period: 'June 2010 – July 2012 (2 Years)', nature: 'Database Kernel & Distributed Cache Optimization' },
    ];
  });

  const [payroll, setPayroll] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_payroll`);
    return saved ? JSON.parse(saved) : {
      payBand: 'Academic Level 14 (Professor)',
      basicPay: 144200,
      daPercent: 46,
      hraPercent: 27,
      specialAllowance: 8500,
      epfDeduction: 17304,
      tdsDeduction: 32500,
      profTax: 200,
    };
  });

  const [bankInfo, setBankInfo] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_bank`);
    return saved ? JSON.parse(saved) : {
      bankName: 'State Bank of India (SBI)',
      accountNumber: '3829104928194',
      accountType: 'Salary Account (Corporate)',
      ifsc: 'SBIN0014820',
      branch: 'Smart University Campus Branch',
      pan: 'ABCPS8921K',
      aadhaar: 'XXXX-XXXX-8921',
      pfUan: '100982391029'
    };
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_documents`);
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Official Appointment & Confirmation Order', org: 'Governing Board of Management', status: 'VERIFIED & ARCHIVED', date: '15 Jul 2021', size: '1.8 MB' },
      { id: 2, name: 'Ph.D. Original Degree Certificate & Notification', org: 'IIT Madras Academic Senate', status: 'VERIFIED & ARCHIVED', date: '20 Jul 2019', size: '2.4 MB' },
      { id: 3, name: 'M.Tech Degree & Gold Medal Certificate', org: 'NIT Warangal Convocation', status: 'VERIFIED & ARCHIVED', date: '18 Aug 2014', size: '1.9 MB' },
      { id: 4, name: 'Relieving Certificate & Service Book Record', org: 'Previous Institute (NITS)', status: 'VERIFIED & ARCHIVED', date: '30 Jun 2021', size: '1.2 MB' },
      { id: 5, name: 'Aadhaar & PAN National KYC Copy', org: 'Govt of India (UIDAI / ITD)', status: 'VERIFIED & ARCHIVED', date: '15 Jul 2021', size: '890 KB' },
    ];
  });

  const [researchIds, setResearchIds] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_research_ids`);
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'ORCID iD', val: '0000-0002-8921-3914', url: 'https://orcid.org/0000-0002-8921-3914' },
      { id: 2, name: 'Scopus Author ID', val: '57218930491', url: 'https://www.scopus.com' },
      { id: 3, name: 'Google Scholar ID', val: 'scholar.google.com/citations?user=sharma_ai', url: 'https://scholar.google.com' },
      { id: 4, name: 'ResearcherID (Web of Science)', val: 'AAK-8921-2020', url: 'https://www.webofscience.com' },
      { id: 5, name: 'Vidwan Expert Portal ID', val: 'VIDWAN-109482', url: 'https://vidwan.inflibnet.ac.in' },
      { id: 6, name: 'IEEE Collabratec Profile', val: 'ieee-collabratec.ieee.org/prof-sharma', url: 'https://ieee-collabratec.ieee.org' },
    ];
  });

  const [researchDomains, setResearchDomains] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_domains`);
    return saved ? JSON.parse(saved) : [
      'Artificial Intelligence', 'Deep Neural Pruning', 'Distributed Cloud Systems', 'Edge AI Analytics',
      'Federated Learning', 'Zero-Trust Microservices', 'Kubernetes Orchestration', 'Autonomous Agents'
    ];
  });

  const [technicalSkills, setTechnicalSkills] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_skills`);
    return saved ? JSON.parse(saved) : [
      'Python (PyTorch / TensorFlow)', 'Java (Spring Boot / Micronaut)', 'C / C++ (POSIX / eBPF)',
      'Go (Golang Microservices)', 'React.js & TypeScript', 'Docker & Kubernetes', 'PostgreSQL / MySQL / Redis'
    ];
  });

  const [professionalBodies, setProfessionalBodies] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_prof_bodies`);
    return saved ? JSON.parse(saved) : [
      { id: 1, body: 'Institute of Electrical and Electronics Engineers (IEEE)', grade: 'Senior Member (SMIEEE)', memId: 'IEEE-92810492', valid: 'Life Member', status: 'ACTIVE' },
      { id: 2, body: 'Association for Computing Machinery (ACM)', grade: 'Professional Member', memId: 'ACM-7489201', valid: 'Valid thru 2026', status: 'ACTIVE' },
      { id: 3, body: 'Computer Society of India (CSI)', grade: 'Life Member (LM)', memId: 'CSI-LM-094821', valid: 'Life Member', status: 'ACTIVE' },
      { id: 4, body: 'Indian Society for Technical Education (ISTE)', grade: 'Life Member (LMISTE)', memId: 'ISTE-LM-48201', valid: 'Life Member', status: 'ACTIVE' },
    ];
  });

  const [additionalQualifications, setAdditionalQualifications] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_add_qual`);
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'AWS Certified Solutions Architect – Professional (SAP-C02)', org: 'Amazon Web Services (AWS)', valid: '2023 - 2026', badge: 'Global Professional Certificate' },
      { id: 2, title: 'Google Cloud Certified Professional Machine Learning Engineer', org: 'Google Cloud Platform (GCP)', valid: '2024 - 2027', badge: 'Global Professional Certificate' },
      { id: 3, title: 'NPTEL Elite + Gold Medal: Deep Learning & Neural Networks (Top 1%)', org: 'IIT Madras / SWAYAM MHRD', valid: 'Dec 2022', badge: 'NPTEL Gold Honor' },
      { id: 4, title: 'AICTE-ATAL Faculty Development Program on Quantum Computing & Security', org: 'AICTE Training & Learning Academy', valid: 'Nov 2023', badge: 'FDP Certified' },
    ];
  });

  const [phdInfo, setPhdInfo] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_phd_info`);
    return saved ? JSON.parse(saved) : {
      status: 'Degree Awarded (Conferred July 2019)',
      uni: 'IIT Madras',
      topic: 'Optimized Distributed Deep Learning Models for Resource-Constrained Edge Computing Architectures',
      guide: 'Prof. K. V. Subramanian (IIT Madras)',
      dept: 'Computer Science & Engineering',
      regYear: '2014',
      awardYear: '2019',
    };
  });

  const [phdScholars, setPhdScholars] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_phd_scholars`);
    return saved ? JSON.parse(saved) : [
      { id: 1, roll: 'PHD-2021-04', name: 'Ms. Keerthi Varma', area: 'Federated Edge Learning for Healthcare IoT', yr: '2021', status: 'COMPREHENSIVE EXAM CLEARED' },
      { id: 2, roll: 'PHD-2022-09', name: 'Mr. Manoj Kumar P.', area: 'eBPF-driven Zero-Trust Kubernetes Security', yr: '2022', status: 'COURSEWORK COMPLETED' },
      { id: 3, roll: 'PHD-2023-02', name: 'Ms. Snigdha Roy', area: 'Quantum Natural Language Processing', yr: '2023', status: 'PROPOSAL SUBMITTED' },
    ];
  });

  // Save to LocalStorage helpers
  const saveState = (key, data) => {
    localStorage.setItem(`${storageKey}_${key}`, JSON.stringify(data));
  };

  // ── Dialog States for Modals ──
  const [modalType, setModalType] = useState(null); // 'edit_profile', 'personal_info', 'education', 'experience', 'payroll', 'bank', 'document', 'research_id', 'domain', 'skill', 'prof_body', 'add_qual', 'phd_info', 'phd_scholar'
  const [modalData, setModalData] = useState({});
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    const qTab = queryParams.get('tab');
    if (qTab !== null) {
      setTabIndex(parseInt(qTab, 10));
    }
  }, [location.search]);

  const loadFacultyProfileData = () => {
    if (!facultyId) return;
    setLoading(true);
    userAPI.getById(facultyId)
      .then(u => {
        const fData = u.data.data;
        setFaculty(fData);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load faculty profile.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFacultyProfileData();
  }, [facultyId, user?.id]);

  // General Modal Submissions
  const handleModalSave = async () => {
    setSaving(true);
    try {
      if (modalType === 'edit_profile') {
        await userAPI.updateUser(faculty.id, modalData);
        toast.success('Core Faculty Profile updated successfully!');
        loadFacultyProfileData();
      } else if (modalType === 'personal_info') {
        setPersonalInfo(modalData);
        saveState('personal', modalData);
        toast.success('Personal & Contact info updated!');
      } else if (modalType === 'education') {
        let updated;
        if (modalData.id) {
          updated = educations.map(e => e.id === modalData.id ? modalData : e);
        } else {
          updated = [...educations, { ...modalData, id: Date.now() }];
        }
        setEducations(updated);
        saveState('educations', updated);
        toast.success('Educational qualification saved!');
      } else if (modalType === 'experience') {
        let updated;
        if (modalData.id) {
          updated = experiences.map(e => e.id === modalData.id ? modalData : e);
        } else {
          updated = [...experiences, { ...modalData, id: Date.now() }];
        }
        setExperiences(updated);
        saveState('experiences', updated);
        toast.success('Experience record saved!');
      } else if (modalType === 'payroll') {
        setPayroll(modalData);
        saveState('payroll', modalData);
        toast.success('Payroll and pay scale settings updated!');
      } else if (modalType === 'bank') {
        setBankInfo(modalData);
        saveState('bank', modalData);
        toast.success('Bank details & KYC saved!');
      } else if (modalType === 'document') {
        const newDoc = {
          id: Date.now(),
          name: modalData.name || 'New Document Upload',
          org: modalData.org || 'Smart Campus Registry',
          status: 'VERIFIED & ARCHIVED',
          date: 'Just now',
          size: '1.5 MB'
        };
        const updated = [...documents, newDoc];
        setDocuments(updated);
        saveState('documents', updated);
        toast.success('Document uploaded and archived!');
      } else if (modalType === 'research_id') {
        let updated;
        if (modalData.id) {
          updated = researchIds.map(r => r.id === modalData.id ? modalData : r);
        } else {
          updated = [...researchIds, { ...modalData, id: Date.now() }];
        }
        setResearchIds(updated);
        saveState('research_ids', updated);
        toast.success('Research identifier updated!');
      } else if (modalType === 'domain') {
        if (modalData.name && !researchDomains.includes(modalData.name)) {
          const updated = [...researchDomains, modalData.name];
          setResearchDomains(updated);
          saveState('domains', updated);
          toast.success(`Domain "${modalData.name}" added!`);
        }
      } else if (modalType === 'skill') {
        if (modalData.name && !technicalSkills.includes(modalData.name)) {
          const updated = [...technicalSkills, modalData.name];
          setTechnicalSkills(updated);
          saveState('skills', updated);
          toast.success(`Skill "${modalData.name}" added!`);
        }
      } else if (modalType === 'prof_body') {
        let updated;
        if (modalData.id) {
          updated = professionalBodies.map(p => p.id === modalData.id ? modalData : p);
        } else {
          updated = [...professionalBodies, { ...modalData, id: Date.now(), status: 'ACTIVE' }];
        }
        setProfessionalBodies(updated);
        saveState('prof_bodies', updated);
        toast.success('Professional body membership saved!');
      } else if (modalType === 'add_qual') {
        let updated;
        if (modalData.id) {
          updated = additionalQualifications.map(q => q.id === modalData.id ? modalData : q);
        } else {
          updated = [...additionalQualifications, { ...modalData, id: Date.now() }];
        }
        setAdditionalQualifications(updated);
        saveState('add_qual', updated);
        toast.success('Certification / qualification saved!');
      } else if (modalType === 'phd_info') {
        setPhdInfo(modalData);
        saveState('phd_info', modalData);
        toast.success('Ph.D. degree details updated!');
      } else if (modalType === 'phd_scholar') {
        let updated;
        if (modalData.id) {
          updated = phdScholars.map(s => s.id === modalData.id ? modalData : s);
        } else {
          updated = [...phdScholars, { ...modalData, id: Date.now() }];
        }
        setPhdScholars(updated);
        saveState('phd_scholars', updated);
        toast.success('Ph.D. scholar record saved!');
      }
      setModalType(null);
    } catch (err) {
      toast.error('Failed to update record.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!faculty) return <Alert severity="warning" sx={{ m: 3 }}>Faculty member not found.</Alert>;

  const tabLabels = [
    'Profile Info',
    'Educational Info',
    'Experience',
    'Payroll',
    'Bank Info',
    'Documents',
    'Research ID\'s',
    'Expertise',
    'Professional Body',
    'Additional Qualification',
    'Ph.D Status'
  ];

  // Calculated Payroll values
  const basic = Number(payroll.basicPay || 144200);
  const daVal = Math.round(basic * (Number(payroll.daPercent || 46) / 100));
  const hraVal = Math.round(basic * (Number(payroll.hraPercent || 27) / 100));
  const splVal = Number(payroll.specialAllowance || 8500);
  const grossSalary = basic + daVal + hraVal + splVal;
  const totalDeductions = Number(payroll.epfDeduction || 17304) + Number(payroll.tdsDeduction || 32500) + Number(payroll.profTax || 200);
  const netTakeHome = grossSalary - totalDeductions;

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Faculty Professional Dossier & Profile"
        subtitle={`${faculty.name} • ${faculty.designation || 'Professor'} • ${faculty.department || 'Computer Science'}`}
        breadcrumbs={['Home', 'Faculty', 'My Profile', tabLabels[tabIndex]]}
        action={
          <Stack direction="row" spacing={1.5}>
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => {
                  setModalData({
                    name: faculty.name || '',
                    email: faculty.email || '',
                    phoneNumber: faculty.phoneNumber || '',
                    department: faculty.department || 'Computer Science',
                    employeeId: faculty.employeeId || faculty.enrollmentNumber || 'EMP-1042',
                    designation: faculty.designation || 'Professor & Associate Dean',
                    qualifications: faculty.qualifications || 'Ph.D., M.Tech (Distinction)',
                    experienceYears: faculty.experienceYears || '12+ Years',
                    specialization: faculty.specialization || 'Artificial Intelligence & Distributed Systems',
                  });
                  setModalType('edit_profile');
                }}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
              >
                Edit Core Profile
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={() => window.print()}
              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Print Dossier
            </Button>
          </Stack>
        }
      />

      {/* Hero Faculty Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${COLORS.border}`,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
          <ProfilePhotoUploader
            targetUser={faculty}
            size={96}
            onImageUpdated={(newUrl) => setFaculty(prev => ({ ...prev, profileImage: newUrl }))}
          />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h5" fontWeight={800} color="#0f172a">
                {faculty.name}
              </Typography>
              <Chip
                label={faculty.designation || 'Professor'}
                color="primary"
                size="small"
                sx={{ fontWeight: 700, borderRadius: 1 }}
              />
              <Chip
                label={`EMP ID: ${faculty.employeeId || faculty.enrollmentNumber || 'EMP-1042'}`}
                size="small"
                sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 700, borderRadius: 1 }}
              />
              <Chip
                icon={<VerifiedUser fontSize="small" />}
                label="VERIFIED FACULTY"
                size="small"
                sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, borderRadius: 1 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <strong>Department:</strong> {faculty.department || 'Computer Science & Engineering'} • <strong>Total Experience:</strong> {faculty.experienceYears || '12+ Years'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2.5, mt: 1, flexWrap: 'wrap', fontSize: 13, color: '#475569' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Email fontSize="inherit" color="action" /> {faculty.email}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Phone fontSize="inherit" color="action" /> {faculty.phoneNumber || '+91 98480 12345'}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <School fontSize="inherit" color="action" /> {faculty.qualifications || 'Ph.D., M.Tech (IIT Madras)'}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Quick Credentials Summary Badges */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center', minWidth: 105 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Scopus Papers</Typography>
            <Typography variant="h6" fontWeight={800} color={COLORS.secondary}>18</Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center', minWidth: 105 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Patents</Typography>
            <Typography variant="h6" fontWeight={800} color="#16a34a">4</Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center', minWidth: 105 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Ph.D Scholars</Typography>
            <Typography variant="h6" fontWeight={800} color="#2563eb">{phdScholars.length}</Typography>
          </Paper>
        </Box>
      </Paper>

      {/* Tabs Row for All 11 Sections */}
      <Paper elevation={0} sx={{ borderBottom: `1px solid ${COLORS.border}`, mb: 3, borderRadius: 2, bgcolor: '#ffffff' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => {
            setTabIndex(val);
            navigate(`/faculty/profile?tab=${val}`, { replace: true });
          }}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ px: 2 }}
        >
          <Tab icon={<AccountCircle fontSize="small" />} iconPosition="start" label="Profile Info" />
          <Tab icon={<School fontSize="small" />} iconPosition="start" label="Educational Info" />
          <Tab icon={<Work fontSize="small" />} iconPosition="start" label="Experience" />
          <Tab icon={<AccountBalanceWallet fontSize="small" />} iconPosition="start" label="Payroll" />
          <Tab icon={<AccountBalance fontSize="small" />} iconPosition="start" label="Bank Info" />
          <Tab icon={<Description fontSize="small" />} iconPosition="start" label="Documents" />
          <Tab icon={<Fingerprint fontSize="small" />} iconPosition="start" label="Research ID's" />
          <Tab icon={<Psychology fontSize="small" />} iconPosition="start" label="Expertise" />
          <Tab icon={<CardMembership fontSize="small" />} iconPosition="start" label="Professional Body" />
          <Tab icon={<MilitaryTech fontSize="small" />} iconPosition="start" label="Additional Qualification" />
          <Tab icon={<WorkspacePremium fontSize="small" />} iconPosition="start" label="Ph.D Status" />
        </Tabs>
      </Paper>

      {/* ── 1. PROFILE INFO ── */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountCircle color="primary" />
                    <Typography variant="h6" fontWeight={700}>Personal Information</Typography>
                  </Box>
                  {canEdit && (
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => {
                        setModalData({ ...personalInfo });
                        setModalType('personal_info');
                      }}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Edit Personal
                    </Button>
                  )}
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {[
                        { label: 'Employee Code', value: personalInfo.code || faculty.employeeId || 'EMP-1042' },
                        { label: 'Full Name with Title', value: `${personalInfo.title || 'Dr.'} ${faculty.name}` },
                        { label: 'Designation', value: faculty.designation || 'Professor & Associate Dean' },
                        { label: 'Department', value: faculty.department || 'Computer Science & Engineering' },
                        { label: 'Date of Birth', value: personalInfo.dob },
                        { label: 'Gender', value: personalInfo.gender },
                        { label: 'Blood Group', value: personalInfo.bloodGroup },
                        { label: 'Marital Status', value: personalInfo.maritalStatus },
                        { label: 'Nationality', value: personalInfo.nationality },
                      ].map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '40%', py: 1.1 }}>{row.label}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#0f172a', py: 1.1 }}>{row.value}</TableCell>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone color="secondary" />
                    <Typography variant="h6" fontWeight={700}>Official & Emergency Contacts</Typography>
                  </Box>
                  {canEdit && (
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => {
                        setModalData({ ...personalInfo });
                        setModalType('personal_info');
                      }}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Edit Contact & Cabin
                    </Button>
                  )}
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {[
                        { label: 'Official Institutional Email', value: faculty.email },
                        { label: 'Personal Email', value: personalInfo.personalEmail },
                        { label: 'Primary Contact Number', value: faculty.phoneNumber || '+91 98480 12345' },
                        { label: 'Emergency Contact Person', value: personalInfo.emergencyContactName },
                        { label: 'Emergency Contact Phone', value: personalInfo.emergencyContactPhone },
                        { label: 'Campus Office / Cabin', value: personalInfo.cabin },
                        { label: 'Internal Intercom Ext.', value: personalInfo.intercom },
                        { label: 'Residential Address', value: personalInfo.address },
                      ].map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '42%', py: 1.1 }}>{row.label}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#0f172a', py: 1.1 }}>{row.value}</TableCell>
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

      {/* ── 2. EDUCATIONAL INFO ── */}
      {tabIndex === 1 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Formal Academic Education & Qualifications</Typography>
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setModalData({ degree: '', spec: '', uni: '', year: '', score: '', div: '' });
                    setModalType('education');
                  }}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
                >
                  Add Qualification / Degree
                </Button>
              )}
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    {['Degree / Program', 'Specialization / Branch', 'University / Institute', 'Year of Passing', 'Percentage / CGPA', 'Class / Division', ...(canEdit ? ['Actions'] : [])].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {educations.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.secondary, fontSize: 12 }}>{row.degree}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{row.spec}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{row.uni}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{row.year}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{row.score}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        <Chip label={row.div} size="small" variant="outlined" sx={{ fontSize: 10, fontWeight: 600 }} />
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" color="primary" onClick={() => { setModalData(row); setModalType('education'); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => {
                              const updated = educations.filter(e => e.id !== row.id);
                              setEducations(updated);
                              saveState('educations', updated);
                              toast.info('Degree record removed');
                            }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ── 3. EXPERIENCE ── */}
      {tabIndex === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL PROFESSIONAL EXPERIENCE</Typography>
                <Typography variant="h4" fontWeight={800} color={COLORS.secondary} my={1}>12.5 Years</Typography>
                <Stack spacing={1} sx={{ fontSize: 13, color: '#475569' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Teaching Experience:</span>
                    <strong>10.5 Years</strong>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Research Experience:</span>
                    <strong>6.0 Years (Concurrent)</strong>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Industrial / Software:</span>
                    <strong>2.0 Years</strong>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Employment & Career Timeline</Typography>
                  {canEdit && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => {
                        setModalData({ role: '', org: '', period: '', nature: '' });
                        setModalType('experience');
                      }}
                      sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
                    >
                      Add Experience Record
                    </Button>
                  )}
                </Box>
                <Stack spacing={2}>
                  {experiences.map((exp) => (
                    <Paper key={exp.id} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, position: 'relative' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={700} color="#0f172a">{exp.role}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={exp.period} size="small" color="primary" sx={{ fontSize: 10, fontWeight: 700 }} />
                          {canEdit && (
                            <>
                              <IconButton size="small" onClick={() => { setModalData(exp); setModalType('experience'); }}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => {
                                const updated = experiences.filter(e => e.id !== exp.id);
                                setExperiences(updated);
                                saveState('experiences', updated);
                                toast.info('Experience removed');
                              }}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </Box>
                      <Typography variant="body2" color={COLORS.secondary} fontWeight={600} mt={0.5}>{exp.org}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{exp.nature}</Typography>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── 4. PAYROLL ── */}
      {tabIndex === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceWallet color="primary" />
                    <Typography variant="h6" fontWeight={700}>Payroll Structure (7th CPC)</Typography>
                  </Box>
                  {canEdit && (
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => {
                        setModalData({ ...payroll });
                        setModalType('payroll');
                      }}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Update Structure
                    </Button>
                  )}
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {[
                        { label: 'Pay Band / Level', value: payroll.payBand },
                        { label: 'Basic Pay', value: `₹ ${basic.toLocaleString('en-IN')}` },
                        { label: `Dearness Allowance (DA ${payroll.daPercent}%)`, value: `₹ ${daVal.toLocaleString('en-IN')}` },
                        { label: `House Rent Allowance (HRA ${payroll.hraPercent}%)`, value: `₹ ${hraVal.toLocaleString('en-IN')}` },
                        { label: 'Special Academic Allowance', value: `₹ ${splVal.toLocaleString('en-IN')}` },
                        { label: 'Gross Monthly Salary', value: `₹ ${grossSalary.toLocaleString('en-IN')}` },
                        { label: 'Provident Fund (EPF)', value: `₹ ${Number(payroll.epfDeduction).toLocaleString('en-IN')}` },
                        { label: 'Income Tax TDS Deduction', value: `₹ ${Number(payroll.tdsDeduction).toLocaleString('en-IN')}` },
                        { label: 'Professional Tax (PT)', value: `₹ ${Number(payroll.profTax).toLocaleString('en-IN')}` },
                        { label: 'Net Disbursed Take-Home', value: `₹ ${netTakeHome.toLocaleString('en-IN')}` },
                      ].map((row, i) => (
                        <TableRow key={i} sx={{ bgcolor: row.label.startsWith('Net') ? '#f0fdf4' : row.label.startsWith('Gross') ? '#eff6ff' : 'inherit' }}>
                          <TableCell sx={{ fontWeight: row.label.startsWith('Net') || row.label.startsWith('Gross') ? 800 : 600, py: 1 }}>{row.label}</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: row.label.startsWith('Net') ? '#166534' : row.label.startsWith('Gross') ? '#1e40af' : '#0f172a', py: 1 }}>
                            {row.value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Annual Tax Statements & Form 16</Typography>
                <Stack spacing={2}>
                  {[
                    { year: 'Financial Year 2023-2024', pan: bankInfo.pan || 'ABCPS8921K', gross: `₹ ${(grossSalary * 12).toLocaleString('en-IN')}`, taxPaid: `₹ ${(payroll.tdsDeduction * 12).toLocaleString('en-IN')}`, file: 'Form16_FY2023-24.pdf' },
                    { year: 'Financial Year 2022-2023', pan: bankInfo.pan || 'ABCPS8921K', gross: '₹ 28,45,200', taxPaid: '₹ 3,45,000', file: 'Form16_FY2022-23.pdf' },
                  ].map((tax, i) => (
                    <Paper key={i} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={700} color="#0f172a">{tax.year}</Typography>
                        <Chip label={`PAN: ${tax.pan}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" my={0.5}>
                        Gross Taxable Income: <strong>{tax.gross}</strong> • Total Tax Deducted: <strong>{tax.taxPaid}</strong>
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => toast.success(`Downloading ${tax.file}`)}
                        sx={{ mt: 1, textTransform: 'none' }}
                      >
                        Download Form 16 Part A & B
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── 5. BANK INFO ── */}
      {tabIndex === 4 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalance color="primary" />
                <Typography variant="h6" fontWeight={700}>Disbursement Bank Account & Statutory KYC Details</Typography>
              </Box>
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => {
                    setModalData({ ...bankInfo });
                    setModalType('bank');
                  }}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
                >
                  Edit Bank & KYC Info
                </Button>
              )}
            </Box>
            <Grid container spacing={3}>
              {[
                { label: 'Bank Name', value: bankInfo.bankName, verified: true },
                { label: 'Account Number', value: bankInfo.accountNumber, verified: true },
                { label: 'Account Type', value: bankInfo.accountType, verified: true },
                { label: 'IFSC Code', value: bankInfo.ifsc, verified: true },
                { label: 'Branch Name', value: bankInfo.branch, verified: true },
                { label: 'PAN Card Number', value: bankInfo.pan, verified: true },
                { label: 'Aadhaar (UIDAI)', value: bankInfo.aadhaar, verified: true },
                { label: 'PF UAN Number', value: bankInfo.pfUan, verified: true },
              ].map((item, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>{item.label}</Typography>
                    <Typography variant="subtitle2" fontWeight={800} color="#0f172a" my={0.5}>{item.value}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#16a34a', fontSize: 11, fontWeight: 700 }}>
                      <CheckCircle fontSize="inherit" /> Verified by Finance
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ── 6. DOCUMENTS ── */}
      {tabIndex === 5 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Institutional Records & Verified Credentials Repository</Typography>
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setModalData({ name: '', org: '' });
                    setModalType('document');
                  }}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
                >
                  Upload New Document / Certificate
                </Button>
              )}
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    {['Document Name', 'Issuing Authority', 'Verification Status', 'Upload Date', 'File Size', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: 12 }}>{doc.name}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{doc.org}</TableCell>
                      <TableCell>
                        <Chip label={doc.status} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 10 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{doc.date}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{doc.size}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => toast.success(`Downloading ${doc.name}`)}
                            sx={{ textTransform: 'none', fontSize: 11, py: 0.2 }}
                          >
                            Download
                          </Button>
                          {canEdit && (
                            <IconButton size="small" color="error" onClick={() => {
                              const updated = documents.filter(d => d.id !== doc.id);
                              setDocuments(updated);
                              saveState('documents', updated);
                              toast.info('Document removed');
                            }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ── 7. RESEARCH ID'S ── */}
      {tabIndex === 6 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Science color="primary" />
                <Typography variant="h6" fontWeight={700}>Author Research Identifiers & Scholarly Profiles</Typography>
              </Box>
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setModalData({ name: '', val: '', url: '' });
                    setModalType('research_id');
                  }}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
                >
                  Add Research Profile
                </Button>
              )}
            </Box>
            <Grid container spacing={2.5}>
              {researchIds.map((res) => (
                <Grid item xs={12} sm={6} key={res.id}>
                  <Paper sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={700} color="#0f172a">{res.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip label="AUTHENTICATED" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 10 }} />
                        {canEdit && (
                          <IconButton size="small" onClick={() => { setModalData(res); setModalType('research_id'); }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: COLORS.secondary, my: 1, fontWeight: 700 }}>
                      {res.val}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<OpenInNew />}
                      onClick={() => window.open(res.url, '_blank')}
                      sx={{ textTransform: 'none', fontSize: 11 }}
                    >
                      Open Verified Profile
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ── 8. EXPERTISE ── */}
      {tabIndex === 7 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Technical Domains, Programming & Research Competencies</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#0f172a">Core Research Specializations:</Typography>
                    {canEdit && (
                      <Button size="small" startIcon={<Add />} onClick={() => { setModalData({ name: '' }); setModalType('domain'); }}>
                        Add Domain
                      </Button>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {researchDomains.map((t, i) => (
                      <Chip
                        key={i}
                        label={t}
                        color="primary"
                        onDelete={canEdit ? () => {
                          const updated = researchDomains.filter(item => item !== t);
                          setResearchDomains(updated);
                          saveState('domains', updated);
                        } : undefined}
                        sx={{ fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#0f172a">Programming Languages & Frameworks:</Typography>
                    {canEdit && (
                      <Button size="small" startIcon={<Add />} onClick={() => { setModalData({ name: '' }); setModalType('skill'); }}>
                        Add Skill
                      </Button>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {technicalSkills.map((t, i) => (
                      <Chip
                        key={i}
                        label={t}
                        variant="outlined"
                        color="secondary"
                        onDelete={canEdit ? () => {
                          const updated = technicalSkills.filter(item => item !== t);
                          setTechnicalSkills(updated);
                          saveState('skills', updated);
                        } : undefined}
                        sx={{ fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ── 9. PROFESSIONAL BODY ── */}
      {tabIndex === 8 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Professional Society Memberships & Fellowships</Typography>
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setModalData({ body: '', grade: '', memId: '', valid: 'Life Member' });
                    setModalType('prof_body');
                  }}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
                >
                  Add Professional Body
                </Button>
              )}
            </Box>
            <Grid container spacing={2.5}>
              {professionalBodies.map((mem) => (
                <Grid item xs={12} sm={6} key={mem.id}>
                  <Paper sx={{ p: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={700} color="#0f172a">{mem.body}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip label={mem.status} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 10 }} />
                        {canEdit && (
                          <>
                            <IconButton size="small" onClick={() => { setModalData(mem); setModalType('prof_body'); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => {
                              const updated = professionalBodies.filter(p => p.id !== mem.id);
                              setProfessionalBodies(updated);
                              saveState('prof_bodies', updated);
                              toast.info('Membership removed');
                            }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2" color={COLORS.secondary} fontWeight={700} my={0.5}>{mem.grade}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">Membership ID: <strong>{mem.memId}</strong> • {mem.valid}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ── 10. ADDITIONAL QUALIFICATION ── */}
      {tabIndex === 9 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Post-Doctoral Fellowships, NPTEL Elite & Global Certifications</Typography>
              {canEdit && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setModalData({ title: '', org: '', valid: '', badge: 'Global Professional Certificate' });
                    setModalType('add_qual');
                  }}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
                >
                  Add Qualification / Certificate
                </Button>
              )}
            </Box>
            <Stack spacing={2}>
              {additionalQualifications.map((cert) => (
                <Paper key={cert.id} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#0f172a">{cert.title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={cert.badge} size="small" color="primary" sx={{ fontWeight: 700, fontSize: 10 }} />
                      {canEdit && (
                        <>
                          <IconButton size="small" onClick={() => { setModalData(cert); setModalType('add_qual'); }}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => {
                            const updated = additionalQualifications.filter(q => q.id !== cert.id);
                            setAdditionalQualifications(updated);
                            saveState('add_qual', updated);
                            toast.info('Certificate removed');
                          }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" my={0.5}>{cert.org} • Valid: <strong>{cert.valid}</strong></Typography>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ── 11. PH.D STATUS ── */}
      {tabIndex === 10 && (
        <Card sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkspacePremium color="secondary" />
                <Typography variant="h6" fontWeight={700}>Doctor of Philosophy (Ph.D.) Research Details</Typography>
              </Box>
              {canEdit && (
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => {
                    setModalData({ ...phdInfo });
                    setModalType('phd_info');
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Edit Ph.D Details
                </Button>
              )}
            </Box>
            <Paper sx={{ p: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight={800} color="#166534">{phdInfo.status}</Typography>
                <Chip label={phdInfo.uni} color="success" sx={{ fontWeight: 700 }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mt={1}>
                Thesis Title: "{phdInfo.topic}"
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1, fontSize: 13, color: '#334155' }}>
                <Grid item xs={12} sm={6}><strong>Research Guide / Supervisor:</strong> {phdInfo.guide}</Grid>
                <Grid item xs={12} sm={6}><strong>Department:</strong> {phdInfo.dept}</Grid>
                <Grid item xs={12} sm={6}><strong>Year of Registration:</strong> {phdInfo.regYear}</Grid>
                <Grid item xs={12} sm={6}><strong>Year of Viva-Voce & Degree Award:</strong> {phdInfo.awardYear}</Grid>
              </Grid>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>Scholars Currently Under Supervision as Ph.D. Guide:</Typography>
              {canEdit && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setModalData({ roll: '', name: '', area: '', yr: '2024', status: 'COURSEWORK COMMENCED' });
                    setModalType('phd_scholar');
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600, bgcolor: COLORS.secondary }}
                >
                  Add Ph.D Scholar
                </Button>
              )}
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    {['Scholar Roll', 'Scholar Name', 'Research Area', 'Registration Year', 'Status', ...(canEdit ? ['Actions'] : [])].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {phdScholars.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{s.roll}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                      <TableCell>{s.area}</TableCell>
                      <TableCell>{s.yr}</TableCell>
                      <TableCell>
                        <Chip label={s.status} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: 10 }} />
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" onClick={() => { setModalData(s); setModalType('phd_scholar'); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => {
                              const updated = phdScholars.filter(item => item.id !== s.id);
                              setPhdScholars(updated);
                              saveState('phd_scholars', updated);
                              toast.info('Scholar record removed');
                            }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ── UNIFIED EDIT / ADD MODAL DIALOG ── */}
      <Dialog open={Boolean(modalType)} onClose={() => setModalType(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: `1px solid ${COLORS.border}` }}>
          {modalType === 'edit_profile' && 'Edit Core Faculty Profile Details'}
          {modalType === 'personal_info' && 'Edit Personal & Contact Information'}
          {modalType === 'education' && (modalData.id ? 'Edit Educational Qualification' : 'Add Educational Qualification')}
          {modalType === 'experience' && (modalData.id ? 'Edit Employment Experience' : 'Add Employment Experience')}
          {modalType === 'payroll' && 'Update Payroll Scale & Allowance Structure'}
          {modalType === 'bank' && 'Edit Bank Account & Statutory KYC'}
          {modalType === 'document' && 'Upload New Document / Certificate'}
          {modalType === 'research_id' && (modalData.id ? 'Edit Research Identifier' : 'Add Research Identifier')}
          {modalType === 'domain' && 'Add Research Domain Specialization'}
          {modalType === 'skill' && 'Add Technical Programming Skill / Tool'}
          {modalType === 'prof_body' && (modalData.id ? 'Edit Professional Society Membership' : 'Add Professional Society Membership')}
          {modalType === 'add_qual' && (modalData.id ? 'Edit Additional Qualification' : 'Add Additional Qualification / Certificate')}
          {modalType === 'phd_info' && 'Edit Doctor of Philosophy (Ph.D.) Record'}
          {modalType === 'phd_scholar' && (modalData.id ? 'Edit Ph.D Scholar Supervised' : 'Add Ph.D Scholar Supervised')}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>

            {/* Core Profile */}
            {modalType === 'edit_profile' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name" value={modalData.name || ''} onChange={e => setModalData({ ...modalData, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Employee ID" value={modalData.employeeId || ''} onChange={e => setModalData({ ...modalData, employeeId: e.target.value })} disabled={!isAdmin} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Designation" value={modalData.designation || ''} onChange={e => setModalData({ ...modalData, designation: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Department" value={modalData.department || ''} onChange={e => setModalData({ ...modalData, department: e.target.value })} disabled={!isAdmin} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Qualifications" value={modalData.qualifications || ''} onChange={e => setModalData({ ...modalData, qualifications: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Experience Years" value={modalData.experienceYears || ''} onChange={e => setModalData({ ...modalData, experienceYears: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone Number" value={modalData.phoneNumber || ''} onChange={e => setModalData({ ...modalData, phoneNumber: e.target.value })} />
                </Grid>
              </>
            )}

            {/* Personal Info */}
            {modalType === 'personal_info' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Title (e.g. Dr. / Prof.)" value={modalData.title || ''} onChange={e => setModalData({ ...modalData, title: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Date of Birth" value={modalData.dob || ''} onChange={e => setModalData({ ...modalData, dob: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Gender" value={modalData.gender || ''} onChange={e => setModalData({ ...modalData, gender: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Blood Group" value={modalData.bloodGroup || ''} onChange={e => setModalData({ ...modalData, bloodGroup: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Personal Email" value={modalData.personalEmail || ''} onChange={e => setModalData({ ...modalData, personalEmail: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Emergency Contact Person" value={modalData.emergencyContactName || ''} onChange={e => setModalData({ ...modalData, emergencyContactName: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Emergency Contact Phone" value={modalData.emergencyContactPhone || ''} onChange={e => setModalData({ ...modalData, emergencyContactPhone: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Cabin Location" value={modalData.cabin || ''} onChange={e => setModalData({ ...modalData, cabin: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Intercom Ext." value={modalData.intercom || ''} onChange={e => setModalData({ ...modalData, intercom: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Residential Address" value={modalData.address || ''} onChange={e => setModalData({ ...modalData, address: e.target.value })} />
                </Grid>
              </>
            )}

            {/* Education */}
            {modalType === 'education' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Degree / Program Title" value={modalData.degree || ''} onChange={e => setModalData({ ...modalData, degree: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Specialization / Branch" value={modalData.spec || ''} onChange={e => setModalData({ ...modalData, spec: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="University / Institute" value={modalData.uni || ''} onChange={e => setModalData({ ...modalData, uni: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Year of Passing" value={modalData.year || ''} onChange={e => setModalData({ ...modalData, year: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Percentage / CGPA" value={modalData.score || ''} onChange={e => setModalData({ ...modalData, score: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Class / Division" value={modalData.div || ''} onChange={e => setModalData({ ...modalData, div: e.target.value })} />
                </Grid>
              </>
            )}

            {/* Experience */}
            {modalType === 'experience' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Designation / Role" value={modalData.role || ''} onChange={e => setModalData({ ...modalData, role: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Organization / Institution" value={modalData.org || ''} onChange={e => setModalData({ ...modalData, org: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Duration / Period" placeholder="e.g. July 2021 – Present" value={modalData.period || ''} onChange={e => setModalData({ ...modalData, period: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Nature of Duties" value={modalData.nature || ''} onChange={e => setModalData({ ...modalData, nature: e.target.value })} />
                </Grid>
              </>
            )}

            {/* Payroll */}
            {modalType === 'payroll' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Pay Band / Scale" value={modalData.payBand || ''} onChange={e => setModalData({ ...modalData, payBand: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="number" label="Basic Pay (₹)" value={modalData.basicPay || ''} onChange={e => setModalData({ ...modalData, basicPay: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="number" label="DA Percentage (%)" value={modalData.daPercent || ''} onChange={e => setModalData({ ...modalData, daPercent: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="number" label="HRA Percentage (%)" value={modalData.hraPercent || ''} onChange={e => setModalData({ ...modalData, hraPercent: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="number" label="Special Allowance (₹)" value={modalData.specialAllowance || ''} onChange={e => setModalData({ ...modalData, specialAllowance: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="number" label="EPF Deduction (₹)" value={modalData.epfDeduction || ''} onChange={e => setModalData({ ...modalData, epfDeduction: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="number" label="Monthly TDS Tax (₹)" value={modalData.tdsDeduction || ''} onChange={e => setModalData({ ...modalData, tdsDeduction: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="number" label="Professional Tax (₹)" value={modalData.profTax || ''} onChange={e => setModalData({ ...modalData, profTax: Number(e.target.value) })} />
                </Grid>
              </>
            )}

            {/* Bank Info */}
            {modalType === 'bank' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Bank Name" value={modalData.bankName || ''} onChange={e => setModalData({ ...modalData, bankName: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Account Number" value={modalData.accountNumber || ''} onChange={e => setModalData({ ...modalData, accountNumber: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="IFSC Code" value={modalData.ifsc || ''} onChange={e => setModalData({ ...modalData, ifsc: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Branch Name" value={modalData.branch || ''} onChange={e => setModalData({ ...modalData, branch: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="PAN Card Number" value={modalData.pan || ''} onChange={e => setModalData({ ...modalData, pan: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Aadhaar Number" value={modalData.aadhaar || ''} onChange={e => setModalData({ ...modalData, aadhaar: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="PF UAN Number" value={modalData.pfUan || ''} onChange={e => setModalData({ ...modalData, pfUan: e.target.value })} />
                </Grid>
              </>
            )}

            {/* Document */}
            {modalType === 'document' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Document Name / Title" placeholder="e.g. Relieving Order, Degree Cert" value={modalData.name || ''} onChange={e => setModalData({ ...modalData, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Issuing Authority / Body" placeholder="e.g. University Senate, Govt of India" value={modalData.org || ''} onChange={e => setModalData({ ...modalData, org: e.target.value })} />
                </Grid>
              </>
            )}

            {/* Research ID */}
            {modalType === 'research_id' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Profile Name" placeholder="e.g. ORCID, Scopus, Google Scholar" value={modalData.name || ''} onChange={e => setModalData({ ...modalData, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Identifier Value / ID" value={modalData.val || ''} onChange={e => setModalData({ ...modalData, val: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Profile Direct URL" value={modalData.url || ''} onChange={e => setModalData({ ...modalData, url: e.target.value })} />
                </Grid>
              </>
            )}

            {/* Domain & Skill */}
            {(modalType === 'domain' || modalType === 'skill') && (
              <Grid item xs={12}>
                <TextField fullWidth label={modalType === 'domain' ? "Research Domain Name" : "Programming Skill / Technology"} placeholder="e.g. Quantum Computing, Docker, PyTorch" value={modalData.name || ''} onChange={e => setModalData({ ...modalData, name: e.target.value })} />
              </Grid>
            )}

            {/* Professional Body */}
            {modalType === 'prof_body' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Professional Society / Body" placeholder="e.g. IEEE, ACM, CSI, ISTE" value={modalData.body || ''} onChange={e => setModalData({ ...modalData, body: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Membership Grade" placeholder="e.g. Senior Member (SMIEEE)" value={modalData.grade || ''} onChange={e => setModalData({ ...modalData, grade: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Membership ID / Number" value={modalData.memId || ''} onChange={e => setModalData({ ...modalData, memId: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Validity" placeholder="e.g. Life Member / Valid thru 2026" value={modalData.valid || ''} onChange={e => setModalData({ ...modalData, valid: e.target.value })} />
                </Grid>
              </>
            )}

            {/* Additional Qualification */}
            {modalType === 'add_qual' && (
              <>
                <Grid item xs={12}>
                  <TextField fullWidth label="Qualification / Certification Title" value={modalData.title || ''} onChange={e => setModalData({ ...modalData, title: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Issuing Organization" value={modalData.org || ''} onChange={e => setModalData({ ...modalData, org: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Validity / Year" value={modalData.valid || ''} onChange={e => setModalData({ ...modalData, valid: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Badge / Category Label" value={modalData.badge || ''} onChange={e => setModalData({ ...modalData, badge: e.target.value })} />
                </Grid>
              </>
            )}

            {/* Ph.D. Info */}
            {modalType === 'phd_info' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Degree Status" value={modalData.status || ''} onChange={e => setModalData({ ...modalData, status: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Conferring University / Institute" value={modalData.uni || ''} onChange={e => setModalData({ ...modalData, uni: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Thesis Title" value={modalData.topic || ''} onChange={e => setModalData({ ...modalData, topic: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Research Supervisor / Guide" value={modalData.guide || ''} onChange={e => setModalData({ ...modalData, guide: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Department" value={modalData.dept || ''} onChange={e => setModalData({ ...modalData, dept: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Registration Year" value={modalData.regYear || ''} onChange={e => setModalData({ ...modalData, regYear: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Year of Award" value={modalData.awardYear || ''} onChange={e => setModalData({ ...modalData, awardYear: e.target.value })} />
                </Grid>
              </>
            )}

            {/* Ph.D. Scholar */}
            {modalType === 'phd_scholar' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Scholar Roll Number" value={modalData.roll || ''} onChange={e => setModalData({ ...modalData, roll: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Scholar Full Name" value={modalData.name || ''} onChange={e => setModalData({ ...modalData, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Research Area" value={modalData.area || ''} onChange={e => setModalData({ ...modalData, area: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Registration Year" value={modalData.yr || ''} onChange={e => setModalData({ ...modalData, yr: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Progress / Stage Status" value={modalData.status || ''} onChange={e => setModalData({ ...modalData, status: e.target.value })} />
                </Grid>
              </>
            )}

          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
          <Button onClick={() => setModalType(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleModalSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
