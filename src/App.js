import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { theme } from './styles/theme';
import BottomNav from './components/layout/BottomNav';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Import all our page components
import Home from './pages/Home';
import ExploreMap from './pages/ExploreMap';
import AddItem from './pages/AddItem';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetails from './pages/ItemDetails';
import ClaimChat from './pages/ClaimChat';
import AdminDashboard from './pages/AdminDashboard';
import MyClaims from './pages/MyClaims';
import FoundItems from './pages/FoundItems';

const MainLayout = () => {
  const location = useLocation();
  const showNav = !['/login', '/register', '/admin'].includes(location.pathname);

  return (
    <>
      <Box sx={{ pb: showNav ? 7 : 0, p: { xs: 2, sm: 3 } }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<ExploreMap />} />
            {/* NEW ROUTE */}
            <Route path="/found-items" element={<FoundItems />} /> 
            <Route path="/add" element={<AddItem />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/item/:itemId" element={<ItemDetails />} />
            <Route path="/claim/:claimId" element={<ClaimChat />} />
            <Route path="/my-claims" element={<MyClaims />} />
          </Route>

          {/* Admin Route */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Box>
      {showNav && <BottomNav />}
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MainLayout />
      </Router>
    </ThemeProvider>
  );
};

export default App;