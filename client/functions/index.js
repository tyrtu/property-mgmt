const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.sendRentReminder = functions.https.onRequest((req, res) => {
  // Wrap entire request in CORS middleware
  cors(req, res, async () => {
    try {
      // Handle preflight request
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Methods", "POST");
        return res.status(204).send();
      }

      // Validate request method
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
      }

      // Validate request body
      const { phoneNumber, message } = req.body;
      if (!phoneNumber || !message) {
        return res.status(400).json({ 
          error: "Missing required fields: phoneNumber and message" 
        });
      }

      // Validate phone number format
      if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
        return res.status(400).json({
          error: "Phone number must be in E.164 format (+12345678900)"
        });
      }

      // Get Twilio config
      const config = functions.config().twilio;
      if (!config?.sid || !config?.auth_token || !config?.phone) {
        throw new Error("Twilio credentials not configured");
      }

      // Send SMS
      const client = twilio(config.sid, config.auth_token);
      const response = await client.messages.create({
        body: message,
        from: config.phone,
        to: phoneNumber,
      });

      // Send success response
      res.json({ 
        success: true, 
        sid: response.sid,
        status: response.status 
      });

    } catch (error) {
      console.error("Error:", error);
      const statusCode = error.status === 400 ? 400 : 500;
      res.status(statusCode).json({
        error: error.message || "Internal server error",
        code: error.code,
        moreInfo: error.moreInfo
      });
    }
  });
});