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
    console.error("❌ FATAL ERROR: GEMINI_API_KEY is missing.");
}

// 1. Initialize SDK
const genAI = new GoogleGenerativeAI(apiKey);

// 2. Neutral System Instructions
const SYSTEM_BEHAVIOR = "You are SmartAI, a professional assistant. Provide clear, accurate, and concise responses. Always use Markdown for code snippets.";

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // FIX: In the v1 SDK, systemInstruction should be passed as an object 
        // with a 'parts' array inside the model constructor.
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: {
                parts: [{ text: SYSTEM_BEHAVIOR }]
            }
        }, { apiVersion: 'v1' }); 

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ Success: Message processed under Tier 1.`);
        res.json({ reply: text });
        
    } catch (error) {
        console.error("❌ AI Error Details:", error.message);
        res.status(500).json({ 
            error: "SmartAI recalibrating.", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartAI Live on Port ${PORT} - Production Mode`);
});