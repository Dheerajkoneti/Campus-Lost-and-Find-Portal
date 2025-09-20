import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Box, Typography, CircularProgress, Container, Paper, Grid, Button } from '@mui/material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import EditItemModal from '../components/items/EditItemModal';

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ItemDetails = () => {
  const { itemId } = useParams();
  const { currentUser } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const docRef = doc(db, 'items', itemId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such document!');
      }
      setLoading(false);
    };
    fetchItem();
  }, [itemId]);

  const handleClaim = async () => {
    if (!currentUser || !item) {
        alert("You must be logged in to claim an item.");
        return;
    }

    try {
        const claimsCollectionRef = collection(db, "claims");
        const newClaimRef = await addDoc(claimsCollectionRef, {
            itemId: item.id,
            itemTitle: item.title,
            itemImageUrl: item.imageUrl,
            finderId: item.userId,
            claimerId: currentUser.uid,
            status: 'pending',
            createdAt: serverTimestamp(),
        });

        const itemDocRef = doc(db, 'items', itemId);
        await updateDoc(itemDocRef, {
            status: 'pending_claim'
        });

        navigate(`/claim/${newClaimRef.id}`);
        alert("Claim initiated successfully!");

    } catch (error) {
        console.error("Error creating claim:", error);
        alert("Failed to initiate claim. Please try again.");
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (!item) return <Typography align="center" sx={{ mt: 5 }}>Item not found.</Typography>;

  const canClaim = item.itemType === 'found' && currentUser && item.userId !== currentUser.uid && item.status === 'active';
  const isOwner = currentUser && item.userId === currentUser.uid;
  const position = [item.location.latitude, item.location.longitude];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <EditItemModal open={isEditing} handleClose={() => setIsEditing(false)} item={item} />
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>{item.title}</Typography>
            <Box sx={{ mb: 2 }}>
                <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }} />
            </Box>
            <Typography variant="h6">Description</Typography>
            <Typography paragraph color="text.secondary">{item.description}</Typography>
            <Typography><strong>Category:</strong> {item.category}</Typography>
            <Typography><strong>Reported by:</strong> {item.userName}</Typography>
            <Typography><strong>Status:</strong> {item.status.replace('_', ' ').toUpperCase()}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Last Known Location</Typography>
            <Box sx={{ height: '300px', width: '100%', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
              <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position}></Marker>
              </MapContainer>
            </Box>
            {isOwner && (
              <Button fullWidth variant="outlined" color="primary" size="large" sx={{ mb: 2 }} onClick={() => setIsEditing(true)}>
                Edit Post
              </Button>
            )}
            {canClaim && (
              <Button fullWidth variant="contained" color="primary" size="large" onClick={handleClaim}>
                Claim This Item
              </Button>
            )}
            {item.status === 'pending_claim' && <Typography align="center" color="text.secondary">This item is currently being claimed.</Typography>}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};
export default ItemDetails;