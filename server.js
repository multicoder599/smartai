const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. IMPROVED CORS: Allow your specific Netlify domain
app.use(cors({
    origin: ['https://smartproai.netlify.app', 'http://127.0.0.1:5500'], // Allows your live site and local testing
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 2. API KEY CHECK: Log a warning if the key is missing (check your Render logs for this)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY is not set in Environment Variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "SmartAI is having trouble processing that request." });
    }
});

// 3. RENDER PORT: Render uses a dynamic port; process.env.PORT is mandatory
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartAI Server active on port ${PORT}`);
});