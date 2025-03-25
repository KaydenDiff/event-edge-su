import express from 'express';  // Используем import вместо require
import cookieParser from 'cookie-parser';
import session from 'express-session';

const app = express();

// Конфигурация сессий
app.use(cookieParser());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  }
}));

app.post('/login', (req, res) => {
  req.session.userId = 1; // Например, сохраняем ID пользователя в сессии
  res.send({ message: 'Вы вошли в систему!' });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Сервер работает на порту ${port}`);
});