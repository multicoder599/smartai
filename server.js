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

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // UPDATED: Switching to Gemini 3 Flash (Preview) for 2026 support
        // Other options: "gemini-3-pro-preview" or "gemini-2.5-flash"
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
        
    } catch (error) {
        console.error("AI Error Detailed:", error);
        
        // Check for specific 404/retirement errors in the response
        res.status(500).json({ 
            error: "SmartAI is having trouble processing that request.", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartAI Backend Live on Port ${PORT}`);
});