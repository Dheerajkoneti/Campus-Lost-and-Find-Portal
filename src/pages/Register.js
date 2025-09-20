import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../api/firebase'; // Import auth and db
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions

const Register = () => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [section, setSection] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    // 1. Validate all fields are filled
    if (!name || !department || !section || !registerNumber || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // 2. Validate the campus email domain
    if (!email.endsWith('@klu.ac.in')) {
      alert("Please use your official campus email (@klu.ac.in).");
      return;
    }

    try {
      // 3. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 4. Save the additional user data to Firestore
      // We use the user's UID from Authentication as the document ID in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        department: department,
        section: section,
        registerNumber: registerNumber,
        email: email,
      });

      alert("Registration successful! You are now logged in.");
      navigate('/'); // Redirect to the home page

    } catch (error) {
      console.error("Error during registration:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Sign Up</Typography>
        <Box component="form" noValidate sx={{ mt: 3 }}>
          <TextField margin="normal" required fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Section" value={section} onChange={(e) => setSection(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Register Number" value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Campus Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="button" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleRegister}>
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;