const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Intervention, Client, Site, Technicien, Photo, NoteVocale, Signature } = require('../models');

exports.genererRapport = async (req, res) => {
  try {
    const { id_intervention } = req.params;

    const intervention = await Intervention.findOne({
      where: { id_intervention },
      include: [
        { model: Client, as: 'client' },
        { model: Site, as: 'site' },
        { model: Technicien, as: 'techniciens', through: { attributes: [] } },
        { model: Photo, as: 'photos', order: [['categorie', 'ASC']] },
        { model: NoteVocale, as: 'noteVocale' },
        { model: Signature, as: 'signature' }
      ]
    });

    if (!intervention) return res.status(404).json({ error: "Intervention non trouvée" });
    if (intervention.noteVocale && !intervention.noteVocale.validation) {
      return res.status(400).json({ error: "La note vocale n'a pas été validée (RG-03)" });
    }
    if (!intervention.signature) {
      return res.status(400).json({ error: "La signature du client est manquante (RG-05)" });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filePath = path.join(__dirname, `../uploads/rapport_${id_intervention}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // --- MISE EN PAGE AMÉLIORÉE ---

    // 01. Logo
    const logoPath = path.join(__dirname, '../assets/logo_dgs.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 100 });
    }
    doc.moveDown(5); // Espace sous le logo

    // 02. Titre
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#1a365d').text('RAPPORT D\'INTERVENTION', { align: 'center' });
    doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).lineWidth(2).stroke(); // Ligne sous le titre
    doc.moveDown(1);
    doc.fillColor('black'); // Remet le texte en noir

    // 03 & 04. Infos Client et Site (encadré)
    doc.fontSize(11).font('Helvetica-Bold').text('INFORMATIONS DU CLIENT & SITE', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').text(`Client : ${intervention.client.nom_client}  |  Contact : ${intervention.client.contact || 'N/A'}`);
    doc.text(`Site : ${intervention.site.adresse_site}`);
    doc.moveDown(1);

    // 05, 06, 07. Infos Intervention
    doc.font('Helvetica-Bold').text("DÉTAILS DE L'INTERVENTION", { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').text(`Date/Heure : ${new Date(intervention.date_debut).toLocaleString()} au ${new Date(intervention.date_fin).toLocaleString()}`);
    doc.text(`Technicien(s) : ${intervention.techniciens.map(t => `${t.prenom} ${t.nom}`).join(', ')}`);
    doc.text(`Type : ${intervention.type_intervention}  |  Équipement : ${intervention.equipement || 'N/A'}`);
    doc.moveDown(1.5);

    // 08. Travaux réalisés
    doc.font('Helvetica-Bold').text('TRAVAUX RÉALISÉS', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').text(intervention.travaux_realises, { align: 'justify' });
    
    if (intervention.description_probleme) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Diagnostic :');
      doc.font('Helvetica').text(intervention.description_probleme, { align: 'justify' });
    }
    doc.moveDown(1.5);

    // 09. Notes vocales
    if (intervention.noteVocale) {
      doc.font('Helvetica-Bold').text('NOTES DU TECHNICIEN', { underline: true });
      doc.moveDown(0.5);
      doc.font('Helvetica-Oblique').fillColor('#444').text(intervention.noteVocale.transcription, { align: 'justify' });
      doc.fillColor('black');
      doc.moveDown(1.5);
    }

    // 10. Photos (CORRECTION DU SUPERPOSITION)
    if (intervention.photos.length > 0) {
      // Vérifie s'il reste assez de place, sinon saut de page
      if (doc.y > 550) doc.addPage(); 

      doc.font('Helvetica-Bold').text('PHOTOS D\'INTERVENTION', { underline: true });
      doc.moveDown(0.5);

      for (const photo of intervention.photos) {
               let photoPath = photo.chemin_photo;
        if (!path.isAbsolute(photoPath)) {
            photoPath = path.join(__dirname, '..', photoPath);
        }
        
        if (fs.existsSync(photoPath)) {
          // S'il ne reste plus assez d'espace pour une image, on change de page !
          if (doc.y > 600) doc.addPage();

          // Légende
          doc.font('Helvetica-Bold').fillColor('#2563eb').text(`[${photo.categorie.toUpperCase()}]`, { continued: true });
          doc.fillColor('black').font('Helvetica').text(` - ${photo.legende || ''}`);
          
          // SAUVEGARDER LA POSITION Y ACTUELLE
          const currentPositionY = doc.y;
          
          // Placer l'image
          doc.image(photoPath, 50, currentPositionY, { width: 200, height: 140 });
          
          // FORCER LE CURSEUR À DESCENDRE EN DESSOUS DE L'IMAGE + UN ESPACE
          doc.y = currentPositionY + 160; 
          doc.x = 50; // Remettre le curseur à gauche
        }
      }
      doc.moveDown(1.5);
    }

    // 11 & 12. Recommandations et Remarques
    if (intervention.recommandations || intervention.remarques_client) {
      if (doc.y > 650) doc.addPage();
      doc.font('Helvetica-Bold').text('RECOMMANDATIONS & REMARQUES', { underline: true });
      doc.moveDown(0.5);
      if (intervention.recommandations) {
        doc.font('Helvetica-Bold').text('Recommandations : ');
        doc.font('Helvetica').text(intervention.recommandations, { align: 'justify' });
      }
      if (intervention.remarques_client) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('Remarques client : ');
        doc.font('Helvetica').text(intervention.remarques_client, { align: 'justify' });
      }
      doc.moveDown(1.5);
    }

    // 13. Signature
    if (doc.y > 650) doc.addPage();
    doc.font('Helvetica-Bold').text('SIGNATURE DU CLIENT', { underline: true });
    doc.moveDown(0.5);
    
    // On vérifie si le chemin est déjà complet (absolu) ou s'il manque le début
    let signaturePath = intervention.signature.image_signature;
    if (!path.isAbsolute(signaturePath)) {
        signaturePath = path.join(__dirname, '..', signaturePath);
    }
    if (fs.existsSync(signaturePath)) {
      // Dessiner un cadre pour la signature
      doc.save();
      doc.rect(50, doc.y, 200, 100).stroke();
      doc.restore();
      
      doc.image(signaturePath, 55, doc.y + 5, { width: 180, height: 85 });
      doc.y = doc.y + 110; // Descendre après la signature
      doc.x = 50;
      
      doc.font('Helvetica').fillColor('gray').text(`Signé électroniquement le : ${new Date(intervention.signature.date_signature).toLocaleString()}`);
      doc.fillColor('black');
    } else {
      // SI LA SIGNATURE N'APPARAÎT TOUJOURS PAS, CE TEXTE S'AFFICHERA POUR NOUS DIRE POURQUOI
      doc.fillColor('red').font('Helvetica-Bold').text(`ERREUR : Fichier signature introuvable au chemin : ${signaturePath}`);
      doc.fillColor('black');
    }

    // 14. Pied de page
    doc.moveDown(3);
    doc.fontSize(9).font('Helvetica-Bold').text('DYNAMIC GLOBAL SERVICES (DGS Africa)', { align: 'center' });
    doc.font('Helvetica').text('Dakar, Sénégal | +221 33 800 00 00 | contact@dgs-africa.com', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, `Rapport_DGS_${id_intervention}.pdf`);
    });

  } catch (error) {
    console.error("Erreur PDF:", error);
    res.status(500).json({ error: "Erreur lors de la génération du PDF" });
  }
};