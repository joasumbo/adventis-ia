# Adventis IA

Assistente virtual cristão adventista do sétimo dia, criado para ajudar com estudos bíblicos, meditações, orações e muito mais.

## Tecnologias

### Backend
- Node.js + Express
- MongoDB
- Google Gemini AI (2.5-flash)
- Rate limiting por IP
- UUID para URLs únicas

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Zustand (state management)
- Markdown rendering

##  Funcionalidades

- Chat em tempo real com IA especializada em adventismo
- Artefatos especiais (meditações, hinos, orações)
- URLs únicas por conversa
- Histórico salvo por IP (cache)
- Design responsivo
- Limite de 20 mensagens/hora por IP
- Interface moderna e limpa

## Instalação

### Backend
```bash
cd backend
npm install
```

Cria arquivo `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/adventis-ia
GEMINI_API_KEY=sua_chave_aqui
JWT_SECRET=secret_key
PORT=5000
```

Inicia:
```bash
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deploy

- Backend: Render, Railway, Heroku
- Frontend: Vercel, Netlify
- Database: MongoDB Atlas

##  Desenvolvedor

Criado por **João Sumbo**

LinkedIn: [linkedin.com/in/joaasumbo](https://www.linkedin.com/in/joaasumbo)

## Licença

MIT License