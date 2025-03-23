import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

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

  // Handle user queries based on Firestore data
  const handleUserQuery = async (query) => {
    const tenantData = await getTenantData();
    if (!tenantData) return "Please log in to access your information.";

    const lowerQuery = query.toLowerCase();

    // Match queries to actual fields from registration
    if (lowerQuery.includes("name")) return `Your name: ${tenantData.name}`;
    if (lowerQuery.includes("email")) return `Registered email: ${tenantData.email}`;
    if (lowerQuery.includes("phone")) return `Contact number: ${tenantData.phone}`;
    if (lowerQuery.includes("unit")) return `Your unit ID: ${tenantData.unitId}`;
    if (lowerQuery.includes("property")) return `Your property ID: ${tenantData.propertyId}`;
    if (lowerQuery.includes("created") || lowerQuery.includes("registered"))
      return `Account created: ${new Date(tenantData.createdAt).toLocaleDateString()}`;

    return "I can help with: name, email, phone, unit, property, or account creation date.";
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