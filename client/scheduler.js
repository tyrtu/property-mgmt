import cron from "node-cron";
import { fetchTenantEmails } from "./fetchEmails.js";
import { sendEmail } from "./sendEmail.js";

// Function to send reminder emails
const sendReminders = async () => {
  try {
    // Fetch tenant emails from Firebase
    const emails = await fetchTenantEmails();
    if (!emails || emails.length === 0) {
      console.log("No tenant emails found.");
      return;
    }

    // Send an email to each tenant
    for (const email of emails) {
      await sendEmail(
        email,
        "Monthly Rent Reminder",
        "Hello, this is a reminder that your rent is due this month. Please make sure to complete your payment."
      );
      console.log(`Reminder email sent to ${email}`);
    }
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
};

// Schedule the sendReminders function to run at 9:00 AM on the 1st of every month
cron.schedule("0 9 1 * *", sendReminders);

console.log("Email reminder scheduler is running...");
