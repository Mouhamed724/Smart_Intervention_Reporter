const express = require('express');
const router = express.Router();
const signatureController = require('../controllers/signatureController');

router.post('/:id_intervention', signatureController.enregistrerSignature);

module.exports = router;