import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Technician } from "@/data/mockData";
import dayjs, { Dayjs } from 'dayjs';

interface TechnicianFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Technician) => void;
  technician?: Technician | null;
}

export const TechnicianFormDialog = ({ isOpen, onClose, onSave, technician }: TechnicianFormDialogProps) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'available' as Technician['status'],
    specialization: 'Electrical' as Technician['specialization'],
    joinDate: null as Dayjs | null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (technician) {
        setFormState({
          name: technician.name,
          email: technician.email,
          phone: technician.phone,
          status: technician.status,
          specialization: technician.specialization,
          joinDate: technician.joinDate ? dayjs(technician.joinDate) : null,
        });
      } else {
        setFormState({
          name: '',
          email: '',
          phone: '',
          status: 'available',
          specialization: 'Electrical',
          joinDate: null,
        });
      }
    }
  }, [isOpen, technician]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name!]: value }));
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setFormState(prevState => ({ ...prevState, joinDate: newValue }));
  };

  const handleSubmit = async () => {
    if (!formState.name || !formState.email || !formState.phone || !formState.joinDate) {
      return;
    }
    setLoading(true);
    try {
      const newId = technician?.id || `tech${Math.floor(Math.random() * 1000)}`;
      const technicianToSave: Technician = {
        id: newId,
        name: formState.name,
        status: formState.status,
        avatar: technician?.avatar || '/placeholder.svg',
        email: formState.email,
        phone: formState.phone,
        specialization: formState.specialization,
        joinDate: formState.joinDate.toISOString(),
        lat: technician?.lat || 0.32,
        lng: technician?.lng || 32.58,
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave(technicianToSave);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{technician ? "Edit Technician" : "Add Technician"}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField name="name" label="Name" value={formState.name} onChange={handleChange} fullWidth placeholder="e.g. John Doe" />
        <TextField name="email" label="Email" type="email" value={formState.email} onChange={handleChange} fullWidth placeholder="e.g. john.doe@gogo.com" />
        <TextField name="phone" label="Phone Number" value={formState.phone} onChange={handleChange} fullWidth placeholder="e.g. +256 772 123456" />
        <FormControl fullWidth>
          <InputLabel id="status-label">Status</InputLabel>
          <Select labelId="status-label" name="status" value={formState.status} label="Status" onChange={handleChange as any}>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="busy">Busy</MenuItem>
            <MenuItem value="offline">Offline</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="specialization-label">Specialization</InputLabel>
          <Select labelId="specialization-label" name="specialization" value={formState.specialization} label="Specialization" onChange={handleChange as any}>
            <MenuItem value="Electrical">Electrical</MenuItem>
            <MenuItem value="Mechanical">Mechanical</MenuItem>
            <MenuItem value="Diagnostics">Diagnostics</MenuItem>
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Join Date" value={formState.joinDate} onChange={handleDateChange} />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};