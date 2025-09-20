import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Container, Paper } from '@mui/material';
import { db } from '../api/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import ClaimCard from '../components/profile/ClaimCard';

const MyClaims = () => {
  const { currentUser } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    const claimsAsClaimerQuery = query(collection(db, "claims"), where("claimerId", "==", currentUser.uid));
    const claimsAsFinderQuery = query(collection(db, "claims"), where("finderId", "==", currentUser.uid));

    const unsubscribeClaimsAsClaimer = onSnapshot(claimsAsClaimerQuery, (snapshot) => {
      const claimsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClaims(prevClaims => [...prevClaims.filter(c => c.finderId === currentUser.uid), ...claimsData]);
      setLoading(false);
    });

    const unsubscribeClaimsAsFinder = onSnapshot(claimsAsFinderQuery, (snapshot) => {
      const claimsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClaims(prevClaims => [...prevClaims.filter(c => c.claimerId === currentUser.uid), ...claimsData]);
    });

    return () => {
      unsubscribeClaimsAsClaimer();
      unsubscribeClaimsAsFinder();
    };
  }, [currentUser]);

  if (!currentUser || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        My Claims & Conversations
      </Typography>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mt: 3 }}>
        {claims.length > 0 ? (
          claims.map(claim => <ClaimCard key={claim.id} claim={claim} currentUserId={currentUser.uid} />)
        ) : (
          <Typography variant="body1" color="text.secondary" align="center">You have no active claims.</Typography>
        )}
      </Paper>
    </Container>
  );
};
export default MyClaims;