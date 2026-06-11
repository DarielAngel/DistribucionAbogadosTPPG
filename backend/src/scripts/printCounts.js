const db = require('../models');
(async ()=>{
  try{
    await db.sequelize.authenticate();
    const lawyers = await db.Lawyer.count();
    const schedules = await db.Schedule.count();
    console.log('Lawyers', lawyers, 'Schedules', schedules);
    process.exit(0);
  }catch(err){ console.error(err); process.exit(1); }
})();
