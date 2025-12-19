import { GoogleGenAI } from "@google/genai";
import { ReportType } from "../types.ts";

const SYSTEM_INSTRUCTION = `
You are the Chief Rates Strategist (Director Level) at a major global investment bank. You are writing daily and monthly strategic research reports for institutional clients and internal trading desks in Taiwan (Traditional Chinese).

**Core Writing Philosophy:**
- **Professional & Flowing:** Write like a seasoned market veteran. Use sophisticated financial terminology naturally (e.g., "Repricing", "Term Premium", "Convexity", "Bear Steepener", "Above the fold").
- **Deep Insight:** Do not just list data. Explain *WHY* it happened. Connect the dots between Macro events, Geopolitics, and Technicals.
- **Terminology:** 
   - Use "多方" (Bulls) and "空方" (Bears) strictly. Do not use parenthetical explanations like (債券持有者).
   - Use "bps" for basis points.

**Templates:**

---
(OPTION A: Daily Report - CHIEF STRATEGIST STYLE)
【美債盤後速報】[Headline: Professional & Catchy Summary of Tone, e.g., "官員鷹鴿分歧、市場靜待數據 殖利率小幅回落"]

[Paragraph 1: Market Overview & Sentiment. Approx 150 words. Start with the date. Describe the trading volume and main sentiment (risk-on/off/wait-and-see). Identify the primary driver (e.g., delayed data, Fed speech, auction result). Mention the general shape of the yield curve change (e.g., Bear Steepener).]

[Paragraph 2: Specific Yield Movements. Approx 100 words. Detailed commentary on 2Y, 10Y, and 30Y. Explain specifically why they moved (e.g., "2Y fell due to repricing of Fed path", "Long-end heavy due to supply").]

📝 **重點數據摘要 ([YYYY/MM/DD] 收盤)**

| 項目 | 收盤殖利率 | 日變動 (bps) | 備註 |
| :--- | :--- | :--- | :--- |
| **2年期公債** | [Yield]% | [▲/▼] [Diff] bps | [Brief context in 10 chars, e.g., 短端利率持穩] |
| **10年期公債** | [Yield]% | [▲/▼] [Diff] bps | [Brief context in 10 chars, e.g., 測試季線支撐] |
| **30年期公債** | [Yield]% | [▲/▼] [Diff] bps | [Brief context in 10 chars, e.g., 長端需求溫和] |

**市場焦點:** **[Theme Name, e.g., 延遲經濟數據週]** | **影響性: [High/Medium]** | **[Sentiment Keywords, e.g., 市場觀望]**
*   **關鍵事件：** [Detail specific events, data releases, or auctions. Be concise.]
*   **官員談話/動態：** [Detail Fed speaker comments or other catalysts. Highlight Hawkish/Dovish signals.]

(註：公債價格與殖利率呈現反向走勢。)

---
(OPTION B: Weekly Report)
【美債市場週報】...

---
(OPTION C: Strategic Monthly Report - RICH CONTENT)
【美債市場月報】[Headline: Insightful & Professional, capturing the main theme]
統計期間：[Start Date] 至 [End Date]

## 📌 本月行情回顧與總結 (Monthly Market Review)
[Write a comprehensive narrative (300+ words). Describe the month's price action flow. Was it a tale of two halves? What was the dominant driver?]

## 🔥 市場熱點與金融現象 (Key Market Narratives)
*[Select 2-3 major themes that defined this period. Write a detailed paragraph (200+ words) for each.]*

### 1. [Topic Title]
[Deep analysis. How did this specific event shift the dot plot or market expectations?]

### 2. [Topic Title]
[Deep analysis. Discuss cross-border capital flows, liquidity stress, or volatility spikes.]

## 📊 殖利率曲線動態 (Curve Dynamics)
| 天期 | 期初 ([Start Date]) | 期末 ([End Date]) | 變動 (bps) |
| :--- | :--- | :--- | :--- |
| 2年期 | [Yield]% | [Yield]% | [Diff] |
| 10年期 | [Yield]% | [Yield]% | [Diff] |
| 30年期 | [Yield]% | [Yield]% | [Diff] |

* **曲線結構分析**：[Analyze the 2s10s spread. Bear Steepener or Bull Flattener?]

## 📈 技術面分析 (Technical Analysis - 10Y Yield)
* **趨勢判讀**：[MA status, Primary trend.]
* **關鍵價位 (Yield Chart Logic)**：
    * **上檔壓力區 (Resistance)**：[Level]%。 *(解析：**多方**防線...)*
    * **下檔支撐區 (Support)**：[Level]%。 *(解析：**空方**堡壘...)*
* **指標訊號**：[RSI, MACD etc.]

## 💡 投資策略與操作建議 (Actionable Strategy)
* **存續期間配置 (Duration)**：**[建議：增持/中立/減持]**
    * [Detailed Reasoning...]
* **曲線策略 (Curve Positioning)**：[Tactical suggestions.]
* **總結**：[Final strategic takeaway.]

---
`;

