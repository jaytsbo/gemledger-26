/**
 * 📊 Google Sheets 智慧多幣別財務儀表板與 Gemini 3.5 AI 記帳系統 (Google Apps Script)
 * 檔案：Code.gs
 */

// 安全取得 UI 物件（避免在無 UI 環境、Web App 或編輯器測試時拋出例外）
function getSafeUi() {
  try {
    return SpreadsheetApp.getUi();
  } catch (e) {
    return null;
  }
}

// 安全彈出提示訊息
function safeAlert(message) {
  const ui = getSafeUi();
  if (ui) {
    ui.alert(message);
  } else {
    console.log("[Alert]: " + message);
  }
}

// 安全顯示 Toast 提示
function safeToast(message, title = "系統通知", timeoutSeconds = 3) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) ss.toast(message, title, timeoutSeconds);
  } catch (e) {
    console.log(`[Toast - ${title}]: ${message}`);
  }
}

function onOpen() {
  const ui = getSafeUi();
  if (!ui) {
    console.warn("目前處於無 UI 執行環境（如 Web App 或背景測試），略過選單掛載。");
    return;
  }

  ui.createMenu('📊 財務儀表板與多幣別記帳')
    .addItem('🚀 開啟財務分析儀表板', 'openDashboardModal')
    .addItem('📱 開啟側邊欄智能記帳', 'openSidebar')
    .addSeparator()
    .addItem('⚙️ 初始化 8 欄位「記帳資料」工作表', 'initAccountingSheet')
    .addItem('⚙️ 初始化/重設「系統設定」工作表', 'initSettingsSheet')
    .addSeparator()
    .addItem('🔑 設定/更新 Gemini API Key', 'promptSetApiKey')
    .addItem('💱 立即同步最新各國即時匯率', 'syncExchangeRatesToast')
    .addToUi();
}

function openDashboardModal() {
  const ui = getSafeUi();
  if (!ui) return;
  const html = HtmlService.createHtmlOutputFromFile('index')
    .setWidth(1380)
    .setHeight(900)
    .setTitle('個人財務分析儀表板');
  ui.showModalDialog(html, '個人財務分析儀表板');
}

function openSidebar() {
  const ui = getSafeUi();
  if (!ui) return;
  const html = HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Gemini 智能記帳側邊欄');
  ui.showSidebar(html);
}

// 確保手機版與 Web App 正確套用 Viewport 排版
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle('個人財務深層分析與多幣別記帳儀表板');
}

function initAccountingSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("找不到作用中的試算表");

  let sheet = ss.getSheetByName("記帳資料") || ss.insertSheet("記帳資料");
  const headers = ["日期", "時間", "帳戶", "項目名稱", "分類", "幣別", "金額", "備註"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground("#0f766e").setFontColor("#ffffff").setFontWeight("bold");
  sheet.setFrozenRows(1);
  safeAlert('✅ 成功初始化「記帳資料」工作表！');
}

function initSettingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  let sheet = ss.getSheetByName("系統設定") || ss.insertSheet("系統設定");
  sheet.clear();
  sheet.getRange(1, 1, 1, 2).setValues([["帳戶清單", "分類清單"]]).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  
  const accounts = ['現金', 'LINE Pay', 'LINE Bank', '郵局', '永豐銀行', '國泰世華', '玉山銀行', '悠遊卡', '街口支付', '台新Richart'];
  const categories = ['食', '衣', '住', '行', '育樂', '學習費用', '醫療/雜項', '收入', '初始資產', '代墊款', '代墊回收', '內部轉帳'];
  const rows = [];
  for (let i = 0; i < Math.max(accounts.length, categories.length); i++) {
    rows.push([accounts[i] || "", categories[i] || ""]);
  }
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  sheet.setFrozenRows(1);
  safeAlert('✅ 成功初始化「系統設定」工作表！');
}

function getCustomSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const fallbackCurrencies = ['TWD', 'JPY', 'USD', 'KRW', 'EUR', 'CNY', 'GBP', 'HKD', 'SGD', 'THB', 'AUD'];

  if (!ss) return { accounts: ['現金'], categories: ['食', '收入'], currencies: fallbackCurrencies };
  const sheet = ss.getSheetByName("系統設定");
  if (!sheet) return { accounts: ['現金'], categories: ['食', '收入'], currencies: fallbackCurrencies };

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return { accounts: ['現金'], categories: ['食', '收入'], currencies: fallbackCurrencies };

  const accounts = [], categories = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) accounts.push(String(values[i][0]).trim());
    if (values[i][1]) categories.push(String(values[i][1]).trim());
  }
  return { 
    accounts: accounts.length > 0 ? accounts : ['現金'], 
    categories: categories.length > 0 ? categories : ['食', '收入'], 
    currencies: fallbackCurrencies 
  };
}

