const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CORS Configuration
app.use(cors({
    origin: 'https://smartproai.netlify.app'
}));

app.use(express.json());

// 2. API Key Check
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ FATAL ERROR: GEMINI_API_KEY is missing.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 3. System Instruction String
const SYSTEM_BEHAVIOR = "You are SmartAI, a professional assistant. Provide clear, accurate, and concise responses. Always use Markdown for code snippets.";

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // FIX: Reverting to v1beta ensures the 'systemInstruction' field is mapped correctly.
        // Google Cloud Billing (Paid Tier) works across both v1 and v1beta.
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: SYSTEM_BEHAVIOR
        }, { apiVersion: 'v1beta' }); 

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

        console.log(`✅ Message processed successfully.`);
        res.json({ reply: text });
        
    } catch (error) {
        console.error("❌ AI Error Details:", error.message);
        
        // If the error persists, fallback to a version without systemInstruction
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