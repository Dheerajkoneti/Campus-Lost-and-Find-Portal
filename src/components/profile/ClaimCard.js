import React from 'react';
import { Paper, Typography, Box, Avatar, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const ClaimCard = ({ claim, currentUserId }) => {
  // Determine the user's role in this claim
  const userRole = claim.claimerId === currentUserId ? 'Claimer' : 'Finder';

  return (
    <Paper
      component={RouterLink}
      to={`/claim/${claim.id}`}
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
          backgroundColor: 'action.hover',
          cursor: 'pointer'
        }
      }}
    >
      <Avatar src={claim.itemImageUrl} variant="rounded" sx={{ width: 60, height: 60, mr: 2 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">{claim.itemTitle}</Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {claim.status.toUpperCase()}
        </Typography>
      </Box>
      <Chip label={`Your Role: ${userRole}`} size="small" />
    </Paper>
  );
};

export default ClaimCard;