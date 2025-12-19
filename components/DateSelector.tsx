import React, { useState } from 'react';
import { ReportType } from '../types';

interface DateSelectorProps {
  selectedDate: string;
  selectedStartDate: string;
  onDateChange: (date: string) => void;
  onStartDateChange: (date: string) => void;
  onGenerate: (type: ReportType) => void;
  isLoading: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({ 
  selectedDate, 
  selectedStartDate,
  onDateChange, 
  onStartDateChange,
  onGenerate, 
  isLoading 
}) => {
  const [activeTab, setActiveTab] = useState<ReportType>('daily');

  const handleTabChange = (tab: ReportType) => {
    setActiveTab(tab);
  };

  const handleGenerateClick = () => {
    onGenerate(activeTab);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 bg-gray-50/50">
        <button
          onClick={() => handleTabChange('daily')}
          className={`flex-1 py-4 text-sm font-semibold text-center transition-colors border-b-2 ${
            activeTab === 'daily' 
              ? 'border-bond-primary text-bond-primary bg-white' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fas fa-file-invoice-dollar mr-2"></i>
          盤後速報 (Daily)
        </button>
        <button
          onClick={() => handleTabChange('weekly')}
          className={`flex-1 py-4 text-sm font-semibold text-center transition-colors border-b-2 ${
            activeTab === 'weekly' 
              ? 'border-bond-secondary text-bond-secondary bg-white' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fas fa-calendar-week mr-2"></i>
          市場週報 (Weekly)
        </button>
        <button
          onClick={() => handleTabChange('monthly')}
          className={`flex-1 py-4 text-sm font-semibold text-center transition-colors border-b-2 ${
            activeTab === 'monthly' 
              ? 'border-bond-success text-bond-success bg-white' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <i className="fas fa-chart-area mr-2"></i>
          市場月報 (Monthly)
        </button>
      </div>

      <div className="p-6">
        {/* Description Text */}
        <div className="mb-6 text-sm text-gray-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
          {activeTab === 'daily' && <p><i className="fas fa-info-circle text-bond-primary mr-2"></i>針對單一交易日，快速整理收盤數據與當日市場焦點。</p>}
          {activeTab === 'weekly' && <p><i className="fas fa-info-circle text-bond-secondary mr-2"></i>針對過去一週，回顧整週行情變化、重要數據發布與 Fed 官員談話。</p>}
          {activeTab === 'monthly' && <p><i className="fas fa-info-circle text-bond-success mr-2"></i>針對自訂區間，整合<strong>總經趨勢</strong>、<strong>市場熱點</strong>與<strong>技術分析</strong>，提供全方位的策略報告。</p>}
        </div>

        {/* Date Inputs */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          
          {/* Start Date - Only visible for Monthly */}
          {activeTab === 'monthly' && (
            <div className="w-full md:w-1/2 animate-fade-in-up">
              <label htmlFor="start-date" className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-bond-success mr-1"><i className="fas fa-calendar-alt"></i></span>
                起始日期 (Start Date)
              </label>
              <input
                type="date"
                id="start-date"
                value={selectedStartDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bond-success focus:border-bond-success outline-none transition-colors bg-gray-50"
              />
            </div>
          )}

          {/* End/Target Date - Always visible */}
          <div className={`w-full ${activeTab === 'monthly' ? 'md:w-1/2' : 'md:w-full'}`}>
            <label htmlFor="report-date" className="block text-sm font-semibold text-gray-700 mb-2">
              <span className={`${activeTab === 'monthly' ? 'text-bond-success' : activeTab === 'weekly' ? 'text-bond-secondary' : 'text-bond-primary'} mr-1`}>
                <i className="fas fa-flag-checkered"></i>
              </span>
              {activeTab === 'monthly' ? '結束日期 (End Date)' : activeTab === 'weekly' ? '該週結束日期 (End Date)' : '交易日期 (Trade Date)'}
            </label>
            <input
              type="date"
              id="report-date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none transition-colors
                ${activeTab === 'monthly' ? 'focus:ring-bond-success focus:border-bond-success' : 
                  activeTab === 'weekly' ? 'focus:ring-bond-secondary focus:border-bond-secondary' : 
                  'focus:ring-bond-primary focus:border-bond-primary'}`}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateClick}
          disabled={isLoading || !selectedDate || (activeTab === 'monthly' && !selectedStartDate)}
          className={`w-full py-4 rounded-lg font-bold text-lg text-white transition-all shadow-md flex items-center justify-center gap-2
            ${isLoading || !selectedDate || (activeTab === 'monthly' && !selectedStartDate)
              ? 'bg-gray-300 cursor-not-allowed' 
              : activeTab === 'monthly' 
                ? 'bg-gradient-to-r from-bond-success to-emerald-600 hover:to-emerald-700 active:scale-95' 
                : activeTab === 'weekly'
                  ? 'bg-gradient-to-r from-bond-secondary to-slate-600 hover:to-slate-700 active:scale-95'
                  : 'bg-gradient-to-r from-bond-primary to-blue-700 hover:to-blue-800 active:scale-95'
            }`}
        >
          {isLoading ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i> 生成中...
            </>
          ) : (
            <>
              <i className="fas fa-robot"></i> 生成 {activeTab === 'monthly' ? '市場月報' : activeTab === 'weekly' ? '市場週報' : '盤後速報'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DateSelector;