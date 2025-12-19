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
`;

export const generateReport = async (date: string, type: ReportType, startDate?: string): Promise<{ text: string, sources: any[] }> => {
  // Use VITE_GEMINI_API_KEY for Vite/Zeabur environments, with process.env.API_KEY as fallback.
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("找不到 API Key。請確保環境變數 VITE_GEMINI_API_KEY 已正確設定。");
  }

  const ai = new GoogleGenAI({ apiKey });

  let specificRequest = "";
  let searchContext = "";

  if (type === 'daily') {
    specificRequest = `GENERATE DAILY REPORT. Target Date: ${date}`;
    searchContext = `Search for US Treasury closing yields (2Y, 10Y, 30Y) for ${date} and recent market news.`;
  } else if (type === 'weekly') {
    specificRequest = `GENERATE WEEKLY REPORT. Week ending: ${date}`;
    searchContext = `Search for US Treasury market summary for the week ending ${date}.`;
  } else if (type === 'monthly') {
    if (!startDate) throw new Error("Generating a monthly report requires a Start Date.");
    specificRequest = `GENERATE MONTHLY STRATEGIC REPORT. Period: ${startDate} to ${date}.`;
    searchContext = `Search for major US bond market events and technical levels between ${startDate} and ${date}.`;
  }

  const prompt = `
  Please generate the US Treasury Market report based on your system instructions.
  Target Date: ${date}
  ${startDate ? `Start Date: ${startDate}` : ''}
  
  Request Details: ${specificRequest}
  Search Focus: ${searchContext}
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

    // Directly access the generated text content from the response
    const text = response.text || "No content generated.";
    
    // Extract website URLs from groundingChunks to display references
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
    throw new Error(error.message || "生成報告時發生錯誤，請稍後再試。");
  }
};