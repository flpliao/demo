// 先加載環境變數
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const mongoose = require('mongoose');
const line = require('@line/bot-sdk');
const crypto = require('crypto');

const app = express();
// 使用環境變數中的端口，或默認為 8080
const port = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Line 設置
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

// 檢查 Line 配置
const isLineConfigured = process.env.LINE_CHANNEL_ACCESS_TOKEN && process.env.LINE_CHANNEL_SECRET;

// 創建 Line 客戶端
const lineClient = isLineConfigured ? new line.Client(lineConfig) : null;

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

if (!isLineConfigured) {
  console.warn('警告: LINE_CHANNEL_ACCESS_TOKEN 或 LINE_CHANNEL_SECRET 未設置，Line 機器人功能將無法使用');
}

// 健康檢查端點
app.get('/health', (req, res) => {
    const status = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            mongodb: process.env.MONGODB_URI ? 'configured' : 'not configured',
            openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
            line: isLineConfigured ? 'configured' : 'not configured'
        }
    };
    res.json(status);
});

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
        const statusCode = error.status || 500;
        const errorMessage = error.message || "伺服器內部錯誤";
        res.status(200).json({ 
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
});

// 使用 OpenAI 生成回應
async function generateAIResponse(message) {
    if (!openai) {
        return "抱歉，AI 服務目前無法使用。";
    }
    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI API 錯誤:", error);
        return "抱歉，AI 處理您的請求時發生錯誤。";
    }
}

// 設置多個 LINE Webhook 端點，確保無論使用哪個路徑都能正確響應
const setupLineWebhook = (path) => {
    app.post(path, (req, res) => {
        console.log(`接收到 LINE Webhook 請求: ${path}`);
        
        // 最重要：無論如何都立即回應 HTTP 200
        res.status(200).end();
        
        // 如果未配置 LINE，僅記錄並返回
        if (!isLineConfigured) {
            console.error("Line 機器人未配置，無法處理 webhook");
            return;
        }
        
        // 異步處理其餘邏輯，不影響響應速度
        setTimeout(async () => {
            try {
                const signature = req.headers['x-line-signature'];
                if (!signature) {
                    console.error("缺少 LINE 簽名");
                    return;
                }
                
                const body = JSON.stringify(req.body);
                const hash = crypto.createHmac('sha256', lineConfig.channelSecret)
                            .update(body)
                            .digest('base64');
                            
                if (hash !== signature) {
                    console.error("LINE 簽名驗證失敗");
                    return;
                }
                
                const events = req.body.events;
                if (!events || events.length === 0) {
                    console.log("沒有事件要處理");
                    return;
                }
                
                // 處理每個事件
                for (const event of events) {
                    // 只處理文字訊息
                    if (event.type !== 'message' || event.message.type !== 'text') {
                        console.log(`跳過非文字訊息事件: ${event.type}`);
                        continue;
                    }
                    
                    const userMessage = event.message.text;
                    console.log(`收到 LINE 用戶訊息: ${userMessage}`);
                    
                    // 記錄用戶訊息到 MongoDB (如果已配置)
                    if (process.env.MONGODB_URI) {
                        try {
                            const messageData = new Data({
                                type: 'line_message',
                                content: {
                                    userId: event.source.userId,
                                    message: userMessage
                                }
                            });
                            await messageData.save();
                            console.log("訊息已儲存到資料庫");
                        } catch (dbError) {
                            console.error("儲存 Line 訊息到資料庫時出錯:", dbError);
                        }
                    }
                    
                    try {
                        // 使用 OpenAI 生成回應
                        const aiResponse = await generateAIResponse(userMessage);
                        
                        // 回覆用戶
                        await lineClient.replyMessage(event.replyToken, {
                            type: 'text',
                            text: aiResponse
                        });
                        console.log("已回覆 LINE 用戶");
                    } catch (replyError) {
                        console.error("回覆 LINE 用戶時出錯:", replyError);
                    }
                }
            } catch (error) {
                console.error("Line Webhook 處理錯誤:", error);
            }
        }, 0);
    });
};

// 註冊多個可能的 webhook 路徑
setupLineWebhook('/webhook/line');
setupLineWebhook('/line/webhook');
setupLineWebhook('/webhook');
setupLineWebhook('/callback');
setupLineWebhook('/line/callback');
setupLineWebhook('/bot/webhook');
setupLineWebhook('/bot/callback');

// 添加通用端點以確保所有 POST 請求都收到 200 回應
app.post('*', (req, res) => {
    console.log(`接收到未知 POST 請求: ${req.path}`);
    res.status(200).json({
        message: 'OK - This is a generic response to ensure all POST requests receive a 200 status code',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// Line 推播功能
app.post('/api/line/push', async (req, res) => {
    if (!isLineConfigured) {
        return res.status(503).json({ error: "Line 機器人未配置" });
    }
    
    try {
        const { userId, message } = req.body;
        
        if (!userId || !message) {
            return res.status(400).json({ error: "缺少必要參數" });
        }
        
        // 驗證請求來源 (簡單的 API 金鑰驗證)
        const apiKey = req.headers['x-api-key'];
        if (!apiKey || apiKey !== process.env.API_KEY) {
            return res.status(401).json({ error: "未授權的請求" });
        }
        
        // 發送推播訊息
        await lineClient.pushMessage(userId, {
            type: 'text',
            text: message
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error("Line 推播錯誤:", error);
        const statusCode = error.status || 500;
        const errorMessage = error.message || "伺服器內部錯誤";
        res.status(statusCode).json({ 
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
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
        const statusCode = error.status || 500;
        const errorMessage = error.message || "伺服器內部錯誤";
        res.status(statusCode).json({ 
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
});

// 全局錯誤處理中間件
app.use((err, req, res, next) => {
    console.error('未捕獲的錯誤:', err);
res.status(200).json({
    message: 'Received',
    timestamp: new Date().toISOString()
});
});

// 處理 404 錯誤
app.get('*', (req, res) => {
    res.status(200).json({
        message: 'This is the default response. Your request was received but did not match any specific route.',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

const server = app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));

// 優雅關閉
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
    console.log('正在關閉伺服器...');
    server.close(() => {
        console.log('伺服器已關閉');
        if (mongoose.connection.readyState === 1) {
            console.log('正在關閉資料庫連接...');
            mongoose.connection.close()
                .then(() => console.log('資料庫連接已關閉'))
                .catch(err => console.error('關閉資料庫連接時出錯:', err))
                .finally(() => process.exit(0));
        } else {
            process.exit(0);
        }
    });
    
    // 如果 10 秒內無法優雅關閉，則強制退出
    setTimeout(() => {
        console.error('無法在時間內優雅關閉，強制退出');
        process.exit(1);
    }, 10000);
}
