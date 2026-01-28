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

// 1. Initialize with v1 endpoint for Paid Tier stability
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_BEHAVIOR = `
    You are SmartAI, a professional and highly capable AI assistant. 
    Provide clear, accurate, and concise responses. 
    Always use Markdown for code snippets.
    Maintain a professional yet friendly tone.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // 2. FORCE 'v1' API Version to avoid Free Tier 'v1beta' loops
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash", 
            systemInstruction: SYSTEM_BEHAVIOR 
        }, { apiVersion: 'v1' }); 

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 4096,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ Paid Tier v1 Success: Response delivered.`);
        res.json({ reply: text });
        
    } catch (error) {
        console.error("❌ AI Error Details:", error.message);
        
        // Return clear error if quota is still an issue
        res.status(500).json({ 
            error: "SmartAI is currently recalibrating.", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartAI Live on Port ${PORT} - Production v1 Mode`);
});