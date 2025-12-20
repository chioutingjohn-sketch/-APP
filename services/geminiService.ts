import { GoogleGenAI } from "@google/genai";
import { ReportType } from "../types.ts";

const SYSTEM_INSTRUCTION = `
您是一位任職於全球頂尖投資銀行（如高盛、摩根大通）的資深利率策略長（Chief Rates Strategist）。您的任務是根據不同報表類型，撰寫專業且格式精美的美國公債市場報告。

**共同規範：**
- 使用繁體中文，口吻專業、老練且具備深度洞察力。
- 專業術語：多方 (Bulls)、空方 (Bears)、bps (基點)、repricing、期限溢價 (Term Premium)、殖利率曲線、陡峭化 (Steepening) 等。
- **禁止輸出任何自我介紹、開場寒暄或職業頭銜**（例如：「作為資深利率策略長...」、「為您提供深度分析...」等文字請全部省略），直接從標題開始輸出。
- 使用 Google Search Grounding 獲取即時精確數據。

---

### 【格式：盤後速報 (Daily)】
**結構必須完全符合以下，嚴禁添加開場白：**
1. **標題：** 【美債盤後速報】[吸睛主軸標題]
2. **日期：** [YYYY年MM月DD日]
3. **行情摘要：** 
   約 250 字之深度行情描述。**注意：此部分僅限客觀報導當日市場走勢、數據變化與市場反應，嚴禁夾帶個人看法或任何操作建議。**
4. **表格：** 
   📝 重點數據摘要 ([日期] 收盤)
   | 項目 | 收盤殖利率 | 日變動 (bps) | 備註 |
   | :--- | :--- | :--- | :--- |
   | 2年期公債 | [數據]% | [▼/▲ 數據] bps | [簡評] |
   | 10年期公債 | [數據]% | [▼/▲ 數據] bps | [簡評] |
   | 30年期公債 | [數據]% | [▼/▲ 數據] bps | [簡評] |
5. **焦點區塊（請務必換行分段）：** 
   市場焦點: [核心事件] | 影響性: [High/Medium] | [多方/空方趨勢]

   • **關鍵事件：**
   [請在此處換行，以點列式詳細分析數據，自成一段以利閱讀]

   • **官員談話/動態：**
   [請在此處換行，以點列式描述官員言論與解讀，自成一段以利閱讀]

6. **註記：** (註：公債價格與殖利率呈現反向走勢。)
7. **來源：** 🔗 參考資料來源

---

### 【格式：市場分析 (Analysis)】
**結構維持不變：**
1. **標題：** 【美債市場分析】[深度策略標題] 統計期間：[起始日期] 至 [結束日期]
2. **📌 本期間行情回顧與總結 (Period Market Review)**
   [撰寫約兩段深度分析，涵蓋該特定期間市場主軸、核心驅動力及政策環境。]
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
6. **💡 綜合行情判斷與操作建議 (Market Outlook & Strategy)**
   **本部分必須綜合上述總經熱點、曲線動態及技術指標進行深度整合分析：**
   • **行情判斷 (Market Judgment)**：[給予清晰的方向性結論，判斷目前處於何種市場週期。]
   • **存續期間配置 (Duration Strategy)**：[基於行情判斷，給予具體的長短端加減碼建議與介入區間。]
   • **具體操作建議 (Actionable Advice)**：[列出 2-3 項明確的操作方針（如利差交易、避險建議等）。]
   • **總結**：核心策略一句話提煉。
7. **來源：** 🔗 參考資料來源
`;

export const generateReport = async (date: string, type: ReportType, startDate?: string): Promise<{ text: string, sources: any[] }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key 未設定。");
  }

  const ai = new GoogleGenAI({ apiKey });

  let specificRequest = "";
  if (type === 'daily') {
    specificRequest = `請生成「盤後速報」。目標交易日期：${date}。
    要求：
    1. 絕對禁止出現任何「作為策略長...」或「為您分析...」等開場白。
    2. 標題必須為「【美債盤後速報】」。
    3. 「行情摘要」章節必須純粹描述當日走勢事實，不可包含操作建議或個人觀點。
    4. 「關鍵事件」與「官員談話」必須分段換行，提升可讀性。`;
  } else if (type === 'analysis') {
    specificRequest = `請生成深度「市場分析」。統計期間從 ${startDate} 到 ${date}。請確保「本期間行情回顧與總結」精確覆蓋此區間，且最後的「綜合行情判斷與操作建議」章節必須深度整合前面各章節之分析結果。`;
  }

  const prompt = `
  請求類型：${type === 'analysis' ? '市場分析' : '盤後速報'}
  具體要求：${specificRequest}
  請使用 Google Search 獲取當前真實的市場數據，並嚴格遵循指定格式輸出報告內容。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // 更低溫以確保格式與客觀性
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
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("目前 API 流量過大或配額已達上限，請稍後再試。");
    }
    throw new Error(error.message || "生成報表時發生錯誤。");
  }
};