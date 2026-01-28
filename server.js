const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // Allows your index.html to talk to this server

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Using 1.5 Flash for speed
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong with SmartAI" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SmartAI Server running on port ${PORT}`));