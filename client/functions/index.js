// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
const cors = require("cors")({ origin: true }); // Import and configure CORS

// Initialize Firebase Admin
admin.initializeApp();

// Retrieve Twilio credentials from Firebase environment variables
const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.auth_token;
const twilioPhoneNumber = functions.config().twilio.phone;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Cloud Function to send SMS for rent reminders, with CORS support
exports.sendRentReminder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Allow only POST requests
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // Extract phoneNumber and message from the request body
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: "Phone number and message are required" });
    }

    try {
      // Send SMS via Twilio
      const response = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });

      return res.status(200).json({ success: true, sid: response.sid });
    } catch (error) {
      console.error("Error sending SMS:", error);
      return res.status(500).json({ error: "Failed to send SMS" });
    }
  });
});
