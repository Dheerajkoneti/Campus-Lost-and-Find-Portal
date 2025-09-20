import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, MenuItem, Paper, FormControl, InputLabel, Select } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { db } from '../api/firebase';
import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { uploadFileToCloudinary } from '../api/cloudinary';
import { useNavigate } from 'react-router-dom';
import LocationPickerMap from '../components/map/LocationPickerMap';

const categories = [
  'Electronics', 'ID Card', 'Wallet/Purse', 'Keys', 'Apparel', 
  'Books', 'Bags', 'Jewelry', 'Water Bottle', 'Other'
];

const AddItem = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [itemType, setItemType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [secretQuestion, setSecretQuestion] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };
  
  const handleLocationSelect = (latlng) => { setLocation(latlng); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let requiredFieldsMissing = !currentUser || !itemType || !title || !description || !category || !location || !imageFile;
    if (itemType === 'found' && (!secretQuestion || !secretAnswer)) {
      requiredFieldsMissing = true;
    }

    if (requiredFieldsMissing) {
      alert('Please fill all required fields, select an image, and pin a location.');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadFileToCloudinary(imageFile);
      if (!imageUrl) throw new Error('Image upload failed.');
      
      const locationGeoPoint = new GeoPoint(location.lat, location.lng);

      const itemData = {
        userId: currentUser.uid,
        userName: currentUser.name || currentUser.email,
        itemType, title, description, category, imageUrl,
        location: locationGeoPoint,
        status: 'active',
        timestamp: serverTimestamp(),
      };
      
      if (itemType === 'found') {
        itemData.secretQuestion = secretQuestion;
        itemData.secretAnswer = secretAnswer;
      }

      await addDoc(collection(db, "items"), itemData);
      alert('Item successfully reported!');
      navigate('/');
    } catch (error) {
      console.error("Error reporting item:", error);
      alert(`Failed to report item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>Report an Item</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <FormControl fullWidth margin="normal" required><InputLabel>What happened?</InputLabel><Select value={itemType} label="What happened?" onChange={(e) => setItemType(e.target.value)}><MenuItem value="lost">I Lost Something</MenuItem><MenuItem value="found">I Found Something</MenuItem></Select></FormControl>
          
          {itemType === 'found' && (
            <>
              <TextField margin="normal" required fullWidth label="Secret Question for Verification" helperText="e.g., What is the phone's lock screen wallpaper?" value={secretQuestion} onChange={(e) => setSecretQuestion(e.target.value)} />
              <TextField margin="normal" required fullWidth label="Secret Answer" helperText="The owner must provide this answer to claim the item." value={secretAnswer} onChange={(e) => setSecretAnswer(e.target.value)} />
            </>
          )}

          <TextField margin="normal" required fullWidth label="Item Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField margin="normal" required fullWidth multiline rows={3} label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <FormControl fullWidth margin="normal" required><InputLabel>Category</InputLabel><Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>{categories.map((cat) => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}</Select></FormControl>
          <Box sx={{ mt: 2, mb: 2, border: '1px dashed grey', p: 2, borderRadius: 1, textAlign: 'center' }}><input accept="image/*" style={{ display: 'none' }} id="raised-button-file" type="file" onChange={handleImageChange} /><label htmlFor="raised-button-file"><Button variant="contained" component="span" startIcon={<AddPhotoAlternateIcon />} sx={{ mb: 1 }}>Upload Image</Button></label>{imagePreview && <Box sx={{ mt: 2 }}><img src={imagePreview} alt="Item Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} /><Typography variant="body2" sx={{ mt: 1 }}>Image selected</Typography></Box>}{!imagePreview && <Typography variant="body2" color="text.secondary">No image selected</Typography>}</Box>
          <Box sx={{ mt: 3, mb: 2 }}><Typography variant="subtitle1" gutterBottom>Last Known Location</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Click on the map to drop a pin.</Typography><LocationPickerMap onLocationSelect={handleLocationSelect} />{location && (<Typography variant="caption" sx={{ mt: 1, display: 'block' }}>Selected Location: Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</Typography>)}</Box>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>{loading ? 'Submitting...' : 'Submit Report'}</Button>
        </Box>
      </Paper>
    </Container>
  );
};
export default AddItem;