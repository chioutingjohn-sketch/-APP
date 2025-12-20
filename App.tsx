
import React, { useState, useEffect } from 'react';
import DateSelector from './components/DateSelector.tsx';
import ReportDisplay from './components/ReportDisplay.tsx';
import { generateReport } from './services/geminiService.ts';
import { LoadingState, ReportType } from './types.ts';

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

  // 自動化流程：啟動時自動讀取當日數據並生成盤後速報
  useEffect(() => {
    handleGenerate('daily');
  }, []);

  const handleGenerate = async (type: ReportType) => {
    // 確保有日期資料
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    if (type === 'analysis' && !startDate) {
      setErrorMsg("請選擇起始日期以生成市場分析報告");
      setLoadingState(LoadingState.ERROR);
      return;
    }

    setLoadingState(LoadingState.LOADING);
    setErrorMsg(null);
    setReportContent('');
    setReportSources([]);

    try {
      const { text, sources } = await generateReport(targetDate, type, startDate);
      setReportContent(text);
      setReportSources(sources);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error(err);
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
              <p className="text-[10px] text-blue-200 font-light tracking-wider">美債市場盤後速報自動化生成器</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <div className="text-xs text-blue-200 bg-blue-900/50 px-3 py-1.5 rounded-full border border-blue-700/50">
               Gemini 3 Flash Online
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">市場觀測站</h2>
          <p className="text-gray-600 max-w-2xl">
            系統已自動讀取 API 配置，並於啟動時自動為您整理最新的美債市場動態。您也可以手動選擇不同日期或進行深度市場分析。
          </p>
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
                <p className="text-sm text-red-600">{errorMsg}</p>
                <button 
                  onClick={() => handleGenerate('daily')}
                  className="mt-2 text-xs text-red-700 font-semibold underline hover:text-red-800"
                >
                  嘗試重新載入
                </button>
              </div>
            </div>
          </div>
        )}

        {loadingState === LoadingState.SUCCESS && (
           <ReportDisplay content={reportContent} sources={reportSources} />
        )}

        {loadingState === LoadingState.LOADING && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-bond-primary border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">正在自動抓取並分析最新美債數據...</p>
            <p className="text-xs text-gray-400 mt-2">使用 Google Search Grounding 技術進行即時校對</p>
          </div>
        )}

        {loadingState === LoadingState.IDLE && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <i className="fas fa-newspaper text-6xl text-gray-200 mb-4"></i>
            <p className="text-gray-500 font-medium">請選擇報告類型並點擊生成按鈕</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} US Bond Market Brief Tool. 自動化數據處理流程。</p>
          <p className="text-xs text-gray-400 mt-1">本報告僅供參考，投資人應獨立判斷並自負風險。</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
