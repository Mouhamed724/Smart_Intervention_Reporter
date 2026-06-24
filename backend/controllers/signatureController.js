const fs = require('fs');
const path = require('path');
const { Signature } = require('../models');

exports.enregistrerSignature = async (req, res) => {
  try {
    const { id_intervention } = req.params;
    const { image_signature } = req.body;

    // On enlève le préfixe "data:image/png;base64," pour avoir que les données brutes
    const base64Data = image_signature.replace(/^data:image\/png;base64,/, "");
    
    // On génère un nom de fichier unique
    const nomFichier = `signature_${id_intervention}_${Date.now()}.png`;
    const cheminDossier = path.join(__dirname, '../uploads/signatures');
    
    // Créer le dossier s'il n'existe pas (comme pour les photos)
    if (!fs.existsSync(cheminDossier)) {
      fs.mkdirSync(cheminDossier, { recursive: true });
    }

    // Sauvegarder l'image physique sur le disque
    const cheminFichier = path.join(cheminDossier, nomFichier);
    fs.writeFileSync(cheminFichier, base64Data, 'base64');

    // Sauvegarder dans la base de données (RG-05 : horodatage automatique via defaultValue: DataTypes.NOW)
    await Signature.create({
      image_signature: cheminFichier,
      id_intervention: id_intervention
    });

    res.status(201).json({ message: "Signature enregistrée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement de la signature" });
  }
};