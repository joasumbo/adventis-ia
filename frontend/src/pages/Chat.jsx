import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Menu, AlertCircle } from 'lucide-react';
import { chatAPI } from '../services/api';
import useStore from '../store/useStore';

// Components
import Sidebar from '../components/Sidebar';
import Message from '../components/Message';
import ChatInput from '../components/ChatInput';
import TypingAnimation from '../components/TypingAnimation';
import Artifact from '../components/Artifact';

function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [limit, setLimit] = useState({ remaining: 20, total: 20 });
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [artifactContent, setArtifactContent] = useState('');
  const [artifactType, setArtifactType] = useState('');
  
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { messages, setMessages, addMessage, clearMessages, currentConversationId, setCurrentConversationId } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else if (currentConversationId && messages.length > 0) {
      navigate(`/chat/${currentConversationId}`, { replace: true });
    } else {
      clearMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    loadLimit();
  }, []);

  const loadLimit = async () => {
    try {
      const response = await chatAPI.getLimit();
      setLimit(response.data);
    } catch (error) {
      console.error('Erro ao carregar limite:', error);
    }
  };

  const loadConversation = async (id) => {
    try {
      const response = await chatAPI.getConversation(id);
      const conv = response.data.conversation;
      setMessages(conv.messages);
      setCurrentConversationId(id);
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      setError('Conversa não encontrada');
      navigate('/', { replace: true });
    }
  };

  const handleNewChat = () => {
    console.log('🆕 Nova conversa'); // Debug
    clearMessages();
    setError(null);
    navigate('/', { replace: true });
    setSidebarOpen(false); // FORÇA FECHAR
  };

  const handleSelectConversation = (id) => {
    console.log('📂 Selecionando conversa:', id); // Debug
    navigate(`/chat/${id}`);
    setSidebarOpen(false); // FORÇA FECHAR
  };

  const handleDeleteConversation = async (id) => {
    try {
      await chatAPI.deleteConversation(id);
      
      if (currentConversationId === id) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleOpenArtifact = (content, type) => {
    setArtifactContent(content);
    setArtifactType(type);
    setArtifactOpen(true);
  };

  const handleSendMessage = async (content) => {
    setError(null);

    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    addMessage(userMessage);

    setIsTyping(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await chatAPI.sendMessage({
        message: content,
        conversationId: currentConversationId
      }, {
        signal: abortControllerRef.current.signal
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        hasArtifact: response.data.hasArtifact || false,
        artifactType: response.data.artifactType || null,
        timestamp: new Date()
      };
      addMessage(aiMessage);

      const newConvId = response.data.conversationId;
      if (newConvId && newConvId !== currentConversationId) {
        setCurrentConversationId(newConvId);
        navigate(`/chat/${newConvId}`, { replace: true });
      }

      loadLimit();

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Mensagem cancelada');
      } else {
        console.error('Erro ao enviar mensagem:', error);
        setError(
          error.response?.data?.error || 
          'Desculpa irmão, tive um problema. Tenta novamente.'
        );
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => {
          console.log('❌ Fechando sidebar'); // Debug
          setSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        currentConversationId={currentConversationId}
      />

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                console.log('Abrindo sidebar'); // Debug
                setSidebarOpen(true);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Igreja_Adventista_Dia.svg/500px-Igreja_Adventista_Dia.svg.png"
              alt="Adventis IA"
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Adventis IA</h1>
              <p className="text-xs text-gray-500">
                {limit.remaining}/{limit.total} mensagens restantes
              </p>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Nova Conversa
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="max-w-2xl w-full text-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Igreja_Adventista_Dia.svg/500px-Igreja_Adventista_Dia.svg.png"
                  alt="Adventis IA"
                  className="w-20 h-20 mx-auto mb-6"
                />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Olá! Como posso ajudar?
                </h2>
                <p className="text-gray-600 mb-8">
                  Sou o Adventis IA, criado por João Sumbo. Posso te ajudar com estudos bíblicos, meditações e muito mais.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Cria uma meditação sobre fé',
                    'O que é o santuário celestial?',
                    'Me faz uma oração de gratidão',
                    'Fala sobre o hino 1 do hinário'
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="p-4 text-left border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-sm bg-white shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full py-4">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  message={message}
                  isStreaming={index === messages.length - 1 && isTyping}
                  onOpenArtifact={handleOpenArtifact}
                />
              ))}

              {isTyping && <TypingAnimation />}

              {error && (
                <div className="px-4 mb-4">
                  <div className="max-w-[75%] mx-auto p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isTyping || limit.remaining === 0}
          placeholder={
            limit.remaining === 0 
              ? 'Limite atingido. Aguarde...'
              : 'Mensagem Adventis IA...'
          }
        />
      </div>

      {/* Artifact Modal */}
      {artifactOpen && (
        <Artifact
          content={artifactContent}
          type={artifactType}
          onClose={() => setArtifactOpen(false)}
        />
      )}
    </div>
  );
}

export default Chat;