import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";
import { Location } from "@/data/mockData";

interface LocationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Location) => void;
  location?: Location | null;
}

export const LocationFormDialog = ({ isOpen, onClose, onSave, location }: LocationFormDialogProps) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(location?.name || '');
      setAddress(location?.address || '');
    }
  }, [isOpen, location]);

  const handleSubmit = async () => {
    if (!name || !address) {
      return;
    }
    setLoading(true);
    try {
      const newId = location?.id || `loc${Math.floor(Math.random() * 1000)}`;
      const locationToSave: Location = {
        id: newId,
        name,
        address,
        lat: location?.lat || 0.32,
        lng: location?.lng || 32.58,
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave(locationToSave);
      onClose();
    } catch (info) {
      console.log('Save Failed:', info);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{location ? "Edit Location" : "Add Location"}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Location Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. GOGO Station - Wandegeya"
        />
        <TextField
          margin="dense"
          id="address"
          label="Address"
          type="text"
          fullWidth
          variant="outlined"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. Wandegeya, Kampala"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};