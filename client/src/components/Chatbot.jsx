import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "system", content: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch all relevant Firestore data for the logged-in user
  const fetchFirestoreData = async (userId) => {
    try {
      // Fetch tenant data
      const tenantRef = doc(db, "users", userId);
      const tenantSnap = await getDoc(tenantRef);
      const tenantData = tenantSnap.exists() ? tenantSnap.data() : null;

      if (!tenantData) return null;

      // Fetch property data
      const propertyRef = doc(db, "properties", tenantData.propertyId);
      const propertySnap = await getDoc(propertyRef);
      const propertyData = propertySnap.exists() ? propertySnap.data() : null;

      // Fetch notifications
      const notificationsRef = collection(db, "notifications");
      const notificationsQuery = query(notificationsRef, where("userId", "==", userId));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notifications = notificationsSnapshot.docs.map((doc) => doc.data());

      // Fetch maintenance requests
      const maintenanceRef = collection(db, "maintenanceRequests");
      const maintenanceQuery = query(maintenanceRef, where("userId", "==", userId));
      const maintenanceSnapshot = await getDocs(maintenanceQuery);
      const maintenanceRequests = maintenanceSnapshot.docs.map((doc) => doc.data());

      return {
        tenantData,
        propertyData,
        notifications,
        maintenanceRequests,
      };
    } catch (error) {
      console.error("Error fetching Firestore data:", error);
      return null;
    }
  };

  // Construct a dynamic prompt for Groq
  const constructPrompt = (query, firestoreData) => {
    const { tenantData, propertyData, notifications, maintenanceRequests } = firestoreData;

    return `
      You are a helpful assistant for a property management system. Below is the user's query and relevant data from Firestore. Generate a precise response based on the data.

      User Query: "${query}"

      Firestore Data:
      - Tenant Name: ${tenantData.name}
      - Tenant Email: ${tenantData.email}
      - Tenant Phone: ${tenantData.phone}
      - Property Name: ${propertyData.name}
      - Property Address: ${propertyData.address}
      - Unit Number: ${tenantData.unitId}
      - Notifications: ${notifications.map((n) => n.message).join(", ")}
      - Maintenance Requests: ${maintenanceRequests.map((r) => r.issue).join(", ")}

      Instructions:
      1. If the user asks about their property, respond with the property name and address.
      2. If the user asks about their unit, respond with the unit number.
      3. If the user asks about notifications, list their recent notifications.
      4. If the user asks about maintenance requests, provide the status of their requests.
      5. If the query is unclear, ask for clarification.
    `;
  };

  // Fetch AI response from Groq
  const fetchAIResponse = async (query, userId) => {
    try {
      const firestoreData = await fetchFirestoreData(userId);
      if (!firestoreData) return "Please log in to access your information.";

      const prompt = constructPrompt(query, firestoreData);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen-qwq-32b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Sorry, something went wrong. Please try again.";
    }
  };

  // Send message handler
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMessage = { role: "user", content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const reply = await fetchAIResponse(trimmedInput, auth.currentUser.uid);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "400px", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
      <div style={{ height: "300px", overflowY: "auto", padding: "10px", background: "#f9f9f9" }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              padding: "5px",
              marginBottom: "5px",
              background: msg.role === "user" ? "#dcf8c6" : "#e0e0e0",
              borderRadius: "5px",
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: "center", margin: "10px 0" }}>
            <div
              style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid #007bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "8px", borderRadius: "3px", border: "1px solid #ccc" }}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            marginLeft: "5px",
            padding: "8px",
            background: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>
      </div>
      <style>
        {
          `@keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`
        }
      </style>
    </div>
  );
};

export default Chatbot;