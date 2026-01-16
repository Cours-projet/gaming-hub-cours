// Système d'authentification centralisé
class AuthSystem {
    constructor() {
        this.apiUrl = window.location.origin + '/api';
        this.token = localStorage.getItem('gameHubToken');
        this.user = null;
        this.init();
    }

    async init() {
        if (this.token) {
            try {
                await this.loadUserProfile();
                this.updateUI();
            } catch (error) {
                console.error('Erreur lors du chargement du profil:', error);
                this.logout();
            }
        }
        this.createAuthModal();
        this.bindEvents();
    }

    createAuthModal() {
        const modalHTML = `
            <div id="authModal" class="auth-modal">
                <div class="auth-modal-content">
                    <span class="auth-close">&times;</span>
                    
                    <!-- Onglets -->
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Connexion</button>
                        <button class="auth-tab" data-tab="register">Inscription</button>
                    </div>

                    <!-- Formulaire de connexion -->
                    <div id="loginForm" class="auth-form active">
                        <h2>Se connecter</h2>
                        <form id="loginFormElement">
                            <div class="form-group">
                                <label for="loginEmail">Email</label>
                                <input type="email" id="loginEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Mot de passe</label>
                                <input type="password" id="loginPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Se connecter</button>
                        </form>
                    </div>

                    <!-- Formulaire d'inscription -->
                    <div id="registerForm" class="auth-form">
                        <h2>S'inscrire</h2>
                        <form id="registerFormElement">
                            <div class="form-group">
                                <label for="registerUsername">Nom d'utilisateur</label>
                                <input type="text" id="registerUsername" required>
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">Email</label>
                                <input type="email" id="registerEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Mot de passe</label>
                                <input type="password" id="registerPassword" required>
                            </div>
                            <div class="form-group">
                                <label for="registerConfirmPassword">Confirmer le mot de passe</label>
                                <input type="password" id="registerConfirmPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary">S'inscrire</button>
                        </form>
                    </div>

                    <div id="authMessage" class="auth-message"></div>
                </div>
            </div>

            <!-- Interface utilisateur connecté -->
            <div id="userInterface" class="user-interface">
                <div class="user-avatar">
                    <img id="userAvatar" src="" alt="Avatar">
                </div>
                <div class="user-info">
                    <span id="userName"></span>
                    <span id="userLevel"></span>
                </div>
                <div class="user-actions">
                    <button id="profileBtn" class="btn btn-small">Profil</button>
                    <button id="logoutBtn" class="btn btn-small">Déconnexion</button>
                </div>
            </div>

            <!-- Bouton de connexion -->
            <button id="loginBtn" class="login-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10,17 15,12 10,7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Connexion
            </button>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    bindEvents() {
        // Bouton de connexion
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showModal();
        });

        // Fermeture de la modal
        document.querySelector('.auth-close').addEventListener('click', () => {
            this.hideModal();
        });

        // Clic en dehors de la modal
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.hideModal();
            }
        });

        // Onglets
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Formulaires
        document.getElementById('loginFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Boutons utilisateur
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('profileBtn').addEventListener('click', () => {
            this.showProfile();
        });
    }

    showModal() {
        document.getElementById('authModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        document.getElementById('authModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.clearMessages();
    }

    switchTab(tab) {
        // Mettre à jour les onglets
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Mettre à jour les formulaires
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${tab}Form`).classList.add('active');

        this.clearMessages();
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('gameHubToken', this.token);
                
                this.showMessage('Connexion réussie !', 'success');
                setTimeout(() => {
                    this.hideModal();
                    this.updateUI();
                    this.loadUserProgress();
                }, 1000);
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            this.showMessage('Erreur de connexion au serveur', 'error');
        }
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            this.showMessage('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('gameHubToken', this.token);
                
                this.showMessage('Inscription réussie !', 'success');
                setTimeout(() => {
                    this.hideModal();
                    this.updateUI();
                    this.loadUserProgress();
                }, 1000);
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            this.showMessage('Erreur de connexion au serveur', 'error');
        }
    }

    async loadUserProfile() {
        const response = await fetch(`${this.apiUrl}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (response.ok) {
            this.user = await response.json();
        } else {
            throw new Error('Impossible de charger le profil');
        }
    }

    async loadUserProgress() {
        try {
            const response = await fetch(`${this.apiUrl}/progress`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const progress = await response.json();
                this.userProgress = progress;
                this.dispatchEvent('progressLoaded', progress);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la progression:', error);
        }
    }

    async saveProgress(game, data) {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.apiUrl}/progress/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ game, data })
            });

            if (response.ok) {
                console.log(`Progression sauvegardée pour ${game}`);
                this.dispatchEvent('progressSaved', { game, data });
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        this.userProgress = null;
        localStorage.removeItem('gameHubToken');
        this.updateUI();
        this.dispatchEvent('userLoggedOut');
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userInterface = document.getElementById('userInterface');

        if (this.user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userInterface) {
                userInterface.style.display = 'flex';
                
                document.getElementById('userAvatar').src = this.user.avatar || '/assets/default-avatar.png';
                document.getElementById('userName').textContent = this.user.username;
                document.getElementById('userLevel').textContent = `Niveau ${this.user.level}`;
            }
            
            // Déclencher l'événement pour la navbar
            this.dispatchEvent('userLoggedIn', this.user);
        } else {
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userInterface) userInterface.style.display = 'none';
            
            // Déclencher l'événement pour la navbar
            this.dispatchEvent('userLoggedOut');
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('authMessage');
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
        messageEl.style.display = 'block';
    }

    clearMessages() {
        const messageEl = document.getElementById('authMessage');
        messageEl.style.display = 'none';
        messageEl.textContent = '';
        messageEl.className = 'auth-message';
    }

    showProfile() {
        // Créer et afficher la modal de profil
        this.createProfileModal();
    }

    createProfileModal() {
        const existingModal = document.getElementById('profileModal');
        if (existingModal) {
            existingModal.remove();
        }

        const profileHTML = `
            <div id="profileModal" class="auth-modal">
                <div class="auth-modal-content profile-modal">
                    <span class="auth-close">&times;</span>
                    <h2>Mon Profil</h2>
                    
                    <div class="profile-header">
                        <img src="${this.user.avatar}" alt="Avatar" class="profile-avatar">
                        <div class="profile-info">
                            <h3>${this.user.username}</h3>
                            <p>Niveau ${this.user.level} • ${this.user.xp} XP</p>
                            <p>Membre depuis ${new Date(this.user.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-value">${this.userProgress?.stats?.totalPlayTime || 0}</span>
                            <span class="stat-label">Minutes jouées</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.userProgress?.stats?.gamesPlayed || 0}</span>
                            <span class="stat-label">Jeux joués</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.user.achievements?.length || 0}</span>
                            <span class="stat-label">Succès</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', profileHTML);
        
        // Afficher la modal
        document.getElementById('profileModal').style.display = 'flex';
        
        // Gérer la fermeture
        document.querySelector('#profileModal .auth-close').addEventListener('click', () => {
            document.getElementById('profileModal').remove();
        });
    }

    dispatchEvent(eventName, data = null) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    // Méthodes publiques pour les jeux
    isLoggedIn() {
        return !!this.token && !!this.user;
    }

    getUser() {
        return this.user;
    }

    getProgress(game) {
        return this.userProgress?.games?.[game] || null;
    }
}

// Initialiser le système d'authentification
const authSystem = new AuthSystem();

// Exposer globalement pour les jeux
window.GameHubAuth = authSystem;