const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getGeminiResponse(userMessage) {
  try {
    const engineeredPrompt = `
      You are a professional assistant for a company named VlookUp Global.
      Answer the following user question concisely and professionally, in about 2-3 complete sentences.
      Do not use bullet points or any special formatting.
      
      User question: "${userMessage}"
    `;

    // --- FINAL FIX ---
    // Using the 'v1beta' endpoint with the correct and available 'gemini-1.5-flash' model.
    // This resolves the "404 Not Found" error.
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: engineeredPrompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      let reply = data.candidates[0].content.parts[0].text;
      return reply;
    } else {
      // This will catch errors returned in the JSON body, like the 404
      console.error("API Error Response:", data.error ? data.error.message : "No candidates returned.");
      return "🤖 I'm sorry, I am not able to answer that question at the moment.";
    }

  } catch (error) {
    console.error("❌ Network or Fetch API error:", error);
    return "🤖 I’m having trouble connecting to my AI service right now.";
  }
}

module.exports = { getGeminiResponse };