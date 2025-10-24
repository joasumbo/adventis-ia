import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial - nova conversa */}
        <Route path="/" element={<Chat />} />
        
        {/* Conversa específica com UUID */}
        <Route path="/chat/:conversationId" element={<Chat />} />
        
        {/* Redirecionar qualquer outra rota */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;