const fs = require('fs');
const path = require('path');
const { Signature } = require('../models');

exports.enregistrerSignature = async (req, res) => {
  try {
    const { id_intervention } = req.params;
    const { image_signature } = req.body;

    const base64Data = image_signature.replace(/^data:image\/png;base64,/, "");
    
    const nomFichier = `signature_${id_intervention}_${Date.now()}.png`;
    const cheminDossier = path.join(__dirname, '../uploads/signatures');
    
    if (!fs.existsSync(cheminDossier)) {
      fs.mkdirSync(cheminDossier, { recursive: true });
    }

    const cheminFichier = path.join(cheminDossier, nomFichier);
    fs.writeFileSync(cheminFichier, base64Data, 'base64');

    await Signature.create({
      image_signature: cheminFichier,
      id_intervention: id_intervention
    });

    res.status(201).json({ message: "Signature enregistrée avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement de la signature" });
  }
};