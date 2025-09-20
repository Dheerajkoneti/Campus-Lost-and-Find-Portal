import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import AudioPlayer from 'react-audio-player';

const ChatMessage = ({ message }) => {
  const { currentUser } = useAuth();
  
  const isSentByCurrentUser = message.uid === currentUser.uid;

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: isSentByCurrentUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: isSentByCurrentUser ? 'row-reverse' : 'row' }}>
        <Avatar src={message.photoURL} sx={{ width: 40, height: 40, ml: isSentByCurrentUser ? 1 : 0, mr: isSentByCurrentUser ? 0 : 1 }} />
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: isSentByCurrentUser ? 'right' : 'left' }}>
            {message.userName}
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 4,
              bgcolor: isSentByCurrentUser ? 'primary.main' : 'background.paper',
              color: isSentByCurrentUser ? 'primary.contrastText' : 'text.primary',
              boxShadow: 1,
            }}
          >
            {message.text && (
              <Typography variant="body1">{message.text}</Typography>
            )}
            {message.imageUrl && (
              <img src={message.imageUrl} alt="chat-image" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '4px' }} />
            )}
            {message.audioUrl && (
              <audio controls>
                <source src={message.audioUrl} type="audio/mpeg" />
              </audio>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default ChatMessage;