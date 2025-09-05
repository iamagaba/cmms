import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Select, MenuItem, FormControl, InputLabel, Grid, Stepper, Step, StepLabel, Box } from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { WorkOrder, technicians, locations } from "@/data/mockData";
import dayjs, { Dayjs } from 'dayjs';
import { GoogleLocationSearchInput } from "./GoogleLocationSearchInput";

interface WorkOrderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkOrder) => void;
  workOrder?: WorkOrder | null;
}

interface WorkOrderFormState extends Omit<Partial<WorkOrder>, 'slaDue'> {
  slaDue: Dayjs | null;
}

const steps = ['Customer & Vehicle', 'Service Details', 'Assignment & Scheduling'];

export const WorkOrderFormDialog = ({ isOpen, onClose, onSave, workOrder }: WorkOrderFormDialogProps) => {
  const [formState, setFormState] = useState<WorkOrderFormState>({
    vehicleId: '',
    vehicleModel: '',
    customerName: '',
    customerPhone: '',
    service: '',
    status: 'Open',
    priority: 'Medium',
    locationId: '',
    customerAddress: '',
    assignedTechnicianId: null,
    slaDue: null,
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (workOrder) {
        setFormState({
          ...workOrder,
          slaDue: workOrder.slaDue ? dayjs(workOrder.slaDue) : null,
        });
        if (workOrder.customerLat && workOrder.customerLng) {
          setClientLocation({ lat: workOrder.customerLat, lng: workOrder.customerLng });
        }
      } else {
        setFormState({
          vehicleId: '', vehicleModel: '', customerName: '', customerPhone: '',
          service: '', status: 'Open', priority: 'Medium', locationId: '',
          customerAddress: '', assignedTechnicianId: null, slaDue: null,
        });
        setClientLocation(null);
      }
      setCurrentStep(0);
    }
  }, [isOpen, workOrder]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name!]: value }));
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setFormState(prev => ({ ...prev, slaDue: newValue }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; label: string }) => {
    setClientLocation({ lat: location.lat, lng: location.lng });
    setFormState(prev => ({ ...prev, customerAddress: location.label }));
  };

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleBack = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const newId = workOrder?.id || `WO-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const workOrderToSave: WorkOrder = {
        ...formState,
        id: newId,
        slaDue: formState.slaDue!.toISOString(),
        customerLat: clientLocation?.lat,
        customerLng: clientLocation?.lng,
        activityLog: workOrder?.activityLog || [],
        partsUsed: workOrder?.partsUsed || [],
      } as WorkOrder;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave(workOrderToSave);
      onClose();
    } catch (info) {
      console.log('Validate Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField name="vehicleId" label="Vehicle ID" value={formState.vehicleId} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField name="vehicleModel" label="Vehicle Model" value={formState.vehicleModel} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField name="customerName" label="Customer Name" value={formState.customerName} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField name="customerPhone" label="Customer Phone" value={formState.customerPhone} onChange={handleChange} fullWidth /></Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField name="service" label="Service Description" value={formState.service} onChange={handleChange} fullWidth multiline rows={2} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select name="status" label="Status" value={formState.status} onChange={handleChange}><MenuItem value="Open">Open</MenuItem><MenuItem value="In Progress">In Progress</MenuItem><MenuItem value="On Hold">On Hold</MenuItem><MenuItem value="Completed">Completed</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Priority</InputLabel><Select name="priority" label="Priority" value={formState.priority} onChange={handleChange}><MenuItem value="High">High</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="Low">Low</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Service Location</InputLabel><Select name="locationId" label="Service Location" value={formState.locationId} onChange={handleChange}>{locations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><GoogleLocationSearchInput onLocationSelect={handleLocationSelect} initialValue={workOrder?.customerAddress || ''} /></Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Assigned Technician</InputLabel><Select name="assignedTechnicianId" label="Assigned Technician" value={formState.assignedTechnicianId || ''} onChange={handleChange}>{technicians.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><LocalizationProvider dateAdapter={AdapterDayjs}><DateTimePicker label="SLA Due Date" value={formState.slaDue} onChange={handleDateChange} /></LocalizationProvider></Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{workOrder ? "Edit Work Order" : "Create Work Order"}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
        {renderStepContent(currentStep)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {currentStep > 0 && <Button onClick={handleBack}>Back</Button>}
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained">Next</Button>
        ) : (
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>Save Work Order</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};