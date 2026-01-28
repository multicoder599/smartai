const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Production CORS Policy
app.use(cors({
    origin: 'https://smartproai.netlify.app'
}));

app.use(express.json());

// 2. API Key Verification
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ FATAL ERROR: GEMINI_API_KEY is missing from environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 3. System Instructions (Neutral & Smart)
const SYSTEM_BEHAVIOR = `
    You are SmartAI, a professional and highly capable digital assistant. 
    Provide clear, technically accurate, and concise responses. 
    Always use Markdown for code snippets. 
    If you don't know an answer, admit it politely rather than hallucinating.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // Use the standard stable model identifier
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: SYSTEM_BEHAVIOR 
        });

        // Initialize chat with history provided by the frontend
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 2048, 
            },
        });

        // Process message
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // Log successful interaction in Render console
        console.log(`✅ Success: Message received. Response sent.`);

        res.json({ reply: text });
        
    } catch (error) {
        // Detailed logging for Render Dashboard
        console.error("❌ AI Error Details:", error.message);
        
        res.status(500).json({ 
            error: "SmartAI is currently recalibrating.", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartAI Live on Port ${PORT}`);
});