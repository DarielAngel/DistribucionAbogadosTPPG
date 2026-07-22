// Middleware para permitir acceso sólo desde IPs listadas en ADMIN_ALLOWED_IPS
// ADMIN_ALLOWED_IPS debe ser una lista separada por comas de direcciones IP confiables
module.exports = function adminIpWhitelist(req, res, next){
  const env = process.env.ADMIN_ALLOWED_IPS || '';
  const allowed = env.split(',').map(s => s.trim()).filter(Boolean);
  if(allowed.length === 0) return next(); // si no hay lista, no filtrar (control externo recomendado)

  const xf = req.headers['x-forwarded-for'];
  const remote = xf ? xf.split(',')[0].trim() : (req.connection && (req.connection.remoteAddress || req.socket && req.socket.remoteAddress)) || req.ip;

  if(allowed.includes(remote)) return next();
  return res.status(403).json({ message: 'Admin access denied from this IP' });
};
