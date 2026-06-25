const { Intervention, Photo, Client, Site, Technicien } = require('../models');

exports.createIntervention = async (req, res) => {
  try {
    const { date_debut, date_fin, type_intervention, equipement, description_probleme, travaux_realises, recommandations, remarques_client, nom_client, contact_client, adresse_site, noms_techniciens, photosData } = req.body;

    // 1. FIND OR CREATE : Client
    const [client] = await Client.findOrCreate({
      where: { nom_client: nom_client },
      defaults: { contact: contact_client || '' }
    });

    // 2. FIND OR CREATE : Site
    const [site] = await Site.findOrCreate({
      where: { adresse_site: adresse_site }
    });

    // 3. Création de l'intervention
    const nouvelleIntervention = await Intervention.create({
      date_debut, date_fin, type_intervention, equipement, 
      description_probleme, travaux_realises, recommandations, remarques_client,
      id_client: client.id_client,
      id_site: site.id_site
    });

    // 4. FIND OR CREATE : Techniciens
    if (noms_techniciens) {
      const nomsArray = noms_techniciens.split(',');
      for (const nom of nomsArray) {
        const nomPropre = nom.trim();
        if (nomPropre) {
                  const [tech] = await Technicien.findOrCreate({
          where: { nom: nomPropre },
          defaults: { prenom: 'N/A' } // On met N/A par défaut car le formulaire ne sépare plus le prénom du nom
        });
          await nouvelleIntervention.addTechnicien(tech);
        }
      }
    }

    // 5. Gestion des photos
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
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de l'intervention" });
  }
};