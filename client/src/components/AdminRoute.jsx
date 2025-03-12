import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CircularProgress, Box, Typography } from '@mui/material';

const AdminRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        setError(err);
        setIsAdmin(false);
      }
    };

    fetchUserRole();
  }, [user]);

  // Show a loading spinner while the authentication and role check is in progress
  if (loading || isAdmin === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Display error message if there was an error fetching role
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          Error: Unable to verify admin status. Please try again later.
        </Typography>
      </Box>
    );
  }

  // Redirect to unauthorized if the user is not an admin
  if (!isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  // If the user is an admin, render the protected component
  return children;
};

export default AdminRoute;
