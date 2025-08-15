const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // Verifica que el encabezado tenga formato Bearer <token>
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado o formato incorrecto' });
    }

    const token = authHeader.split(' ')[1];

    // Verificamos el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos los datos útiles del usuario en req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next(); // Pasa al siguiente middleware o controlador
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'El token ha expirado', expired: true });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    return res.status(500).json({ message: 'Error al verificar el token', error: error.message });
  }
};

module.exports = verifyToken;
