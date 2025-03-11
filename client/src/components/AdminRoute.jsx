// src/components/AdminRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';

const AdminRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (loading || isAdmin === null) return <div>Loading...</div>;

  return isAdmin ? children : <Navigate to="/unauthorized" />;
};

export default AdminRoute;
