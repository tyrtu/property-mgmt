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
        const accessToken = await getAccessToken();
        const { BUSINESS_SHORTCODE, PASSKEY, PHONE_NUMBER, CALLBACK_URL } = process.env;

        const timestamp = moment().format("YYYYMMDDHHmmss");
        const password = Buffer.from(`${BUSINESS_SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

        const stkRequest = {
            BusinessShortCode: BUSINESS_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: "1",
            PartyA: PHONE_NUMBER,
            PartyB: BUSINESS_SHORTCODE,
            PhoneNumber: PHONE_NUMBER,
            CallBackURL: CALLBACK_URL,
            AccountReference: "Test",
            TransactionDesc: "Test Payment",
        };

        const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", stkRequest, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
