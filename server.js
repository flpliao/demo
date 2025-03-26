const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
// 使用環境變數中的端口，或默認為 5000
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 連接 MongoDB
// 如果環境變數存在才連接 MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('已成功連接到 MongoDB'))
    .catch(err => console.error('MongoDB 連接錯誤:', err));
} else {
  console.log('未提供 MongoDB 連接字串，跳過資料庫連接');
}

// 定義資料模型
const DataSchema = new mongoose.Schema({
    type: String,
    content: Object,
    date: { type: Date, default: Date.now }
});

const Data = mongoose.model('Data', DataSchema);

// 設置 OpenAI
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// 檢查關鍵環境變數
console.log('環境變數檢查:');
console.log('PORT =', process.env.PORT);
console.log('NODE_ENV =', process.env.NODE_ENV);

if (!process.env.OPENAI_API_KEY) {
  console.warn('警告: OPENAI_API_KEY 未設置，聊天功能將無法使用');
}

if (!process.env.MONGODB_URI) {
  console.warn('警告: MONGODB_URI 未設置，資料儲存功能將無法使用');
}

// API 路由
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!openai) {
            return res.status(503).json({ 
                error: "OpenAI API 金鑰未設置，無法使用聊天功能" 
            });
        }
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });
        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error("聊天API錯誤:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        if (!process.env.MONGODB_URI) {
            return res.status(503).json({ 
                error: "MongoDB 連接未設置，無法儲存資料" 
            });
        }
        
        const newData = new Data(req.body);
        await newData.save();
        res.json({ success: true, id: newData._id });
    } catch (error) {
        console.error("資料儲存錯誤:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));
