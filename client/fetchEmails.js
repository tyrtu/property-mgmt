import admin from "firebase-admin";
import { createRequire } from "module";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccount.json");

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Function to fetch tenant emails
const fetchTenantEmails = async () => {
  try {
    const snapshot = await db.collection("users").where("role", "==", "tenant").get();

    if (snapshot.empty) {
      console.log("No tenants found.");
      return [];
    }

    const emails = snapshot.docs.map((doc) => doc.data().email);
    console.log("Tenant Emails:", emails);
    return emails;
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
};

// Run the function **only if the script is executed directly**
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchTenantEmails();
}

// Export the function for reusability in other files
export { fetchTenantEmails };
