const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  logging: false
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, DataTypes);
db.Lawyer = require('./lawyer')(sequelize, DataTypes);
db.Schedule = require('./schedule')(sequelize, DataTypes);

// Relations
db.User.hasMany(db.Lawyer, { foreignKey: 'createdBy' });
db.Lawyer.belongsTo(db.User, { foreignKey: 'createdBy' });

db.Lawyer.hasMany(db.Schedule, { foreignKey: 'lawyerId', onDelete: 'CASCADE' });
db.Schedule.belongsTo(db.Lawyer, { foreignKey: 'lawyerId' });

module.exports = db;
