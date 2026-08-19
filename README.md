# 📊 Google Sheets 多幣別 AI 智慧記帳系統 (GAS + HTML5)

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-8E75B2?logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> 一套基於 **Google 試算表 (Google Sheets)** 與 **Google Apps Script (GAS)** 的現代化開源多幣別記帳系統。結合 **Gemini AI 自然語言解析**、**即時匯率自動折算**、**發票收據照片辨識**與**互動式財務分析儀表板**。

---

## ✨ 核心特色亮點 (Key Features)

- 🤖 **Gemini AI 智慧記帳**：
  - 自然語言文字輸入（例：「中午跟同事吃鼎泰豐小籠包，我用 LINE Pay 付了 850」），AI 自動解析日期、時間、帳戶、金額、分類與備註。
  - 支援發票、收據拍照／截圖 OCR 影像自動拆單與辨識。
  - **防重複寫入安全鎖**：點擊「確認寫入」後立即進入防連點與載入狀態，防止網路延遲導致重複記帳。
- 📈 **視覺化財務儀表板**：
  - 資產總覽卡片（總資產、總負債、當月總收入、當月總支出、淨現金流）。
  - **三大動態圖表 (Chart.js)**：支出分類佔比圓餅圖、各帳戶餘額柱狀圖、每日收支走勢圖。
  - 多維度篩選器（年份、月份、指定日期、帳戶、分類、幣別、全文搜尋）。
- 💱 **即時多幣別匯率自動折算**：
  - 支援 TWD, JPY, USD, EUR, KRW, CNY, GBP, HKD, SGD, THB 等主流幣別。
  - 串接即時外匯 API 並具備 Google CacheService 智慧快取，提供儀表板頂部即時匯率看板與多幣別自動轉換基準幣。
- ⚙️ **高度自訂設定與本機/雲端雙向持久化**：
  - 支援自訂帳戶清單（如：現金、LINE Pay、郵局、LINE Bank、信用卡等）與消費分類。
  - 同步儲存至 Google 試算表「系統設定」分頁，且在瀏覽器預覽環境中無縫持久化至 `localStorage`。
- 📋 **內建 60 筆開源範本資料庫**：
  - 一鍵匯入 60 筆涵蓋食衣住行、轉帳、初始資產與多幣別交易的標準範例，開箱即測。
- 📥 **CSV 批次匯入與匯出**：
  - 支援匯出標準 UTF-8 附帶 BOM 的 CSV 檔案，與 Excel 及各大主流記帳工具完美相容。
- 📱 **極簡無多餘冗贅的優雅介面**：
  - 採用 Tailwind CSS 響應式佈局與 Lucide 向量圖示，完美適配手機版抽屜式選單與桌面版寬螢幕。

---

## 📁 專案檔案結構 (Project Structure)

```text
├── Code.gs             # Google Apps Script 後端（資料庫讀寫、Gemini API、匯率、選單）
├── index.html          # 前端 Single-Page Web App（HTML5 + Tailwind CSS + Chart.js）
├── metadata.json       # 專案中繼資料設定
├── package.json        # 前端開發與建置設定檔
└── README.md           # 專案完整中文使用與部署說明文件
```

---

## 🚀 5 分鐘快速部署教學 (Step-by-Step Deployment)

