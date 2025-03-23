import axios from "axios";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = "GROQ_API_KEY"; // Store this securely, e.g., in an environment variable

export const fetchGroqResponse = async (messages) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "qwen-qwq-32b",
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
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching Groq response:", error);
    return "Error fetching response. Please try again.";
  }
};
