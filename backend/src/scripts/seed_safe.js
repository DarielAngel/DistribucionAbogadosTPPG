const bcrypt = require('bcrypt');
const { sequelize, User, Lawyer, Schedule } = require('../models');

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min }
function pad(n){ return n<10? '0'+n : ''+n }

async function ensureSeed(){
  await sequelize.sync();
  console.log('DB synced');
  const adminEmail = 'admin@example.com';
  let admin = await User.findOne({ where: { email: adminEmail } });
  if(!admin){
    const hash = await bcrypt.hash('secret', 10);
    admin = await User.create({ name: 'Admin', email: adminEmail, passwordHash: hash, role: 'admin' });
    console.log('Created admin');
  }

  const countLawyers = await Lawyer.count();
  const need = Math.max(0, 100 - countLawyers);
  if(need>0){
    const firstNames = ['Juan','María','Luis','Ana','Carlos','Lucía','Pedro','Sofía','Miguel','Elena','Diego','Laura'];
    const lastNames = ['García','Rodríguez','Pérez','López','Martínez','González','Sánchez','Ramírez','Torres','Flores'];
    const provinces = ['Provincia A','Provincia B','Provincia C','Provincia D'];
    const municipalities = ['Municipio 1','Municipio 2','Municipio 3','Municipio 4'];
    const specs = ['Civil','Penal','Laboral','Familiar','Mercantil','Administrativo'];
    for(let i=0;i<need;i++){
      const idx = countLawyers + i + 1;
      const name = `${firstNames[randInt(0, firstNames.length-1)]} ${lastNames[randInt(0,lastNames.length-1)]} ${idx}`;
      const email = `lawyer${idx}@example.com`;
      await Lawyer.create({ name, email, phone: `+34 600 ${1000 + idx}`, province: provinces[randInt(0,provinces.length-1)], municipality: municipalities[randInt(0,municipalities.length-1)], specialization: specs[randInt(0,specs.length-1)], createdBy: admin.id });
    }
    console.log(`Added ${need} lawyers`);
  } else {
    console.log('Already have 100+ lawyers');
  }

  // ensure schedules for current month exist for each lawyer
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const lawyers = await Lawyer.findAll();
  let createdSchedules = 0;
  for(const l of lawyers){
    const existing = await Schedule.findOne({ where: { lawyerId: l.id, date: { [require('sequelize').Op.between]: [`${year}-${pad(month+1)}-01`, `${year}-${pad(month+1)}-${pad(daysInMonth)}`] } } });
    if(existing) continue; // skip if lawyer already has schedules this month
    const tasksCount = randInt(8, 20);
    for(let t=0;t<tasksCount;t++){
      const day = randInt(1, daysInMonth);
      const date = `${year}-${pad(month+1)}-${pad(day)}`;
      const startH = randInt(8,16);
      const startM = [0,15,30,45][randInt(0,3)];
      const dur = [30,45,60,90,120][randInt(0,4)];
      const endDate = new Date(year, month, day, startH, startM + dur);
      const endH = endDate.getHours();
      const endM = endDate.getMinutes();
      const startTime = `${pad(startH)}:${pad(startM)}:00`;
      const endTime = `${pad(endH)}:${pad(endM)}:00`;
      await Schedule.create({ type: 'task', date, startTime, endTime, description: `Task for ${l.name}`, durationMinutes: dur, lawyerId: l.id, category: 'appointment' });
      createdSchedules++;
    }
  }
  console.log('Created schedules:', createdSchedules);
  console.log('Seed ensure complete');
  process.exit(0);
}

ensureSeed().catch(err=>{ console.error(err); process.exit(1) });
