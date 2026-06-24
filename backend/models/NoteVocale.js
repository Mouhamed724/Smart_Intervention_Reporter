const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NoteVocale = sequelize.define('NoteVocale', {
  id_note: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fichier_audio: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  langue: { 
    type: DataTypes.STRING, 
    defaultValue: 'fr' 
  },
  transcription: { 
    type: DataTypes.TEXT 
  },
  validation: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false // RG-03
  },
  id_intervention: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    unique: true   // Contrainte UNIQUE de ton MLD
  }
}, {
  tableName: 'NOTE_VOCALE',
  timestamps: false
});

module.exports = NoteVocale;