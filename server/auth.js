const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bench_rotation_secret_key_2026_super_secure';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
}

function requireStudent(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Forbidden: Student access required' });
    }
    next();
  });
}

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken,
  requireAdmin,
  requireStudent
};
