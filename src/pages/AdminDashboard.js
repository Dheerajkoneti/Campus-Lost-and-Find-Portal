import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { db } from '../api/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const AdminDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This query gets all items ordered by the newest first
    const itemsCollectionRef = collection(db, "items");
    const q = query(itemsCollectionRef, orderBy("timestamp", "desc"));

    // Set up a real-time listener to get all items
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Paper elevation={4} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Reported Items ({items.length})
        </Typography>
        <TableContainer>
          <Table aria-label="admin items table">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reported By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <img src={item.imageUrl} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{item.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(item.timestamp.seconds * 1000).toLocaleString()}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)} 
                      color={item.itemType === 'lost' ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.status.replace('_', ' ').toUpperCase()}</TableCell>
                  <TableCell>{item.userName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
export default AdminDashboard;