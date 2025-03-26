# Google Cloud Platform (GCP) 設置詳細指南

本指南將引導您完成在 Google Cloud Platform 上設置專案、配置必要的服務，以及部署您的應用程式的完整步驟。

## 1. 創建和設置 GCP 專案

### 1.1 創建新專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊頁面頂部的專案選擇器
3. 點擊「新建專案」按鈕
4. 輸入以下資訊：
   - 專案名稱：Demo
   - 專案 ID：river-span-454804-p5（已指定）
   - 組織：（可選）如果您有組織，可以選擇
   - 位置：（可選）如果您有資料夾，可以選擇
5. 點擊「創建」按鈕

### 1.2 啟用必要的 API

1. 在 Google Cloud Console 中，確保您已選擇正確的專案
2. 在左側導航欄中，點擊「API 和服務」>「程式庫」
3. 搜索並啟用以下 API：
   - Cloud Build API
   - Cloud Run API
   - Container Registry API
   - Artifact Registry API
   - Cloud Logging API
   - Cloud Monitoring API

## 2. 設置 Cloud Build

### 2.1 連接 GitHub 儲存庫

1. 在 Google Cloud Console 中，前往「Cloud Build」>「觸發器」
2. 點擊「連接儲存庫」按鈕
3. 選擇「GitHub (Cloud Build GitHub App)」
4. 點擊「繼續」
5. 按照指示授權 Google Cloud Build 訪問您的 GitHub 帳號
6. 選擇您的 GitHub 儲存庫（flpliao/demo）
7. 點擊「連接」按鈕

### 2.2 創建 Cloud Build 觸發器

1. 在「觸發器」頁面中，點擊「創建觸發器」按鈕
2. 填寫以下資訊：
   - 名稱：demo-deploy
   - 描述：（可選）部署 Demo 應用程式
   - 事件：選擇「推送到分支」
   - 來源：選擇您的 GitHub 儲存庫
   - 分支：輸入 `^main$`（正則表達式，僅匹配 main 分支）
   - 配置：選擇「Cloud Build 配置文件 (yaml 或 json)」
   - 位置：選擇「儲存庫」
   - Cloud Build 配置文件位置：輸入 `cloudbuild.yaml`
3. 在「替代變數」部分，點擊「添加變數」按鈕，添加以下變數：
   - `_OPENAI_API_KEY`：您的 OpenAI API 金鑰
   - `_MONGODB_URI`：您的 MongoDB 連接字串
   - `_LINE_CHANNEL_SECRET`：您的 Line 頻道密鑰
   - `_LINE_CHANNEL_ACCESS_TOKEN`：您的 Line 頻道存取權杖
   - `_API_KEY`：自定義的 API 金鑰，用於 API 認證
4. 點擊「創建」按鈕保存觸發器

## 3. 設置 Cloud Run

### 3.1 配置 Cloud Run 服務

Cloud Run 服務將由 Cloud Build 自動創建，但您可以預先了解一些設置：

1. 在 Google Cloud Console 中，前往「Cloud Run」
2. 服務名稱將是 `demo-service`（在 cloudbuild.yaml 中定義）
3. 區域將是 `asia-east1`（在 cloudbuild.yaml 中定義）
4. 允許未經身份驗證的訪問（在 cloudbuild.yaml 中設置為 `--allow-unauthenticated`）
5. 環境變數將由 Cloud Build 設置（使用您在觸發器中定義的替代變數）

## 4. 設置 MongoDB

如果您還沒有 MongoDB 資料庫，您可以使用 MongoDB Atlas 創建一個免費的雲端資料庫：

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 創建一個帳號或登入
3. 創建一個新的叢集（免費層級即可）
4. 在「Security」>「Database Access」中創建一個資料庫用戶
5. 在「Security」>「Network Access」中添加您的 IP 地址或允許所有 IP 地址訪問（0.0.0.0/0）
6. 在「Clusters」頁面中，點擊「Connect」按鈕
7. 選擇「Connect your application」
8. 複製連接字串，並將 `<username>`、`<password>` 和 `<dbname>` 替換為您的資料庫用戶名、密碼和資料庫名稱
9. 將此連接字串用作 `_MONGODB_URI` 替代變數

