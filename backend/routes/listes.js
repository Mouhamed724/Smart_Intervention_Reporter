const express = require('express');
const router = express.Router();
const { Client, Site, Technicien } = require('../models');

// Récupérer tous les clients
router.get('/clients', async (req, res) => {
  const clients = await Client.findAll();
  res.json(clients);
});

// Récupérer tous les sites
router.get('/sites', async (req, res) => {
  const sites = await Site.findAll();
  res.json(sites);
});

// Récupérer tous les techniciens
router.get('/techniciens', async (req, res) => {
  const techniciens = await Technicien.findAll();
  res.json(techniciens);
});

module.exports = router;