const nodemailer = require('nodemailer');

// Configurar transporter para cPanel SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true, // true para porta 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false, // Aceita certificados self-signed
    ciphers: 'SSLv3' // Compatibilidade com servidores mais antigos
  },
  debug: false, // Desativa logs detalhados
  logger: false
});

// Verificar configuração ao iniciar
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Erro na configuração do email:', error.message);
    console.log('⚠️  Verifique:');
    console.log('   - Host:', process.env.EMAIL_HOST);
    console.log('   - Porta:', process.env.EMAIL_PORT);
    console.log('   - Usuário:', process.env.EMAIL_USER);
  } else {
    console.log('✅ Servidor de email (cPanel) pronto!');
    console.log('📧 Enviando de:', process.env.EMAIL_USER);
  }
});

// Enviar código de verificação
const sendVerificationEmail = async (email, name, code) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Luz da Fé'} ✨" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🙏 Seu Código de Verificação - Luz da Fé',
    html: `
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            line-height: 1.6;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
          }
          .header p {
            font-size: 16px;
            opacity: 0.95;
            font-weight: 300;
          }
          .content {
            padding: 40px 30px;
            background: white;
          }
          .greeting {
            font-size: 20px;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
          }
          .message {
            color: #555;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.8;
          }
          .code-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
          }
          .code-label {
            color: white;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
            font-weight: 600;
            opacity: 0.9;
          }
          .code {
            font-size: 48px;
            font-weight: 900;
            color: white;
            letter-spacing: 15px;
            text-shadow: 2px 2px 8px rgba(0,0,0,0.2);
            font-family: 'Courier New', monospace;
          }
          .code-info {
            color: white;
            font-size: 14px;
            margin-top: 15px;
            opacity: 0.9;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin: 25px 0;
            color: #856404;
            font-size: 14px;
          }
          .verse-section {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            text-align: center;
          }
          .verse {
            font-style: italic;
            color: #4a5568;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 10px;
          }
          .verse-reference {
            color: #667eea;
            font-weight: 600;
            font-size: 14px;
          }
          .footer {
            background: #1a202c;
            padding: 30px;
            text-align: center;
            color: white;
          }
          .footer-content {
            margin-bottom: 20px;
          }
          .footer-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #667eea;
          }
          .footer-text {
            font-size: 14px;
            color: #cbd5e0;
            margin-bottom: 5px;
          }
          .social-links {
            margin: 20px 0;
            padding: 20px 0;
            border-top: 1px solid #2d3748;
            border-bottom: 1px solid #2d3748;
          }
          .linkedin-link {
            display: inline-block;
            background: #0077b5;
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
          }
          .creator {
            margin-top: 20px;
            padding-top: 20px;
            font-size: 14px;
            color: #a0aec0;
          }
          .creator strong {
            color: #667eea;
            font-weight: 700;
          }
          .copyright {
            font-size: 12px;
            color: #718096;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>Adventis IA</h1>
            <p>Assistente Cristão Adventista do Sétimo Dia</p>
          </div>
          <div class="content">
            <div class="greeting">Olá, <strong>${name}</strong>! 👋</div>
            <div class="message">
              Que a paz do Senhor esteja contigo! Estamos muito felizes em recebê-lo(a) na nossa comunidade de fé.
            </div>
            <div class="message">
              Para confirmar seu cadastro, utilize o código de verificação abaixo:
            </div>
            <div class="code-container">
              <div class="code-label">Seu Código de Verificação</div>
              <div class="code">${code}</div>
              <div class="code-info">⏱️ Válido por 10 minutos</div>
            </div>
            <div class="warning">
              ⚠️ <strong>Importante:</strong> Se você não solicitou este cadastro, ignore este email.
            </div>
            <div class="verse-section">
              <div class="verse">"Lâmpada para os meus pés é a tua palavra<br>e, luz para os meus caminhos."</div>
              <div class="verse-reference">— Salmos 119:105</div>
            </div>
          </div>
          <div class="footer">
            <div class="footer-content">
              <div class="footer-title">Luz da Fé</div>
              <div class="footer-text">Crescendo em Cristo através da Palavra</div>
            </div>
            <div class="social-links">
              <a href="https://www.linkedin.com/in/joaosumbo" class="linkedin-link" target="_blank">🔗 Conecte-se no LinkedIn</a>
            </div>
            <div class="creator">
              <strong>Feito por:</strong> João Sumbo<br>Desenvolvedor de Software | Angola 🇦🇴
            </div>
            <div class="copyright">© 2025 Luz da Fé - Todos os direitos reservados</div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log('📤 Enviando email para:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Resposta do servidor:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:');
    console.error('   Código:', error.code);
    console.error('   Mensagem:', error.message);
    return false;
  }
};

module.exports = { sendVerificationEmail };