import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, Avatar, Badge,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
  Menu, MenuItem, Tooltip, Chip, useMediaQuery
} from '@mui/material';
import {
  Dashboard, People, CalendarMonth, Payment, BarChart, Psychology,
  Chat, Logout, Menu as MenuIcon, Notifications, School, Assessment,
  AutoGraph, LibraryBooks, Close, Person, Settings, TrendingUp, Campaign
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { notifAPI } from '../../services/api';
import { COLORS } from '../../theme/theme';
import { Grade } from '@mui/icons-material';

const DRAWER_W = 260;

function NavItem({ icon, label, path, active, onClick }) {
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          mx: 1, borderRadius: 2, py: 1.2, px: 2,
          bgcolor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          transition: 'all 0.15s ease'
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: active ? '#fff' : 'rgba(255,255,255,0.65)' }}>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            fontSize: '0.875rem', fontWeight: active ? 600 : 400,
            color: active ? '#fff' : 'rgba(255,255,255,0.75)'
          }}
        />
        {active && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: COLORS.accent }} />}
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
          setNotifCount(Array.isArray(data) ? data.length : (data?.unread || 0));
        })
        .catch(() => {});
    }
  }, [user]);

  const studentNav = [
    { icon: <Dashboard fontSize="small" />,  label: 'Dashboard',    path: '/student/dashboard' },
    { icon: <CalendarMonth fontSize="small"/>,label: 'Attendance',  path: '/student/attendance' },
    { icon: <Assessment fontSize="small" />, label: 'Results',      path: '/student/results' },
    { icon: <TrendingUp fontSize="small" />, label: 'GPA Tracker',  path: '/student/gpa' },
    { icon: <Payment fontSize="small" />,    label: 'Fees',         path: '/student/fees' },
    { icon: <School fontSize="small" />,     label: 'Exams',        path: '/student/exams' },
    { icon: <AutoGraph fontSize="small" />,  label: 'AI Insights',  path: '/student/ai-insights' },
    { icon: <Person fontSize="small" />,     label: 'My Profile',   path: '/student/profile' },
    { icon: <Chat fontSize="small" />,       label: 'CampusMate AI',path: '/chatbot' },
  ];
  const facultyNav = [
    { icon: <Dashboard fontSize="small" />,  label: 'Dashboard',    path: '/faculty/dashboard' },
    { icon: <CalendarMonth fontSize="small"/>,label: 'Attendance',  path: '/student/attendance' },
    { icon: <LibraryBooks fontSize="small"/>,label: 'My Schedule',  path: '/faculty/schedule' },
    { icon: <Assessment fontSize="small" />, label: 'Results',      path: '/student/results' },
    { icon: <School fontSize="small" />,     label: 'Exams',        path: '/student/exams' },
    { icon: <People fontSize="small" />,     label: 'Students',     path: '/admin/students' },
    { icon: <Psychology fontSize="small" />, label: 'AI Analytics', path: '/student/ai-insights' },
    { icon: <Person fontSize="small" />,     label: 'My Profile',   path: '/faculty/profile' },
    { icon: <Campaign fontSize="small" />, label: 'Announcements', path: '/announcements' },
    { icon: <Chat fontSize="small" />,       label: 'CampusMate AI', path: '/chatbot' },
  ];
  const adminNav = [
    { icon: <Dashboard fontSize="small" />,  label: 'Dashboard',    path: '/admin/dashboard' },
    { icon: <People fontSize="small" />,     label: 'Students',     path: '/admin/students' },
    { icon: <School fontSize="small" />,     label: 'Faculty',      path: '/admin/faculty' },
    { icon: <BarChart fontSize="small" />,   label: 'Analytics',    path: '/student/ai-insights' },
    { icon: <Payment fontSize="small" />,    label: 'Fees',         path: '/student/fees' },
    { icon: <School fontSize="small" />,     label: 'Exams',        path: '/student/exams' },
    { icon: <Grade fontSize='small'/>,      label: 'Publish CGPA', path: '/admin/publish-cgpa' },
    { icon: <Campaign fontSize="small" />, label: 'Announcements', path: '/announcements' },
    { icon: <Chat fontSize="small" />,       label: 'CampusMate AI', path: '/chatbot' },
  ];

  const navItems = isAdmin ? adminNav : isFaculty ? facultyNav : studentNav;
  const roleBadgeColor = isAdmin ? '#f59e0b' : isFaculty ? '#2563eb' : '#059669';
  const roleLabel = user?.role || 'USER';

  const DrawerContent = (
    <Box sx={{ height: '100%', bgcolor: COLORS.bgSidebar, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: 2.5,
          bgcolor: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <School sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1 }}>CampusIQ+</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', mt: 0.3 }}>Smart Campus Platform</Typography>
        </Box>
        {isMobile && (
          <IconButton sx={{ ml: 'auto', color: 'rgba(255,255,255,0.5)' }} onClick={() => setMobileOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* User card */}
      <Box sx={{ mx: 2, mb: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: roleBadgeColor, fontSize: '0.875rem', fontWeight: 700 }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || user?.username}
            </Typography>
            <Chip label={roleLabel} size="small" sx={{
              bgcolor: `${roleBadgeColor}22`, color: roleBadgeColor,
              height: 18, fontSize: '0.65rem', fontWeight: 700, mt: 0.5,
              border: `1px solid ${roleBadgeColor}40`
            }} />
          </Box>
        </Box>
        {isStudent && user?.username && (
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', mt: 1, fontFamily: 'monospace' }}>
            {user.rollNo}
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        <Typography sx={{ px: 3, pb: 0.5, fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Navigation
        </Typography>
        <List disablePadding>
          {navItems.map(item => (
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

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => { logout(); navigate('/login'); }}
          sx={{ borderRadius: 2, color: 'rgba(255,255,255,0.55)', '&:hover': { bgcolor: 'rgba(220,38,38,0.15)', color: '#fca5a5' } }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><Logout fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.bgBase }}>
      {/* Sidebar — desktop */}
      {!isMobile && (
        <Box sx={{ width: DRAWER_W, flexShrink: 0 }}>
          <Box sx={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: DRAWER_W, zIndex: 1200 }}>
            {DrawerContent}
          </Box>
        </Box>
      )}

      {/* Mobile drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_W, border: 'none' } }}>
        {DrawerContent}
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <AppBar position="sticky" elevation={0} sx={{
          bgcolor: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}`,
          color: COLORS.textPrimary
        }}>
          <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, md: 3 } }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, fontSize: '1rem', color: COLORS.textPrimary }}>
              {navItems.find(n => location.pathname === n.path)?.label || 'CampusIQ+'}
            </Typography>
            <Tooltip title="Notifications">
              <IconButton sx={{ mr: 1 }}>
                <Badge badgeContent={notifCount} color="error" max={9}>
                  <Notifications sx={{ color: COLORS.textSecond }} />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={user?.username}>
              <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: COLORS.primary, fontSize: '0.875rem' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}>
              <MenuItem disabled sx={{ py: 1.5 }}>
                <Box>
                  <Typography variant="body2" fontWeight={700}>{user?.name || user?.username}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { logout(); navigate('/login'); setAnchorEl(null); }}
                sx={{ color: COLORS.critical, fontSize: '0.875rem' }}>
                <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
