import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Paper, Avatar, Grid, IconButton, CircularProgress, Container } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../api/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { uploadFileToCloudinary } from '../api/cloudinary';
import EditProfileModal from '../components/profile/EditProfileModal';
import ItemCard from '../components/items/ItemCard';
import EditItemModal from '../components/items/EditItemModal'; // <-- NEW IMPORT

const Profile = () => {
  const { currentUser, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditingItemId, setIsEditingItemId] = useState(null); // <-- NEW STATE

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    const itemsQuery = query(collection(db, "items"), where("userId", "==", currentUser.uid), orderBy("timestamp", "desc"));
    const unsubscribeItems = onSnapshot(itemsQuery, (snapshot) => {
      setMyItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribeItems();
  }, [currentUser]);

  const handleDeletePost = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "items", itemId));
        alert("Post deleted successfully!");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post.");
      }
    }
  };

  const handleEditPost = (item) => {
    setIsEditingItemId(item.id);
  };

  const handleCloseEditPostModal = () => {
    setIsEditingItemId(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };
  
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const photoURL = await uploadFileToCloudinary(file);
      if (photoURL) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { photoURL });
        await refetchUser();
        alert('Profile picture updated!');
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert('Failed to upload picture.');
    } finally {
      setUploading(false);
    }
  };

  if (!currentUser || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const itemToEdit = myItems.find(item => item.id === isEditingItemId);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <EditProfileModal open={openEditModal} handleClose={() => setOpenEditModal(false)} user={currentUser} refetchUser={refetchUser} />
      
      {itemToEdit && (
        <EditItemModal open={!!itemToEdit} handleClose={handleCloseEditPostModal} item={itemToEdit} />
      )}

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, mb: 2 }}>
            <Box sx={{ position: 'relative', width: 150, height: 150, mb: 2 }}>
              <Avatar src={currentUser.photoURL} sx={{ width: '100%', height: '100%', fontSize: '4rem', boxShadow: 3 }}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : ''}
              </Avatar>
              <IconButton color="primary" aria-label="upload picture" component="label" sx={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.8)', '&:hover': { backgroundColor: 'white' } }}>
                <input hidden accept="image/*" type="file" onChange={handleProfilePictureChange} />
                {uploading ? <CircularProgress size={24} /> : <PhotoCamera />}
              </IconButton>
            </Box>
            
            <Typography variant="h5" fontWeight="bold">{currentUser.name}</Typography>
            <Typography color="text.secondary">{currentUser.email}</Typography>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography color="text.secondary">Dept: {currentUser.department} | Section: {currentUser.section}</Typography>
                <Typography color="text.secondary">Reg No: {currentUser.registerNumber}</Typography>
            </Box>
            
            <Button variant="outlined" startIcon={<EditIcon />} sx={{ mt: 3, borderRadius: 20 }} onClick={() => setOpenEditModal(true)}>
              Edit Profile
            </Button>
          </Paper>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>My Claims & Conversations</Typography>
            <Button component={RouterLink} to="/my-claims" variant="contained" sx={{ mt: 2, width: '100%' }}>
              View all claims
            </Button>
          </Paper>
          <Button variant="contained" color="error" onClick={handleLogout} sx={{ mt: 2, width: '100%', borderRadius: 3 }}>
            Log Out
          </Button>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom>My Reported Items</Typography>
            {myItems.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {myItems.map(item => (
                  <ItemCard key={item.id} item={item} isProfilePage onDelete={handleDeletePost} onEdit={handleEditPost} />
                ))}
              </Box>
            ) : (
              <Typography sx={{ mt: 3, textAlign: 'center' }}>You have not reported any items yet.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
export default Profile;