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
    try {
        const { CONSUMER_KEY, CONSUMER_SECRET } = process.env;
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: { Authorization: `Basic ${auth}` },
        });

        return response.data.access_token;
    } catch (error) {
        console.error("Error getting access token:", error.response?.data || error.message);
        throw error;
    }
};

// Route to trigger STK Push
app.post("/stkpush", async (req, res) => {
    try {
        // Extract values from the request body, falling back to environment variables
        const { amount, phone, accountReference } = req.body;
        const { BUSINESS_SHORTCODE, PASSKEY, PHONE_NUMBER, CALLBACK_URL } = process.env;
        const phoneToUse = phone || PHONE_NUMBER;
        const reference = accountReference || "Test";
        const actualAmount = amount || "1";

        // Get access token
        const accessToken = await getAccessToken();

        // Create timestamp and password
        const timestamp = moment().format("YYYYMMDDHHmmss");
        const password = Buffer.from(`${BUSINESS_SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

        // Prepare STK Push request payload
        const stkRequest = {
            BusinessShortCode: BUSINESS_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: actualAmount.toString(),
            PartyA: phoneToUse,
            PartyB: BUSINESS_SHORTCODE,
            PhoneNumber: phoneToUse,
            CallBackURL: CALLBACK_URL,
            AccountReference: reference,
            TransactionDesc: "Test Payment",
        };

        // Log the request payload (for debugging)
        console.log("Sending STK Push request:", stkRequest);

        const mpesaResponse = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", stkRequest, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Safaricom Response:", mpesaResponse.data);
        res.json(mpesaResponse.data);
    } catch (error) {
        // Log the error details
        console.error("Error during STK Push:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
