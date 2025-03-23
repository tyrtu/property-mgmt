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

  // Fetch tenant data based on logged-in user
  const getTenantData = async () => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error fetching tenant data:", error);
      return null;
    }
  };

  // Fetch property name by propertyId
  const getPropertyName = async (propertyId) => {
    try {
      const propertyRef = doc(db, "properties", propertyId);
      const propertySnap = await getDoc(propertyRef);
      return propertySnap.exists() ? propertySnap.data().name : "Unknown";
    } catch (error) {
      console.error("Error fetching property name:", error);
      return "Unknown";
    }
  };

  // Fetch unit number by propertyId and unitId
  const getUnitNumber = async (propertyId, unitId) => {
    try {
      const unitRef = doc(db, "properties", propertyId, "units", unitId);
      const unitSnap = await getDoc(unitRef);
      return unitSnap.exists() ? unitSnap.data().number : "Unknown";
    } catch (error) {
      console.error("Error fetching unit number:", error);
      return "Unknown";
    }
  };

  // Fetch notifications for the logged-in user
  const getNotifications = async (userId) => {
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  };

  // Fetch maintenance requests for the logged-in user
  const getMaintenanceRequests = async (userId) => {
    try {
      const maintenanceRef = collection(db, "maintenanceRequests");
      const q = query(maintenanceRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      return [];
    }
  };

  // Fetch property amenities by propertyId
  const getPropertyAmenities = async (propertyId) => {
    try {
      const propertyRef = doc(db, "properties", propertyId);
      const propertySnap = await getDoc(propertyRef);
      return propertySnap.exists() ? propertySnap.data().amenities : [];
    } catch (error) {
      console.error("Error fetching property amenities:", error);
      return [];
    }
  };

  // Handle user queries dynamically
  const handleUserQuery = async (queryText) => {
    const tenantData = await getTenantData();
    if (!tenantData) return "Please log in to access your information.";

    const lowerQuery = queryText.toLowerCase();

    // Fetch property name
    if (lowerQuery.includes("property") && lowerQuery.includes("name")) {
      const propertyName = await getPropertyName(tenantData.propertyId);
      return `Your property name: ${propertyName}`;
    }

    // Fetch unit number
    if (lowerQuery.includes("unit") && (lowerQuery.includes("number") || lowerQuery.includes("id"))) {
      const unitNumber = await getUnitNumber(tenantData.propertyId, tenantData.unitId);
      return `Your unit number: ${unitNumber}`;
    }

    // Fetch notifications
    if (lowerQuery.includes("notification") || lowerQuery.includes("alert")) {
      const notifications = await getNotifications(tenantData.uid);
      if (notifications.length === 0) return "You have no notifications.";
      return `Your notifications:\n${notifications
        .map((notif) => `- ${notif.message} (${new Date(notif.createdAt).toLocaleString()})`)
        .join("\n")}`;
    }

    // Fetch maintenance requests
    if (lowerQuery.includes("maintenance") || lowerQuery.includes("request")) {
      const requests = await getMaintenanceRequests(tenantData.uid);
      if (requests.length === 0) return "You have no maintenance requests.";
      return `Your maintenance requests:\n${requests
        .map((req) => `- ${req.issue} (Status: ${req.status})`)
        .join("\n")}`;
    }

    // Fetch property amenities
    if (lowerQuery.includes("amenities") || lowerQuery.includes("facilities")) {
      const amenities = await getPropertyAmenities(tenantData.propertyId);
      if (amenities.length === 0) return "Your property has no amenities listed.";
      return `Your property amenities:\n- ${amenities.join("\n- ")}`;
    }

    // Default response for unrecognized queries
    return "I can help with: property name, unit number, notifications, maintenance requests, or property amenities.";
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
      let reply = await handleUserQuery(trimmedInput); // Fetch tenant data first
      if (!reply) {
        reply = await fetchAIResponse([...messages, userMessage]); // Fallback to AI
      }

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

  // Fetch AI response (streaming)
  const fetchAIResponse = async (newMessages) => {
    try {
      const API_URL = "https://api.groq.com/openai/v1/chat/completions";
      const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

      if (!API_KEY) {
        console.error("GROQ_API_KEY is missing!");
        return "API key missing!";
      }

      const requestBody = {
        model: "qwen-qwq-32b",
        messages: newMessages,
        temperature: 0.6,
        max_completion_tokens: 32768,
        top_p: 0.95,
        stream: true,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.body) throw new Error("Response body is empty");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line === "data: [DONE]") break;

          if (line.startsWith("data:")) {
            try {
              const jsonString = line.replace("data: ", "").trim();
              if (!jsonString) continue;

              const json = JSON.parse(jsonString);
              const delta = json.choices?.[0]?.delta?.content || "";
              const filteredDelta = delta.replace(/<think>.*?<\/think>/g, ""); // Remove <think> tags

              assistantReply += filteredDelta;

              setMessages((prevMessages) => [
                ...prevMessages.slice(0, -1),
                { role: "assistant", content: assistantReply },
              ]);
            } catch (error) {
              console.error("Error parsing stream chunk:", error);
            }
          }
        }
      }
      return assistantReply;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Sorry, something went wrong. Please try again.";
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