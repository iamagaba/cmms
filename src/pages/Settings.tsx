import React, { useState } from 'react';
import { Card, Tabs, Tab, Box, TextField, Button, Select, Switch, Avatar, Typography, Grid, FormControl, InputLabel, MenuItem, FormControlLabel } from '@mui/material';
import { Person, Settings as SettingsIcon, Notifications, Lock, Save } from '@mui/icons-material';
import { TechnicianDataTable } from '@/components/TechnicianDataTable';
import { technicians, workOrders, Technician } from '@/data/mockData';
import { TechnicianFormDialog } from '@/components/TechnicianFormDialog';
import { showSuccess } from '@/utils/toast';

// Mock current user data
const currentUser = {
  name: 'Admin User',
  email: 'admin@gogo.com',
  avatar: '/placeholder.svg',
};

const UserManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allTechnicians, setAllTechnicians] = useState(technicians);

  const handleSave = (technicianData: Technician) => {
    const exists = allTechnicians.some(t => t.id === technicianData.id);
    if (exists) {
      setAllTechnicians(allTechnicians.map(t => t.id === technicianData.id ? technicianData : t));
    } else {
      setAllTechnicians([...allTechnicians, technicianData]);
    }
    showSuccess(`User ${technicianData.name} has been saved.`);
  };

  return (
    <Card>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Manage Users</Typography>
        <Button variant="contained" onClick={() => setIsDialogOpen(true)}>Add User</Button>
      </Box>
      <TechnicianDataTable initialData={allTechnicians} workOrders={workOrders} />
      {isDialogOpen && (
        <TechnicianFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          technician={null}
        />
      )}
    </Card>
  );
};

const SystemSettings = () => {
  const onFinish = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());
    console.log('Saving system settings:', values);
    showSuccess('System settings have been updated.');
  };

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>System Configuration</Typography>
        <Box component="form" onSubmit={onFinish} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControlLabel
            control={<Switch name="notifications" defaultChecked />}
            label="Enable Email Notifications"
          />
          <FormControl sx={{ maxWidth: 250 }}>
            <InputLabel>Default Work Order Priority</InputLabel>
            <Select name="defaultPriority" label="Default Work Order Priority" defaultValue="Medium">
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="slaThreshold"
            label="SLA Warning Threshold (days)"
            type="number"
            defaultValue={3}
            sx={{ maxWidth: 250 }}
          />
          <Box>
            <Button type="submit" variant="contained" startIcon={<Save />}>
              Save Settings
            </Button>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

const ProfileSettings = () => {
  const onProfileFinish = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showSuccess('Your profile has been updated.');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 128, height: 128 }} src={currentUser.avatar}><Person /></Avatar>
          <Typography variant="h5">{currentUser.name}</Typography>
          <Typography color="text.secondary">{currentUser.email}</Typography>
          <Button variant="outlined">Change Avatar</Button>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Edit Profile Information</Typography>
          <Box component="form" onSubmit={onProfileFinish} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField name="name" label="Full Name" defaultValue={currentUser.name} required />
            <TextField name="email" label="Email Address" type="email" defaultValue={currentUser.email} required />
            <Box>
              <Button type="submit" variant="contained">Update Profile</Button>
            </Box>
          </Box>
        </Card>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Change Password</Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField name="currentPassword" label="Current Password" type="password" InputProps={{ startAdornment: <Lock /> }} />
            <TextField name="newPassword" label="New Password" type="password" InputProps={{ startAdornment: <Lock /> }} />
            <TextField name="confirmPassword" label="Confirm New Password" type="password" InputProps={{ startAdornment: <Lock /> }} />
            <Box>
              <Button type="submit" variant="contained">Update Password</Button>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" component="h1" fontWeight="bold">Settings</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleChange}>
          <Tab label="User Management" icon={<Person />} iconPosition="start" />
          <Tab label="System Settings" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="My Profile" icon={<Notifications />} iconPosition="start" />
        </Tabs>
      </Box>
      {activeTab === 0 && <UserManagement />}
      {activeTab === 1 && <SystemSettings />}
      {activeTab === 2 && <ProfileSettings />}
    </Box>
  );
};

export default SettingsPage;