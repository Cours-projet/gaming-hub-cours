/**
 * Routes API REST
 * @author Tomy - Lead Developer
 */

const express = require('express');
const router = express.Router();
const DatabaseService = require('../services/DatabaseService');
const ProgressService = require('../services/ProgressService');

/**
 * GET /api/health - Vérification de l'état du serveur
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        author: 'Tomy - PlayHub Team'
    });
});

/**
 * GET /api/stats - Statistiques du serveur
 */
router.get('/stats', async (req, res) => {
    try {
        const gameService = req.app.get('gameService');
        const globalStats = await DatabaseService.getGlobalStats();
        
        res.json({
            server: gameService.getStats(),
            global: globalStats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leaderboard - Classement des joueurs
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const leaderboard = await DatabaseService.getLeaderboard(limit);
        
        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/support - Créer un ticket de support
 */
router.post('/support', async (req, res) => {
    try {
        const { email, subject, message } = req.body;

        if (!email || !subject || !message) {
            return res.status(400).json({
                success: false,
                error: 'Tous les champs sont requis'
            });
        }

        const result = await DatabaseService.createSupportTicket(email, subject, message);
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/auth/login - Connexion
 */
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await DatabaseService.login(email, password);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/auth/signup - Inscription
 */
router.post('/auth/signup', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const result = await DatabaseService.signup(email, password, username);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/progress/:userId - Récupérer la progression
 */
router.get('/progress/:userId', async (req, res) => {
    try {
        const progress = await ProgressService.getProgress(req.params.userId);
        res.json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/progress/:userId - Sauvegarder la progression
 */
router.post('/progress/:userId', async (req, res) => {
    try {
        const progress = await ProgressService.updateProgress(req.params.userId, req.body);
        res.json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/progress/:userId - Réinitialiser la progression
 */
router.delete('/progress/:userId', async (req, res) => {
    try {
        const progress = await ProgressService.resetProgress(req.params.userId);
        res.json({ success: true, progress });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/settings/:userId - Récupérer les paramètres
 */
router.get('/settings/:userId', async (req, res) => {
    try {
        const settings = await ProgressService.getSettings(req.params.userId);
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/settings/:userId - Sauvegarder les paramètres
 */
router.post('/settings/:userId', async (req, res) => {
    try {
        const settings = await ProgressService.updateSettings(req.params.userId, req.body);
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
