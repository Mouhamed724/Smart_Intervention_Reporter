const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Site = sequelize.define('Site', {
  id_site: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  adresse_site: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }
}, {
  tableName: 'SITE',
  timestamps: false
});

module.exports = Site;