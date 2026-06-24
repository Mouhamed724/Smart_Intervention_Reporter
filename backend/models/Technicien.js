const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Technicien = sequelize.define('Technicien', {
  id_technicien: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  prenom: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  telephone: { 
    type: DataTypes.STRING 
  }
}, {
  tableName: 'TECHNICIEN',
  timestamps: false
});

module.exports = Technicien;