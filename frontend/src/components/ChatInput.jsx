import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';

function ChatInput({ onSend, disabled = false, placeholder = 'Mensagem...' }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-2 bg-gray-100 rounded-3xl px-4 py-2">
            <button
              type="button"
              disabled
              className="flex-shrink-0 p-2 text-gray-400 disabled:opacity-30"
              title="Anexar (em breve)"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="flex-1 bg-transparent px-2 py-2 resize-none focus:outline-none text-gray-800 placeholder-gray-500"
              style={{ minHeight: '24px', maxHeight: '150px' }}
            />

            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className="flex-shrink-0 p-2 text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        <p className="mt-2 text-xs text-center text-gray-500">
          Adventis IA pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </div>
  );
}

export default ChatInput;