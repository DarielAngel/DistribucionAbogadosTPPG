const express = require('express');
const router = express.Router();
const { Schedule, Lawyer } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Add schedule entry (free day or task) - admin only
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try{
    const { type, date, lawyerId } = req.body;
    if(!type || !date) return res.status(400).json({ message: 'type and date required' });
    if(type === 'task' && !lawyerId) return res.status(400).json({ message: 'lawyerId required for task' });
    // if lawyerId provided, ensure it exists
    if(lawyerId){
      const l = await Lawyer.findByPk(lawyerId);
      if(!l) return res.status(400).json({ message: 'Invalid lawyerId' });
    }
    const s = await Schedule.create(req.body);
    const created = await Schedule.findByPk(s.id, { include: [{ model: Lawyer }] });
    res.status(201).json(created);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

// Get schedules, filter by lawyerId/date range
router.get('/', authenticate, async (req, res) => {
  const { lawyerId, date, startDate, endDate } = req.query;
  const where = {};
  const { Op } = require('sequelize');
  if(lawyerId) where.lawyerId = lawyerId;
  if(date) where.date = date;
  if(startDate || endDate){
    where.date = {};
    if(startDate) where.date[Op.gte] = startDate;
    if(endDate) where.date[Op.lte] = endDate;
  }
  try{
    const items = await Schedule.findAll({ where, include: [{ model: Lawyer }] });
    res.json(items);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

// Update and delete (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const s = await Schedule.findByPk(req.params.id);
  if(!s) return res.status(404).json({ message: 'Not found' });
  await s.update(req.body);
  res.json(s);
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const s = await Schedule.findByPk(req.params.id);
  if(!s) return res.status(404).json({ message: 'Not found' });
  await s.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router;
