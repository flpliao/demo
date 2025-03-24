const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 連接 MongoDB
mongoose.connect(process.env.MONGODB_URI);

// 定義資料模型
const DataSchema = new mongoose.Schema({
    type: String,
    content: Object,
    date: { type: Date, default: Date.now }
});

const Data = mongoose.model('Data', DataSchema);

// 設置 OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// API 路由
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });
        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const newData = new Data(req.body);
        await newData.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));