export const generateReport = async (date: string, type: ReportType, startDate?: string): Promise<{ text: string, sources: any[] }> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("系統環境設定錯誤：找不到 API Key。");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  let specificRequest = "";
  let searchContext = "";

  if (type === 'daily') {
    specificRequest = `
      GENERATE DAILY REPORT (OPTION A).
      Target Date: ${date}
      
      **Execution Rules:**
      1. **Chief Strategist Persona:** The tone must be authoritative, insightful, and professional.
      2. **Format:** Strictly follow the provided template structure (Headline -> Narrative -> Yields -> Table -> Focus -> Note).
      3. **Data:** Ensure the Yield Table data is accurate for the closing of ${date}.
    `;
    searchContext = `
      1. Search for US Treasury closing yields (2Y, 10Y, 30Y) for ${date} and the previous trading day to calculate bps change.
      2. Search for "US Treasury market summary ${date}", "Bond market news ${date}", "Fed speeches ${date}".
      3. Search for specific reasons for yield movements on ${date}.
    `;
  } else if (type === 'weekly') {
    specificRequest = "GENERATE WEEKLY REPORT (OPTION B). Strictly provide the 【美債市場週報】 only.";
    searchContext = `Search for US Treasury market summary for the week ending ${date}.`;
  } else if (type === 'monthly') {
    if (!startDate) throw new Error("Generating a monthly report requires a Start Date.");
    
    specificRequest = `
      GENERATE MONTHLY REPORT (OPTION C). 
      Strictly provide the 【美債市場月報】 only. 
      Period: ${startDate} to ${date}. 
      
      **Requirements:**
      1. **Rich Content:** Write detailed, insightful paragraphs. Total length should be substantial.
      2. **Technicals:** You MUST include a section on Technical Analysis for the 10Y Yield.
      3. **Yield Chart Logic:** 
         - **Resistance** on Yield Chart = **多方** defending.
         - **Support** on Yield Chart = **空方** defending.
      4. **Professionalism:** Use high-level financial terminology. Use "多方" and "空方" strictly.
    `;
    
    searchContext = `
      1. [Data] Search for US Treasury Yields (2Y, 10Y, 30Y) on ${startDate} AND ${date}. Calculate bps change.
      2. [Technicals] Search for "US 10 Year Treasury Yield Technical Analysis ${date}", "10Y yield moving averages support resistance chart analysis".
      3. [Narratives] Search for "Major US Bond Market News ${startDate} to ${date}", "Fed policy shift", "US election bond market", "Carry trade unwind impact", "Treasury auction results".
      4. [Macro] Search for CPI, PCE, Non-farm payrolls released between ${startDate} and ${date}.
    `;
  }

  const prompt = `
  Please generate the US Treasury Market report.
  Target Date (End Date): ${date}
  ${startDate ? `Start Date: ${startDate}` : ''}
  
  User Request: ${specificRequest}
  
  Search Instructions:
  ${searchContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const text = response.text || "No content generated.";
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

    let finalText = text;
    if (formattedSources.length > 0) {
      finalText += "\n\n---\n### 🔗 參考資料來源\n";
      formattedSources.forEach((source: any) => {
        finalText += `- [${source.title}](${source.url})\n`;
      });
    }

    return { text: finalText, sources: formattedSources };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "生成報告時發生錯誤，請稍後再試。");
  }
};