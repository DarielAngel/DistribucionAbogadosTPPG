const express = require('express');
const router = express.Router();
const { Schedule, Lawyer } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { getBlockedDays } = require('./config');

function isRestrictedDay(isoDate, blockedDays){
  return blockedDays.includes(new Date(isoDate + 'T12:00:00').getDay());
}

// Add schedule entry (free day or task) - admin only
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try{
    const { type, date, lawyerId, startDate, endDate } = req.body;
    if(!type) return res.status(400).json({ message: 'type required' });

    const blockedDays = await getBlockedDays();

    if(startDate && endDate){
      if(type === 'task' && !lawyerId) return res.status(400).json({ message: 'lawyerId required for task' });
      if(lawyerId){
        const l = await Lawyer.findByPk(lawyerId);
        if(!l) return res.status(400).json({ message: 'Invalid lawyerId' });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if(isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return res.status(400).json({ message: 'Invalid date range' });
      const createdItems = [];
      for(let d = new Date(start); d <= end; d.setDate(d.getDate()+1)){
        const iso = d.toISOString().slice(0,10);
        if(type === 'task' && isRestrictedDay(iso, blockedDays)) continue;
        if(type === 'task' && lawyerId){
          const conflict = await Schedule.findOne({ where: { lawyerId, date: iso, type: 'task' } });
          if(conflict) continue;
        }
        const payload = Object.assign({}, req.body, { date: iso });
        delete payload.startDate; delete payload.endDate;
        const s = await Schedule.create(payload);
        const full = await Schedule.findByPk(s.id, { include: [{ model: Lawyer }] });
        createdItems.push(full);
      }
      try{ require('../events').sendEvent('schedule:created', createdItems); }catch(e){}
      return res.status(201).json(createdItems);
    }

    // single date case
    if(!date) return res.status(400).json({ message: 'date or startDate/endDate required' });
    if(type === 'task' && !lawyerId) return res.status(400).json({ message: 'lawyerId required for task' });
    if(type === 'task' && isRestrictedDay(date, blockedDays)){
      return res.status(400).json({ message: 'No se pueden asignar tareas en ese día de la semana' });
    }
    if(lawyerId){
      const l = await Lawyer.findByPk(lawyerId);
      if(!l) return res.status(400).json({ message: 'Invalid lawyerId' });
    }
    if(type === 'task' && lawyerId){
      const conflict = await Schedule.findOne({ where: { lawyerId, date, type: 'task' } });
      if(conflict) return res.status(409).json({ message: 'El abogado ya tiene una tarea asignada en esa fecha' });
    }
    const s = await Schedule.create(req.body);
    const created = await Schedule.findByPk(s.id, { include: [{ model: Lawyer }] });
    try{ require('../events').sendEvent('schedule:created', created); }catch(e){}
    res.status(201).json(created);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

// Get schedules, filter by lawyerId/date range
router.get('/', authenticate, async (req, res) => {
  const { lawyerId, lawyerIds, date, startDate, endDate } = req.query;
  const where = {};
  const { Op } = require('sequelize');
  if(lawyerId) where.lawyerId = lawyerId;
  if(lawyerIds){
    const ids = String(lawyerIds).split(',').map(x=>parseInt(x)).filter(Boolean);
    if(ids.length) where.lawyerId = { [Op.in]: ids };
  }
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

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const s = await Schedule.findByPk(req.params.id);
  if(!s) return res.status(404).json({ message: 'Not found' });
  await s.update(req.body);
  try{ const full = await Schedule.findByPk(s.id, { include: [{ model: Lawyer }] }); require('../events').sendEvent('schedule:updated', full); }catch(e){}
  res.json(s);
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const s = await Schedule.findByPk(req.params.id);
  if(!s) return res.status(404).json({ message: 'Not found' });
  await s.destroy();
  try{ require('../events').sendEvent('schedule:deleted', { id: s.id, lawyerId: s.lawyerId, date: s.date }); }catch(e){}
  res.json({ message: 'Deleted' });
});

module.exports = router;
