// Formatar tempo restante
export const formatTimeRemaining = (milliseconds) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
  return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
};

// Detectar tipo de resposta de forma MAIS INTELIGENTE
export const detectResponseType = (text) => {
  const lowerText = text.toLowerCase();
  
  // Meditação - deve ter palavras-chave e ser longo
  const meditationKeywords = ['meditação', 'meditar', 'reflexão', 'contempl'];
  const hasMeditationKeyword = meditationKeywords.some(k => lowerText.includes(k));
  const isLongText = text.length > 500;
  
  if (hasMeditationKeyword && isLongText) {
    return 'meditation';
  }
  
  // Passagem bíblica - tem referência de versículo
  const biblePattern = /\b(gênesis|êxodo|levítico|números|deuteronômio|josué|juízes|rute|samuel|reis|crônicas|esdras|neemias|ester|jó|salmos?|provérbios|eclesiastes|cantares|isaías|jeremias|lamentações|ezequiel|daniel|oséias|joel|amós|obadias|jonas|miquéias|naum|habacuque|sofonias|ageu|zacarias|malaquias|mateus|marcos|lucas|joão|atos|romanos|coríntios|gálatas|efésios|filipenses|colossenses|tessalonicenses|timóteo|tito|filemom|hebreus|tiago|pedro|judas|apocalipse)\s+\d+:\d+/i;
  
  if (biblePattern.test(text)) {
    return 'bible';
  }
  
  // Hino - menciona hinário ou hino
  if (lowerText.includes('hino') || lowerText.includes('hinário')) {
    return 'hymn';
  }
  
  return 'normal';
};

// Gerar título automático da conversa
export const generateConversationTitle = (messages) => {
  if (messages.length === 0) return 'Nova Conversa';
  
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'Nova Conversa';
  
  const text = firstUserMessage.content;
  const maxLength = 40;
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

// Formatar data
export const formatDate = (date) => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now - messageDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  
  return messageDate.toLocaleDateString('pt-PT');
};

// Verificar se deve mostrar saudação (só na primeira mensagem)
export const shouldShowGreeting = (messages) => {
  return messages.length === 0;
};