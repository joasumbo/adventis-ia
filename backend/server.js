const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

// Model para controle de rate limit por IP
const rateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  resetAt: { type: Date, default: Date.now }
});

// Model para conversas (com UUID e IP)
const conversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  ip: { type: String, required: true },
  title: { type: String, default: 'Nova Conversa' },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    hasArtifact: { type: Boolean, default: false },
    artifactType: { type: String }, // meditation, hymn, prayer
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const RateLimit = mongoose.model('RateLimit', rateLimitSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

// Rate limiting por IP
const rateLimitByIP = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    let record = await RateLimit.findOne({ ip });
    const now = new Date();

    if (!record) {
      record = new RateLimit({
        ip,
        count: 1,
        resetAt: new Date(now.getTime() + 3600000)
      });
      await record.save();
      return next();
    }

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = new Date(now.getTime() + 3600000);
      await record.save();
      return next();
    }

    if (record.count >= 20) {
      const timeUntilReset = record.resetAt - now;
      const minutes = Math.ceil(timeUntilReset / 60000);
      return res.status(429).json({ 
        error: `Irmão, atingiste o limite de 20 mensagens por hora. Tenta novamente em ${minutes} minutos.`
      });
    }

    record.count += 1;
    await record.save();
    next();
  } catch (error) {
    console.error('Erro no rate limit:', error);
    next();
  }
};

// Detectar se deve criar artefato
const detectArtifact = (message) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('meditação') || lowerMsg.includes('meditar') || lowerMsg.includes('reflexão')) {
    return { hasArtifact: true, artifactType: 'meditation' };
  }
  
  if (lowerMsg.includes('hino') || lowerMsg.includes('hinário') || lowerMsg.includes('cântico')) {
    return { hasArtifact: true, artifactType: 'hymn' };
  }
  
  if (lowerMsg.includes('oração') || lowerMsg.includes('ore') || lowerMsg.includes('orar')) {
    return { hasArtifact: true, artifactType: 'prayer' };
  }
  
  return { hasArtifact: false, artifactType: null };
};

