import React, { useState, useEffect, useRef } from "react";

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

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const newMessages = [...messages, { role: "user", content: trimmedInput }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const API_URL = "https://api.groq.com/openai/v1/chat/completions";
      const API_KEY = import.meta.env.VITE_GROQ_API_KEY; // Ensure this is set in your environment variables

      if (!API_KEY) {
        console.error("GROQ_API_KEY is missing!");
        setMessages([...newMessages, { role: "assistant", content: "API key missing!" }]);
        return;
      }

      const requestBody = {
        model: "qwen-qwq-32b", // Ensure the correct model
        messages: newMessages,
        temperature: 0.6,
        max_completion_tokens: 32768,
        top_p: 0.95,
        stream: true, // Enable streaming
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
          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.replace("data: ", ""));
              const delta = json.choices?.[0]?.delta?.content || "";

              assistantReply += delta;

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
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
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
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Chatbot;