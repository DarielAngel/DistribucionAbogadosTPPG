module.exports = (sequelize, DataTypes) => {
  const AdminLog = sequelize.define('AdminLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING(100), allowNull: false },
    route: { type: DataTypes.STRING(200), allowNull: true },
    ip: { type: DataTypes.STRING(50), allowNull: true },
    details: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: 'admin_logs',
    timestamps: true
  });

  return AdminLog;
};