## 5. 部署應用程式

### 5.1 推送代碼到 GitHub

1. 確保您已經將所有更改提交到本地 Git 儲存庫：
   ```bash
   git add .
   git commit -m "整合 Line 機器人功能和 GCP 部署配置"
   ```

2. 推送代碼到 GitHub：
   ```bash
   git push origin main
   ```

### 5.2 監控部署進度

1. 在 Google Cloud Console 中，前往「Cloud Build」>「歷史記錄」
2. 您應該會看到一個正在進行的構建，這是由您的代碼推送觸發的
3. 點擊該構建以查看詳細日誌和進度
4. 構建完成後，您可以在「Cloud Run」服務中找到您的應用程式

### 5.3 測試部署

1. 在 Google Cloud Console 中，前往「Cloud Run」
2. 點擊您的服務（demo-service）
3. 在服務詳情頁面中，您會看到一個 URL，這是您的應用程式 URL
4. 點擊該 URL 訪問您的應用程式
5. 測試網頁聊天功能是否正常工作

## 6. 設置 GitHub Pages 進行版本管理

您提到需要使用 GitHub Pages 進行雲端版本管理，以下是設置步驟：

1. 在 GitHub 儲存庫中，前往「Settings」>「Pages」
2. 在「Source」部分，選擇「Deploy from a branch」
3. 在「Branch」下拉菜單中，選擇「main」分支和「/docs」資料夾（如果您的靜態文件在 docs 資料夾中）或「/(root)」（如果在根目錄）
4. 點擊「Save」按鈕
5. GitHub 將自動構建並部署您的頁面，完成後會顯示 URL（通常是 https://flpliao.github.io/demo/）

如果您需要將 Cloud Run 應用程式與 GitHub Pages 整合，您可以在 GitHub Pages 中添加一個重定向到您的 Cloud Run URL，或者使用 GitHub Pages 僅作為文檔和版本歷史的展示。

## 7. 監控和日誌

### 7.1 設置監控

1. 在 Google Cloud Console 中，前往「Monitoring」>「Dashboards」
2. 您可以創建自定義儀表板來監控您的應用程式性能
3. 點擊「Create Dashboard」按鈕
4. 添加相關指標，如 CPU 使用率、內存使用率、請求數等

### 7.2 查看日誌

1. 在 Google Cloud Console 中，前往「Logging」>「Logs Explorer」
2. 在查詢編輯器中，您可以使用以下查詢來查看您的 Cloud Run 服務日誌：
   ```
   resource.type="cloud_run_revision"
   resource.labels.service_name="demo-service"
   ```
3. 點擊「Run query」按鈕查看日誌

## 8. 故障排除

如果您遇到問題，請檢查以下幾點：

1. 確保所有必要的 API 都已啟用
2. 檢查 Cloud Build 日誌中是否有錯誤
3. 確保所有環境變數都已正確設置
4. 檢查 Cloud Run 服務日誌以查看應用程式錯誤
5. 確保您的 MongoDB 連接字串正確且資料庫可訪問
6. 確保您的 OpenAI API 金鑰有效且未超出配額

如需更多幫助，請參考 [Google Cloud 文檔](https://cloud.google.com/docs) 或 [Google Cloud 社區支持](https://cloud.google.com/community)。

## 9. 安全性最佳實踐

為了確保您的應用程式和數據安全，請考慮以下最佳實踐：

1. 使用 Secret Manager 存儲敏感資訊，而不是環境變數
2. 定期輪換 API 金鑰和密碼
3. 設置 IAM 權限，遵循最小權限原則
4. 啟用 Cloud Audit Logs 以記錄管理活動
5. 配置 VPC Service Controls 以限制資源訪問
6. 使用 Cloud Armor 保護您的應用程式免受 DDoS 攻擊
7. 定期備份您的數據
8. 啟用 Cloud Security Command Center 以監控安全威脅
