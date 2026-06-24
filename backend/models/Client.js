const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id_client: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom_client: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  contact: { 
    type: DataTypes.STRING 
  }
}, {
  tableName: 'CLIENT', // Force le nom exact de la table dans MySQL
  timestamps: false     // On désactive les colonnes createdAt/updatedAt si tu ne les veux pas
});

module.exports = Client;