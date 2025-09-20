import React from 'react';
import { 
  Card, 
  CardHeader,
  CardMedia, 
  CardContent, 
  CardActions,
  Typography, 
  Avatar,
  Chip,
  IconButton,
  Box // <-- ADD THIS LINE
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { red } from '@mui/material/colors';
import { Link as RouterLink } from 'react-router-dom';

const ItemCard = ({ item, isProfilePage, onDelete, onEdit }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const userInitial = item.userName ? item.userName.charAt(0).toUpperCase() : '?';

  return (
    <Card 
      component={isProfilePage ? 'div' : RouterLink}
      to={!isProfilePage ? `/item/${item.id}` : ''}
      sx={{ 
        maxWidth: 550, 
        width: '100%', 
        mb: 4, 
        borderRadius: 3, 
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
        textDecoration: 'none',
        '&:hover': {
          transform: isProfilePage ? 'none' : 'translateY(-4px)',
          boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)',
        },
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="user-initial">
            {userInitial}
          </Avatar>
        }
        title={<Typography variant="subtitle1" fontWeight="bold">{item.userName}</Typography>}
        subheader={formatDate(item.timestamp)}
        action={isProfilePage && (
          <Box>
            <IconButton aria-label="edit" onClick={() => onEdit(item)}>
              <EditIcon />
            </IconButton>
            <IconButton aria-label="delete" onClick={() => onDelete(item.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      />
      <CardMedia
        component="img"
        height="400"
        image={item.imageUrl}
        alt={item.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            {item.title}
          </Typography>
          <Chip 
            label={item.itemType ? (item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)) : 'Unknown'} 
            color={item.itemType === 'lost' ? 'error' : 'success'}
          />
        </div>
        <Typography variant="body2" color="text.secondary">
          <strong>Category:</strong> {item.category}
        </Typography>
      </CardContent>
    </Card>
  );
};
export default ItemCard;