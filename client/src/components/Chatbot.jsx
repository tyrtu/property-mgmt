import React, { useState } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "system", content: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "https://api.groq.com/openai/v1/chat/completions";
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY; // Ensure it's set in .env or Vercel

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const requestBody = {
        messages: newMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.choices?.[0]?.message?.content) {
        setMessages([...newMessages, { role: "assistant", content: data.choices[0].message.content }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "AI could not respond. Try again." }]);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages([...newMessages, { role: "assistant", content: "Error fetching response. Please try again." }]);
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
