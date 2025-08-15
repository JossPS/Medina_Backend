function verifyAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admin role required' });
  }
  next();
}

module.exports = verifyAdmin;
