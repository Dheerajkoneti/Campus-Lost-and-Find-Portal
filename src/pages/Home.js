import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Container, CircularProgress, Alert, Button,
  Tabs, Tab, Paper
} from '@mui/material';
import { db } from '../api/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, where } from 'firebase/firestore';
import ItemCard from '../components/items/ItemCard';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lostItemMatch, setLostItemMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('latest'); // <-- NEW STATE FOR TABS

  useEffect(() => {
    setLoading(true);
    let itemsCollectionRef = collection(db, "items");
    let q;
    
    // Dynamically change the query based on the active tab
    if (activeTab === 'latest') {
      q = query(itemsCollectionRef, orderBy("timestamp", "desc"));
    } else { // 'claimed' tab
      q = query(itemsCollectionRef, where("status", "in", ['pending_claim', 'returned']), orderBy("timestamp", "desc"));
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsData);
      setLoading(false);

      if (currentUser) {
        const lostItem = itemsData.find(item => item.userId === currentUser.uid && item.itemType === 'lost' && item.potentialMatchId);
        if (lostItem) {
          const matchDoc = await getDoc(doc(db, 'items', lostItem.potentialMatchId));
          if (matchDoc.exists()) {
            setLostItemMatch({ ...matchDoc.data(), id: matchDoc.id, lostItemId: lostItem.id });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, activeTab]); // <-- RE-RUN EFFECT WHEN TAB CHANGES

  const handleDismissMatch = () => {
    setLostItemMatch(null);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Campus Feed
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          centered
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Latest" value="latest" />
          <Tab label="Claimed" value="claimed" />
        </Tabs>
      </Paper>

      {lostItemMatch && (
        <Alert severity="success" onClose={handleDismissMatch} sx={{ mb: 3 }}>
          <Typography variant="body1">
            **Great news!** A potential match was found for your lost item: "{lostItemMatch.title}".
          </Typography>
          <Button 
            component={RouterLink}
            to={`/item/${lostItemMatch.id}`}
            sx={{ mt: 1 }}
          >
            View Match
          </Button>
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography sx={{ mt: 4, textAlign: 'center' }}>
          No items have been reported yet. Be the first!
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
export default Home;