function saveCustomSettings(settings) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("找不到試算表");

  let sheet = ss.getSheetByName("系統設定") || ss.insertSheet("系統設定");
  sheet.clear();
  sheet.getRange(1, 1, 1, 2).setValues([["帳戶清單", "分類清單"]]).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  
  const accounts = (settings.accounts || []).map(a => String(a).trim()).filter(Boolean);
  const categories = (settings.categories || []).map(c => String(c).trim()).filter(Boolean);
  const rows = [];
  for (let i = 0; i < Math.max(accounts.length, categories.length); i++) {
    rows.push([accounts[i] || "", categories[i] || ""]);
  }
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  sheet.setFrozenRows(1);
  return { success: true, message: "已成功儲存自訂設定至試算表！" };
}

function getSheetData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return [];
  const sheet = ss.getSheetByName("記帳資料") || ss.getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const data = [];
  const timeZone = Session.getScriptTimeZone();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] && !row[3]) continue;

    let dateStr = row[0] instanceof Date ? Utilities.formatDate(row[0], timeZone, "yyyy-MM-dd") : row[0];
    let timeStr = row[1] instanceof Date ? Utilities.formatDate(row[1], timeZone, "HH:mm") : String(row[1] || "").slice(0, 5);

    data.push({
      id: i + 1,
      rowNumber: i + 1,
      date: String(dateStr || "").trim(),
      time: String(timeStr || "").trim(),
      account: String(row[2] || "現金").trim(),
      name: String(row[3] || "未命名項目").trim(),
      category: String(row[4] || "食").trim(),
      currency: String(row[5] || "TWD").trim().toUpperCase(),
      amount: Number(row[6]) || 0,
      note: String(row[7] || "").trim()
    });
  }
  return data;
}

function addTransaction(item) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("找不到試算表");
    let sheet = ss.getSheetByName("記帳資料") || ss.getActiveSheet();
    const timeZone = Session.getScriptTimeZone();

    const category = String(item.category || "食").trim();
    let rawAmount = Number(item.amount) || 0;

    const incomeCategories = ['收入', '初始資產', '代墊回收'];
    if (!incomeCategories.includes(category)) {
      rawAmount = -Math.abs(rawAmount);
    } else {
      rawAmount = Math.abs(rawAmount);
    }

    const rowData = [
      String(item.date || Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd")).trim(),
      String(item.time || Utilities.formatDate(new Date(), timeZone, "HH:mm")).trim(),
      String(item.account || "現金").trim(),
      String(item.name || "未命名項目").trim(),
      category,
      String(item.currency || 'TWD').trim().toUpperCase(),
      rawAmount,
      String(item.note || "").trim()
    ];

    sheet.appendRow(rowData);
    const newRowNumber = sheet.getLastRow();

    return { 
      success: true, 
      message: "成功寫入記帳紀錄！", 
      rowNumber: newRowNumber 
    };
  } catch (error) {
    throw new Error("寫入試算表失敗: " + error.message);
  }
}

function batchAddTransactions(items) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("找不到試算表");
    let sheet = ss.getSheetByName("記帳資料") || ss.getActiveSheet();
    const timeZone = Session.getScriptTimeZone();
    const incomeCategories = ['收入', '初始資產', '代墊回收'];

    const rows = items.map(item => {
      const category = String(item.category || "食").trim();
      let rawAmount = Number(item.amount) || 0;
      if (!incomeCategories.includes(category)) {
        rawAmount = -Math.abs(rawAmount);
      } else {
        rawAmount = Math.abs(rawAmount);
      }

      return [
        String(item.date || Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd")).trim(),
        String(item.time || Utilities.formatDate(new Date(), timeZone, "HH:mm")).trim(),
        String(item.account || "現金").trim(),
        String(item.name || "未命名項目").trim(),
        category,
        String(item.currency || 'TWD').trim().toUpperCase(),
        rawAmount,
        String(item.note || "").trim()
      ];
    });

    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 8).setValues(rows);
    }
    return { success: true, count: rows.length };
  } catch (error) {
    throw new Error("批次寫入試算表失敗: " + error.message);
  }
}

function updateTransaction(rowNumber, updatedItem) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("找不到試算表");
  const sheet = ss.getSheetByName("記帳資料") || ss.getActiveSheet();
  const rowIndex = Number(rowNumber);
  if (!rowIndex || rowIndex < 2 || rowIndex > sheet.getLastRow()) throw new Error("無效的資料列編號");

  sheet.getRange(rowIndex, 1, 1, 8).setValues([[
    String(updatedItem.date || "").trim(),
    String(updatedItem.time || "").trim(),
    String(updatedItem.account || "現金").trim(),
    String(updatedItem.name || "未命名項目").trim(),
    String(updatedItem.category || "食").trim(),
    String(updatedItem.currency || 'TWD').trim().toUpperCase(),
    Number(updatedItem.amount) || 0,
    String(updatedItem.note || "").trim()
  ]]);
  return { success: true, message: "成功更新紀錄！" };
}

