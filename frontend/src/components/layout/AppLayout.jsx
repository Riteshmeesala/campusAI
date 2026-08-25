import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, Avatar, Badge,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
  Menu, MenuItem, Tooltip, Chip, Button, useMediaQuery
} from '@mui/material';
import {
  DashboardOutlined, PeopleAltOutlined, CalendarMonthOutlined,
  PaymentOutlined, BarChartOutlined, PsychologyOutlined,
  ChatBubbleOutline, LogoutOutlined, Menu as MenuIcon, NotificationsOutlined,
  SchoolOutlined, AssessmentOutlined, AutoGraphOutlined,
  LibraryBooksOutlined, Close, PersonOutline, TrendingUpOutlined,
  CampaignOutlined, EventNoteOutlined, MenuBookOutlined,
  ScheduleOutlined, GradeOutlined, AccountBalanceOutlined
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { notifAPI } from '../../services/api';
import { COLORS } from '../../theme/theme';
import FloatingCampusBot from '../shared/FloatingCampusBot';

const DRAWER_W = 260;

function NavItem({ icon, label, path, active, onClick }) {
  return (
    <ListItem disablePadding sx={{ mb: 0.25, px: 1 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 0.5,
          py: 0.9,
          px: 1.5,
          position: 'relative',
          bgcolor: active ? '#eff6ff' : 'transparent',
          color: active ? '#1d4ed8' : '#475569',
          '&:hover': {
            bgcolor: active ? '#eff6ff' : '#f1f5f9',
            color: active ? '#1d4ed8' : '#0f172a',
            '& .MuiListItemIcon-root': {
              color: '#2563eb',
            },
          },
          transition: 'background-color 0.12s ease, color 0.12s ease',
        }}
      >
        {/* Crisp active indicator line */}
        {active && (
          <Box sx={{
            position: 'absolute',
            left: 0,
            top: '20%',
            bottom: '20%',
            width: 3,
            backgroundColor: '#2563eb',
            borderRadius: '0 2px 2px 0',
          }} />
        )}
        <ListItemIcon sx={{
          minWidth: 32,
          color: active ? '#2563eb' : '#64748b',
          transition: 'color 0.12s ease',
        }}>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            fontSize: '0.8125rem',
            fontWeight: active ? 600 : 500,
            color: active ? '#1d4ed8' : '#334155',
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}

export default function AppLayout() {
  const { user, logout, isAdmin, isFaculty, isStudent } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl,   setAnchorEl]   = useState(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      notifAPI.getUnreadCount()
        .then(r => {
          const data = r.data.data;
          setNotifCount(typeof data === 'number' ? data : (data?.count ?? data?.unread ?? 0));
        })
        .catch(() => {});
    }
  }, [user]);

  const studentNav = [
    { icon: <DashboardOutlined fontSize="small" />,  label: 'Dashboard',    path: '/student/dashboard' },
    { icon: <CalendarMonthOutlined fontSize="small"/>,label: 'Attendance',  path: '/student/attendance' },
    { icon: <AssessmentOutlined fontSize="small" />, label: 'Results',      path: '/student/results' },
    { icon: <TrendingUpOutlined fontSize="small" />, label: 'GPA Tracker',  path: '/student/gpa' },
    { icon: <PaymentOutlined fontSize="small" />,    label: 'Fees & Invoices', path: '/student/fees' },
    { icon: <SchoolOutlined fontSize="small" />,     label: 'Exams Schedule', path: '/student/exams' },
    { icon: <AutoGraphOutlined fontSize="small" />,  label: 'AI Performance', path: '/student/ai-insights' },
    { icon: <PersonOutline fontSize="small" />,     label: 'My Profile',   path: '/student/profile' },
    { icon: <ChatBubbleOutline fontSize="small" />,  label: 'Campus Intelligence', path: '/chatbot' },
  ];

  const facultyNav = [
    { icon: <DashboardOutlined fontSize="small" />,   label: 'Faculty Dashboard', path: '/faculty/dashboard' },
    { icon: <MenuBookOutlined fontSize="small" />,    label: 'Course Catalog',    path: '/faculty/courses' },
    { icon: <ScheduleOutlined fontSize="small" />,    label: 'Weekly Timetable',  path: '/faculty/timetable' },
    { icon: <CalendarMonthOutlined fontSize="small"/>,label: 'Take Attendance',   path: '/student/attendance' },
    { icon: <LibraryBooksOutlined fontSize="small"/>, label: 'Curriculum Log',    path: '/faculty/schedule' },
    { icon: <AssessmentOutlined fontSize="small" />,  label: 'Grades & Evaluation', path: '/student/results' },
    { icon: <SchoolOutlined fontSize="small" />,      label: 'Exams Management',  path: '/student/exams' },
    { icon: <PeopleAltOutlined fontSize="small" />,   label: 'Student Directory', path: '/admin/students' },
    { icon: <PsychologyOutlined fontSize="small" />,  label: 'Cohort Analytics',  path: '/student/ai-insights' },
    { icon: <CampaignOutlined fontSize="small" />,    label: 'Announcements',     path: '/announcements' },
    { icon: <PersonOutline fontSize="small" />,      label: 'Staff Profile',     path: '/faculty/profile' },
    { icon: <ChatBubbleOutline fontSize="small" />,   label: 'Campus Intelligence', path: '/chatbot' },
  ];

  const adminNav = [
    { icon: <DashboardOutlined fontSize="small" />,  label: 'Executive Dashboard', path: '/admin/dashboard' },
    { icon: <PeopleAltOutlined fontSize="small" />,  label: 'Student Records',     path: '/admin/students' },
    { icon: <SchoolOutlined fontSize="small" />,     label: 'Faculty Directory',   path: '/admin/faculty' },
    { icon: <BarChartOutlined fontSize="small" />,   label: 'Institutional Insights', path: '/student/ai-insights' },
    { icon: <PaymentOutlined fontSize="small" />,    label: 'Tuition & Billing',   path: '/student/fees' },
    { icon: <EventNoteOutlined fontSize="small" />,  label: 'Examination Registry',path: '/student/exams' },
    { icon: <GradeOutlined fontSize='small'/>,       label: 'GPA & CGPA Release',  path: '/admin/publish-cgpa' },
    { icon: <CampaignOutlined fontSize="small" />,   label: 'Campus Bulletins',    path: '/announcements' },
    { icon: <ChatBubbleOutline fontSize="small" />,  label: 'Campus Intelligence', path: '/chatbot' },
  ];

  const navItems = isAdmin ? adminNav : isFaculty ? facultyNav : studentNav;
  const roleLabel = user?.role || 'USER';

  const DrawerContent = (
    <Box sx={{
      height: '100%',
      backgroundColor: '#ffffff',
      borderRight: `1px solid ${COLORS.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Brand Header */}
      <Box sx={{ px: 2.5, py: 2.25, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${COLORS.border}` }}>
        <Box sx={{
          width: 34,
          height: 34,
          borderRadius: 0.5,
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2563eb',
        }}>
          <AccountBalanceOutlined sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{
            color: COLORS.textPrimary,
            fontWeight: 700,
            fontSize: '0.94rem',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            CampusIQ
          </Typography>
          <Typography sx={{ color: COLORS.textMuted, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em' }}>
            ACADEMIC ERP & SIS
          </Typography>
        </Box>
        {isMobile && (
          <IconButton sx={{ color: COLORS.textSecond }} onClick={() => setMobileOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* User Information Panel */}
      <Box sx={{
        m: 1.5,
        p: 1.25,
        borderRadius: 0.5,
        backgroundColor: '#f8fafc',
        border: `1px solid ${COLORS.border}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar
            src={user?.profileImage}
            sx={{
              width: 34,
              height: 34,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 0.5,
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{
              color: COLORS.textPrimary,
              fontSize: '0.8125rem',
              fontWeight: 600,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.name || user?.username}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4 }}>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  borderRadius: '2px',
                  border: '1px solid #bfdbfe',
                }}
              />
              <Typography sx={{ color: COLORS.textMuted, fontSize: '0.68rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.department || 'Academic Affairs'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        <Typography sx={{
          px: 2.5,
          pb: 0.75,
          pt: 0.5,
          fontSize: '0.65rem',
          color: COLORS.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 700,
        }}>
          Operations & Modules
        </Typography>
        <List disablePadding>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
              onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
            />
          ))}
        </List>
      </Box>

      {/* Sign Out */}
      <Box sx={{ p: 1.5, borderTop: `1px solid ${COLORS.border}` }}>
        <ListItemButton
          onClick={() => { logout(); navigate('/login'); }}
          sx={{
            borderRadius: 0.5,
            py: 0.75,
            px: 1.5,
            color: COLORS.textSecond,
            '&:hover': { bgcolor: '#fef2f2', color: '#dc2626' },
            transition: 'background-color 0.12s ease, color 0.12s ease',
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <LogoutOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.bgBase }}>
      {/* Sidebar — Desktop */}
      {!isMobile && (
        <Box sx={{ width: DRAWER_W, flexShrink: 0 }}>
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: DRAWER_W,
            zIndex: 1200,
          }}>
            {DrawerContent}
          </Box>
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_W, border: 'none' } }}
      >
        {DrawerContent}
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            borderBottom: `1px solid ${COLORS.border}`,
            color: COLORS.textPrimary,
          }}
        >
          <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, md: 3 } }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: COLORS.textSecond }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{
              flexGrow: 1,
              fontWeight: 600,
              fontSize: '0.92rem',
              color: COLORS.textPrimary,
            }}>
              {navItems.find(n => location.pathname === n.path)?.label || 'Institution Workspace'}
            </Typography>

            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton
                sx={{ mr: 1, color: COLORS.textSecond }}
                onClick={() => {
                  const profilePath = isAdmin ? '/admin/dashboard' : isFaculty ? '/faculty/dashboard' : '/student/dashboard';
                  navigate(profilePath);
                  notifAPI.markAllRead().catch(() => {});
                  setNotifCount(0);
                }}
              >
                <Badge badgeContent={notifCount} color="error" max={9}>
                  <NotificationsOutlined sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Profile Info & Dropdown */}
            <Box
              onClick={e => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 0.5,
                px: 1,
                borderRadius: 0.5,
                '&:hover': { bgcolor: '#f8fafc' },
              }}
            >
              <Avatar
                src={user?.profileImage}
                sx={{
                  width: 30,
                  height: 30,
                  backgroundColor: COLORS.primary,
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: 0.5,
                }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: COLORS.textPrimary, lineHeight: 1.2 }}>
                  {user?.name || user?.username}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: COLORS.textMuted }}>
                  {user?.role || 'USER'}
                </Typography>
              </Box>
            </Box>

            {/* Prominent Header Logout Button */}
            <Button
              size="small"
              variant="outlined"
              onClick={() => { logout(); navigate('/login'); }}
              startIcon={<LogoutOutlined sx={{ fontSize: 16 }} />}
              sx={{
                ml: 1.5,
                borderRadius: 0.5,
                borderColor: '#e2e8f0',
                color: '#64748b',
                fontSize: '0.78rem',
                fontWeight: 600,
                px: 1.25,
                py: 0.4,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#fca5a5',
                  bgcolor: '#fef2f2',
                  color: '#dc2626',
                },
              }}
            >
              Logout
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  borderRadius: 0.5,
                  mt: 1,
                  minWidth: 210,
                  boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)',
                  border: `1px solid ${COLORS.border}`,
                }
              }}
            >
              <MenuItem disabled sx={{ py: 1 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} color={COLORS.textPrimary}>
                    {user?.name || user?.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  const profilePath = isStudent ? '/student/profile' : isFaculty ? '/faculty/profile' : '/admin/dashboard';
                  navigate(profilePath);
                  setAnchorEl(null);
                }}
                sx={{ fontSize: '0.8125rem' }}
              >
                <PersonOutline fontSize="small" sx={{ mr: 1, color: COLORS.textSecond }} /> Account Profile
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => { logout(); navigate('/login'); setAnchorEl(null); }}
                sx={{ color: COLORS.critical, fontSize: '0.8125rem', fontWeight: 600 }}
              >
                <LogoutOutlined fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Viewport Content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>

      {/* Persistent Global Floating AI Assistant */}
      <FloatingCampusBot />
    </Box>
  );
}
