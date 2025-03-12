import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CircularProgress, Box } from '@mui/material'; // Import Material-UI components for loading spinner

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
  }, [user]); // Only re-run when `user` changes

  // Show a loading spinner while fetching data
  if (loading || isAdmin === null) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Handle Firestore errors
  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h6" color="error">
          Error: Unable to verify admin status. Please try again later.
        </Typography>
      </Box>
    );
  }

  // Redirect if not an admin
  if (!isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  // Render the protected component if the user is an admin
  return children;
};

export default AdminRoute;