import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Link } from '@mui/material';
import { auth } from '../api/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
      navigate('/');
    } catch (error) {
      console.error("Error logging in:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Sign In</Typography>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth name="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="button" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleLogin}>
            Sign In
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link component="button" variant="body2" onClick={handleForgotPassword}>
              Forgot password?
            </Link>
            <Link component="button" variant="body2" onClick={() => navigate('/register')}>
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;