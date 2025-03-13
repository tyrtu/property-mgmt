require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Function to get M-Pesa Access Token
const getAccessToken = async () => {
  const auth = Buffer.from(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`).toString("base64");
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { 
          Authorization: `Basic ${auth}`,
        },
        timeout: 10000, // Increased timeout
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Access Token Error:", error.response?.data || error.message);
    throw new Error("Failed to get access token");
  }
};

// Function to generate the password dynamically
const generatePassword = () => {
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(
    `${process.env.BUSINESS_SHORTCODE}${process.env.PASSKEY}${timestamp}`
  ).toString("base64");
  return { password, timestamp };
};

// STK Push endpoint
app.post("/stkpush", async (req, res) => {
  try {
    const { amount, phone, accountReference } = req.body;
    // Validate required fields
    if (!amount || !phone || !accountReference) {
      return res.status(400).json({ error: "Missing required fields: amount, phone, accountReference" });
    }
    
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const stkRequest = {
      BusinessShortCode: process.env.BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.BUSINESS_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: "SkillSwap Payment",
    };

    console.log("STK Request:", stkRequest);

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("Safaricom STK Push Response:", response.data);
    res.json(response.data);
  } catch (error) {
    const errorData = error.response?.data || { error: error.message };
    console.error("STK Push Error:", errorData);
    res.status(500).json({
      error: "Payment processing failed",
      details: errorData,
    });
  }
});

// Callback endpoint for M-Pesa to post the transaction results
app.post("/callback", (req, res) => {
  console.log("M-Pesa Callback Received:", req.body);
  res.status(200).send("Callback received");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));