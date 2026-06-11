const express = require('express');
const router = express.Router();
const { Lawyer } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Create lawyer (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try{
    const l = await Lawyer.create(req.body);
    res.json(l);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

// List lawyers with optional filters
router.get('/', authenticate, async (req, res) => {
  // support pagination and simple search
  const { province, municipality, name, page = 1, pageSize = 25 } = req.query;
  const where = {};
  const { Op } = require('sequelize');
  if(province) where.province = province;
  if(municipality) where.municipality = municipality;
  if(name) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${name}%` } },
      { province: { [Op.iLike]: `%${name}%` } },
      { municipality: { [Op.iLike]: `%${name}%` } }
    ];
  }
  try{
    const limit = Math.min(100, parseInt(pageSize) || 25);
    const offset = (Math.max(1, parseInt(page) || 1) - 1) * limit;
    const { count, rows } = await Lawyer.findAndCountAll({ where, limit, offset, order: [['name','ASC']] });
    res.json({ items: rows, total: count, page: parseInt(page), pageSize: limit });
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

// Get one
router.get('/:id', authenticate, async (req, res) => {
  const l = await Lawyer.findByPk(req.params.id);
  if(!l) return res.status(404).json({ message: 'Not found' });
  res.json(l);
});

// Update (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const l = await Lawyer.findByPk(req.params.id);
  if(!l) return res.status(404).json({ message: 'Not found' });
  await l.update(req.body);
  res.json(l);
});

// Delete (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const l = await Lawyer.findByPk(req.params.id);
  if(!l) return res.status(404).json({ message: 'Not found' });
  await l.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router;
