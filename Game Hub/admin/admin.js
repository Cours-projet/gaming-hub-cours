/**
 * Dashboard Admin - Game Hub
 * Système de gestion administrateur avec authentification et statistiques
 */

class AdminDashboard {
    constructor() {
        this.apiUrl = window.location.origin + '/api';
        this.token = localStorage.getItem('adminToken');
        this.currentUser = null;
        this.currentSection = 'dashboard';
        
        this.init();
    }

    /**
     * Initialisation du dashboard
     */
    async init() {
        this.bindEvents();
        
        if (this.token) {
            try {
                await this.loadUserProfile();
                this.showDashboard();
                await this.loadDashboardData();
            } catch (error) {
                console.error('Erreur chargement profil:', error);
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }

    /**
     * Liaison des événements
     */
    bindEvents() {
        // Formulaire de connexion
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Toggle mot de passe
        document.getElementById('togglePassword').addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Déconnexion
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchSection(btn.dataset.section);
            });
        });

        // Actualisation des données
        document.getElementById('refreshUsers')?.addEventListener('click', () => {
            this.loadUsers();
        });

        document.getElementById('refreshLogs')?.addEventListener('click', () => {
            this.loadLogs();
        });

        // Gestion des comptes serveur
        document.getElementById('createServerAccount')?.addEventListener('click', () => {
            this.showCreateAccountModal();
        });

        document.getElementById('refreshServerAccounts')?.addEventListener('click', () => {
            this.loadServerAccounts();
        });

        document.getElementById('createAccountForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateServerAccount();
        });

        // Fermeture modal
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeCreateAccountModal();
        });

        // Recherche utilisateurs
        document.getElementById('userSearch')?.addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        // Filtre logs
        document.getElementById('logFilter')?.addEventListener('change', (e) => {
            this.filterLogs(e.target.value);
        });
    }

    /**
     * Toggle visibilité du mot de passe
     */
    togglePasswordVisibility() {
        const passwordDisplay = document.getElementById('passwordDisplay');
        const toggleBtn = document.getElementById('togglePassword');
        
        if (passwordDisplay.textContent === '••••••••••••') {
            passwordDisplay.textContent = 'GameHub2025!';
            toggleBtn.textContent = '🙈';
        } else {
            passwordDisplay.textContent = '••••••••••••';
            toggleBtn.textContent = '👁️';
        }
    }

    /**
     * Gestion de la connexion admin
     */
    async handleLogin() {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const messageEl = document.getElementById('loginMessage');

        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user.role !== 'owner') {
                    this.showMessage('Accès refusé - Droits administrateur requis', 'error');
                    return;
                }

                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('adminToken', this.token);
                
                this.showMessage('Connexion réussie !', 'success');
                setTimeout(() => {
                    this.showDashboard();
                    this.loadDashboardData();
                }, 1000);
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Erreur connexion:', error);
            this.showMessage('Erreur de connexion au serveur', 'error');
        }
    }

    /**
     * Chargement du profil utilisateur
     */
    async loadUserProfile() {
        const response = await fetch(`${this.apiUrl}/user/profile`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });

        if (response.ok) {
            this.currentUser = await response.json();
            if (this.currentUser.role !== 'owner') {
                throw new Error('Droits insuffisants');
            }
        } else {
            throw new Error('Profil non trouvé');
        }
    }

    /**
     * Déconnexion
     */
    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('adminToken');
        this.showLogin();
    }

    /**
     * Affichage de l'écran de connexion
     */
    showLogin() {
        document.getElementById('adminLogin').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    /**
     * Affichage du dashboard
     */
    showDashboard() {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        
        if (this.currentUser) {
            document.getElementById('adminUsername').textContent = this.currentUser.username;
        }
    }

    /**
     * Changement de section
     */
    switchSection(section) {
        // Mettre à jour la navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Mettre à jour le contenu
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}Section`).classList.add('active');

        this.currentSection = section;

        // Charger les données spécifiques à la section
        switch (section) {
            case 'users':
                this.loadUsers();
                break;
            case 'serverAccounts':
                this.loadServerAccounts();
                break;
            case 'logs':
                this.loadLogs();
                break;
            case 'games':
                this.loadGameStats();
                break;
        }
    }

    /**
     * Chargement des données du dashboard
     */
    async loadDashboardData() {
        try {
            const response = await fetch(`${this.apiUrl}/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateDashboardStats(data);
                this.updateRecentActivity(data.logs.recent);
            }
        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
        }
    }

    /**
     * Mise à jour des statistiques du dashboard
     */
    updateDashboardStats(data) {
        document.getElementById('totalUsers').textContent = data.users.total;
        document.getElementById('activeUsers').textContent = data.users.active;
        document.getElementById('newUsers').textContent = data.users.new;
        document.getElementById('totalPlayTime').textContent = data.games.totalPlayTime;
    }

    /**
     * Mise à jour de l'activité récente
     */
    updateRecentActivity(logs) {
        const container = document.getElementById('recentLogs');
        container.innerHTML = '';

        logs.forEach(log => {
            const logEl = this.createLogElement(log);
            container.appendChild(logEl);
        });
    }

    /**
     * Chargement des utilisateurs
     */
    async loadUsers() {
        try {
            const response = await fetch(`${this.apiUrl}/admin/users`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const users = await response.json();
                this.displayUsers(users);
                this.allUsers = users; // Pour la recherche
            }
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
        }
    }

    /**
     * Affichage des utilisateurs
     */
    displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <img src="${user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username}" 
                             alt="${user.username}" class="user-avatar">
                        <div class="user-details">
                            <h4>${user.username}</h4>
                            <span class="user-role ${user.role}">${user.role}</span>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>Niveau ${user.level} (${user.xp} XP)</td>
                <td>${user.totalPlayTime} min</td>
                <td>${user.lastLogin ? this.formatDate(user.lastLogin) : 'Jamais'}</td>
                <td>
                    <button class="btn btn-small" onclick="adminDashboard.viewUser('${user.id}')">
                        👁️ Voir
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Filtrage des utilisateurs
     */
    filterUsers(searchTerm) {
        if (!this.allUsers) return;

        const filtered = this.allUsers.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.displayUsers(filtered);
    }

    /**
     * Chargement des logs
     */
    async loadLogs() {
        try {
            const response = await fetch(`${this.apiUrl}/admin/logs?limit=200`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const logs = await response.json();
                this.displayLogs(logs);
                this.allLogs = logs; // Pour le filtrage
            }
        } catch (error) {
            console.error('Erreur chargement logs:', error);
        }
    }

    /**
     * Affichage des logs
     */
    displayLogs(logs) {
        const container = document.getElementById('logsContainer');
        container.innerHTML = '';

        logs.forEach(log => {
            const logEl = this.createLogElement(log);
            container.appendChild(logEl);
        });
    }

    /**
     * Création d'un élément log
     */
    createLogElement(log) {
        const logEl = document.createElement('div');
        logEl.className = 'log-entry';
        
        const actionText = this.getActionText(log.action);
        const details = this.getLogDetails(log);

        logEl.innerHTML = `
            <div class="log-content">
                <div class="log-action ${log.action}">${log.action}</div>
                <h4>${actionText}</h4>
                <p>${details}</p>
            </div>
            <div class="log-time">${this.formatDate(log.timestamp)}</div>
        `;

        return logEl;
    }

    /**
     * Filtrage des logs
     */
    filterLogs(actionFilter) {
        if (!this.allLogs) return;

        const filtered = actionFilter 
            ? this.allLogs.filter(log => log.action === actionFilter)
            : this.allLogs;

        this.displayLogs(filtered);
    }

    /**
     * Chargement des statistiques de jeux
     */
    async loadGameStats() {
        // Simulation des stats de jeux
        // En production, ces données viendraient de l'API
        document.getElementById('minecraftPlayers').textContent = '12';
        document.getElementById('minecraftTime').textContent = '1,234';
        document.getElementById('uploadPlayers').textContent = '8';
        document.getElementById('uploadTime').textContent = '567';
    }

    /**
     * Utilitaires
     */
    getActionText(action) {
        const actions = {
            'user_login': 'Connexion utilisateur',
            'user_registered': 'Nouvel utilisateur',
            'progress_saved': 'Progression sauvegardée',
            'login_failed': 'Échec de connexion'
        };
        return actions[action] || action;
    }

    getLogDetails(log) {
        switch (log.action) {
            case 'user_login':
                return `${log.details.username} s'est connecté`;
            case 'user_registered':
                return `${log.details.username} (${log.details.email}) s'est inscrit`;
            case 'progress_saved':
                return `Progression sauvegardée pour ${log.details.game}`;
            case 'login_failed':
                return `Tentative de connexion échouée pour ${log.details.email}`;
            default:
                return JSON.stringify(log.details);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('loginMessage');
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';

        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    /**
     * Actions utilisateur
     */
    viewUser(userId) {
        // Afficher les détails d'un utilisateur
        console.log('Voir utilisateur:', userId);
        // Ici on pourrait ouvrir une modal avec les détails
    }

    /**
     * Gestion des comptes serveur
     */
    showCreateAccountModal() {
        document.getElementById('createAccountModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeCreateAccountModal() {
        document.getElementById('createAccountModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.clearCreateAccountForm();
    }

    clearCreateAccountForm() {
        document.getElementById('createAccountForm').reset();
        const messageEl = document.getElementById('createAccountMessage');
        messageEl.style.display = 'none';
        messageEl.textContent = '';
        messageEl.className = 'message';
    }

    async handleCreateServerAccount() {
        const username = document.getElementById('serverUsername').value;
        const email = document.getElementById('serverEmail').value;
        const password = document.getElementById('serverPassword').value;
        const role = document.getElementById('serverRole').value;

        try {
            const response = await fetch(`${this.apiUrl}/admin/create-server-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ username, email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                this.showCreateAccountMessage('Compte serveur créé avec succès !', 'success');
                setTimeout(() => {
                    this.closeCreateAccountModal();
                    this.loadServerAccounts();
                }, 1500);
            } else {
                this.showCreateAccountMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Erreur création compte serveur:', error);
            this.showCreateAccountMessage('Erreur de connexion au serveur', 'error');
        }
    }

    async loadServerAccounts() {
        try {
            const response = await fetch(`${this.apiUrl}/admin/server-accounts`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const accounts = await response.json();
                this.displayServerAccounts(accounts);
            }
        } catch (error) {
            console.error('Erreur chargement comptes serveur:', error);
        }
    }

    displayServerAccounts(accounts) {
        const tbody = document.getElementById('serverAccountsTableBody');
        tbody.innerHTML = '';

        if (accounts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                        Aucun compte serveur créé
                    </td>
                </tr>
            `;
            return;
        }

        accounts.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <img src="${account.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + account.username}" 
                             alt="${account.username}" class="user-avatar">
                        <div class="user-details">
                            <h4>${account.username}</h4>
                            <span class="user-role ${account.role}">${account.role}</span>
                        </div>
                    </div>
                </td>
                <td>${account.email}</td>
                <td>
                    <span class="role-badge ${account.role}">${account.role}</span>
                </td>
                <td>${this.formatDate(account.createdAt)}</td>
                <td>${account.createdBy || 'Système'}</td>
                <td>
                    <button class="btn btn-small btn-danger" onclick="adminDashboard.deleteServerAccount('${account.id}')">
                        🗑️ Supprimer
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async deleteServerAccount(accountId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte serveur ?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/admin/server-account/${accountId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Compte serveur supprimé avec succès', 'success');
                this.loadServerAccounts();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Erreur suppression compte serveur:', error);
            this.showMessage('Erreur de connexion au serveur', 'error');
        }
    }

    showCreateAccountMessage(message, type) {
        const messageEl = document.getElementById('createAccountMessage');
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
    }
}

// Initialisation du dashboard
const adminDashboard = new AdminDashboard();

// Actualisation automatique des données toutes les 30 secondes
setInterval(() => {
    if (adminDashboard.token && adminDashboard.currentSection === 'dashboard') {
        adminDashboard.loadDashboardData();
    }
}, 30000);