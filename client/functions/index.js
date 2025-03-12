const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

// Initialize Firebase Admin
admin.initializeApp();

// Twilio Credentials
const accountSid = "AC174ddd0f5007a76a18cdfdb708cdb965";
const authToken = "ee46d1ca53aad11d3dab50cf616f8b20";
const twilioClient = twilio(accountSid, authToken);
const twilioPhoneNumber = "+12603688590"; // Twilio number

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
