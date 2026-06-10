module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define('Schedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.ENUM('free','task'), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: { type: DataTypes.TIME },
    endTime: { type: DataTypes.TIME },
    description: { type: DataTypes.TEXT },
    durationMinutes: { type: DataTypes.INTEGER },
    category: { type: DataTypes.STRING }
  });
  return Schedule;
};
