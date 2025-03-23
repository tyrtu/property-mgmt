import React, { useState } from "react";
import { fetchGroqResponse } from "../services/groqService"; // Import service
import Navigation from "./Navigation";
const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "system", content: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetchGroqResponse(newMessages);
      setMessages([...newMessages, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Error fetching response." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "400px", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
      <div style={{ height: "300px", overflowY: "auto", padding: "10px", background: "#f9f9f9" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ 
            textAlign: msg.role === "user" ? "right" : "left", 
            padding: "5px", 
            marginBottom: "5px",
            background: msg.role === "user" ? "#dcf8c6" : "#e0e0e0",
            borderRadius: "5px"
          }}>
            {msg.content}
          </div>
        ))}
        {loading && <div style={{ fontStyle: "italic" }}>Thinking...</div>}
      </div>
      <div style={{ display: "flex", marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "8px", borderRadius: "3px", border: "1px solid #ccc" }}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading} 
          style={{ 
            marginLeft: "5px", 
            padding: "8px", 
            background: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "3px",
            cursor: "pointer"
          }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
