import React, { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Box, Button, Paper, Typography, CircularProgress, Avatar, TextField, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import { db } from '../api/firebase';
import { doc, collection, query, orderBy, onSnapshot, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import ChatMessage from '../components/chat/ChatMessage';

const ClaimChat = () => {
  const { claimId } = useParams();
  const { currentUser } = useAuth();
  const [claim, setClaim] = useState(null);
  const [item, setItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    const claimDocRef = doc(db, 'claims', claimId);
    const unsubscribe = onSnapshot(claimDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const claimData = { id: docSnap.id, ...docSnap.data() };
        if (currentUser.uid === claimData.claimerId || currentUser.uid === claimData.finderId) {
          setClaim(claimData);
          if (!item) {
            const itemDocRef = doc(db, 'items', claimData.itemId);
            const itemDocSnap = await getDoc(itemDocRef);
            if (itemDocSnap.exists()) { setItem(itemDocSnap.data()); }
          }
        } else { setUnauthorized(true); }
      } else { setUnauthorized(true); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [claimId, currentUser.uid, item]);

  useEffect(() => {
    if (!claim) return;
    const messagesRef = collection(db, 'claims', claimId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [claim, claimId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;
    const messagesRef = collection(db, 'claims', claimId, 'messages');
    await addDoc(messagesRef, {
      text: newMessage,
      timestamp: serverTimestamp(),
      uid: currentUser.uid,
      userName: currentUser.name,
      photoURL: currentUser.photoURL || null,
    });
    setNewMessage('');
  };
  
  const handleClaimResolution = async (newStatus) => {
    const isApproved = newStatus === 'approved';
    try {
      const claimDocRef = doc(db, 'claims', claimId);
      await updateDoc(claimDocRef, { status: newStatus });
      const itemDocRef = doc(db, 'items', claim.itemId);
      await updateDoc(itemDocRef, { status: isApproved ? 'returned' : 'active' });
      alert(`Claim has been ${newStatus}.`);
    } catch (error) {
      console.error("Error resolving claim:", error);
      alert('Failed to update claim status.');
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answer) return alert('Please provide an answer.');
    const claimDocRef = doc(db, 'claims', claimId);
    await updateDoc(claimDocRef, {
        answerAttempt: answer,
        status: 'pending_approval'
    });
    alert('Answer submitted! The finder can now review it.');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (unauthorized) return <Navigate to="/" />;
  if (!claim || !item) return <Typography align="center" sx={{ mt: 5 }}>Claim not found.</Typography>;

  const isClaimer = currentUser.uid === claim.claimerId;
  const isFinder = currentUser.uid === claim.finderId;
  const isClaimResolved = claim.status === 'approved' || claim.status === 'rejected';

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">Claim Discussion</Typography>
      <Paper elevation={4} sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Avatar src={claim.itemImageUrl} variant="rounded" sx={{ width: 56, height: 56, mr: 2 }} />
          <Box>
            <Typography variant="h6">{claim.itemTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {claim.status.replace('_', ' ').toUpperCase()}
            </Typography>
          </Box>
        </Box>

        {/* --- VERIFICATION SECTION --- */}
        <Box sx={{ p: 2, backgroundColor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight="bold">Ownership Verification</Typography>
          <Typography sx={{ mt: 1 }}><strong>Secret Question:</strong> {item.secretQuestion}</Typography>
          
          {isClaimer && claim.status === 'pending' && (
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAnswerSubmit(); }} sx={{ display: 'flex', mt: 1 }}>
              <TextField size="small" fullWidth label="Your Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
              <Button type="submit" variant="contained" sx={{ ml: 1 }}>Submit</Button>
            </Box>
          )}

          {isFinder && claim.answerAttempt && (
            <Box sx={{ mt: 1, p: 1, borderRadius: 1, backgroundColor: item.secretAnswer.toLowerCase() === claim.answerAttempt.toLowerCase() ? 'success.light' : 'error.light' }}>
              <Typography><strong>Correct Answer:</strong> {item.secretAnswer}</Typography>
              <Typography><strong>Claimer's Answer:</strong> {claim.answerAttempt}</Typography>
            </Box>
          )}

          {isClaimer && claim.answerAttempt && <Typography sx={{ mt: 1 }}><strong>Your Submitted Answer:</strong> {claim.answerAttempt}</Typography>}
        </Box>

        {isFinder && !isClaimResolved && claim.status === 'pending_approval' && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2, backgroundColor: 'action.hover' }}>
            <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleClaimResolution('approved')}>Approve Claim</Button>
            <Button variant="contained" color="error" startIcon={<CancelIcon />} onClick={() => handleClaimResolution('rejected')}>Reject Claim</Button>
          </Box>
        )}
        
        <Box sx={{ height: '50vh', flex: 1, overflowY: 'auto', p: 2 }}>
          {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={scrollRef}></div>
        </Box>
        
        {isClaimResolved ? (
          <Typography sx={{ p: 2, textAlign: 'center', backgroundColor: 'action.disabledBackground' }}>
            This claim has been resolved. Chat is disabled.
          </Typography>
        ) : (
          <Box component="form" onSubmit={handleSendMessage} sx={{ p: '8px 16px', display: 'flex', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              InputProps={{ disableUnderline: true }}
            />
            <IconButton type="submit" color="primary"><SendIcon /></IconButton>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
export default ClaimChat;