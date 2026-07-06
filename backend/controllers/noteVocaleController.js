const fs = require('fs');
const { NoteVocale } = require('../models');

const USE_REAL_WHISPER = process.env.USE_REAL_WHISPER === 'true';

let openai;
if (USE_REAL_WHISPER) {
  const OpenAI = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

exports.transcrireAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier audio fourni" });

    const { id_intervention } = req.params;
    const { langue } = req.body;
    const cheminFichier = req.file.path;

    let texteTranscrit = "";

    if (USE_REAL_WHISPER) {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(cheminFichier),
        model: "whisper-1",
        language: langue || "fr",
      });
      texteTranscrit = transcription.text;
      
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
      texteTranscrit = langue === 'en' 
        ? "[SIMULATION] The equipment was completely offline. I had to reset the main circuit board." 
        : "[SIMULATION] L'équipement était totalement hors service. J'ai dû réinitialiser la carte mère principale.";
    }

    await NoteVocale.create({
      fichier_audio: cheminFichier,
      langue: langue || 'fr',
      transcription: texteTranscrit,
      validation: false,
      id_intervention: id_intervention
    });

    res.status(201).json({ texte: texteTranscrit });

  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la transcription vocale" });
  }
};

exports.validerTranscription = async (req, res) => {
  try {
    const { id_intervention } = req.params;
    const { nouveauTexte } = req.body;

    const note = await NoteVocale.findOne({ where: { id_intervention } });
    if (!note) return res.status(404).json({ error: "Aucune note vocale pour cette intervention" });

    note.transcription = nouveauTexte;
    note.validation = true;
    await note.save();

    res.status(200).json({ message: "Transcription validée avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la validation" });
  }
};