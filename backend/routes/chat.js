const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Você é "Adventis IA", um assistente cristão adventista do sétimo dia criado por João Sumbo, um desenvolvedor de software angolano.

IDENTIDADE E COMPORTAMENTO:
- Seu criador: João Sumbo (desenvolvedor angolano)
- LinkedIn do criador: https://www.linkedin.com/in/joaasumbo
- NUNCA mencione Google, Gemini ou qualquer outra empresa de IA
- Saudações contextuais: "Bom dia, irmão!", "Boa tarde, irmã!", "Boa noite!" (baseado no horário)
- Tom: Acolhedor, sábio, empático e fraterno

CONHECIMENTO E TEOLOGIA:
- Base: Bíblia Sagrada e doutrina Adventista do Sétimo Dia
- Princípios: Guarda do sábado, santuário celestial, estado dos mortos, segunda vinda de Cristo, reforma de saúde, espírito de profecia (Ellen G. White)
- Sempre cite versículos bíblicos relevantes
- Pode mencionar Ellen G. White quando apropriado

CAPACIDADES:
Responder perguntas bíblicas e doutrinárias
Criar meditações completas e personalizadas
Fazer estudos bíblicos profundos
Orientação espiritual baseada na Bíblia
Buscar e explicar passagens bíblicas
Ajudar com orações

LIMITAÇÕES (responda educadamente quando perguntado):
- Imagens/fotos: "Irmão(ã), infelizmente ainda não estou treinado para criar ou processar imagens."
- Assuntos não-cristãos: Redirecione gentilmente para temas espirituais
- Outras religiões: Respeite mas mantenha base adventista

ESTILO DE RESPOSTA:
- Conciso: 2-4 parágrafos (exceto meditações que podem ser mais longas)
- Prático e aplicável ao dia a dia
- Linguagem simples e acessível
- Sempre termine com encorajamento ou bênção curta

EXEMPLOS DE SAUDAÇÃO:
- Manhã (6h-12h): "Bom dia, irmão(ã)! Que Deus abençoe seu dia!"
- Tarde (12h-18h): "Boa tarde! Como posso ajudá-lo(a) hoje?"
- Noite (18h-6h): "Boa noite! Que a paz do Senhor esteja contigo!"`;

// Função para detectar horário e gerar saudação
function getSaudacao() {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) return "Bom dia, irmão(ã)!";
  if (hora >= 12 && hora < 18) return "Boa tarde!";
  return "Boa noite!";
}

// @route   POST /api/chat/message
// @desc    Enviar mensagem para a IA
// @access  Private
router.post('/message', protect, async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    console.log('[CHAT] Mensagem recebida de:', req.user.name);

    // Buscar ou criar conversa
    const user = await User.findById(req.user._id);
    let conversation;

    if (conversationId) {
      conversation = user.conversations.id(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversa não encontrada' });
      }
    } else {
      // Criar nova conversa
      conversation = { messages: [] };
      user.conversations.push(conversation);
    }

    // Detecta perguntas sobre criador
    const perguntasCriador = ['quem te criou', 'quem é seu criador', 'quem fez você', 'quem te desenvolveu'];
    if (perguntasCriador.some(p => message.toLowerCase().includes(p))) {
      const respostaCriador = `${getSaudacao()} Fui criado por João Sumbo, um talentoso desenvolvedor de software angolano. Ele me desenvolveu com o propósito de ajudar irmãos e irmãs em Cristo a crescerem espiritualmente através da Palavra de Deus e dos ensinamentos adventistas. Você pode conhecer mais sobre o trabalho dele no LinkedIn: https://www.linkedin.com/in/joaasumbo - Que Deus abençoe seu dia!`;
      
      // Salvar no histórico
      conversation.messages.push({ role: 'user', content: message });
      conversation.messages.push({ role: 'assistant', content: respostaCriador });
      await user.save();

      return res.json({ 
        response: respostaCriador,
        conversationId: conversation._id,
        success: true 
      });
    }

    // Detecta pedidos de imagens
    const pedidosImagem = ['criar imagem', 'gerar imagem', 'fazer uma foto', 'desenhar', 'criar foto', 'me mostre', 'mostre-me'];
    if (pedidosImagem.some(p => message.toLowerCase().includes(p))) {
      const respostaImagem = `Irmão(ã), infelizmente ainda não estou treinado para criar ou processar imagens. Mas posso te ajudar com meditações, estudos bíblicos, orações e orientação espiritual! Como posso te auxiliar hoje?`;
      
      // Salvar no histórico
      conversation.messages.push({ role: 'user', content: message });
      conversation.messages.push({ role: 'assistant', content: respostaImagem });
      await user.save();

      return res.json({ 
        response: respostaImagem,
        conversationId: conversation._id,
        success: true 
      });
    }

    // Montar histórico para o Gemini
    const contents = [];
    
    // Adicionar system prompt
    contents.push({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    });
    
    contents.push({
      role: 'model',
      parts: [{ text: `${getSaudacao()} Sou Adventis IA, criado por João Sumbo para te ajudar em sua jornada cristã. Como posso te auxiliar hoje?` }]
    });

    // Adicionar histórico da conversa (últimas 10 mensagens para não ultrapassar limite)
    const recentMessages = conversation.messages.slice(-10);
    recentMessages.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Adicionar mensagem atual
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Chamar API do Gemini
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.9
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na API do Gemini');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    // Salvar no histórico
    conversation.messages.push({ role: 'user', content: message });
    conversation.messages.push({ role: 'assistant', content: aiResponse });
    await user.save();

    console.log('[CHAT] Resposta gerada e salva');

    res.json({ 
      response: aiResponse,
      conversationId: conversation._id,
      success: true 
    });

  } catch (error) {
    console.error('[CHAT ERROR]', error.message);
    res.status(500).json({ 
      error: 'Erro ao processar mensagem',
      details: error.message 
    });
  }
});

// @route   GET /api/chat/conversations
// @desc    Obter todas as conversas do usuário
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const conversations = user.conversations.map(conv => ({
      id: conv._id,
      messageCount: conv.messages.length,
      lastMessage: conv.messages[conv.messages.length - 1]?.content.substring(0, 100) || '',
      createdAt: conv.createdAt
    }));

    res.json({ conversations });

  } catch (error) {
    console.error('[CHAT ERROR]', error);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

// @route   GET /api/chat/conversation/:id
// @desc    Obter uma conversa específica
// @access  Private
router.get('/conversation/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const conversation = user.conversations.id(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    res.json({ conversation });

  } catch (error) {
    console.error('[CHAT ERROR]', error);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

// @route   DELETE /api/chat/conversation/:id
// @desc    Deletar uma conversa
// @access  Private
router.delete('/conversation/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const conversation = user.conversations.id(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    conversation.remove();
    await user.save();

    res.json({ message: 'Conversa deletada com sucesso' });

  } catch (error) {
    console.error('[CHAT ERROR]', error);
    res.status(500).json({ error: 'Erro ao deletar conversa' });
  }
});

// @route   GET /api/chat/greeting
// @desc    Obter saudação inicial
// @access  Private
router.get('/greeting', protect, async (req, res) => {
  res.json({ 
    greeting: getSaudacao(),
    message: `Olá, ${req.user.name}! Sou Adventis IA. Como posso te ajudar hoje na sua jornada espiritual?`,
    success: true 
  });
});

module.exports = router;