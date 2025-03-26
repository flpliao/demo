# 個人專用 AI 助理

這是一個個人專用的 AI 助理程式，整合了 OpenAI API 和 Line 機器人功能，可以透過網頁界面或 Line 應用程式與 AI 助理進行對話。

## 功能特點

- 基本的個人資訊頁面
- 整合 OpenAI API 的聊天助理功能
- Line 機器人對話與推播功能
- MongoDB 資料儲存功能
- 安全性保護，確保私人資料安全

## 技術堆疊

- 前端：HTML, CSS, JavaScript
- 後端：Node.js, Express
- 資料庫：MongoDB
- API 整合：OpenAI API, Line Messaging API
- 部署：Google Cloud Platform (GCP) - Cloud Run
- 版本控制：GitHub

## 快速開始

### 前置需求

- Node.js 18 或更高版本
- MongoDB 資料庫 (如果需要資料儲存功能)
- OpenAI API 金鑰
- Line 開發者帳號和 Line 機器人頻道 (如果需要 Line 機器人功能)

### 安裝

1. 複製專案
```
git clone https://github.com/flpliao/demo.git
cd demo
```

2. 安裝依賴
```
npm install
```

3. 配置環境變數
   - 複製 `.env.example` 並重新命名為 `.env`
   - 填入必要的環境變數值：
     - OpenAI API 金鑰
     - MongoDB 連接字串 (如果需要)
     - Line 頻道存取權杖和頻道密鑰 (如果需要)

### 啟動應用程式

開發環境啟動：
```
npm start
```

應用程式將在 http://localhost:8080 啟動。

## Line 機器人設置

要設置 Line 機器人，請按照以下步驟操作：

1. 前往 [Line Developers Console](https://developers.line.biz/console/)
2. 創建一個新的 Provider (如果尚未有)
3. 在 Provider 下創建一個新的 Messaging API 頻道
4. 獲取頻道密鑰 (Channel Secret) 和頻道存取權杖 (Channel Access Token)
5. 將這些值添加到 `.env` 文件中：
   ```
   LINE_CHANNEL_SECRET=your_channel_secret
   LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
   ```
6. 在 Line Developers Console 中，設置 Webhook URL 為您的應用程式 URL + `/webhook/line`，例如：`https://your-app-url.com/webhook/line`
7. 啟用 Webhook 並關閉自動回覆訊息功能

## 部署到 GCP

此專案已配置好使用 Google Cloud Build 部署到 Cloud Run。

### 部署步驟

1. 在 GCP 控制台創建一個新專案或使用現有專案
2. 啟用 Cloud Build 和 Cloud Run API
3. 設置 Cloud Build 觸發器，連接到您的 GitHub 儲存庫
4. 在 Cloud Build 觸發器中設置以下秘密變數：
   - `_OPENAI_API_KEY`: OpenAI API 金鑰
   - `_MONGODB_URI`: MongoDB 連接字串
   - `_LINE_CHANNEL_SECRET`: Line 頻道密鑰
   - `_LINE_CHANNEL_ACCESS_TOKEN`: Line 頻道存取權杖
   - `_API_KEY`: 用於 API 認證的自定義金鑰
5. 推送代碼到 GitHub 儲存庫，觸發自動部署

## 安全性考量

為了保護您的私人工作資料，此專案實施了以下安全措施：

1. 所有敏感資訊 (API 金鑰、連接字串等) 都存儲在環境變數中，不會被提交到版本控制系統
2. 在 GCP 部署中，敏感資訊作為秘密變數處理
3. API 端點使用 API 金鑰進行認證
4. 所有用戶輸入都經過驗證和清理，防止 XSS 攻擊
5. 使用 HTTPS 加密所有通信
6. 實施了錯誤處理和日誌記錄，但不會暴露敏感信息

## 環境變數說明

```
# MongoDB 連接設置
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/demo?retryWrites=true&w=majority

# OpenAI API 設置
OPENAI_API_KEY=your_openai_api_key

# Line 機器人設置
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret

# API 認證設置
API_KEY=your_custom_api_key_for_authentication

# 服務器端口設置
PORT=8080

# 環境設置
NODE_ENV=production
```

## Docker 支援

此專案包含 Dockerfile 以支援容器化部署，可使用以下命令構建並運行容器：

```
docker build -t demo-app .
docker run -p 8080:8080 --env-file .env demo-app
```

## 使用 GitHub Pages 進行版本管理

此專案使用 GitHub Pages 進行雲端版本管理，可以在以下網址訪問：
https://flpliao.github.io/demo/

## 貢獻

這是一個個人專案，但歡迎提出建議和改進意見。

## 授權

此專案僅供個人使用。
