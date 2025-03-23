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

      // Fetch units under the property
      const unitsRef = collection(db, "properties", tenantData.propertyId, "units");
      const unitsSnapshot = await getDocs(unitsRef);
      const units = unitsSnapshot.docs.map((doc) => doc.data());

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
        units,
        notifications,
        maintenanceRequests,
      };
    } catch (error) {
      console.error("Error fetching Firestore data:", error);
      return null;
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
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Please log in to access your information." },
        ]);
        return;
      }

      // Fetch Firestore data
      const firestoreData = await fetchFirestoreData(userId);
      if (!firestoreData) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Failed to fetch your data. Please try again." },
        ]);
        return;
      }

      // Construct dynamic prompt with Firestore data
      const prompt = `
        You are a helpful assistant for a property management system. Below is the user's query and relevant data from Firestore. Generate a precise response based on the data.

        User Query: "${trimmedInput}"

        Firestore Data:
        - Tenant Name: ${firestoreData.tenantData.name}
        - Tenant Email: ${firestoreData.tenantData.email}
        - Tenant Phone: ${firestoreData.tenantData.phone}
        - Property Name: ${firestoreData.propertyData.name}
        - Property Address: ${firestoreData.propertyData.address}
        - Unit Number: ${firestoreData.tenantData.unitId}
        - Units: ${firestoreData.units.map((unit) => unit.number).join(", ")}
        - Notifications: ${firestoreData.notifications.map((n) => n.message).join(", ")}
        - Maintenance Requests: ${firestoreData.maintenanceRequests.map((r) => r.issue).join(", ")}

        Instructions:
        1. Respond only to the specific query. Do not list all data unless asked.
        2. If the user asks about their property, respond with the property name and address.
        3. If the user asks about their unit, respond with the unit number.
        4. If the user asks about units, list all available units.
        5. If the user asks about notifications, list their recent notifications.
        6. If the user asks about maintenance requests, provide the status of their requests.
        7. If the query is unclear, ask for clarification.
        8. **Never include <think> tags or internal reasoning in the response.**
      `;

      const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      if (!API_KEY) throw new Error("GROQ_API_KEY is missing!");

      // Add empty assistant message placeholder
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen-qwq-32b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          stream: true,
        }),
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
              const json = JSON.parse(line.replace("data: ", "").trim());
              const delta = json.choices?.[0]?.delta?.content || "";

              // Remove <think> tags before adding to response
              const cleanedDelta = delta.replace(/<think>[\s\S]*?<\/think>/g, "");
              assistantReply += cleanedDelta;

              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantReply,
                };
                return newMessages;
              });
            } catch (error) {
              console.error("Error parsing stream chunk:", error);
            }
          }
        }
      }
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
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
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