const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { getGeminiResponse } = require("./external-apis");

dotenv.config();
const app = express();

// --- THIS IS THE DEFINITIVE FIX ---
// This tells Express where to find ALL your static files (HTML, CSS, JS, images).
// '..' means the folder one level UP from where server.js is.
//const rootDirectory = path.join(__dirname, '..');
//app.use(express.static(rootDirectory));

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, "responses.json");
const { manualResponses, responseTemplates } = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
const { greeting, contextualResponses, fallbacks } = responseTemplates;

// This route ensures that when someone visits your website's root, they get the index.html page.
//app.get('/', (req, res) => {
  //  res.sendFile(path.join(rootDirectory, 'index.html'));
//});

// ... The rest of your code for the chatbot's brain remains unchanged ...

function formatGeminiReply(reply, userMessage) {
    if (!reply) return "🤖 Sorry, I had a moment of confusion. Could you rephrase that?";
    let friendly = reply.trim().replace(/\*/g, '');
    if (friendly.length > 350) {
        let cutoff = friendly.lastIndexOf('.', 350);
        if (cutoff !== -1) friendly = friendly.substring(0, cutoff + 1);
        else friendly = friendly.slice(0, 350) + "...";
    }
    return `✨ Here's what I found about your question on *"${userMessage}"*:\n\n${friendly}`;
}

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message?.trim();
    let userContext = req.body.context;
    if (!userMessage) return res.json({ reply: "🤖 Please enter a message." });

    const lowerMessage = userMessage.toLowerCase();

    const manualMatch = Object.keys(manualResponses).find(key => lowerMessage === key.toLowerCase());
    if (manualMatch) {
        return res.json({ reply: manualResponses[manualMatch], newContext: userContext });
    }

    if (greeting.triggers.includes(lowerMessage)) {
        return res.json({ reply: greeting.response, options: greeting.options, newContext: null });
    }

    if (!userContext) {
        if (lowerMessage === "i’m a job seeker") return res.json({ reply: contextualResponses.jobSeeker.welcome, newContext: "jobSeeker" });
        if (lowerMessage === "i’m an employer") return res.json({ reply: contextualResponses.employer.welcome, newContext: "employer" });
        if (lowerMessage === "learn more about services") return res.json({ reply: contextualResponses.general.welcome, newContext: "general" });
    }

    const businessKeywords = ['service', 'software', 'staffing', 'recruitment', 'company', 'vlookup', 'it', 'non-it', 'job', 'career', 'hiring', 'payroll', 'seo', 'ceo', 'development', 'integration', 'automation', 'app', 'talent', 'process'];
    const businessKeywordsRegex = new RegExp('\\b(' + businessKeywords.join('|') + ')\\b', 'i');
    const dynamicKeywords = ['explain', 'compare', 'difference', 'what if', 'how does', 'why is', 'what is'];
    
    if (dynamicKeywords.some(keyword => lowerMessage.startsWith(keyword)) && businessKeywordsRegex.test(lowerMessage)) {
        try {
            const dynamicReply = await getGeminiResponse(userMessage);
            if (dynamicReply) return res.json({ reply: formatGeminiReply(dynamicReply, userMessage), newContext: userContext });
            return res.json({ reply: fallbacks.apiError, newContext: userContext });
        } catch (err) {
            console.error("Gemini API error:", err);
            return res.json({ reply: fallbacks.apiError, newContext: userContext });
        }
    }

    let possibleMatches = [];
    const searchScopes = [];
    if (userContext && contextualResponses[userContext]) {
        searchScopes.push(contextualResponses[userContext].responses);
    }
    searchScopes.push(contextualResponses.general.responses);

    for (const scope of searchScopes) {
        for (const key in scope) {
            const template = scope[key];
            if (template.triggers && Array.isArray(template.triggers)) {
                for (const trigger of template.triggers) {
                    if (lowerMessage.includes(trigger.toLowerCase())) {
                        possibleMatches.push({ response: template.response, triggerLength: trigger.length });
                    }
                }
            }
        }
    }

    if (possibleMatches.length > 0) {
        possibleMatches.sort((a, b) => b.triggerLength - a.triggerLength);
        return res.json({ reply: possibleMatches[0].response, newContext: userContext });
    }
    
    if (dynamicKeywords.some(keyword => lowerMessage.startsWith(keyword))) {
        return res.json({ reply: fallbacks.global, newContext: userContext });
    }
    
    if (!userContext) return res.json({ reply: fallbacks.global, newContext: null });
    if (userContext === 'jobSeeker') return res.json({ reply: fallbacks.jobSeeker, newContext: userContext });
    if (userContext === 'employer') return res.json({ reply: fallbacks.employer, newContext: userContext });
    return res.json({ reply: fallbacks.global, newContext: userContext });
});
const PORT = process.env.PORT || 5000;
// Start listening on the port
app.get("/", (req, res) => {
  res.send("✅ Chatbot Backend is running!");
});
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("--> The terminal should now stay busy. If it quits, there is an error.");
});

// THIS IS THE CRUCIAL ADDITION: It catches startup errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ FATAL ERROR: Port ${PORT} is already in use by another program.`);
    console.error("This is why the server is stopping. Please restart your computer or stop the other process.\n");
  } else {
    console.error("❌ An unknown server error occurred:", err);
  }
  process.exit(1); // Exit with an error code
});