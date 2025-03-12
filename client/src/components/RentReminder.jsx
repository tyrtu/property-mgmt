import React, { useState } from "react";
import { sendSMS } from "../utils/sendSMS";

const RentReminder = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSendSMS = async () => {
    setLoading(true);
    setSuccess(null);
    try {
      await sendSMS(phoneNumber, message);
      setSuccess("SMS sent successfully!");
    } catch (error) {
      setSuccess("Failed to send SMS.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Send Rent Reminder</h2>
      <input
        type="text"
        placeholder="Enter Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Reminder Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendSMS} disabled={loading}>
        {loading ? "Sending..." : "Send SMS"}
      </button>
      {success && <p>{success}</p>}
    </div>
  );
};

export default RentReminder;
