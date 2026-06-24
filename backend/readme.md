 Smart Intervention Reporter - DGS Africa
Node.jsReactMySQLTailwind CSS

 Contexte et Problématique
Dynamic Global Services (DGS Africa) réalise quotidiennement des interventions techniques (climatisation, électricité, plomberie, etc.). Jusqu'à présent, les rapports d'intervention étaient rédigés manuellement, engendrant des pertes de temps, des pertes de données et une présentation non uniforme.

L'objectif est de digitaliser ce processus via une application web responsive permettant aux techniciens de générer automatiquement un rapport PDF professionnel sur le terrain, incluant des photos, la transcription de notes vocales et la signature du client.
Fonctionnalités principales (MVP)
Formulaire dynamique : Saisie des informations client, site, diagnostic et travaux réalisés avec validation des champs obligatoires.
Gestion des photos : Upload et catégorisation stricte des photos (Avant, Pendant, Après) avec légendes.
Notes vocales intelligentes : Enregistrement ou import audio avec transcription automatique (Français/Anglais) via IA, et correction manuelle avant validation.
Signature digitale : Zone de dessin responsive (Canvas) avec horodatage et verrouillage de la signature.
Génération PDF : Assemblage automatique des 14 éléments exigés (Logo, infos, photos redimensionnées, transcription, signature) en un document PDF téléchargeable.
 Architecture & Technologies
Le projet suit une Architecture MVC (Modèle-Vue-Contrôleur) stricte, séparant clairement les responsabilités.

Couche	Technologie	Rôle
Frontend	React.js, Vite, Tailwind CSS	Interface utilisateur responsive (Mobile First)
Backend	Node.js, Express.js	API REST sécurisée
Base de données	MySQL, Sequelize (ORM)	Gestion des données relationnelles
Signature	signature_pad	Capture Canvas HTML5 native
Transcription	OpenAI Whisper API	Speech-to-text (FR/EN)
Génération PDF	PDFKit	Mise en page A4 dynamique avec gestion des sauts de page
 Structure du projet
smart-intervention-reporter/│├── backend/│   ├── config/           # Configuration de la base de données│   ├── controllers/      # Logique métier (MVC - Controllers)│   ├── models/           # Schémas Sequelize (MVC - Models)│   ├── routes/           # Points d'entrée API (MVC - Routes)│   ├── uploads/          # Stockage local (photos, audios, signatures)│   ├── assets/           # Fichiers statiques (Logo DGS)│   ├── .env              # Variables d'environnement (Clés API)│   └── server.js         # Point d'entrée du serveur│├── frontend/│   ├── src/│   │   ├── components/   # Composants React (Formulaire, Signature, Audio)│   │   └── App.jsx│   └── ...config (Tailwind, Vite)│└── README.md
 Installation et Lancement
Prérequis
Node.js (v18 ou supérieur)
MySQL Server (WAMP, XAMPP, ou natif)
Un éditeur de code (VS Code recommandé)
1. Base de données
Créez une base de données vide nommée dgs_reporter dans votre gestionnaire MySQL (ex: phpMyAdmin).

2. Configuration du Backend
bash

cd backend
npm install
Créez un fichier .env à la racine du dossier backend et configurez-le :

env

PORT=3000
# Identifiants MySQL
DB_USER=root
DB_PASS=votre_mot_de_passe_mysql
DB_NAME=dgs_reporter

# Clé API OpenAI (Nécessaire pour la vraie transcription vocale)
OPENAI_API_KEY=sk-votre_cle_api
# Mettre "false" pour utiliser le mode simulation gratuit
USE_REAL_WHISPER=false 
3. Dossiers de stockage
Créez manuellement ces dossiers dans backend/uploads/ :

photos/
audio/
signatures/
Placez le logo de DGS Africa dans backend/assets/logo_dgs.png.

4. Lancement du serveur
bash

# Dans le dossier backend
node server.js
# Les tables MySQL se créent automatiquement (Synchronisation Sequelize)
5. Lancement du Frontend
bash

cd frontend
npm install
npm run dev
L'application est accessible sur http://localhost:5173.

 Règles de Gestion Respectées (Cahier des charges)
RG-01 : Le bouton de sauvegarde est bloqué si les champs Client, Date, Type et Travaux sont vides.
RG-02 : L'ajout d'une photo exige obligatoirement la sélection d'une catégorie (Avant/Pendant/Après).
RG-03 : La transcription vocale ne peut pas être intégrée au PDF sans avoir été explicitement validée par le technicien.
RG-04 : La route de génération PDF effectue une vérification complète des données (RG-01 à RG-03) avant de compiler le document.
RG-05 : La signature est enregistrée avec un horodatage SQL (DEFAULT CURRENT_TIMESTAMP) et liée de manière unique (UNIQUE) à l'intervention.
 Évolutions futures (Phase 2)
Ce MVP a été conçu pour être évolutif. Les fonctionnalités suivantes pourront être ajoutées par la suite :

Tableau de bord (Dashboard) pour les coordinateurs et managers.
Envoi automatique du PDF par Email ou WhatsApp via API (Twilio/Meta).
Génération de QR Codes collés sur les équipements pour un accès rapide.
Connexion avec un CMMS (Gestion de Maintenance Assistée par Ordinateur).
Authentification complète avec JWT et gestion des rôles (Admin, Tech, Manager).
👨‍💻 Auteur
Mouhamed LO - Stage Bac+2 Informatique
Entreprise : Dynamic Global Services (DGS Africa)
Année : 2026