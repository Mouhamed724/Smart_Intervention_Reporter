const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Intervention = sequelize.define('Intervention', {
  id_intervention: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date_debut: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  date_fin: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  type_intervention: { 
    type: DataTypes.STRING, 
    allowNull: false // RG-01
  },
  equipement: { 
    type: DataTypes.STRING 
  },
  description_probleme: { 
    type: DataTypes.TEXT 
  },
  travaux_realises: { 
    type: DataTypes.TEXT, 
    allowNull: false // RG-01
  },
  recommandations: { 
    type: DataTypes.TEXT 
  },
    remarques_client: { 
    type: DataTypes.TEXT 
  },
  id_client: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  id_site: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  }
}, {
  tableName: 'INTERVENTION',
  timestamps: false
});

module.exports = Intervention;