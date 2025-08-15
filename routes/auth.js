const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();
let refreshTokens = []; // temporal (mejor usar DB si luego escalarás)

// LOGIN + generar access y refresh token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    refreshTokens.push(refreshToken);

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Error en login', error: err.message });
  }
});

// RENOVAR TOKEN
router.post('/token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'Falta refreshToken' });

  if (!refreshTokens.includes(token)) return res.status(403).json({ message: 'Token no válido' });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token expirado o inválido' });

    const newAccessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  });
});

// LOGOUT (opcional)
router.post('/logout', (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter(t => t !== token);
  res.sendStatus(204);
});

module.exports = router;
