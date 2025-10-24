import { X, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

function Artifact({ content, type, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTitle = () => {
    switch (type) {
      case 'meditation': return 'Meditação';
      case 'hymn': return 'Hinário';
      case 'prayer': return 'Oração';
      default: return 'Conteúdo';
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'meditation': return 'from-amber-50 to-yellow-50';
      case 'hymn': return 'from-purple-50 to-pink-50';
      case 'prayer': return 'from-blue-50 to-indigo-50';
      default: return 'from-gray-50 to-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className={`bg-gradient-to-r ${getGradient()} px-6 py-4 border-b border-gray-200 flex items-center justify-between`}>
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="Copiar"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-800 mb-3 mt-6">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-800">{children}</p>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4 bg-blue-50 py-2 rounded-r">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                    {children}
                  </a>
                ),
                ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
                hr: () => <hr className="my-6 border-gray-300" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Artifact;