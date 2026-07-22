const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { User, Lawyer, Schedule, sequelize, AdminLog } = require('../models');

const router = express.Router();

// Todas las rutas admin requieren autenticación y rol `admin`
router.use(authenticate);
router.use(authorize('admin'));

// Devuelve estado de conexión a la BD
router.get('/db-status', async (req, res) => {
  try{
    await sequelize.authenticate();
    // simple query to check response
    const [[ok]] = await sequelize.query("SELECT 1 as ok");
    // registro de auditoría
    try{ await AdminLog.create({ userId: req.user.id, action: 'db-status', route: req.originalUrl, ip: req.headers['x-forwarded-for'] || req.ip }); }catch(e){}
    res.json({ ok: true, result: ok });
  }catch(err){
    try{ await AdminLog.create({ userId: req.user.id, action: 'db-status-error', route: req.originalUrl, ip: req.headers['x-forwarded-for'] || req.ip, details: { message: err.message } }); }catch(e){}
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Conteo de registros por tabla (útil para revisar salud rápida)
router.get('/tables', async (req, res) => {
  try{
    const counts = {
      users: await User.count(),
      lawyers: await Lawyer.count(),
      schedules: await Schedule.count()
    };
    try{ await AdminLog.create({ userId: req.user.id, action: 'tables-count', route: req.originalUrl, ip: req.headers['x-forwarded-for'] || req.ip, details: counts }); }catch(e){}
    res.json({ counts });
  }catch(err){
    try{ await AdminLog.create({ userId: req.user.id, action: 'tables-count-error', route: req.originalUrl, ip: req.headers['x-forwarded-for'] || req.ip, details: { message: err.message } }); }catch(e){}
    res.status(500).json({ error: err.message });
  }
});

// Export CSV para tablas permitidas (solo lectura)
const allowed = { users: User, lawyers: Lawyer, schedules: Schedule };
router.get('/export/:table', async (req, res) => {
  const table = req.params.table;
  const Model = allowed[table];
  if(!Model) return res.status(400).json({ message: 'Table not allowed' });
  try{
    const rows = await Model.findAll({ raw: true });
    if(!rows || rows.length === 0) return res.status(204).end();
    try{ await AdminLog.create({ userId: req.user.id, action: 'export', route: req.originalUrl, ip: req.headers['x-forwarded-for'] || req.ip, details: { table, rows: rows.length } }); }catch(e){}

    const keys = Object.keys(rows[0]);
    res.setHeader('Content-Disposition', `attachment; filename="${table}.csv"`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');

    // header
    res.write(keys.join(',') + '\n');
    for(const r of rows){
      const line = keys.map(k => {
        let v = r[k] == null ? '' : String(r[k]).replace(/"/g, '""');
        if(v.includes(',') || v.includes('\n') || v.includes('"')) v = '"' + v + '"';
        return v;
      }).join(',');
      res.write(line + '\n');
    }
    res.end();
  }catch(err){
    try{ await AdminLog.create({ userId: req.user.id, action: 'export-error', route: req.originalUrl, ip: req.headers['x-forwarded-for'] || req.ip, details: { message: err.message } }); }catch(e){}
    res.status(500).json({ error: err.message });
  }
});

// Endpoint seguro para ejecutar acciones de mantenimiento permitidas.
// Por seguridad aquí solo devolvemos una lista de acciones soportadas.
router.get('/maintenance/actions', (req, res) => {
  res.json({ actions: ['ping'] });
});

router.post('/maintenance', async (req, res) => {
  const { action } = req.body || {};
  // No ejecutar acciones sensibles desde este API sin controles adicionales
  if(action === 'ping'){
    try{ await AdminLog.create({ userId: req.user.id, action: 'maintenance-ping', route: req.originalUrl, ip: req.headers['x-forwarded-for'] || req.ip }); }catch(e){}
    return res.json({ ok: true });
  }
  return res.status(400).json({ message: 'No allowed action' });
});

module.exports = router;
