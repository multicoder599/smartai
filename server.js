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

// 3. Neutral System Instructions
const SYSTEM_BEHAVIOR = `
    You are SmartAI, a helpful, professional, and highly capable AI assistant. 
    Provide clear, accurate, and concise responses. 
    Always use Markdown for code snippets and technical formatting.
    If a query is ambiguous, ask for clarification.
    Stay objective and avoid referring to specific personal history unless asked.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // UPGRADED: Using Gemini 2.0 Flash (Stable for Paid Tier)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash", 
            systemInstruction: SYSTEM_BEHAVIOR 
        });

        // Initialize chat with history
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 4096, // Increased for detailed Paid Tier responses
            },
        });

        // Process message
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ Paid Tier Success: Request processed.`);

        res.json({ reply: text });
        
    } catch (error) {
        console.error("❌ AI Error Details:", error.message);
        
        // Handle potential errors gracefully
        res.status(500).json({ 
            error: "SmartAI is currently recalibrating.", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartAI Live on Port ${PORT} (Paid Tier Enabled)`);
});