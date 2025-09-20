import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../api/firebase';

const categories = [
  'Electronics', 'ID Card', 'Wallet/Purse', 'Keys', 'Apparel', 
  'Books', 'Bags', 'Jewelry', 'Water Bottle', 'Other'
];

const EditItemModal = ({ open, handleClose, item }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
      });
    }
  }, [item]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!item || !item.id) return;
    try {
      const itemDocRef = doc(db, "items", item.id);
      await updateDoc(itemDocRef, formData);
      alert('Post updated successfully!');
      handleClose();
    } catch (error) {
      console.error("Error updating post: ", error);
      alert('Failed to update post.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit Post</DialogTitle>
      <DialogContent>
        <TextField 
          margin="dense" 
          name="title" 
          label="Item Title" 
          type="text" 
          fullWidth 
          variant="standard" 
          value={formData.title} 
          onChange={handleChange} 
        />
        <TextField 
          margin="dense" 
          name="description" 
          label="Description" 
          type="text" 
          multiline 
          rows={4} 
          fullWidth 
          variant="standard" 
          value={formData.description} 
          onChange={handleChange} 
        />
        <FormControl fullWidth margin="dense" variant="standard">
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            label="Category"
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};
export default EditItemModal;