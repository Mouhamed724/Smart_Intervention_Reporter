const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Photo = sequelize.define('Photo', {
  id_photo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chemin_photo: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  categorie: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      isIn: [['avant', 'pendant', 'apres']] // RG-02
    }
  },
  legende: { 
    type: DataTypes.STRING 
  },
  id_intervention: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  }
}, {
  tableName: 'PHOTO',
  timestamps: false
});

module.exports = Photo;