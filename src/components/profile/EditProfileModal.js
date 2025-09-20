import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore'; // <-- Corrected import
import { db } from '../../api/firebase';

const EditProfileModal = ({ open, handleClose, user, refetchUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    section: '',
    registerNumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        section: user.section || '',
        registerNumber: user.registerNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user || !user.uid) {
      console.error("Error: User object or UID is missing.");
      alert('Cannot save. Please log in again.');
      return;
    }
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      // Use setDoc with merge: true to create the document if it doesn't exist
      await setDoc(userDocRef, formData, { merge: true });
      alert('Profile updated successfully!');
      refetchUser();
      handleClose();
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert('Failed to update profile.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit Profile Details</DialogTitle>
      <DialogContent>
        <TextField margin="dense" name="name" label="Full Name" type="text" fullWidth variant="standard" value={formData.name} onChange={handleChange} />
        <TextField margin="dense" name="department" label="Department" type="text" fullWidth variant="standard" value={formData.department} onChange={handleChange} />
        <TextField margin="dense" name="section" label="Section" type="text" fullWidth variant="standard" value={formData.section} onChange={handleChange} />
        <TextField margin="dense" name="registerNumber" label="Register Number" type="text" fullWidth variant="standard" value={formData.registerNumber} onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};
export default EditProfileModal;