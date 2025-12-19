import React, { useState } from 'react';
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

  const handleGenerate = async (type: ReportType) => {
    if (!date) return;
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
          <div className="text-xs text-blue-200 bg-blue-900/50 px-3 py-1 rounded-full border border-blue-700/50 hidden sm:block">
             Powered by Gemini 3 Flash
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">市場觀測站</h2>
          <p className="text-gray-600">
            請選擇報告類型（盤後速報、市場週報、市場月報），系統將自動整理公債殖利率變化、Fed 官員談話及重大經濟數據。
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
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-sm animate-fade-in">
            <div className="flex items-start">
              <i className="fas fa-exclamation-circle text-red-500 mr-3 text-xl mt-1"></i>
              <div>
                <p className="text-sm text-red-700 font-bold">生成失敗</p>
                <p className="text-sm text-red-600">{errorMsg}</p>
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
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} US Bond Market Brief Tool. Data retrieved via Google Search Grounding.</p>
          <p className="text-xs mt-1 text-gray-400">本報告僅供參考，投資人應獨立判斷並自負風險。</p>
        </div>
      </footer>
    </div>
  );
};

export default App;