const axios = require("axios");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callLLM(prompt) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured in .env");
  }

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.data.choices || !response.data.choices[0]) {
      throw new Error("Invalid API response: No choices returned");
    }

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  callLLM,
};
