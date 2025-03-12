import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase"; // Ensure this imports your Firebase config

const functions = getFunctions(app);
const sendRentReminder = httpsCallable(functions, "sendRentReminder");

export const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await sendRentReminder({ phoneNumber, message });
    console.log("SMS Sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending SMS:", error.message);
    throw error;
  }
};
