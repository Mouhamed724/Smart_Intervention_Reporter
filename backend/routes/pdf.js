const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

router.get('/:id_intervention', pdfController.genererRapport);

module.exports = router;