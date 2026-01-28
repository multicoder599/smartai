const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Production-ready CORS
app.use(cors({
    origin: 'https://smartproai.netlify.app'
}));

app.use(express.json());

// Verify API Key exists on startup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ FATAL ERROR: GEMINI_API_KEY is not defined in Environment Variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // To this:
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        // IMPORTANT: Must await the generation
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        // Send successful response back
        res.json({ reply: text });
        
    } catch (error) {
        // This will print the SPECIFIC error in your Render Logs tab
        console.error("AI Error Detailed:", error);
        
        res.status(500).json({ 
            error: "Internal Server Error", 
            details: error.message 
        });
    }
});

// Render dynamic port binding
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartAI Backend Live on Port ${PORT}`);
});