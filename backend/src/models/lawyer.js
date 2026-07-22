module.exports = (sequelize, DataTypes) => {
  const Lawyer = sequelize.define('Lawyer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    province: { type: DataTypes.STRING },
    municipality: { type: DataTypes.STRING },
    specialization: { type: DataTypes.STRING }
  });
  return Lawyer;
};
