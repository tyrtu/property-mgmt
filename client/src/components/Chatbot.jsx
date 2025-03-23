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
      const tenantRef = doc(db, "users", userId);
      const tenantSnap = await getDoc(tenantRef);
      const tenantData = tenantSnap.exists() ? tenantSnap.data() : null;

      if (!tenantData) return null;

      const propertyRef = doc(db, "properties", tenantData.propertyId);
      const propertySnap = await getDoc(propertyRef);
      const propertyData = propertySnap.exists() ? propertySnap.data() : null;

      const notificationsRef = collection(db, "notifications");
      const notificationsQuery = query(notificationsRef, where("userId", "==", userId));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notifications = notificationsSnapshot.docs.map((doc) => doc.data());

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

  // Fetch AI response from Groq (streaming)
  const fetchAIResponse = async (chatHistory) => {
    try {
      const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      if (!API_KEY) throw new Error("GROQ_API_KEY is missing!");

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen-qwq-32b",
          messages: chatHistory,
          temperature: 0.6,
          max_completion_tokens: 32768,
          top_p: 0.95,
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
              let delta = json.choices?.[0]?.delta?.content || "";

              // Completely remove any "<think>...</think>" segments
              delta = delta.replace(/<think>.*?<\/think>/gs, "").trim();

              assistantReply += delta;

              setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: assistantReply }]);
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

  // Send message handler
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMessage = { role: "user", content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const firestoreData = await fetchFirestoreData(auth.currentUser.uid);
      if (!firestoreData) return "Please log in to access your information.";

      const reply = await fetchAIResponse([...messages, userMessage]);
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
    <div style={styles.container}>
      <div style={styles.chatWindow}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              background: msg.role === "user" ? "#dcf8c6" : "#e0e0e0",
              textAlign: msg.role === "user" ? "right" : "left",
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div style={styles.loader}></div>}
        <div ref={messagesEndRef} />
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            ...styles.sendButton,
            background: loading ? "#ccc" : "#007bff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>
      </div>
      <style>{styles.keyframes}</style>
    </div>
  );
};

const styles = {
  container: { width: "400px", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" },
  chatWindow: { height: "300px", overflowY: "auto", padding: "10px", background: "#f9f9f9" },
  message: { padding: "5px", marginBottom: "5px", borderRadius: "5px" },
  loader: {
    textAlign: "center",
    margin: "10px 0",
    display: "inline-block",
    width: "20px",
    height: "20px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  inputContainer: { display: "flex", marginTop: "10px" },
  input: { flex: 1, padding: "8px", borderRadius: "3px", border: "1px solid #ccc" },
  sendButton: { marginLeft: "5px", padding: "8px", color: "white", border: "none", borderRadius: "3px" },
  keyframes: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`,
};

export default Chatbot;
