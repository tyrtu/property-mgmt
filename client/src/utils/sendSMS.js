import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase"; // ✅ Ensure `app` is correctly imported

const functions = getFunctions(app); // ✅ Uses the exported `app`
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