function deleteTransaction(rowNumber) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("找不到試算表");
  const sheet = ss.getSheetByName("記帳資料") || ss.getActiveSheet();
  const rowIndex = Number(rowNumber);
  if (!rowIndex || rowIndex < 2 || rowIndex > sheet.getLastRow()) throw new Error("無效的資料列編號");
  sheet.deleteRow(rowIndex);
  return { success: true, message: "成功刪除紀錄！" };
}

function getExchangeRates() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('EXCHANGE_RATES_TWD');
  if (cached) { try { return JSON.parse(cached); } catch (e) {} }

  const fallback = { base: "TWD", rates: { TWD: 1, USD: 0.03125, JPY: 4.65, KRW: 41.5, EUR: 0.0285, CNY: 0.225, GBP: 0.0245, HKD: 0.244, SGD: 0.0418, THB: 1.08, AUD: 0.0475 } };
  try {
    const res = UrlFetchApp.fetch("https://open.er-api.com/v6/latest/TWD", { muteHttpExceptions: true });
    if (res.getResponseCode() === 200) {
      const json = JSON.parse(res.getContentText());
      if (json && json.rates) {
        const data = { base: "TWD", updated: json.time_last_update_utc || new Date().toISOString(), rates: json.rates };
        cache.put('EXCHANGE_RATES_TWD', JSON.stringify(data), 21600);
        return data;
      }
    }
  } catch (err) {}
  return fallback;
}

function syncExchangeRatesToast() {
  getExchangeRates();
  safeToast('💱 匯率同步完成！', '即時匯率更新', 3);
}

function promptSetApiKey() {
  const ui = getSafeUi();
  if (!ui) {
    console.warn("無法開啟提示視窗，請在 Google 試算表畫面執行。");
    return;
  }
  const result = ui.prompt('🔑 設定 Gemini API Key', '請輸入您的 Google AI Studio API Key：', ui.ButtonSet.OK_CANCEL);
  if (result.getSelectedButton() === ui.Button.OK) {
    const key = result.getResponseText().trim();
    if (key) {
      PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', key);
      ui.alert('✅ API Key 已成功儲存！');
    }
  }
}

function callGeminiBookkeeper(userMessage, imageBase64, mimeType, autoSave = false) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) return { reply: "⚠️ 尚未設定 GEMINI_API_KEY！請至試算表上方選單點選「設定/更新 Gemini API Key」。", parsedTransactions: [] };

  const settings = getCustomSettings();
  const systemPrompt = `You are an expert multilingual bookkeeping assistant.
Current Date: ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd")}.
Valid Categories: ${JSON.stringify(settings.categories)}.
Valid Accounts: ${JSON.stringify(settings.accounts)}.
Output JSON schema:
{
  "reply": "Friendly response in Traditional Chinese (zh-TW)",
  "transactions": [
    {
      "name": "Item name",
      "amount": -100, // Expense MUST be negative number, Income MUST be positive number
      "currency": "TWD", // 3-letter uppercase ISO code
      "category": "食", // Must match one of valid categories
      "account": "現金", // Must match one of valid accounts
      "date": "YYYY-MM-DD",
      "time": "HH:mm",
      "note": "Any additional note"
    }
  ]
}`;

  const parts = [];
  if (imageBase64) {
    parts.push({ inlineData: { data: imageBase64.replace(/^data:image\/\w+;base64,/, ""), mimeType: mimeType || "image/jpeg" } });
  }
  parts.push({ text: systemPrompt + "\n\nUser Input: " + (userMessage || "請辨識收據與消費內容") });

  const payload = { 
    contents: [{ parts: parts }], 
    generationConfig: { 
      responseMimeType: "application/json", 
      temperature: 0.1 
    } 
  };
  
  const modelsToTry = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];
  let lastError = null;

  for (let m = 0; m < modelsToTry.length; m++) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelsToTry[m]}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    try {
      const res = UrlFetchApp.fetch(url, { 
        method: "post", 
        contentType: "application/json", 
        payload: JSON.stringify(payload), 
        muteHttpExceptions: true 
      });
      
      if (res.getResponseCode() === 200) {
        const json = JSON.parse(res.getContentText());
        const parsed = JSON.parse(json.candidates[0].content.parts[0].text);
        const txs = parsed.transactions || [];

        return { 
          reply: parsed.reply || "解析成功！請核對以下記帳明細：", 
          parsedTransactions: txs 
        };
      }
      lastError = res.getContentText();
    } catch (err) { 
      lastError = err.toString(); 
    }
  }
  return { reply: "⚠️ 調用 Gemini API 發生錯誤：" + lastError, parsedTransactions: [] };
}
