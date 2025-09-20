import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Typography, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { db } from '../api/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import ChatMessage from '../components/chat/ChatMessage';
// Import the new generic upload function
import { uploadFileToCloudinary } from '../api/cloudinary';

// Global variables for the MediaRecorder
let mediaRecorder;
const audioChunks = [];

const Chat = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        timestamp: serverTimestamp(),
        uid: currentUser.uid,
        userName: currentUser.name || currentUser.email.split('@')[0],
        photoURL: currentUser.photoURL || null,
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // Use the new generic upload function
      const imageUrl = await uploadFileToCloudinary(file);
      await addDoc(collection(db, 'messages'), {
        imageUrl,
        timestamp: serverTimestamp(),
        uid: currentUser.uid,
        userName: currentUser.name || currentUser.email.split('@')[0],
        photoURL: currentUser.photoURL || null,
      });
      fileInputRef.current.value = null; // Clear input
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          audioChunks.push(e.data);
        };
        mediaRecorder.onstop = async () => {
          setLoading(true);
          const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
          const audioFile = new File([audioBlob], `voice_message_${Date.now()}.mp3`, { type: 'audio/mpeg' });

          try {
            // Use the new generic upload function
            const audioUrl = await uploadFileToCloudinary(audioFile);
            await addDoc(collection(db, 'messages'), {
              audioUrl,
              timestamp: serverTimestamp(),
              uid: currentUser.uid,
              userName: currentUser.name || currentUser.email.split('@')[0],
              photoURL: currentUser.photoURL || null,
            });
          } catch (error) {
            console.error("Error uploading audio:", error);
          } finally {
            setLoading(false);
            audioChunks.length = 0; // Clear the array for the next recording
          }
        };
        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
      <Typography variant="h4" gutterBottom align="center">
        Community Chat
      </Typography>
      
      <Paper elevation={3} sx={{ flex: 1, overflowY: 'auto', p: 2, mb: 2, borderRadius: 2 }}>
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={scrollRef}></div>
      </Paper>
      
      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', alignItems: 'center', p: '8px 16px', borderTop: '1px solid', borderColor: 'divider' }}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <IconButton component="span" onClick={() => fileInputRef.current.click()} disabled={loading || isRecording}>
          <AddPhotoAlternateIcon />
        </IconButton>

        <IconButton onClick={handleMicToggle} disabled={loading || (isRecording && newMessage !== '')}>
          {isRecording ? <StopIcon sx={{ color: 'red' }} /> : <MicIcon />}
        </IconButton>

        <TextField
          fullWidth
          variant="standard"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          InputProps={{ disableUnderline: true }}
          sx={{ ml: 1, mr: 1 }}
          disabled={isRecording}
        />
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <IconButton type="submit" color="primary" disabled={newMessage.trim() === ''}>
            <SendIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default Chat;