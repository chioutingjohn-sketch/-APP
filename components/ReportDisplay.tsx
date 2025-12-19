import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportDisplayProps {
  content: string;
  sources?: Array<{ title: string; url: string }>;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ content, sources }) => {
  if (!content) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header Decoration */}
      <div className="h-2 bg-gradient-to-r from-bond-primary to-bond-secondary"></div>
      
      <div className="p-8 report-content">
        {/* Markdown Rendering */}
        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-bond-primary prose-a:text-blue-600 prose-table:border-collapse prose-th:bg-gray-100 prose-th:p-2 prose-td:p-2 prose-td:border prose-th:border">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom table styling via Tailwind prose is good, but let's enhance specific elements if needed
              h1: ({node, ...props}) => <h1 className="text-2xl md:text-3xl font-bold text-bond-primary mb-6 border-b pb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-8 mb-4" {...props} />,
              table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="min-w-full text-sm text-left border border-gray-200" {...props} /></div>,
              th: ({node, ...props}) => <th className="bg-gray-50 text-gray-700 font-bold px-4 py-2 border border-gray-200" {...props} />,
              td: ({node, ...props}) => <td className="px-4 py-2 border border-gray-200 text-gray-600" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
              li: ({node, ...props}) => <li className="mb-2 text-gray-700" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Sources Section */}
        {sources && sources.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
              參考來源 (Sources)
            </h4>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 hover:bg-gray-100 text-xs text-blue-600 rounded-full border border-gray-200 transition-colors"
                >
                  <i className="fas fa-external-link-alt text-[10px]"></i>
                  <span className="truncate max-w-[150px]">{source.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Copy Action */}
      <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={() => {
            navigator.clipboard.writeText(content);
            alert("報告內容已複製到剪貼簿！");
          }}
          className="text-sm font-medium text-gray-600 hover:text-bond-primary flex items-center gap-2 transition-colors"
        >
          <i className="fas fa-copy"></i>
          複製全文
        </button>
      </div>
    </div>
  );
};

export default ReportDisplay;