import { useState } from 'react';
import { X, Mail, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import useStore from '../store/useStore';

function AuthModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Email, 2: Código, 3: Nome (se novo)
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    name: '',
    password: '',
  });
  const [userId, setUserId] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const login = useStore((state) => state.login);

  if (!isOpen) return null;

  // STEP 1: Verificar email e enviar código
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Gera senha automática
      const autoPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      // Tenta registrar (se já existe, o backend vai lidar)
      const response = await authAPI.register({
        name: 'Usuário',
        email: formData.email,
        password: autoPassword,
      });

      setUserId(response.data.userId);
      setFormData({ ...formData, password: autoPassword });
      setSuccess('Código enviado para seu email!');
      
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 1500);
    } catch (err) {
      // Se erro for "Email já cadastrado", ainda assim envia código
      if (err.response?.status === 400 && err.response?.data?.error?.includes('cadastrado')) {
        setError('');
        setSuccess('Código enviado para seu email!');
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 1500);
      } else {
        setError(err.response?.data?.error || 'Erro ao processar email. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verificar código
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.verify({
        userId,
        code: formData.code,
      });

      // Se retornar token, é usuário existente - faz login direto
      if (response.data.token) {
        login(response.data.user, response.data.token);
        setSuccess('Bem-vindo de volta!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        // Usuário novo - pede nome
        setIsNewUser(true);
        setSuccess('Código verificado!');
        setTimeout(() => {
          setStep(3);
          setSuccess('');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Completar cadastro com nome (só para novos usuários)
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Atualizar nome do usuário no backend (você precisa criar essa rota)
      // Por enquanto, vamos fazer login direto
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      login(response.data.user, response.data.token);
      setSuccess('Cadastro completo! Bem-vindo!');
      
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao finalizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      await authAPI.resendCode({ userId });
      setSuccess('Código reenviado!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao reenviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Igreja_Adventista_Dia.svg/500px-Igreja_Adventista_Dia.svg.png"
              alt="Adventis IA"
              className="w-16 h-16"
            />
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {step === 1 && 'Acesse o Adventis IA'}
            {step === 2 && 'Verifique seu email'}
            {step === 3 && 'Complete seu perfil'}
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            {step === 1 && 'Insira seu email para continuar'}
            {step === 2 && 'Enviamos um código de 6 dígitos'}
            {step === 3 && 'Como deseja ser chamado?'}
          </p>

          {/* Progress */}
          <div className="flex justify-center space-x-2 mb-6">
            <div className={`h-1 w-12 rounded-full ${step >= 1 ? 'bg-adventist-blue-500' : 'bg-gray-200'}`} />
            <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-adventist-blue-500' : 'bg-gray-200'}`} />
            <div className={`h-1 w-12 rounded-full ${step >= 3 ? 'bg-adventist-blue-500' : 'bg-gray-200'}`} />
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* STEP 1: Email */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-adventist-blue-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.email}
                className="w-full py-3 bg-adventist-blue-500 hover:bg-adventist-blue-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Continuar</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Código */}
          {step === 2 && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  required
                  disabled={loading}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-adventist-blue-500 text-center text-2xl font-mono tracking-widest disabled:bg-gray-50"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading || formData.code.length !== 6}
                className="w-full py-3 bg-adventist-blue-500 hover:bg-adventist-blue-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Verificar</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="w-full text-sm text-adventist-blue-500 hover:text-adventist-blue-600 transition-colors disabled:opacity-50"
              >
                Reenviar código
              </button>
            </form>
          )}

          {/* STEP 3: Nome */}
          {step === 3 && (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-adventist-blue-500 disabled:bg-gray-50"
                  placeholder="Seu nome"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !formData.name}
                className="w-full py-3 bg-adventist-blue-500 hover:bg-adventist-blue-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Finalizando...</span>
                  </>
                ) : (
                  <span>Começar</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;