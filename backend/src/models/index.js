const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');

// Prefer explicit dialect when using sqlite in dev/test to ensure compatibility
let dialect;
if (config.databaseUrl && config.databaseUrl.startsWith('sqlite')) dialect = 'sqlite';
else if (config.databaseUrl && config.databaseUrl.startsWith('postgres')) dialect = 'postgres';

const sequelizeOptions = { logging: false };
if (dialect) sequelizeOptions.dialect = dialect;

const sequelize = new Sequelize(config.databaseUrl, sequelizeOptions);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, DataTypes);
db.Lawyer = require('./lawyer')(sequelize, DataTypes);
db.Schedule = require('./schedule')(sequelize, DataTypes);
db.Setting = require('./setting')(sequelize, DataTypes);

// Relations
db.User.hasMany(db.Lawyer, { foreignKey: 'createdBy' });
db.Lawyer.belongsTo(db.User, { foreignKey: 'createdBy' });

db.Lawyer.hasMany(db.Schedule, { foreignKey: 'lawyerId', onDelete: 'CASCADE' });
db.Schedule.belongsTo(db.Lawyer, { foreignKey: 'lawyerId' });

module.exports = db;
