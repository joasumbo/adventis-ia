import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { Copy, Check, FileText } from 'lucide-react';

function Message({ message, isStreaming = false, onOpenArtifact }) {
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const isUser = message.role === 'user';

  useEffect(() => {
    if (isStreaming && !isUser) {
      let index = 0;
      const text = message.content;
      
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 15);

      return () => clearInterval(timer);
    } else {
      setDisplayedText(message.content);
    }
  }, [message.content, isStreaming, isUser]);

  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
  }, [displayedText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
      <div className={`max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
        
        {/* Avatar e nome */}
        <div className={`flex items-center space-x-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {!isUser && (
            <>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Igreja_Adventista_Dia.svg/500px-Igreja_Adventista_Dia.svg.png"
                alt="AI"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs font-medium text-gray-600">Adventis IA</span>
            </>
          )}
          {isUser && (
            <>
              <span className="text-xs font-medium text-gray-600">Você</span>
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                V
              </div>
            </>
          )}
        </div>

        {/* Bubble */}
        <div className={`relative rounded-2xl px-4 py-3 shadow-sm ${
          isUser 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
        }`}>
          
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className={`mb-3 leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold mb-1 mt-2">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-3 italic my-2 bg-blue-50 py-1 rounded-r">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    {children}
                  </a>
                ),
                code({ inline, children, ...props }) {
                  return !inline ? (
                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto my-2">
                      <code {...props}>{children}</code>
                    </pre>
                  ) : (
                    <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                hr: () => <hr className="my-3 border-gray-300" />,
              }}
            >
              {displayedText}
            </ReactMarkdown>
          </div>

          {/* Hora */}
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-400'} text-right`}>
            {new Date(message.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Botões (só IA) */}
          {!isUser && !isStreaming && (
            <div className="flex items-center space-x-2 mt-2">
              {message.hasArtifact && (
                <button
                  onClick={() => onOpenArtifact(message.content, message.artifactType)}
                  className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center space-x-1"
                  title="Ver artefato"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Ver completo</span>
                </button>
              )}
              
              <button
                onClick={handleCopy}
                className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                title="Copiar"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;