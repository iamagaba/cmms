import { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, TextField, InputAdornment, IconButton, Badge, Avatar, Menu, MenuItem, List, ListItem, ListItemText, Divider, Button, Popover } from '@mui/material';
import {
  Search,
  Notifications,
  AccountCircle,
  Settings,
  HelpOutline,
  Logout,
  Dashboard,
  Build,
  People,
  LocationOn,
  BarChart,
  Public,
  Fireplace,
} from '@mui/icons-material';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useNotifications } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <Dashboard fontSize="small" /> },
  { path: '/work-orders', label: 'Work Orders', icon: <Build fontSize="small" /> },
  { path: '/map', label: 'Map View', icon: <Public fontSize="small" /> },
  { path: '/technicians', label: 'Technicians', icon: <People fontSize="small" /> },
  { path: '/locations', label: 'Locations', icon: <LocationOn fontSize="small" /> },
  { path: '/analytics', label: 'Analytics', icon: <BarChart fontSize="small" /> },
  { path: '/settings', label: 'Settings', icon: <Settings fontSize="small" /> },
];

const AppHeader = () => {
  const location = useLocation();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleNotificationsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsMenuAnchor(event.currentTarget);
    markAllAsRead();
  };
  const handleNotificationsMenuClose = () => setNotificationsMenuAnchor(null);

  return (
    <AppBar position="static" sx={{ background: '#fff', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }} elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
            <Fireplace />
            <Typography variant="h6" component="div" sx={{ ml: 1, fontWeight: 'bold' }}>
              GOGO Electric
            </Typography>
          </Box>
          <Box component="nav" sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={NavLink}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  '&.active': {
                    backgroundColor: 'action.selected',
                    color: 'primary.main',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              sx: { borderRadius: '20px' }
            }}
          />
          <IconButton color="inherit" onClick={handleNotificationsMenuOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton onClick={handleUserMenuOpen}>
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleUserMenuClose}><AccountCircle sx={{ mr: 1 }} /> Profile</MenuItem>
          <MenuItem onClick={handleUserMenuClose}><Settings sx={{ mr: 1 }} /> Settings</MenuItem>
          <MenuItem onClick={handleUserMenuClose}><HelpOutline sx={{ mr: 1 }} /> Support</MenuItem>
          <Divider />
          <MenuItem onClick={handleUserMenuClose}><Logout sx={{ mr: 1 }} /> Logout</MenuItem>
        </Menu>

        {/* Notifications Popover */}
        <Popover
          open={Boolean(notificationsMenuAnchor)}
          anchorEl={notificationsMenuAnchor}
          onClose={handleNotificationsMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ width: 350 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Notifications</Typography>
            </Box>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {notifications.length > 0 ? (
                notifications.map(item => (
                  <ListItem
                    key={item.id}
                    button
                    component={Link}
                    to={`/work-orders/${item.work_order_id}`}
                    sx={{ backgroundColor: item.is_read ? 'transparent' : 'action.hover' }}
                  >
                    <ListItemText
                      primary={item.message}
                      secondary={formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No new notifications" />
                </ListItem>
              )}
            </List>
          </Box>
        </Popover>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;