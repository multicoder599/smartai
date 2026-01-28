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
        
        // FIX: Using the absolute versioned ID 'gemini-1.5-flash-001' on v1beta
        // v1beta is more reliable for 'flash' models in many regions currently.
        const model = genAI.getGenerativeModel({ 
            model: "models/gemini-1.5-flash-001" 
        }, { apiVersion: 'v1beta' });

        let chatHistory = history || [];
        
        // Inject instructions into history for compatibility
        if (chatHistory.length === 0) {
            chatHistory.push({
                role: "user",
                parts: [{ text: `INSTRUCTIONS: ${SYSTEM_BEHAVIOR}. Respond with 'Ready.'` }]
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

        console.log(`✅ Success: Message processed using explicit model ID.`);
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
    console.log(`🚀 SmartAI Live on Port ${PORT} - Absolute ID Mode`);
});