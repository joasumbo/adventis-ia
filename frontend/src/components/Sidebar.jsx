import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  X, 
  Search,
  Trash2,
  Clock
} from 'lucide-react';
import { chatAPI } from '../services/api';

function Sidebar({ isOpen, onClose, onNewChat, onSelectConversation, onDeleteConversation, currentConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    
    if (!confirm('Deseja excluir esta conversa?')) return;
    
    await onDeleteConversation(id);
    setConversations(conversations.filter(c => c.id !== id));
  };

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  const handleSelectConversation = (id) => {
    onSelectConversation(id);
    onClose();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    const now = new Date();
    const convDate = new Date(date);
    const diffMs = now - convDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    
    return convDate.toLocaleDateString('pt-PT');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gray-900 text-white z-50
        w-80 transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0
      `}>
        
        {/* Header com X sempre visível no mobile */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Igreja_Adventista_Dia.svg/500px-Igreja_Adventista_Dia.svg.png"
              alt="Adventis IA"
              className="w-8 h-8"
            />
            <h1 className="text-lg font-bold">Adventis IA</h1>
          </div>
          
          {/* Botão X - SEMPRE visível em mobile */}
          <button
            onClick={() => {
              console.log('❌ X clicado!');
              onClose();
            }}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Nova Conversa */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Conversa</span>
          </button>
        </div>

        {/* Search */}
        {conversations.length > 0 && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-500"
              />
            </div>
          </div>
        )}

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
            Histórico
          </h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>{searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${currentConversationId === conv.id ? 'bg-gray-800 border border-blue-500' : 'hover:bg-gray-800'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-sm font-medium truncate text-white mb-1">
                      {conv.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(conv.updatedAt)}</span>
                      <span>•</span>
                      <span>{conv.messageCount} msgs</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-600/20 rounded transition-all flex-shrink-0"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Desenvolvido por João Sumbo
            </p>
            <p className="text-xs text-gray-600 mt-1">2025 Adventis IA</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;