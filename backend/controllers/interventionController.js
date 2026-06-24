// backend/controllers/interventionController.js
const { Intervention, Photo, Client, Site, Technicien } = require('../models');

exports.createIntervention = async (req, res) => {
  try {
    const { date_debut, date_fin, type_intervention, equipement, description_probleme, travaux_realises, recommandations, remarques_client, id_client, id_site, technicienIds, photosData } = req.body;

    // Création (Model)
    const nouvelleIntervention = await Intervention.create({
      date_debut, date_fin, type_intervention, equipement, 
      description_probleme, travaux_realises, recommandations, remarques_client,
      id_client: parseInt(id_client), id_site: parseInt(id_site)
    });

    // Liaison Many-to-Many
    if (technicienIds) {
      const ids = technicienIds.split(',').map(id => parseInt(id));
      await nouvelleIntervention.setTechniciens(ids);
    }

    // Gestion des photos
    if (req.files && req.files.length > 0) {
      const photosParsees = JSON.parse(photosData);
      for (let i = 0; i < req.files.length; i++) {
        await Photo.create({
          chemin_photo: req.files[i].path,
          categorie: photosParsees[i].categorie,
          legende: photosParsees[i].legende,
          id_intervention: nouvelleIntervention.id_intervention
        });
      }
    }

    res.status(201).json({ message: "Intervention créée avec succès !", id: nouvelleIntervention.id_intervention });

  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};