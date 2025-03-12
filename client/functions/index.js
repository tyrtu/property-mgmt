const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
const cors = require("cors")({ origin: true }); // CORS middleware

// Initialize Firebase Admin
admin.initializeApp();

// Retrieve Twilio credentials from Firebase environment variables
const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.auth_token;
const twilioPhoneNumber = functions.config().twilio.phone;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

exports.sendRentReminder = functions.https.onRequest((req, res) => {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  // Use CORS middleware for the rest of the requests
  cors(req, res, async () => {
    // Allow only POST requests
    if (req.method !== "POST") {
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(405).send("Method Not Allowed");
    }

    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(400).json({ error: "Phone number and message are required" });
    }

    try {
      const response = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(200).json({ success: true, sid: response.sid });
    } catch (error) {
      console.error("Error sending SMS:", error);
      res.set("Access-Control-Allow-Origin", "*");
      return res.status(500).json({ error: "Failed to send SMS" });
    }
  });
});
