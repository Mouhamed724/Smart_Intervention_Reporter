// backend/routes/intervention.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const interventionController = require('../controllers/interventionController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/photos/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// Route : Le routing appelle le controller
router.post('/', upload.array('photos', 10), interventionController.createIntervention);

module.exports = router;