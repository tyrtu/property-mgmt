import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const PrivateRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth); // ✅ Get Firebase user

  if (loading) return <div>Loading...</div>; // ✅ Show loading while checking auth
  return user ? children : <Navigate to="/tenant/login" />; // ✅ Redirect if not logged in
};

export default PrivateRoute;
