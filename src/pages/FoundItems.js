import React, { useState, useEffect } from 'react';
import { Typography, Box, Container, CircularProgress } from '@mui/material';
import { db } from '../api/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import ItemCard from '../components/items/ItemCard';

const FoundItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const itemsCollectionRef = collection(db, "items");
    const q = query(itemsCollectionRef, where("itemType", "==", "found"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Found Items
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography sx={{ mt: 4, textAlign: 'center' }}>
          No found items have been reported yet.
        </Typography>
      ) : (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </Box>
      )}
    </Container>
  );
};
export default FoundItems;