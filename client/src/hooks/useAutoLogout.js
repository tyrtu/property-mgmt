// src/hooks/useAutoLogout.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const useAutoLogout = (inactivityTime = 1 * 60 * 1000) => { // Default: 15 minutes
  const navigate = useNavigate();

  useEffect(() => {
    let inactivityTimer;

    // Function to reset the inactivity timer
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logoutUser, inactivityTime);
    };

    // Function to log out the user
    const logoutUser = async () => {
      try {
        await signOut(auth); // Sign out the user
        localStorage.removeItem('tenantToken'); // Clear tenant token
        navigate('/tenant/login'); // Redirect to login page
      } catch (error) {
        console.error('Auto-logout failed:', error);
      }
    };

    // Add event listeners for user activity
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Initialize the timer
    resetTimer();

    // Cleanup event listeners and timer
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [inactivityTime, navigate]);
};

export default useAutoLogout;