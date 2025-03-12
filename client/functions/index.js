const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

// Initialize Firebase Admin
admin.initializeApp();

// Retrieve Twilio credentials from Firebase environment variables
const twilioSID = functions.config().twilio.sid;
const twilioAuthToken = functions.config().twilio.auth_token;
const twilioPhone = functions.config().twilio.phone;

// Initialize Twilio client
const client = new twilio(twilioSID, twilioAuthToken);

// Cloud Function to send SMS for rent due reminders
exports.sendRentReminder = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  try {
    // Fetch tenants from Firestore
    const tenantsSnapshot = await admin.firestore().collection("tenants").get();

    tenantsSnapshot.forEach(async (tenantDoc) => {
      const tenant = tenantDoc.data();
      const phoneNumber = tenant.phone; // Ensure this exists in Firestore

      if (phoneNumber) {
        await client.messages.create({
          body: `Reminder: Your rent is due soon. Please make your payment to avoid penalties.`,
          from: twilioPhone,
          to: phoneNumber,
        });

        console.log(`Reminder sent to ${phoneNumber}`);
      }
    });

    return null;
  } catch (error) {
    console.error("Error sending rent reminders:", error);
    return null;
  }
});
