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

  if (loading || isAdmin === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/tenant/login" replace />;
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          Error: Unable to verify admin status. Please try again later.
        </Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/tenant/login" replace />;
  }

  return children;
};

export default AdminRoute;
