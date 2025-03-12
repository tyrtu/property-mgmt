const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
require("dotenv").config(); // Load environment variables

// Initialize Firebase Admin
admin.initializeApp();

// Twilio Credentials from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = twilio(accountSid, authToken);

exports.sendRentReminder = functions.https.onCall(async (data, context) => {
  const { phoneNumber, message } = data;

  if (!phoneNumber || !message) {
    throw new functions.https.HttpsError("invalid-argument", "Phone number and message are required");
  }

  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    return { success: true, sid: response.sid };
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new functions.https.HttpsError("internal", "Failed to send SMS");
  }
});
