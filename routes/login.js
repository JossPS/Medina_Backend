const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userSchema = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();
const refreshToken = [];

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userSchema.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Logs temporales para asegurarnos que se leen
    console.log('JWT_SECRET from env:', process.env.JWT_SECRET || '<<NO VALUE>>');
    console.log('JWT_REFRESH_SECRET from env:', process.env.JWT_REFRESH_SECRET || '<<NO VALUE>>');

    // Token de acceso
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Token de refresco usando la nueva variable
    const refreshTokenValue = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    refreshToken.push(refreshTokenValue); // temporal

    res.json({
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      message: 'Ingreso exitoso'
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/verify-token', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (req, res) => {
  const { token } = req.body;

  const index = refreshToken.indexOf(token);
  if (index !== -1) {
    refreshToken.splice(index, 1);
    return res.status(200).json({ message: 'Logout successful' });
  }

  res.status(400).json({ message: 'Invalid token' });
});

module.exports = router;
