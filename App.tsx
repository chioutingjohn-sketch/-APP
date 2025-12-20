
import React, { useState, useEffect } from 'react';
import DateSelector from './components/DateSelector.tsx';
import ReportDisplay from './components/ReportDisplay.tsx';
import { generateReport } from './services/geminiService.ts';
import { LoadingState, ReportType } from './types.ts';

// Fix global window declaration conflict by using any to bypass environmental type mismatches
declare global {
  interface Window {
    aistudio: any;
  }
}

const App: React.FC = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });

  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [reportContent, setReportContent] = useState<string>('');
  const [reportSources, setReportSources] = useState<Array<{ title: string; url: string }>>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio) {
      try {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) {
        console.error("Failed to check API key status", e);
      }
    }
  };

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success after triggering the dialog to avoid race conditions with key detection
      setHasKey(true);
    }
  };

  const handleGenerate = async (type: ReportType) => {
    if (!date) return;
    
    // Ensure API Key selection is handled as per model requirements
    if (window.aistudio) {
      const isKeySelected = await window.aistudio.hasSelectedApiKey();
      if (!isKeySelected) {
        await handleOpenKeyDialog();
      }
    }

    if (type === 'monthly' && !startDate) {
      setErrorMsg("請選擇起始日期以生成市場月報");
      setLoadingState(LoadingState.ERROR);
      return;
    }

    setLoadingState(LoadingState.LOADING);
    setErrorMsg(null);
    setReportContent('');
    setReportSources([]);

    try {
      const { text, sources } = await generateReport(date, type, startDate);
      setReportContent(text);
      setReportSources(sources);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      
      // Mandatory: Handle "Requested entity was not found." by resetting key state and prompting selection
      if (err.message?.includes("Requested entity was not found.")) {
        setHasKey(false);
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
        }
      }

      setErrorMsg(err.message || "發生未知錯誤，請稍後再試。");
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-bond-primary text-white shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-chart-line text-2xl text-white"></i>
            <div>
              <h1 className="text-lg font-bold tracking-wide">US Bond Market Brief</h1>
              <p className="text-[10px] text-blue-200 font-light tracking-wider">美債市場盤後速報生成器</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleOpenKeyDialog}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
                hasKey 
                ? 'bg-blue-900/50 border-blue-700/50 text-blue-100' 
                : 'bg-amber-500/20 border-amber-500/50 text-amber-200 hover:bg-amber-500/30'
              }`}
            >
              <i className={`fas ${hasKey ? 'fa-key' : 'fa-exclamation-triangle'}`}></i>
              {hasKey ? '已設定 API Key' : '設定 API Key'}
            </button>
            <div className="text-xs text-blue-200 bg-blue-900/50 px-3 py-1.5 rounded-full border border-blue-700/50 hidden md:block">
               Gemini 3 Flash
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">市場觀測站</h2>
            <p className="text-gray-600 max-w-2xl">
              請選擇報告類型，系統將利用 Google Search Grounding 技術自動整理公債殖利率變化與重大經濟數據。
            </p>
          </div>
        </div>

        <DateSelector 
          selectedDate={date} 
          onDateChange={setDate}
          selectedStartDate={startDate}
          onStartDateChange={setStartDate}
          onGenerate={handleGenerate}
          isLoading={loadingState === LoadingState.LOADING}
        />

        {loadingState === LoadingState.ERROR && (
          <div className="bg-red-50 border-l-4 border-red-500 p-5 mb-6 rounded-r shadow-sm animate-fade-in">
            <div className="flex items-start">
              <i className="fas fa-exclamation-circle text-red-500 mr-4 text-2xl mt-1"></i>
              <div className="flex-grow">
                <p className="text-sm text-red-700 font-bold mb-1">生成失敗</p>
                <p className="text-sm text-red-600 mb-3">{errorMsg}</p>
                {errorMsg?.includes("429") && (
                  <button 
                    onClick={handleOpenKeyDialog}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-plug"></i> 立即切換為我的 API Key
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {loadingState === LoadingState.SUCCESS && (
           <ReportDisplay content={reportContent} sources={reportSources} />
        )}

        {loadingState === LoadingState.IDLE && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <i className="fas fa-newspaper text-6xl text-gray-200 mb-4"></i>
            <p className="text-gray-500 font-medium">請選擇報告類型並點擊生成按鈕</p>
            <p className="text-xs text-gray-400 mt-2">若遇到 429 錯誤，請使用自己的 API Key 以獲得專屬配額。</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} US Bond Market Brief Tool. Data retrieved via Google Search Grounding.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs text-blue-500 hover:underline">API 計費說明</a>
            <span className="text-gray-300">|</span>
            <p className="text-xs text-gray-400">本報告僅供參考，投資人應獨立判斷並自負風險。</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
