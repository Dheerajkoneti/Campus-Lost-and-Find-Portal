import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster'; // Corrected import
import { db } from '../api/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ExploreMap = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const itemsCollectionRef = collection(db, "items");
    const unsubscribe = onSnapshot(itemsCollectionRef, (snapshot) => {
      const itemsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.location && item.location.latitude && item.location.longitude);
      
      setItems(itemsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Map...</Typography>
      </Box>
    );
  }

  const defaultPosition = [9.5743, 77.6761]; // Kalasalingam University

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        Explore Items on Map
      </Typography>
      <Paper elevation={4} sx={{ height: '75vh', width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <MapContainer center={defaultPosition} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MarkerClusterGroup>
            {items.map(item => (
              <Marker
                key={item.id}
                position={[item.location.latitude, item.location.longitude]}
              >
                <Popup>
                  <Box sx={{ textAlign: 'center' }}>
                    <img src={item.imageUrl} alt={item.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>{item.title}</Typography>
                    <Typography variant="caption">{item.category}</Typography>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </Paper>
    </Box>
  );
};

export default ExploreMap;