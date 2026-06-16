const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwtSecret } = require('../config/config');

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if(!email || !password) return res.status(400).json({ message: 'Missing fields' });
  try{
    console.debug('[auth/register] headers:', req.headers)
    console.debug('[auth/register] body:', req.body)
    // check existing
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash, role: role || 'client' });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ message: 'Missing fields' });
  console.debug('[auth/login] headers:', req.headers)
  console.debug('[auth/login] body:', req.body)
  const user = await User.findOne({ where: { email } });
  if(!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' });
  res.json({ token });
});

module.exports = router;
