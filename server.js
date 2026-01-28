const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'https://smartproai.netlify.app' }));
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_BEHAVIOR = "You are SmartAI, a professional assistant. Provide clear, accurate, and concise responses. Always use Markdown for code snippets.";

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // Using the absolute production ID for Paid Tier 1
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" }, { apiVersion: 'v1' });

        let chatHistory = history || [];
        
        // Injecting persona into the first turn of history
        if (chatHistory.length === 0) {
            chatHistory.push({
                role: "user",
                parts: [{ text: `INSTRUCTION: ${SYSTEM_BEHAVIOR}. Acknowledge with "Ready."` }]
            });
            chatHistory.push({
                role: "model",
                parts: [{ text: "Ready." }]
            });
        }

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ Tier 1 Success: Message delivered.`);
        res.json({ reply: text });
        
    } catch (error) {
        console.error("❌ AI Error:", error.message);
        res.status(500).json({ 
            error: "SmartAI Load Failed", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartAI Live on Port ${PORT} - Tier 1 Production Mode`);
});