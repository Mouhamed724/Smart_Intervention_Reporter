const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Signature = sequelize.define('Signature', {
  id_signature: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  image_signature: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  date_signature: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW // RG-05 (Horodatage)
  },
  id_intervention: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    unique: true   // Contrainte UNIQUE de ton MLD
  }
}, {
  tableName: 'SIGNATURE',
  timestamps: false
});

module.exports = Signature;