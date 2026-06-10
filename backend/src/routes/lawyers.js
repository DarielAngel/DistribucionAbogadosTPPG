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
  const { province, municipality, name } = req.query;
  const where = {};
  if(province) where.province = province;
  if(municipality) where.municipality = municipality;
  if(name) where.name = { [require('sequelize').Op.iLike ]: `%${name}%` };
  try{
    const list = await Lawyer.findAll({ where });
    res.json(list);
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
