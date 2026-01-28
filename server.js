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

// --- 🧠 NEUTRAL SYSTEM INSTRUCTIONS ---
const SYSTEM_BEHAVIOR = `
    You are SmartAI, a helpful and highly capable AI assistant. 
    Provide clear, accurate, and concise responses. 
    When providing code, use Markdown formatting.
    Maintain a professional yet friendly tone.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // UPGRADED: Using Gemini 2.0 Flash for better availability and performance
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: SYSTEM_BEHAVIOR 
        });

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                temperature: 0.7, 
                topP: 0.95,
                maxOutputTokens: 4096, // Increased for longer, more detailed answers
            },
        });

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
    console.log(`🚀 SmartAI Live on Port ${PORT}`);
});