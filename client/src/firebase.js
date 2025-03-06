// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSy***************",  // Replace with your actual API key
  authDomain: "property-mgmt-98346.firebaseapp.com",
  projectId: "property-mgmt-98346",
  storageBucket: "property-mgmt-98346.appspot.com",
  messagingSenderId: "877885715642",
  appId: "1:877885715642:web:bb9638e49f286a24ea7e83",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export auth for authentication

export default app;
