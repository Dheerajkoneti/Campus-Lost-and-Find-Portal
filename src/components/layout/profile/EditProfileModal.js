import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../api/firebase';

const EditProfileModal = ({ open, handleClose, user, refetchUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    section: '',
    registerNumber: '',
  });

  useEffect(() => {
    // Pre-fill form when user data is available
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
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, formData);
      alert('Profile updated successfully!');
      refetchUser(); // Refresh the user data in the context
      handleClose(); // Close the modal
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