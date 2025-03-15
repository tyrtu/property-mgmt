import express from "express";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

// Get env variables (Supabase provides these automatically)
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if the envs are available
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase credentials are missing!");
}

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseKey);
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

// Create Express app
const app = express();
app.use(express.json());

app.post("/send-rent-reminders", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("rent_reminders")
      .select("*")
      .eq("is_paid", false)
      .lte("due_date", new Date().toISOString());

    if (error) throw new Error(`Supabase query error: ${error.message}`);

    let remindersSent = 0;
    for (const reminder of data) {
      try {
        await twilioClient.messages.create({
          body: `Hi ${reminder.tenant_name}, your rent of $${reminder.rent_amount} is due today. Please make the payment.`,
          from: twilioPhoneNumber,
          to: reminder.phone_number,
        });
        remindersSent++;
        console.log(`SMS sent to ${reminder.phone_number}`);
      } catch (twilioError) {
        console.error(`Failed to send SMS:`, twilioError);
      }
    }

    res.json({ success: true, remindersSent });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
