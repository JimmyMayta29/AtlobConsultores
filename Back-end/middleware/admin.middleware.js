/**
 * Admin-only middleware
 * Must be used AFTER auth.middleware (requires req.user)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación requerida.',
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'editor') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador o editor.',
    });
  }

  next();
};

/**
 * Strict admin — only role 'admin'
 */
const requireStrictAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo administradores.',
    });
  }
  next();
};

module.exports = { requireAdmin, requireStrictAdmin };
