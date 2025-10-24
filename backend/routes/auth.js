const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/email');

// Gerar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Gerar código de verificação (6 dígitos)
const generateCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// @route   POST /api/auth/register
// @desc    Registrar novo usuário e enviar código
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });
    }

    // Verificar se já existe
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ error: 'Este email já está cadastrado.' });
      } else {
        // Reenviar código se não verificado
        const code = generateCode();
        userExists.verificationCode = code;
        userExists.verificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
        await userExists.save();
        
        await sendVerificationEmail(email, name, code);
        
        return res.json({ 
          message: 'Código reenviado! Verifique seu email.',
          userId: userExists._id 
        });
      }
    }

    // Criar usuário
    const code = generateCode();
    
    const user = await User.create({
      name,
      email,
      password,
      verificationCode: code,
      verificationExpires: Date.now() + 10 * 60 * 1000 // 10 minutos
    });

    // Enviar email
    const emailSent = await sendVerificationEmail(email, name, code);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Erro ao enviar email de verificação.' });
    }

    res.status(201).json({
      message: 'Cadastro criado! Verifique seu email.',
      userId: user._id
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

// @route   POST /api/auth/verify
// @desc    Verificar código
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email já verificado.' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Código inválido.' });
    }

    if (user.verificationExpires < Date.now()) {
      return res.status(400).json({ error: 'Código expirado. Solicite um novo.' });
    }

    // Verificar usuário
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    // Gerar token
    const token = generateToken(user._id);

    res.json({
      message: 'Email verificado com sucesso!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ error: 'Erro ao verificar código.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login de usuário
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email não verificado. Verifique seu email.' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// @route   POST /api/auth/resend-code
// @desc    Reenviar código de verificação
// @access  Public
router.post('/resend-code', async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email já verificado.' });
    }

    const code = generateCode();
    user.verificationCode = code;
    user.verificationExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, user.name, code);

    res.json({ message: 'Código reenviado! Verifique seu email.' });

  } catch (error) {
    console.error('Erro ao reenviar código:', error);
    res.status(500).json({ error: 'Erro ao reenviar código.' });
  }
});

module.exports = router;