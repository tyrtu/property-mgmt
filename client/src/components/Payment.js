import { useState } from "react";
import axios from "axios";

const Payment = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handlePayment = async () => {
        setLoading(true);
        setMessage("");

        try {
            const response = await axios.post("http://localhost:5000/stkpush");
            setMessage("STK Push Sent! Check your phone.");
        } catch (error) {
            setMessage("Payment failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Make a Payment</h2>
            <button onClick={handlePayment} disabled={loading}>
                {loading ? "Processing..." : "Pay Now"}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Payment;
