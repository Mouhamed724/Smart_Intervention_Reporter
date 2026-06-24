const sequelize = require('../config/database');

// Importation des modèles
const Client = require('./Client');
const Site = require('./Site');
const Technicien = require('./Technicien');
const Intervention = require('./Intervention');
const Photo = require('./Photo');
const NoteVocale = require('./NoteVocale');
const Signature = require('./Signature');

// --- DÉFINITION DES RELATIONS ---

// Une INTERVENTION appartient à un CLIENT et un SITE
Intervention.belongsTo(Client, { foreignKey: 'id_client', as: 'client' });
Intervention.belongsTo(Site, { foreignKey: 'id_site', as: 'site' });

// Relation Many-to-Many via la table de liaison PARTICIPER
Intervention.belongsToMany(Technicien, { 
  through: 'PARTICIPER', 
  foreignKey: 'id_intervention', 
  otherKey: 'id_technicien',
  as: 'techniciens'
});
Technicien.belongsToMany(Intervention, { 
  through: 'PARTICIPER', 
  foreignKey: 'id_technicien', 
  otherKey: 'id_intervention',
  as: 'interventions'
});

// 1 Intervention a PLUSIEURS Photos
Intervention.hasMany(Photo, { foreignKey: 'id_intervention', as: 'photos' });
Photo.belongsTo(Intervention, { foreignKey: 'id_intervention' });

// 1 Intervention a UNE SEULE NoteVocale (grâce à unique: true)
Intervention.hasOne(NoteVocale, { foreignKey: 'id_intervention', as: 'noteVocale' });
NoteVocale.belongsTo(Intervention, { foreignKey: 'id_intervention' });

// 1 Intervention a UNE SEULE Signature (grâce à unique: true)
Intervention.hasOne(Signature, { foreignKey: 'id_intervention', as: 'signature' });
Signature.belongsTo(Intervention, { foreignKey: 'id_intervention' });


// --- SYNCHRONISATION ---
// On utilise { force: true } une seule fois pour créer les tables à vide. 
// Ensuite, mets-le en commentaire et utilise { alter: true } pour ne pas perdre tes données.
sequelize.sync({ force: false }) 
  .then(() => {
    console.log('✅ Toutes les tables ont été créées selon le MLD !');
  })
  .catch(err => console.error('❌ Erreur de création des tables :', err));

module.exports = { Client, Site, Technicien, Intervention, Photo, NoteVocale, Signature };