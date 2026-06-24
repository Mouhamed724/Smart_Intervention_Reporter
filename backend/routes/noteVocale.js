const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const noteVocaleController = require('../controllers/noteVocaleController');

// Configuration Multer pour l'audio
const storageAudio = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/audio/'),
  filename: (req, file, cb) => cb(null, 'audio_' + Date.now() + path.extname(file.originalname))
});
const uploadAudio = multer({ storage: storageAudio });

// Routes
router.post('/:id_intervention', uploadAudio.single('audio'), noteVocaleController.transcrireAudio);
router.put('/valider/:id_intervention', noteVocaleController.validerTranscription);

module.exports = router;