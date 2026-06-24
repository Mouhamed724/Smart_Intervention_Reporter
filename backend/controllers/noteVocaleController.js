const fs = require('fs');
const { NoteVocale } = require('../models');

// On vérifie ce que dit le fichier .env
const USE_REAL_WHISPER = process.env.USE_REAL_WHISPER === 'true';

// Si l'interrupteur est sur "true", on charge OpenAI
let openai;
if (USE_REAL_WHISPER) {
  const OpenAI = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// 1. Uploader et Transcrire
exports.transcrireAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier audio fourni" });

    const { id_intervention } = req.params;
    const { langue } = req.body;
    const cheminFichier = req.file.path;

    let texteTranscrit = "";

    // --- LA MAGIE DE L'INTERRUPTEUR ---
    if (USE_REAL_WHISPER) {
      // MODE OPÉRATIONNEL : On appelle la vraie API Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(cheminFichier),
        model: "whisper-1",
        language: langue || "fr",
      });
      texteTranscrit = transcription.text;
      
    } else {
      // MODE SIMULATION (Bouchon) : On génère un faux texte pour tester
      // On simule un délai réseau de 2 secondes pour que ça soit réaliste
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (langue === 'en') {
        texteTranscrit = "[SIMULATION] The equipment was completely offline. I had to reset the main circuit board and check the power supply. Everything seems stable now.";
      } else {
        texteTranscrit = "[SIMULATION] L'équipement était totalement hors service. J'ai dû réinitialiser la carte mère principale et vérifier l'alimentation. Tout semble stable maintenant.";
      }
    }

    // Sauvegarde en BDD (validation = false par défaut, RG-03)
    await NoteVocale.create({
      fichier_audio: cheminFichier,
      langue: langue || 'fr',
      transcription: texteTranscrit,
      validation: false,
      id_intervention: id_intervention
    });

    res.status(201).json({ 
      message: "Transcription terminée", 
      texte: texteTranscrit 
    });

  } catch (error) {
    console.error("Erreur Transcription:", error.message);
    res.status(500).json({ error: "Erreur lors de la transcription vocale" });
  }
};

// 2. Valider et modifier la transcription (RG-03)
exports.validerTranscription = async (req, res) => {
  try {
    const { id_intervention } = req.params;
    const { nouveauTexte } = req.body;

    const note = await NoteVocale.findOne({ where: { id_intervention } });
    if (!note) return res.status(404).json({ error: "Aucune note vocale pour cette intervention" });

    note.transcription = nouveauTexte;
    note.validation = true; // RG-03 validée
    await note.save();

    res.status(200).json({ message: "Transcription validée avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la validation" });
  }
};