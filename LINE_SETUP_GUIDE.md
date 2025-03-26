# Line 機器人設置詳細指南

本指南將引導您完成在 Line Developers Console 創建機器人頻道、獲取必要的憑證，以及將其整合到您的應用程式和 GCP 部署流程中的完整步驟。

## 1. 在 Line Developers Console 創建機器人頻道

### 1.1 創建 Line 開發者帳號

1. 前往 [Line Developers Console](https://developers.line.biz/console/)
2. 使用您的 Line 帳號登入，如果沒有 Line 帳號，請先創建一個
3. 首次登入時，您需要同意服務條款並填寫開發者資訊

### 1.2 創建 Provider

1. 登入後，點擊「Create a new provider」按鈕
2. 輸入 Provider 名稱（例如：「Personal AI Assistant」）
3. 點擊「Create」按鈕

### 1.3 創建 Messaging API 頻道

1. 在您剛創建的 Provider 頁面中，點擊「Create a Messaging API channel」
2. 填寫以下資訊：
   - Channel name：您的機器人名稱（例如：「Personal AI Assistant」）
   - Channel description：簡短描述您的機器人功能
   - Category：選擇最適合的類別（例如：「Personal」）
   - Subcategory：選擇適合的子類別
   - Email address：您的電子郵件地址
   - Privacy policy URL：（可選）如果您有隱私政策頁面
   - Terms of use URL：（可選）如果您有使用條款頁面
3. 勾選同意條款並點擊「Create」按鈕

## 2. 獲取頻道密鑰和存取權杖

### 2.1 獲取頻道密鑰 (Channel Secret)

1. 在您剛創建的頻道頁面中，切換到「Basic settings」標籤
2. 在「Channel secret」部分，您會看到您的頻道密鑰
3. 點擊「Copy」按鈕複製此密鑰，或記下來以供後續使用

### 2.2 獲取頻道存取權杖 (Channel Access Token)

1. 在同一頻道頁面中，切換到「Messaging API」標籤
2. 向下滾動到「Channel access token」部分
3. 點擊「Issue」按鈕生成一個新的存取權杖
4. 生成後，點擊「Copy」按鈕複製此權杖，或記下來以供後續使用

**重要提示**：請妥善保管這些憑證，不要公開分享或提交到版本控制系統中。

## 3. 將憑證添加到 .env 文件

1. 打開您專案中的 `.env` 文件
2. 找到以下行並填入您剛獲取的憑證：
   ```
   LINE_CHANNEL_SECRET=your_channel_secret_here
   LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
   ```
3. 將 `your_channel_secret_here` 替換為您的頻道密鑰
4. 將 `your_channel_access_token_here` 替換為您的頻道存取權杖
5. 保存文件

## 4. 設置 GCP Cloud Build 觸發器

### 4.1 創建 Cloud Build 觸發器

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇您的專案（river-span-454804-p5）
3. 在左側導航欄中，找到「Cloud Build」並點擊「Triggers」
4. 點擊「Create Trigger」按鈕
5. 填寫以下資訊：
   - Name：觸發器名稱（例如：「demo-deploy」）
   - Description：（可選）觸發器描述
   - Event：選擇「Push to a branch」
   - Repository：選擇您的 GitHub 儲存庫（需要先連接 GitHub）
   - Branch：輸入 `^main$`（正則表達式，僅匹配 main 分支）
   - Configuration：選擇「Cloud Build configuration file (yaml or json)」
   - Location：選擇「Repository」
   - Cloud Build configuration file location：輸入 `cloudbuild.yaml`

### 4.2 添加秘密變數

1. 在觸發器創建頁面中，向下滾動到「Substitution variables」部分
2. 點擊「Add variable」按鈕，添加以下變數：
   - `_OPENAI_API_KEY`：您的 OpenAI API 金鑰
   - `_MONGODB_URI`：您的 MongoDB 連接字串
   - `_LINE_CHANNEL_SECRET`：您的 Line 頻道密鑰
   - `_LINE_CHANNEL_ACCESS_TOKEN`：您的 Line 頻道存取權杖
   - `_API_KEY`：自定義的 API 金鑰，用於 API 認證
3. 點擊「Create」按鈕保存觸發器

## 5. 設置 Line Webhook URL

1. 部署您的應用程式到 GCP（見下一節）
2. 獲取您的應用程式 URL（例如：`https://demo-service-abcdef123-uc.a.run.app`）
3. 前往 [Line Developers Console](https://developers.line.biz/console/)
4. 選擇您的 Provider 和頻道
5. 切換到「Messaging API」標籤
6. 向下滾動到「Webhook settings」部分
7. 在「Webhook URL」欄位中，輸入您的應用程式 URL + `/webhook/line`
   （例如：`https://demo-service-abcdef123-uc.a.run.app/webhook/line`）
8. 點擊「Update」按鈕
9. 點擊「Verify」按鈕測試 Webhook 是否正常工作
10. 確保「Use webhook」選項已開啟
11. 在「Auto-reply messages」部分，建議關閉「Auto-reply messages」功能，以便由您的應用程式處理所有回覆

## 6. 部署到 GCP

### 6.1 推送代碼到 GitHub 儲存庫

1. 確保您已經將所有更改提交到本地 Git 儲存庫：
   ```bash
   git add .
   git commit -m "整合 Line 機器人功能"
   ```

2. 推送代碼到 GitHub：
   ```bash
   git push origin main
   ```

### 6.2 監控部署進度

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇您的專案（river-span-454804-p5）
3. 在左側導航欄中，找到「Cloud Build」並點擊「History」
4. 您應該會看到一個正在進行的構建，這是由您的代碼推送觸發的
5. 點擊該構建以查看詳細日誌和進度
6. 構建完成後，您可以在「Cloud Run」服務中找到您的應用程式

### 6.3 測試部署

1. 在 Google Cloud Console 中，前往「Cloud Run」
2. 點擊您的服務（demo-service）
3. 在服務詳情頁面中，您會看到一個 URL，這是您的應用程式 URL
4. 點擊該 URL 訪問您的應用程式
5. 測試網頁聊天功能是否正常工作
6. 使用 Line 應用程式掃描您在 Line Developers Console 中的 QR 碼，添加您的機器人為好友
7. 向機器人發送訊息，測試 Line 對話功能是否正常工作

## 7. 添加好友並開始使用

1. 在 Line Developers Console 中，切換到「Messaging API」標籤
2. 在頁面中找到您的機器人 QR 碼
3. 使用 Line 應用程式掃描此 QR 碼，或點擊「Add friend」按鈕
4. 將機器人添加為好友後，您可以開始向它發送訊息
5. 機器人將使用 OpenAI API 生成回應並回覆您

## 8. 故障排除

如果您遇到問題，請檢查以下幾點：

1. 確保所有環境變數都已正確設置
2. 檢查 Cloud Build 日誌中是否有錯誤
3. 確保 Webhook URL 已正確設置並已驗證
4. 檢查應用程式日誌以查看是否有錯誤
5. 確保 Line 機器人已添加為好友並已啟用

如需更多幫助，請參考 [Line Messaging API 文檔](https://developers.line.biz/en/docs/messaging-api/) 或 [Google Cloud 文檔](https://cloud.google.com/docs)。
