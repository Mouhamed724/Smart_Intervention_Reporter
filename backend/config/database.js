require('dotenv').config();
const { Sequelize } = require('sequelize');

// Si une URL de base de données complète est fournie (en ligne), on l'utilise. Sinon (en local), on utilise les identifiants.
const sequelize = new Sequelize(process.env.DATABASE_URL || 'dgs_reporter', 'root', 'ton_mot_de_passe_mysql_local', {
  dialect: 'mysql',
  logging: false,
  dialectOptions: process.env.DATABASE_URL ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

module.exports = sequelize;