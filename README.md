# Demo 專案

這是一個簡單的網頁應用程式，包含 Node.js 後端和靜態前端頁面。此應用程式支援與 OpenAI API 整合的聊天功能，以及使用 MongoDB 的資料儲存功能。

## 功能特點

- 基本的個人資訊頁面
- 整合 OpenAI API 的聊天助理功能
- MongoDB 資料儲存功能

## 技術堆疊

- 前端：HTML, CSS, JavaScript
- 後端：Node.js, Express
- 資料庫：MongoDB
- API 整合：OpenAI
- 部署：GitHub Actions + Google Cloud Run

## 快速開始

### 前置需求

- Node.js 18 或更高版本
- MongoDB 資料庫 (如果需要資料儲存功能)
- OpenAI API 金鑰 (如果需要聊天功能)

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
   - 依據需求填入必要的環境變數值

### 啟動應用程式

開發環境啟動：
```
npm start
```

## 部署

專案已配置好使用 GitHub Actions 部署到 Google Cloud Run 的工作流程。當程式碼推送到 main 分支時，將自動觸發部署流程。

部署所需環境變數透過 GitHub Secrets 在 Actions 中設定。

## 環境變數說明

```
# MongoDB 連接設置
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/demo?retryWrites=true&w=majority

# OpenAI API 設置
OPENAI_API_KEY=your_api_key_here

# 服務器端口設置
PORT=8080
```

## Docker 支援

此專案包含 Dockerfile 以支援容器化部署，可使用以下命令構建並運行容器：

```
docker build -t demo-app .
docker run -p 8080:8080 --env-file .env demo-app
```
