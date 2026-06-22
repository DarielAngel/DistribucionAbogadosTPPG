const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwtSecret } = require('../config/config');
const { authenticate } = require('../middleware/auth');
const { jwtSecret: _jwtSecret } = require('../config/config');

// Middleware: rechaza la petición si ya hay una sesión activa
function rejectIfAuthenticated(req, res, next){
  const cookies = req.headers.cookie || '';
  const match = cookies.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
  const token = match ? match.slice(6) : (req.headers.authorization || '').slice(7);
  if(!token) return next();
  try{
    require('jsonwebtoken').verify(token, _jwtSecret);
    return res.status(400).json({ message: 'Ya tienes una sesión activa' });
  }catch(e){ next(); }
}

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  maxAge: 8 * 3600 * 1000,  // 8h, matches JWT expiry
  secure: process.env.NODE_ENV === 'production'
};

router.post('/register', rejectIfAuthenticated, async (req, res) => {
  const { name, email, password, role } = req.body;
  if(!email || !password) return res.status(400).json({ message: 'Missing fields' });
  try{
    const existing = await User.findOne({ where: { email } });
    if(existing) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash, role: role || 'client' });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', rejectIfAuthenticated, async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ message: 'Missing fields' });
  const user = await User.findOne({ where: { email } });
  if(!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' });
  res.cookie('token', token, COOKIE_OPTS);
  res.json({ role: user.role, name: user.name });
});

// Restore session from cookie — returns role so frontend can rebuild in-memory state
router.get('/me', authenticate, (req, res) => {
  res.json({ role: req.user.role, name: req.user.name });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'ok' });
});

module.exports = router;
