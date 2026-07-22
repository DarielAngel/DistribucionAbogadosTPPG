const bcrypt = require('bcrypt');
const { sequelize, User } = require('../models');

async function main(){
  await sequelize.sync();
  const accounts = [
    { name: 'Manual Admin', email: 'admin_manual@example.com', password: 'AdminPass123!', role: 'admin' },
    { name: 'Manual Client', email: 'client_manual@example.com', password: 'ClientPass123!', role: 'client' }
  ];

  for(const a of accounts){
    const existing = await User.findOne({ where: { email: a.email } });
    const hash = await bcrypt.hash(a.password, 10);
    if(existing){
      existing.passwordHash = hash;
      existing.role = a.role;
      await existing.save();
      console.log(`Updated ${a.email} (${a.role})`);
    } else {
      await User.create({ name: a.name, email: a.email, passwordHash: hash, role: a.role });
      console.log(`Created ${a.email} (${a.role})`);
    }
  }

  console.log('\nCredentials created/updated:');
  console.log('  Admin:  admin_manual@example.com  / AdminPass123!');
  console.log('  Client: client_manual@example.com / ClientPass123!');
  process.exit(0);
}

main().catch(err=>{ console.error(err); process.exit(1); });
