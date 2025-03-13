// backend/server.js
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

// Environment variables from your provided credentials
process.env.CONSUMER_KEY = "RpCNhQBahGYcGmM1zv3ad1YX233NdvCNMAYXlty88QyNbVcm";
process.env.CONSUMER_SECRET = "AjxAq8hqU0Vc1WKFynZrGvRDRrgsmXYHLD4bJEHEaxcJXRBOKNMjF50MpUOLw71h";
process.env.BUSINESS_SHORTCODE = "174379";
process.env.PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78";
process.env.CALLBACK_URL = "https://1605-102-0-11-254.ngrok-free.app/callback";

const getAccessToken = async () => {
  const auth = Buffer.from(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`).toString("base64");
  
  try {
    const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 5000
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Access Token Error:", error.response?.data || error.message);
    throw new Error("Failed to get access token");
  }
};

app.post("/stkpush", async (req, res) => {
  try {
    const { amount, phone } = req.body;
    const accessToken = await getAccessToken();
    const timestamp = moment().format("YYYYMMDDHHmmss");
    
    const password = Buffer.from(
      `${process.env.BUSINESS_SHORTCODE}${process.env.PASSKEY}${timestamp}`
    ).toString("base64");

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
      AccountReference: req.body.accountReference,
      TransactionDesc: "SkillSwap Payment"
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    res.json(response.data);
  } catch (error) {
    const errorData = error.response?.data || { error: error.message };
    console.error("STK Push Error:", errorData);
    res.status(500).json({
      error: "Payment processing failed",
      details: errorData
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));