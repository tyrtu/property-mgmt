import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import twilio from "https://esm.sh/twilio";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

const supabase = createClient(supabaseUrl, supabaseKey);
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

serve(async (req) => {
  // Query unpaid rent reminders
  const { data, error } = await supabase
    .from("rent_reminders")
    .select("*")
    .eq("is_paid", false)
    .lte("due_date", new Date().toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  // Send SMS reminders
  for (const reminder of data) {
    await twilioClient.messages.create({
      body: `Hi ${reminder.tenant_name}, your rent of $${reminder.rent_amount} is due today. Please make the payment.`,
      from: twilioPhoneNumber,
      to: reminder.phone_number,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});