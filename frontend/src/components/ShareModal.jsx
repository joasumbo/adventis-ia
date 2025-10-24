import { X, Link2, Check, Facebook, Twitter, Mail } from 'lucide-react';
import { useState } from 'react';

function ShareModal({ isOpen, onClose, conversationId = null }) {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const shareUrl = conversationId 
    ? `${window.location.origin}/chat/${conversationId}`
    : window.location.origin;

  const shareText = 'Conheça o Adventis IA - Assistente Cristão Adventista';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-adventist-blue-700 mb-4">
          Compartilhar
        </h2>

        <p className="text-gray-600 mb-6">
          {conversationId 
            ? 'Compartilhe esta conversa com outros irmãos'
            : 'Compartilhe o Adventis IA com outros irmãos'}
        </p>

        {/* Link para copiar */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-adventist-blue-500 hover:bg-adventist-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Botões de compartilhamento social */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Compartilhar via
          </p>
          
          <button
            onClick={handleShareFacebook}
            className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Facebook className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700">Facebook</span>
          </button>

          <button
            onClick={handleShareTwitter}
            className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Twitter className="w-5 h-5 text-blue-400" />
            <span className="text-gray-700">Twitter</span>
          </button>

          <button
            onClick={handleShareEmail}
            className="w-full flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;