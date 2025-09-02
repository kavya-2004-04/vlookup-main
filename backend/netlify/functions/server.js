const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const serverless = require("serverless-http"); // <-- ADD THIS
const { getGeminiResponse } = require("./external-apis");

dotenv.config();
const app = express();

// --- Netlify uses a different path system, so we adjust it ---
const dataPath = path.resolve(__dirname, 'responses.json');

const { manualResponses, responseTemplates } = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
const { greeting, contextualResponses, fallbacks } = responseTemplates;

// We need a router to handle the path correctly in a serverless environment
const router = express.Router();

// Your entire /chat logic is now inside the router
router.post("/chat", async (req, res) => {
    // ... (Your entire app.post("/chat", ...) logic goes here, unchanged) ...
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

// Helper function from the original server.js
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

// --- Configure the app for Netlify ---
app.use(cors());
app.use(express.json());
app.use('/.netlify/functions/server', router); // <-- Connect the router

// --- Export the handler for Netlify ---
module.exports.handler = serverless(app);