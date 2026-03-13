/**
 * Service de gestion de la base de données JSON
 * @author Tomy - Lead Developer
 * @team Tom (Dev)
 * @school Lycée Albert Einstein
 */

const { db } = require('../config/database');

class DatabaseService {
    /**
     * Sauvegarde ou met à jour les statistiques d'un joueur
     */
    static async updatePlayerStats(player) {
        try {
            await db.sessions.create(
                player.id,
                player.username,
                player.kills,
                player.deaths,
                Date.now() - player.createdAt
            );
        } catch (error) {
            console.error('❌ Erreur sauvegarde stats:', error.message);
        }
    }

    /**
     * Récupère le profil d'un joueur
     */
    static async getPlayerProfile(userId) {
        try {
            return await db.players.findByUserId(userId);
        } catch (error) {
            console.error('❌ Erreur récupération profil:', error.message);
            return null;
        }
    }

    /**
     * Crée un profil joueur
     */
    static async createPlayerProfile(userId, username) {
        try {
            return await db.players.create(userId, username);
        } catch (error) {
            console.error('❌ Erreur création profil:', error.message);
            return null;
        }
    }

    /**
     * Récupère le classement des joueurs
     */
    static async getLeaderboard(limit = 10) {
        try {
            return await db.players.getLeaderboard(limit);
        } catch (error) {
            console.error('❌ Erreur récupération classement:', error.message);
            return [];
        }
    }

    /**
     * Enregistre un ticket de support
     */
    static async createSupportTicket(email, subject, message) {
        try {
            const ticket = await db.tickets.create(email, subject, message);
            return { success: true, data: ticket };
        } catch (error) {
            console.error('❌ Erreur création ticket:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Récupère les statistiques globales
     */
    static async getGlobalStats() {
        try {
            const sessions = await db.sessions.getAll();

            const totalKills = sessions.reduce((sum, s) => sum + s.kills, 0);
            const totalDeaths = sessions.reduce((sum, s) => sum + s.deaths, 0);
            const totalGames = sessions.length;

            return {
                totalKills,
                totalDeaths,
                totalGames,
                averageKillsPerGame: totalGames > 0 ? (totalKills / totalGames).toFixed(2) : 0
            };
        } catch (error) {
            console.error('❌ Erreur stats globales:', error.message);
            return null;
        }
    }

    /**
     * Authentification utilisateur
     */
    static async login(email, password) {
        try {
            const user = await db.users.findByEmail(email);
            if (user && user.password === password) {
                return { success: true, user };
            }
            return { success: false, error: 'Email ou mot de passe incorrect' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Inscription utilisateur
     */
    static async signup(email, password, username) {
        try {
            // Validation
            if (!username || username.length < 3 || username.length > 20) {
                return { success: false, error: 'Le pseudo doit contenir entre 3 et 20 caractères' };
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                return { success: false, error: 'Le pseudo ne peut contenir que des lettres, chiffres, - et _' };
            }

            if (!email || !email.includes('@')) {
                return { success: false, error: 'Email invalide' };
            }

            if (!password || password.length < 6) {
                return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
            }

            // Vérifier si l'email existe
            const existingEmail = await db.users.findByEmail(email);
            if (existingEmail) {
                return { success: false, error: 'Cet email est déjà utilisé' };
            }

            // Vérifier si le pseudo existe
            const allUsers = await db.users.getAll();
            const existingUsername = allUsers.find(u => 
                u.username.toLowerCase() === username.toLowerCase()
            );
            if (existingUsername) {
                return { success: false, error: 'Ce pseudo est déjà pris' };
            }

            // Créer l'utilisateur
            const user = await db.users.create(email, password, username);
            
            // Créer le profil joueur
            await db.players.create(user.id, username);

            return { 
                success: true, 
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            };
        } catch (error) {
            console.error('❌ Erreur signup:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = DatabaseService;