// Função para gerar resposta da IA
const generateAIResponse = async (message, history = [], artifactInfo = {}) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let systemPrompt = `Você é o Adventis IA, um assistente virtual cristão adventista do sétimo dia criado por João Sumbo.

REGRAS ABSOLUTAS:
❌ NUNCA mencione que foi criado pelo Google ou qualquer outra empresa
✅ SEMPRE diga que foi criado por João Sumbo
❌ NUNCA responda perguntas que não sejam sobre Deus, Bíblia, fé cristã ou vida espiritual
✅ Se perguntarem sobre outros assuntos, redirecione gentilmente para temas espirituais
❌ NUNCA cumprimente repetidamente - apenas na primeira interação
✅ Converse naturalmente, sem formalidades excessivas

FORMATAÇÃO MARKDOWN:
- Use **negrito** para ênfase
- Use *itálico* para citações
- Use ## para títulos
- Use --- para separadores
- Use > para blockquotes (versículos)
- Use [texto](url) para links
- Use \n\n para parágrafos (sempre pule linhas entre parágrafos)

PERSONALIDADE:
- Acolhedor, sábio, empático e fraterno
- Use "irmão(ã)" ocasionalmente, não sempre
- Tom natural e conversacional
- Não seja repetitivo nas saudações

ESPECIALIDADES (APENAS ESTES TEMAS):
- Doutrinas adventistas
- Estudos bíblicos profundos
- Meditações e devocionais
- Orações guiadas
- Aconselhamento espiritual
- Hinário Adventista
- Escritos de Ellen G. White`;

    // Instruções especiais para artefatos
    if (artifactInfo.hasArtifact) {
      if (artifactInfo.artifactType === 'meditation') {
        systemPrompt += `\n\nIMPORTANTE: O usuário pediu uma MEDITAÇÃO. Crie um texto devocional profundo, espiritual e inspirador com:
- Título impactante
- Introdução tocante
- Desenvolvimento com reflexões bíblicas
- Citações de versículos (use > para blockquote)
- Aplicação prática
- Conclusão motivadora
- Oração final

Use formatação rica em markdown. Seja poético e espiritual.`;
      } else if (artifactInfo.artifactType === 'hymn') {
        systemPrompt += `\n\nIMPORTANTE: O usuário pediu informações sobre um HINO. Forneça:
- Nome completo do hino
- Número no Hinário Adventista
- Letra completa (se souber)
- História e contexto
- Mensagem espiritual

Use formatação clara com títulos e parágrafos.`;
      } else if (artifactInfo.artifactType === 'prayer') {
        systemPrompt += `\n\nIMPORTANTE: O usuário pediu uma ORAÇÃO. Crie uma oração:
- Reverent e respeitosa
- Direcionada ao tema pedido
- Com linguagem bíblica apropriada
- Tocante e sincera
- Não muito longa

Use formatação em parágrafos.`;
      }
    }

    // Construir conteúdo com histórico
    let fullPrompt = systemPrompt + '\n\n';
    
    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'Usuário' : 'Adventis IA'}: ${msg.content}\n\n`;
    });
    
    fullPrompt += `Usuário: ${message}\n\nAdventis IA:`;

    const response = await axios.post(url, {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: artifactInfo.hasArtifact ? 0.9 : 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: artifactInfo.hasArtifact ? 4096 : 2048,
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const text = response.data.candidates[0].content.parts[0].text;
    return text;
    
  } catch (error) {
    console.error('Erro detalhado da IA:', error.response?.data || error.message);
    throw new Error('Desculpa irmão, tive um problema. Tenta novamente.');
  }
};

// Gerar título da conversa
const generateTitle = (firstMessage) => {
  const maxLength = 50;
  if (firstMessage.length <= maxLength) return firstMessage;
  return firstMessage.substring(0, maxLength).trim() + '...';
};

// ==================== ROTAS ====================

// Enviar mensagem
app.post('/api/chat/message', rateLimitByIP, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    console.log('📩 Nova mensagem');

    // Detectar artefato
    const artifactInfo = detectArtifact(message);

    // Buscar ou criar conversa
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ conversationId, ip });
      if (!conversation) {
        return res.status(404).json({ error: 'Conversa não encontrada' });
      }
    } else {
      // Nova conversa
      const newConversationId = uuidv4();
      conversation = new Conversation({
        conversationId: newConversationId,
        ip,
        title: generateTitle(message.trim()),
        messages: []
      });
    }

    // Gerar resposta
    const aiResponse = await generateAIResponse(
      message.trim(), 
      conversation.messages,
      artifactInfo
    );

    console.log('✅ Resposta gerada');

    // Salvar mensagens
    conversation.messages.push(
      { 
        role: 'user', 
        content: message.trim(),
        hasArtifact: false,
        timestamp: new Date() 
      },
      { 
        role: 'assistant', 
        content: aiResponse,
        hasArtifact: artifactInfo.hasArtifact,
        artifactType: artifactInfo.artifactType,
        timestamp: new Date() 
      }
    );

    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      response: aiResponse,
      conversationId: conversation.conversationId,
      hasArtifact: artifactInfo.hasArtifact,
      artifactType: artifactInfo.artifactType
    });
  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({ 
      error: error.message || 'Erro ao processar mensagem'
    });
  }
});

// Buscar conversa específica
app.get('/api/chat/conversation/:id', async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const conversation = await Conversation.findOne({ 
      conversationId: req.params.id,
      ip 
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

// Listar conversas do IP
app.get('/api/chat/conversations', async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    const conversations = await Conversation.find({ ip })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('conversationId title updatedAt messages');

    const formatted = conversations.map(conv => ({
      id: conv.conversationId,
      title: conv.title,
      messageCount: conv.messages.length,
      updatedAt: conv.updatedAt
    }));

    res.json({ conversations: formatted });
  } catch (error) {
    console.error('Erro ao listar conversas:', error);
    res.json({ conversations: [] });
  }
});

// Deletar conversa
app.delete('/api/chat/conversation/:id', async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    await Conversation.deleteOne({ 
      conversationId: req.params.id,
      ip 
    });
    
    res.json({ message: 'Conversa deletada' });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ error: 'Erro ao deletar conversa' });
  }
});

// Verificar limite
app.get('/api/chat/limit', async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const record = await RateLimit.findOne({ ip });
    
    if (!record) {
      return res.json({ remaining: 20, total: 20 });
    }

    const now = new Date();
    if (now > record.resetAt) {
      return res.json({ remaining: 20, total: 20 });
    }

    res.json({ 
      remaining: Math.max(0, 20 - record.count), 
      total: 20 
    });
  } catch (error) {
    res.json({ remaining: 20, total: 20 });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor na porta ${PORT}`);
  console.log(`👨‍💻 Criado por João Sumbo`);
});