### 步驟 1：建立 Google 試算表
1. 前往 [Google 雲端硬碟](https://drive.google.com/)，建立一份新的 **Google 試算表**。
2. 將試算表命名為「**我的多幣別 AI 記帳本**」。

### 步驟 2：開啟 Apps Script 編輯器
1. 在試算表上方選單點選 **「擴充功能」 > 「Apps Script」**。
2. 將專案名稱重新命名為「**Google Sheets AI 記帳系統**」。

### 步驟 3：複製程式碼
1. **後端程式碼**：
   - 在左側檔案清單點選 `程式碼.gs`（或 `Code.gs`）。
   - 將本專案中的 [`Code.gs`](./Code.gs) 全部內容複製並貼上，覆蓋原內容後存檔 (Ctrl+S / Cmd+S)。
2. **前端程式碼**：
   - 在左側檔案清單點選「**+**」按鈕 > 選擇「**HTML**」。
   - 將檔案名稱命名為 `index`（系統會自動生成 `index.html`）。
   - 將本專案中的 [`index.html`](./index.html) 全部內容複製並貼上，覆蓋原內容後存檔。

### 步驟 4：設定 Gemini API Key（選用，啟用 AI 記帳功能）
1. 前往 [Google AI Studio](https://aistudio.google.com/) 免費取得你的 **Gemini API Key**。
2. 回到 Apps Script 專案頁面，點選左側齒輪圖示 **「專案設定」**。
3. 滑動到最下方的 **「指令碼屬性」**，點選 **「新增指令碼屬性」**：
   - **屬性 (Property)**: `GEMINI_API_KEY`
   - **值 (Value)**: `你的_GEMINI_API_KEY_字串`
4. 點選「**儲存指令碼屬性**」。
*(備註：亦可直接在 `Code.gs` 最上方的 `GEMINI_API_KEY` 變數中填入你的 API Key)*

### 步驟 5：發布網頁應用程式 (Web App)
1. 在 Apps Script 編輯器右上角，點選 **「部署」 > 「新增部署作業」**。
2. 點選齒輪「選取類型」 > 選擇 **「網頁應用程式」 (Web App)**。
3. 設定如下：
   - **說明**：`AI 智慧記帳系統 v1.0`
   - **執行身分**：`我 (你的 Google 帳號)`
   - **誰可以存取**：`僅限我自己`（若需與家人共用可選指定帳號或任何人）
4. 點選 **「部署」**，複製產生的 **「網頁應用程式網址」**。
5. 將此網址加入瀏覽器書籤或手機主畫面，即可隨時隨地開啟記帳！

---

## 📊 試算表欄位結構 (Data Schema)

系統會自動維護兩張工作表：

### 1. 「記帳資料」工作表 (Sheet: `記帳資料`)
| 欄位 | 名稱 | 範例 | 說明 |
| :--- | :--- | :--- | :--- |
| **A** | 日期 | `2026-08-19` | YYYY-MM-DD 格式 |
| **B** | 時間 | `12:30` | HH:mm 格式 |
| **C** | 帳戶 | `LINE Pay` | 扣款或入帳帳戶 |
| **D** | 項目名稱 | `全家超商 咖啡早餐` | 交易項目名稱 |
| **E** | 分類 | `食` | 消費或收入分類 |
| **F** | 幣別 | `TWD` | 原始幣別（TWD, JPY, USD, EUR...） |
| **G** | 金額 | `-85` | 支出為負數，收入為正數 |
| **H** | 備註 | `大熱拿+三明治` | 詳細補充備註 |

### 2. 「系統設定」工作表 (Sheet: `系統設定`)
- **A 欄 (帳戶列表)**：現金、LINE Pay、郵局、LINE Bank、街口支付、永豐銀行、國泰世華、玉山 Pi 信用卡、悠遊卡 等。
- **B 欄 (分類列表)**：食、衣、住、行、育、樂、醫療/雜項、投資、收入、內部轉帳、初始資產 等。

---

## 💡 使用指南 (User Guide)

### 1. 🤖 AI 自然語言對話記帳
- **直接打字輸入**：
  - *「昨晚跟朋友去居酒屋吃了 1800 元，用玉山信用卡結帳」*
  - *「收到八月份薪資 62000 元匯入永豐銀行」*
  - *「在日本買藥妝花了 8500 日圓，現金支付」*
  - *「從郵局轉帳 5000 元到 LINE Bank」*
- **確認寫入防重複機制**：
  - AI 解析完成後，會在對話串中列出確認卡片。
  - 點擊「**確認寫入**」按鈕，系統會即時反饋並將紀錄寫入 Google 試算表。

### 2. 📝 手動快速記帳
- 點擊頂部導覽列或側邊欄的「**手動記帳**」，提供最直覺的表單輸入介面。
- 支援「**連續記帳模式**」，輸入完成後自動保留介面並清空輸入框，適合批次整理收據。

### 3. ⚙️ 自訂帳戶與分類設定
- 點擊側邊欄抽屜的「**帳戶與分類設定**」。
- 可自由新增或刪除帳戶與分類標籤，支援按 Enter 快速新增，點擊「**儲存所有設定**」即刻生效。

---

## 🛠️ 開發與客製化 (Development & Customization)

本專案支援前端本機開發與預覽：

```bash
# 1. 安裝依賴
npm install

# 2. 啟動本機開發伺服器
npm run dev

# 3. 語法檢查與測試
npm run lint
```

---

## 📄 開源授權 (License)

本專案基於 [MIT License](LICENSE) 開源發布，歡迎自由 Fork、修改、個人使用或作為商業記帳基礎模組。
