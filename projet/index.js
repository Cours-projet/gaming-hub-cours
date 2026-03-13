/**
 * Point d'entrée du serveur PlayHub
 * @author Tomy - Lead Developer
 * @school Lycée Albert Einstein
 */

require('dotenv').config();
const PlayHubServer = require('./src/app');

// Créer et démarrer le serveur
const server = new PlayHubServer();
server.start();

