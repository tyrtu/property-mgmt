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

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMessage = { role: "user", content: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const tenantData = await getTenantData();
      if (!tenantData) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Please log in to access your information." 
        }]);
        return;
      }

      // Add empty assistant message placeholder
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      if (!API_KEY) throw new Error("GROQ_API_KEY is missing!");

      // Construct detailed prompt with Firebase data
      const prompt = `
        You are a property management assistant. Use this tenant data to answer questions:
        - Name: ${tenantData.name}
        - Email: ${tenantData.email}
        - Phone: ${tenantData.phone}
        - Property ID: ${tenantData.propertyId}
        - Unit ID: ${tenantData.unitId}
        
        Current query: "${trimmedInput}"
        
        Respond concisely and hide all reasoning. Never show <think> tags.
      `;

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
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line === "data: [DONE]") break;

          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.replace("data: ", "").trim());
              const delta = json.choices?.[0]?.delta?.content || "";
              
              // Remove ALL <think> tags and their content
              const cleanedDelta = delta.replace(/<think>[\s\S]*?<\/think>/g, "");
              assistantReply += cleanedDelta;

              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { 
                  role: "assistant", 
                  content: assistantReply 
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
      setMessages(prev => [
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