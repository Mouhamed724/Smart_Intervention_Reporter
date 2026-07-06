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
    if (intervention.noteVocale && !intervention.noteVocale.validation) return res.status(400).json({ error: "Note vocale non validée (RG-03)" });
    if (!intervention.signature) return res.status(400).json({ error: "Signature manquante (RG-05)" });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filePath = path.join(__dirname, `../uploads/rapport_${id_intervention}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const getAbsolutePath = (relativePath) => {
      if (path.isAbsolute(relativePath)) return relativePath;
      return path.join(__dirname, '..', relativePath);
    };

    // 01. Logo DGS
    const logoPath = getAbsolutePath('assets/logo_dgs.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 100 });
    }
    doc.moveDown(5);

    // 02. Titre du rapport
    const titrePdf = intervention.titre_rapport ? intervention.titre_rapport.toUpperCase() : "RAPPORT D'INTERVENTION";
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#1a365d').text(titrePdf, { align: 'center' });
    doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).lineWidth(2).stroke();
    doc.moveDown(1.5);
    doc.fillColor('black');

    // 03. Informations client
    doc.fontSize(11).font('Helvetica-Bold').text('INFORMATIONS CLIENT', { underline: true });
    doc.moveDown(0.3);
    doc.font('Helvetica').text(`Raison sociale / Nom : ${intervention.client.nom_client}`);
    doc.text(`Contact : ${intervention.client.contact || 'N/A'}`);
    doc.moveDown(1);

    // 04. Informations site
    doc.font('Helvetica-Bold').text('INFORMATIONS SITE', { underline: true });
    doc.moveDown(0.3);
    doc.font('Helvetica').text(`Adresse / Localisation : ${intervention.site.adresse_site}`);
    doc.moveDown(1);

    // 05. Date et heure
    doc.font('Helvetica-Bold').text('DATE ET HEURE', { underline: true });
    doc.moveDown(0.3);
    doc.font('Helvetica').text(`Début : ${new Date(intervention.date_debut).toLocaleString()}`);
    doc.text(`Fin : ${new Date(intervention.date_fin).toLocaleString()}`);
    doc.moveDown(1);

    // 06. Nom des techniciens
    doc.font('Helvetica-Bold').text('TECHNICIEN(S) ASSIGNÉ(S)', { underline: true });
    doc.moveDown(0.3);
    const nomsTechs = intervention.techniciens.map(t => `- ${t.nom}`).join('\n');
    doc.font('Helvetica').text(nomsTechs || 'Aucun technicien assigné');
    doc.moveDown(1);

    // 07. Type d'intervention
    doc.font('Helvetica-Bold').text("TYPE D'INTERVENTION", { underline: true });
    doc.moveDown(0.3);
    doc.font('Helvetica').text(intervention.type_intervention);
    if (intervention.equipement) {
      doc.text(`Équipement concerné : ${intervention.equipement}`);
    }
    doc.moveDown(1.5);

    // 08. Travaux réalisés
    doc.font('Helvetica-Bold').text('TRAVAUX RÉALISÉS', { underline: true });
    doc.moveDown(0.3);
    doc.font('Helvetica').text(intervention.travaux_realises, { align: 'justify' });
    if (intervention.description_probleme) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Diagnostic initial :');
      doc.font('Helvetica').text(intervention.description_probleme, { align: 'justify' });
    }
    doc.moveDown(1.5);

    // 09. Notes vocales
    if (intervention.noteVocale) {
      doc.font('Helvetica-Bold').text('NOTES VOCALES TRANSCRITES', { underline: true });
      doc.moveDown(0.3);
      doc.font('Helvetica-Oblique').fillColor('#444').text(intervention.noteVocale.transcription, { align: 'justify' });
      doc.fillColor('black');
      doc.moveDown(1.5);
    }

    // 10. Photos
    if (intervention.photos.length > 0) {
      if (doc.y > 550) doc.addPage(); 
      doc.font('Helvetica-Bold').text("PHOTOS D'INTERVENTION", { underline: true });
      doc.moveDown(0.5);
      for (const photo of intervention.photos) {
        const photoPath = getAbsolutePath(photo.chemin_photo);
        if (fs.existsSync(photoPath)) {
          if (doc.y > 600) doc.addPage();
          doc.font('Helvetica-Bold').fillColor('#2563eb').text(`[${photo.categorie.toUpperCase()}]`, { continued: true });
          doc.fillColor('black').font('Helvetica').text(` - ${photo.legende || 'Sans légende'}`);
          const currentPositionY = doc.y;
          doc.image(photoPath, 50, currentPositionY, { width: 200, height: 140 });
          doc.y = currentPositionY + 160; 
          doc.x = 50;
        }
      }
      doc.moveDown(1.5);
    }

    // 11. Recommandations
    if (intervention.recommandations) {
      if (doc.y > 650) doc.addPage();
      doc.font('Helvetica-Bold').text('RECOMMANDATIONS', { underline: true });
      doc.moveDown(0.3);
      doc.font('Helvetica').text(intervention.recommandations, { align: 'justify' });
      doc.moveDown(1.5);
    }

    // 12. Remarques client
    if (intervention.remarques_client) {
      if (doc.y > 650) doc.addPage();
      doc.font('Helvetica-Bold').text('REMARQUES CLIENT', { underline: true });
      doc.moveDown(0.3);
      doc.font('Helvetica').text(intervention.remarques_client);
      doc.moveDown(1.5);
    }

    // 13. Signature client
    if (doc.y > 650) doc.addPage();
    doc.font('Helvetica-Bold').text('SIGNATURE CLIENT', { underline: true });
    doc.moveDown(0.5);
    const signaturePath = getAbsolutePath(intervention.signature.image_signature);
    if (fs.existsSync(signaturePath)) {
      doc.save();
      doc.rect(50, doc.y, 200, 100).stroke();
      doc.restore();
      doc.image(signaturePath, 55, doc.y + 5, { width: 180, height: 85 });
      doc.y = doc.y + 110; 
      doc.x = 50;
      doc.font('Helvetica').fillColor('gray').text(`Signé le : ${new Date(intervention.signature.date_signature).toLocaleString()}`);
      doc.fillColor('black');
    }

    // 14. Coordonnées DGS
    doc.moveDown(4);
    doc.fontSize(9).font('Helvetica-Bold').text('DYNAMIC GLOBAL SERVICES (DGS Africa)', { align: 'center' });
    doc.font('Helvetica').text('Dakar, Sénégal | +221 33 800 00 00 | contact@dgs-africa.com', { align: 'center' });

    doc.end();
    stream.on('finish', () => res.download(filePath, `Rapport_DGS_${id_intervention}.pdf`));

  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la génération du PDF" });
  }
};