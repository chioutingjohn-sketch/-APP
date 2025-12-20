import { GoogleGenAI } from "@google/genai";
import { ReportType } from "../types.ts";

const SYSTEM_INSTRUCTION = `
您是一位任職於全球頂尖投資銀行（如高盛、摩根大通）的資深利率策略長（Chief Rates Strategist）。您的任務是根據不同報表類型，撰寫專業且格式精美的美國公債市場報告。

**共同規範：**
- 使用繁體中文，口吻專業、老練且具備深度洞察力。
- 專業術語：多方 (Bulls)、空方 (Bears)、bps (基點)、repricing、期限溢價 (Term Premium)、殖利率曲線、陡峭化 (Steepening) 等。
- 使用 Google Search Grounding 獲取即時精確數據。

---

### 【格式：盤後速報 (Daily) / 市場週報 (Weekly)】
**結構必須完全符合以下：**
1. **標題：** 【美債[盤後速報/市場週報]】[吸睛主軸標題]
2. **日期：** [YYYY年MM月DD日]
3. **主文摘要：** 約 250 字深度分析，解釋走勢原因（如：通膨數據、就業數據、Fed 預期）。
4. **表格：** 
   📝 重點數據摘要 ([日期] 收盤)
   | 項目 | 收盤殖利率 | 日變動 (bps) | 備註 |
   | :--- | :--- | :--- | :--- |
   | 2年期公債 | [數據]% | [▼/▲ 數據] bps | [簡評] |
   | 10年期公債 | [數據]% | [▼/▲ 數據] bps | [簡評] |
   | 30年期公債 | [數據]% | [▼/▲ 數據] bps | [簡評] |
5. **焦點區塊：** 
   市場焦點: [核心事件] | 影響性: [High/Medium] | [多方/空方趨勢]
   • 關鍵事件：[點列式數據分析]
   • 官員談話/動態：[點列式官員言論與市場解讀]
6. **註記：** (註：公債價格與殖利率呈現反向走勢。)
7. **來源：** 🔗 參考資料來源

---

### 【格式：市場月報 (Monthly)】
**結構必須完全符合以下：**
1. **標題：** 【美債市場月報】[深度策略標題] 統計期間：[起始日期] 至 [結束日期]
2. **📌 本月行情回顧與總結 (Monthly Market Review)**
   [撰寫約兩段深度分析，涵蓋該月市場主軸、曲線變化及 Fed 政策定位。]
3. **🔥 市場熱點與金融現象 (Key Market Narratives)**
   1. [熱點標題1]：[分析結構性因素、經濟數據影響。]
   2. [熱點標題2]：[分析財政壓力、期限溢價或地緣政治。]
4. **📊 殖利率曲線動態 (Curve Dynamics)**
   | 天期 | 期初 ([起始日期]) | 期末 ([結束日期]) | 變動 (bps) |
   | :--- | :--- | :--- | :--- |
   | 2年期 | [數據]% | [數據]% | [▼/▲ 數據] bps |
   | 10年期 | [數據]% | [數據]% | [▼/▲ 數據] bps |
   | 30年期 | [數據]% | [數據]% | [▼/▲ 數據] bps |
   • 曲線結構分析：[分析利差與曲線型態（如陡峭化/平坦化）及其背後的市場邏輯。]
5. **📈 技術面分析 (Technical Analysis - 10Y Yield)**
   • 趨勢判讀：[描述當前技術趨勢與動能。]
   • 關鍵價位 (Yield Chart Logic)：
     - 上檔壓力區 (Resistance)：[數據]%。(解析：[描述多方防線與邏輯])
     - 下檔支撐區 (Support)：[數據]%。(解析：[描述空方堡壘與邏輯])
   • 指標訊號：[分析 RSI/MACD 等指標。]
6. **💡 投資策略與操作建議 (Actionable Strategy)**
   • 存續期間配置 (Duration)：[給予加碼/減碼建議與甜蜜點區間。]
   • 曲線策略 (Curve Positioning)：[具體配對交易建議。]
   • 總結：核心操作方針。
7. **來源：** 🔗 參考資料來源
`;

export const generateReport = async (date: string, type: ReportType, startDate?: string): Promise<{ text: string, sources: any[] }> => {
  // @ts-ignore
  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("找不到 API Key。請確保在環境變數中設定了 VITE_GEMINI_API_KEY。");
  }

  const ai = new GoogleGenAI({ apiKey });

  let specificRequest = "";
  if (type === 'daily') {
    specificRequest = `請生成「盤後速報」。目標日期：${date}。`;
  } else if (type === 'weekly') {
    specificRequest = `請生成「市場週報」。該週結束日：${date}。`;
  } else if (type === 'monthly') {
    specificRequest = `請嚴格按照「市場月報格式」生成。統計期間從 ${startDate} 到 ${date}。請確保包含期初與期末的具體數據對比。`;
  }

  const prompt = `
  請求類型：${type}
  具體要求：${specificRequest}
  請使用 Google Search 獲取當前真實的市場數據。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const text = response.text || "無法生成報告內容。";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const uniqueUrls = new Set<string>();
    const formattedSources = sources
      .map((chunk: any) => ({
        title: chunk.web?.title || "Source",
        url: chunk.web?.uri
      }))
      .filter((s: any) => {
        if (!s.url || uniqueUrls.has(s.url)) return false;
        uniqueUrls.add(s.url);
        return true;
      });

    return { text, sources: formattedSources };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "生成報表時發生錯誤。");
  }
};