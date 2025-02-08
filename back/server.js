import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import { createCanvas } from 'canvas';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Configurar sessões para armazenar o CAPTCHA
app.use(session({
    secret: "superseguro",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/captcha', (req, res) => {
    const largura = 150;
    const altura = 50;
    const canvas = createCanvas(largura, altura);
    const ctx = canvas.getContext('2d');

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, largura, altura);

    // Adicionar ruído
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random()})`;
        ctx.beginPath();
        ctx.arc(Math.random() * largura, Math.random() * altura, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Gerar código aleatório (letras e números)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const captchaCode = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    req.session.captcha = captchaCode;

    // Desenhar texto com distorção e rotação
    ctx.font = '30px Arial';
    for (let i = 0; i < captchaCode.length; i++) {
        ctx.fillStyle = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        ctx.save();
        ctx.translate(20 + i * 30, 35);
        ctx.rotate((Math.random() - 0.5) * 0.5);
        ctx.fillText(captchaCode[i], 0, 0);
        ctx.restore();
    }

    // Adicionar linhas de ruído
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(0,0,0,${Math.random()})`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * largura, Math.random() * altura);
        ctx.lineTo(Math.random() * largura, Math.random() * altura);
        ctx.stroke();
    }

    // Configurar cabeçalho para imagem PNG
    res.setHeader('Content-Type', 'image/png');
    canvas.toBuffer((err, buffer) => {
        if (err) {
            console.error('Erro ao gerar CAPTCHA:', err);
            return res.status(500).send('Erro ao gerar CAPTCHA');
        }
        res.end(buffer);
    });
});

// 🔍 Rota para validar CAPTCHA
app.post("/validate-captcha", (req, res) => {
    const { captchaInput } = req.body;
    if (!req.session.captcha || req.session.captcha !== captchaInput) {
        return res.status(400).json({ success: false, error: "CAPTCHA incorreto!" });
    }
    res.json({ success: true });
});

// 📝 Criar usuário (com hash de senha)
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    try {
        const user = await prisma.user.create({
            data: { email, password: hash },
        });
        res.json({ message: "Usuário criado com sucesso!" });
    } catch (error) {
        res.status(400).json({ error: "Usuário já existe" });
    }
});

// 🔑 Login com verificação de CAPTCHA
app.post('/login', async (req, res) => {
    const { email, password, captchaInput } = req.body;

    // Validar CAPTCHA antes de autenticar o usuário
    if (!req.session.captcha || req.session.captcha !== captchaInput) {
        return res.status(400).json({ error: "CAPTCHA inválido!" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return res.status(400).json({ error: "Usuário não encontrado" });
    }

    if (user.isLocked) {
        return res.status(403).json({ error: "Conta bloqueada. Tente novamente mais tarde." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { attempts: user.attempts + 1 },
        });

        if (updatedUser.attempts >= 4) {
            await prisma.user.update({
                where: { email },
                data: { isLocked: true },
            });
            return res.status(403).json({ error: "Conta bloqueada por tentativas excessivas!" });
        }

        return res.status(401).json({ error: `Senha incorreta! Tentativas restantes: ${4 - updatedUser.attempts}` });
    }

    await prisma.user.update({
        where: { email },
        data: { attempts: 0 },
    });

    res.json({ message: "Login bem-sucedido!" });
});

app.listen(3001, () => console.log('🚀 Servidor rodando em http://localhost:3001'));
