/**
 * Système d'authentification PlayHub
 * @author Tomy - Lead Developer
 */

// Formulaire de connexion
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Veuillez remplir tous les champs');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Sauvegarder l'utilisateur
            localStorage.setItem('user', JSON.stringify(data.user));
            showSuccess('Connexion réussie! Redirection...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showError(data.error || 'Erreur de connexion');
        }
    } catch (error) {
        showError('Erreur de connexion au serveur');
        console.error(error);
    }
});

// Formulaire d'inscription
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm')?.value;

    // Validation
    if (!username || !email || !password) {
        showError('Veuillez remplir tous les champs');
        return;
    }

    if (passwordConfirm && password !== passwordConfirm) {
        showError('Les mots de passe ne correspondent pas');
        return;
    }

    if (username.length < 3) {
        showError('Le pseudo doit contenir au moins 3 caractères');
        return;
    }

    if (username.length > 20) {
        showError('Le pseudo ne peut pas dépasser 20 caractères');
        return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        showError('Le pseudo ne peut contenir que des lettres, chiffres, - et _');
        return;
    }

    if (password.length < 6) {
        showError('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }

    if (!email.includes('@')) {
        showError('Email invalide');
        return;
    }

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Sauvegarder l'utilisateur
            localStorage.setItem('user', JSON.stringify(data.user));
            showSuccess(`Bienvenue ${username}! Redirection...`);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showError(data.error || 'Erreur lors de la création du compte');
        }
    } catch (error) {
        showError('Erreur de connexion au serveur');
        console.error(error);
    }
});

/**
 * Affiche un message d'erreur
 */
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.background = 'rgba(255, 0, 68, 0.2)';
        errorDiv.style.border = '2px solid #ff0044';
        errorDiv.style.padding = '15px';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.marginBottom = '20px';
        errorDiv.style.color = '#ff0044';
        errorDiv.style.fontWeight = '600';
    }
    
    if (successDiv) {
        successDiv.style.display = 'none';
    }

    setTimeout(() => {
        if (errorDiv) errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Affiche un message de succès
 */
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    const errorDiv = document.getElementById('error-message');
    
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        successDiv.style.background = 'rgba(0, 255, 136, 0.2)';
        successDiv.style.border = '2px solid #00ff88';
        successDiv.style.padding = '15px';
        successDiv.style.borderRadius = '8px';
        successDiv.style.marginBottom = '20px';
        successDiv.style.color = '#00ff88';
        successDiv.style.fontWeight = '600';
    }
    
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

/**
 * Vérifie si l'utilisateur est connecté
 */
function checkAuth() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

/**
 * Déconnexion
 */
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Vérifier l'authentification sur la page d'accueil
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    const user = checkAuth();
    if (user) {
        // Afficher le nom d'utilisateur
        const userDisplay = document.createElement('div');
        userDisplay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px 20px;
            border-radius: 8px;
            border: 2px solid var(--primary);
            color: var(--primary);
            font-weight: 600;
            z-index: 1000;
        `;
        userDisplay.innerHTML = `
            👤 ${user.username}
            <button onclick="logout()" style="
                margin-left: 15px;
                background: var(--danger);
                border: none;
                color: white;
                padding: 5px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 600;
            ">Déconnexion</button>
        `;
        document.body.appendChild(userDisplay);
    }
}
