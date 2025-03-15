import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import twilio from "https://esm.sh/twilio@4.23.0"; // Use a specific version of Twilio

// Load environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

// Check if the envs are available
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase credentials are missing!");
}

// Initialize Supabase and Twilio clients
const supabase = createClient(supabaseUrl, supabaseKey);
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

// Serve the Edge Function
serve(async (req) => {
  try {
    // Query unpaid rent reminders
    const { data, error } = await supabase
      .from("rent_reminders")
      .select("*")
      .eq("is_paid", false)
      .lte("due_date", new Date().toISOString());

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    // Send SMS reminders
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
        console.error(`Failed to send SMS to ${reminder.phone_number}:`, twilioError);
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, remindersSent }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Return error response
    console.error("Error in function execution:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});