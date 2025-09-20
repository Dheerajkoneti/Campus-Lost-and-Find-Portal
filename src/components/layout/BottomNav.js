import React, { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search'; // <-- NEW IMPORT
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState('/');

  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    navigate(newValue);
    setValue(newValue);
  };

  return (
    <Paper 
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} 
      elevation={3}
    >
      <BottomNavigation value={value} onChange={handleChange}>
        <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="Map" value="/map" icon={<MapIcon />} />
        <BottomNavigationAction label="Found" value="/found-items" icon={<SearchIcon />} />
        <BottomNavigationAction label="Add" value="/add" icon={<AddCircleIcon sx={{ fontSize: 40 }} />} />
        <BottomNavigationAction label="Chat" value="/chat" icon={<ChatIcon />} />
        <BottomNavigationAction label="Profile" value="/profile" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </Paper>
  );
};
export default BottomNav;