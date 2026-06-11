const bcrypt = require('bcrypt');
const { sequelize, User, Lawyer, Schedule } = require('../models');

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min }
function pad(n){ return n<10? '0'+n : ''+n }

async function seed(){
  await sequelize.sync();
  console.log('DB synced');

  // create admin user
  const adminEmail = 'admin@example.com';
  const existing = await User.findOne({ where: { email: adminEmail } });
  let admin;
  if(!existing){
    const hash = await bcrypt.hash('secret', 10);
    admin = await User.create({ name: 'Admin', email: adminEmail, passwordHash: hash, role: 'admin' });
    console.log('Created admin user', adminEmail);
  } else {
    admin = existing;
    console.log('Admin already exists');
  }

  // sample data pools
  const firstNames = ['Juan','María','Luis','Ana','Carlos','Lucía','Pedro','Sofía','Miguel','Elena','Diego','Laura'];
  const lastNames = ['García','Rodríguez','Pérez','López','Martínez','González','Sánchez','Ramírez','Torres','Flores'];
  const provinces = ['Provincia A','Provincia B','Provincia C','Provincia D'];
  const municipalities = ['Municipio 1','Municipio 2','Municipio 3','Municipio 4'];
  const specs = ['Civil','Penal','Laboral','Familiar','Mercantil','Administrativo'];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const daysInMonth = new Date(year, month+1, 0).getDate();

  // create 100 lawyers
  const lawyers = [];
  for(let i=0;i<100;i++){
    const name = `${firstNames[randInt(0, firstNames.length-1)]} ${lastNames[randInt(0,lastNames.length-1)]} ${i+1}`;
    const email = `lawyer${i+1}@example.com`;
    const l = await Lawyer.create({ name, email, phone: `+34 600 ${1000 + i}`, province: provinces[randInt(0,provinces.length-1)], municipality: municipalities[randInt(0,municipalities.length-1)], specialization: specs[randInt(0,specs.length-1)], createdBy: admin.id });
    lawyers.push(l);
  }
  console.log(`Created ${lawyers.length} lawyers`);

  // create schedules: for each lawyer create between 8 and 20 tasks randomly across days in current month
  const schedules = [];
  for(const l of lawyers){
    const tasksCount = randInt(8, 20);
    const usedDays = new Set();
    for(let t=0;t<tasksCount;t++){
      // allow multiple tasks same day sometimes
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
      const s = await Schedule.create({ type: 'task', date, startTime, endTime, description: `Task for ${l.name}`, durationMinutes: dur, lawyerId: l.id, category: 'appointment' });
      schedules.push(s);
    }
  }
  console.log(`Created ${schedules.length} schedules/tasks`);

  console.log('Seed finished');
  process.exit(0);
}

seed().catch(err=>{ console.error(err); process.exit(1) })
