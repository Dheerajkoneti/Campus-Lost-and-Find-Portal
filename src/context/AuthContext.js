import React, { useContext, useState, useEffect, createContext } from 'react';
import { auth, db } from '../api/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      const userData = userDocSnap.exists() ? userDocSnap.data() : {};

      // Add isAdmin property based on a specific email
      const isAdmin = user.email === 'admin@klu.ac.in';

      setCurrentUser({ ...user, ...userData, isAdmin });
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, fetchUserData);
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    refetchUser: () => fetchUserData(auth.currentUser),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}