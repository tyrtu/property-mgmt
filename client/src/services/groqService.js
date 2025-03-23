import axios from "axios";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY; // Use process.env directly

export const fetchGroqResponse = async (messages) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "mixtral-8x7b-32768", // Ensure model consistency
        messages: messages,
        temperature: 0.6,
        max_completion_tokens: 1000,
        top_p: 0.95,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return response.data.choices?.[0]?.message?.content || "No response from AI.";
  } catch (error) {
    console.error("Error fetching Groq response:", error);
    return "Error fetching response. Please try again.";
  }
};
