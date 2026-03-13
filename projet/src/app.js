/**
 * Application principale PlayHub
 * @author Tomy - Lead Developer
 * @team Tom (Dev), Lancelot (Manager)
 * @school Lycée Albert Einstein
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./config/database');
const { SERVER } = require('./config/constants');
const GameController = require('./controllers/GameController');
const SurvivalController = require('./controllers/SurvivalController');
const apiRoutes = require('./routes/api');

class PlayHubServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIO(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.setupMiddleware();
        this.setupRoutes();
        this.setupGameController();
    }

    /**
     * Configure les middlewares
     */
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Servir les fichiers statiques du client
        const clientPath = path.resolve(process.cwd(), 'client');
        this.app.use(express.static(clientPath));
        
        console.log('✅ Middlewares configurés');
        console.log('📁 Working directory:', process.cwd());
        console.log('📁 Client path:', clientPath);
        console.log('📁 __dirname:', __dirname);
    }

    /**
     * Configure les routes
     */
    setupRoutes() {
        // Routes API
        this.app.use('/api', apiRoutes);

        // Route principale
        this.app.get('/', (req, res) => {
            const indexPath = path.resolve(process.cwd(), 'client', 'index.html');
            console.log('📄 Trying to serve:', indexPath);
            res.sendFile(indexPath);
        });

        console.log('✅ Routes configurées');
    }

    /**
     * Configure le contrôleur de jeu
     */
    setupGameController() {
        this.gameController = new GameController(this.io);
        this.survivalController = new SurvivalController(this.io);
        this.app.set('gameService', this.gameController.getGameService());
        console.log('✅ Contrôleur de jeu initialisé');
        console.log('✅ Contrôleur survival multijoueur initialisé');
    }

    /**
     * Démarre le serveur
     */
    async start() {
        try {
            // Initialiser la base de données
            await initializeDatabase();
            
            // Initialiser le service de progression
            const ProgressService = require('./services/ProgressService');
            await ProgressService.initialize();

            // Démarrer le serveur
            this.server.listen(SERVER.PORT, () => {
                this.printBanner();
            });

            // Gestion des erreurs
            this.server.on('error', (error) => {
                console.error('❌ Erreur serveur:', error);
                process.exit(1);
            });

            // Gestion de l'arrêt gracieux
            this.setupGracefulShutdown();

        } catch (error) {
            console.error('❌ Erreur démarrage:', error);
            process.exit(1);
        }
    }

    /**
     * Configure l'arrêt gracieux
     */
    setupGracefulShutdown() {
        process.on('SIGTERM', () => {
            console.log('\n⚠️  Signal SIGTERM reçu');
            this.shutdown();
        });

        process.on('SIGINT', () => {
            console.log('\n⚠️  Signal SIGINT reçu');
            this.shutdown();
        });
    }

    /**
     * Arrête le serveur proprement
     */
    shutdown() {
        console.log('🔄 Arrêt du serveur...');
        
        this.server.close(() => {
            console.log('✅ Serveur arrêté');
            process.exit(0);
        });

        // Force l'arrêt après 10 secondes
        setTimeout(() => {
            console.error('⚠️  Arrêt forcé');
            process.exit(1);
        }, 10000);
    }

    /**
     * Affiche la bannière de démarrage
     */
    printBanner() {
        const serverIp = process.env.SERVER_IP || '0.0.0.0';
        const displayHost = serverIp === '0.0.0.0' ? '147.79.21.126' : serverIp;
        const displayPort = process.env.SERVER_PORT || SERVER.PORT;
        
        console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║              🎮  PlayHub Server v1.0                  ║
║          Battle Royale Pixel - 20 Joueurs            ║
║                                                       ║
║  👨‍💻 Développé par:                                    ║
║     • Tomy (Lead Developer)                          ║
║     • Tom (Developer)                                ║
║     • Lancelot (Manager)                             ║
║                                                       ║
║  🌐 Serveur: http://${displayHost}:${displayPort}           ║
║  📊 API: http://${displayHost}:${displayPort}/api           ║
║  ✅ Status: En ligne                                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
        `);
    }
}

module.exports = PlayHubServer;
