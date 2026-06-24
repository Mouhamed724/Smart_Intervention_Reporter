require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('dgs_reporter', 'root', '24122004aloyene', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // Mettre à true pour voir les requêtes SQL dans la console (utile pour débugger)
});

module.exports = sequelize;