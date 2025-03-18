import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.9.0/index.ts";

console.log("🚀 Email function is running...");

// 🔥 Firebase Service Account Credentials (Set these in Supabase Secrets)
const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID");
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL");
const FIREBASE_PRIVATE_KEY = Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"); // Ensure proper formatting

// 📧 EmailJS Credentials (Set these in Supabase Secrets)
const EMAILJS_USER_ID = Deno.env.get("EMAILJS_USER_ID");
const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID");
const EMAILJS_TEMPLATE_ID = Deno.env.get("EMAILJS_TEMPLATE_ID");

// 🔐 Function to Get Access Token for Firestore
async function getAccessToken(): Promise<string> {
  const authUrl = "https://oauth2.googleapis.com/token";

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: FIREBASE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: authUrl,
    exp: now + 3600,
    iat: now,
  };

  const key = await jose.importPKCS8(FIREBASE_PRIVATE_KEY, "RS256");
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .sign(key);

  const response = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Auth Error: ${data.error}`);
  return data.access_token;
}

// 📂 Fetch Tenant Emails from Firestore
async function fetchTenantEmails(): Promise<string[]> {
  const accessToken = await getAccessToken();
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users`;

  const response = await fetch(firestoreUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Firestore Error: ${JSON.stringify(data)}`);

  // Extract email addresses
  const emails = data.documents?.map((doc: any) => doc.fields?.email?.stringValue).filter(Boolean);
  if (!emails.length) throw new Error("No emails found in Firestore.");
  return emails;
}

// 📧 Send Email Using EmailJS
async function sendEmail(to_email: string): Promise<void> {
  const emailData = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_USER_ID,
    template_params: {
      title: "Reminder",
      name: "RentHive",
      time: new Date().toLocaleString(),
      message: "Your rent is due soon. Please make payment to avoid penalties.",
      to_email,
    },
  };

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    throw new Error(`EmailJS Error: ${await response.text()}`);
  }
}

// 🚀 Serve Function
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    console.log("📩 Fetching tenant emails...");
    const emails = await fetchTenantEmails();

    console.log("📨 Sending emails in parallel...");
    await Promise.all(emails.map(sendEmail));

    return new Response(JSON.stringify({ message: "✅ Emails sent successfully!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
