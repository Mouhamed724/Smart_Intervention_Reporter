// 1. Importations des modules de base
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const path = require('path');

// 2. Initialisation de l'application
const app = express();

// 3. Middleware (Configurations de base)
app.use(cors()); 
app.use(express.json()); 

// 4. Sert les fichiers statiques (photos, audios, signatures uploadés)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Importation des modèles (crée les tables au démarrage)
require('./models');

// ---------------------------------------------------------
// 6. IMPORTATION DES ROUTES
// ---------------------------------------------------------
const interventionRoutes = require('./routes/intervention');
const noteVocaleRoutes = require('./routes/noteVocale');
const signatureRoutes = require('./routes/signature');
const pdfRoutes = require('./routes/pdf'); // <--- NOUVELLE LIGNE AJOUTÉE ICI
const listesRoutes = require('./routes/listes');
app.use('/api/listes', listesRoutes);
// ---------------------------------------------------------
// 7. DÉCLARATION DES ROUTES
// ---------------------------------------------------------
app.use('/api/interventions', interventionRoutes);
app.use('/api/notes-vocales', noteVocaleRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/pdf', pdfRoutes); // <--- NOUVELLE LIGNE AJOUTÉE ICI

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ message: "Le serveur DGS Backend est en ligne !" });
});

// 8. Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend lancé sur : http://localhost:${PORT}`);
});