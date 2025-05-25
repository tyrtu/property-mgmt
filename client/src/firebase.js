// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAiDVXvvhDfm6aa47ixWDwb-mzWK8g7l3A",
    authDomain: "property-mgmt-98346.firebaseapp.com",
    projectId: "property-mgmt-98346",
    storageBucket: "property-mgmt-98346.appspot.com",
    messagingSenderId: "877885715642",
    appId: "1:877885715642:web:bb9638e49f286a24ea7e83",
    measurementId: "G-V6QRGGS9PX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
export { app };
