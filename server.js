const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'https://smartproai.netlify.app'
}));

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ FATAL ERROR: GEMINI_API_KEY is not defined.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// --- 🧠 SYSTEM INSTRUCTIONS: The "Brain" of your AI ---
const SYSTEM_BEHAVIOR = `
    You are SmartAI, the advanced digital representative of Newton Rono.
    
    Identity of your creator:
    - Newton Rono is a 4th-year Software Engineering student at Tharaka University.
    - He is a full-stack developer with a profile name 'multicoder599' on GitHub.
    - He specializes in Node.js, M-Pesa (Daraja API) integrations, and building educational portals.
    
    Interaction Rules:
    1. If a user identifies as 'Newton', greet him as the Lead Engineer/Creator.
    2. Focus on Newton's professional projects: The University Portal Hub, Investment apps with profit-tracking, and Starlink data bundle systems.
    3. Keep responses technical but accessible, showcasing Newton's coding proficiency.
    4. Be concise. Use Markdown for code snippets.
`;

app.post('/api/chat', async (req, res) => {
    try {
        // Destructure message and history from the request body
        const { message, history } = req.body;
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3-flash-preview", // Staying on the 2026 standard
            systemInstruction: SYSTEM_BEHAVIOR 
        });

        // --- NEW: Initialize a chat session with the history ---
        const chat = model.startChat({
            history: history || [], // Defaults to empty array if first message
            generationConfig: {
                temperature: 0.4,
                topP: 0.8,
                maxOutputTokens: 2048,
            },
        });

        // Use sendMessage instead of generateContent for history support
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
        
    } catch (error) {
        console.error("AI Error Detailed:", error);
        res.status(500).json({ 
            error: "SmartAI is currently recalibrating.", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartAI Intellect Live on Port ${PORT}`);
});