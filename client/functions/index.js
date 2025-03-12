const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
const cors = require("cors")({ origin: true }); // Enable CORS for all origins

admin.initializeApp();

exports.sendRentReminder = functions.https.onRequest((req, res) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "https://property-mgmt-six.vercel.app");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  // Use CORS middleware for the actual request
  cors(req, res, async () => {
    try {
      // Validate request method
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
      }

      // Validate request body
      const { phoneNumber, message } = req.body;
      if (!phoneNumber || !message) {
        return res.status(400).json({ error: "Phone number and message are required" });
      }

      // Retrieve Twilio credentials
      const accountSid = functions.config().twilio.sid;
      const authToken = functions.config().twilio.auth_token;
      const twilioPhoneNumber = functions.config().twilio.phone;

      // Initialize Twilio client
      const client = twilio(accountSid, authToken);

      // Send SMS
      const response = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });

      // Success response
      res.set("Access-Control-Allow-Origin", "https://property-mgmt-six.vercel.app");
      return res.status(200).json({ success: true, sid: response.sid });
    } catch (error) {
      console.error("Error sending SMS:", error);
      res.set("Access-Control-Allow-Origin", "https://property-mgmt-six.vercel.app");
      return res.status(500).json({ error: "Failed to send SMS", details: error.message });
    }
  });
});