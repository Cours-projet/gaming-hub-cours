/**
 * Settings PlayHub
 * @author Tomy - Lead Developer
 * @team Tom (Dev), Lancelot (Manager)
 * @school Lycée Albert Einstein
 */

// Charger les paramètres sauvegardés
async function loadSettings() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (user && user.id) {
        // Charger depuis le serveur
        try {
            const response = await fetch(`/api/settings/${user.id}`);
            const data = await response.json();
            
            if (data.success && data.settings) {
                applySettings(data.settings);
                return;
            }
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
        }
    }
    
    // Charger depuis localStorage en fallback
    const settings = JSON.parse(localStorage.getItem('gameSettings') || '{}');
    applySettings(settings);
}

function applySettings(settings) {
    if (settings.difficulty) document.getElementById('difficulty').value = settings.difficulty;
    if (settings.daynightSpeed) {
        document.getElementById('daynight-speed').value = settings.daynightSpeed;
        updateDaynightLabel(settings.daynightSpeed);
    }
    if (settings.volume !== undefined) {
        document.getElementById('volume').value = settings.volume;
        updateVolumeLabel(settings.volume);
    }
    if (settings.showFps !== undefined) document.getElementById('show-fps').checked = settings.showFps;
    if (settings.showMinimap !== undefined) document.getElementById('show-minimap').checked = settings.showMinimap;
    if (settings.showNotifications !== undefined) document.getElementById('show-notifications').checked = settings.showNotifications;
}

// Mettre à jour les labels
function updateVolumeLabel(value) {
    document.getElementById('volume-value').textContent = value + '%';
}

function updateDaynightLabel(value) {
    const labels = ['Très lent', 'Très lent', 'Lent', 'Lent', 'Normal', 'Normal', 'Rapide', 'Rapide', 'Très rapide', 'Très rapide', 'Très rapide'];
    document.getElementById('daynight-value').textContent = labels[value - 1] || 'Normal';
}

// Event listeners pour les sliders
document.getElementById('volume')?.addEventListener('input', (e) => {
    updateVolumeLabel(e.target.value);
});

document.getElementById('daynight-speed')?.addEventListener('input', (e) => {
    updateDaynightLabel(e.target.value);
});

// Sauvegarder les paramètres
document.getElementById('save-settings')?.addEventListener('click', async () => {
    const settings = {
        difficulty: document.getElementById('difficulty').value,
        daynightSpeed: parseInt(document.getElementById('daynight-speed').value),
        volume: parseInt(document.getElementById('volume').value),
        showFps: document.getElementById('show-fps').checked,
        showMinimap: document.getElementById('show-minimap').checked,
        showNotifications: document.getElementById('show-notifications').checked
    };
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const statusDiv = document.getElementById('settings-status');
    
    // Sauvegarder sur le serveur si connecté
    if (user && user.id) {
        try {
            const response = await fetch(`/api/settings/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            
            if (data.success) {
                statusDiv.style.color = '#0f0';
                statusDiv.textContent = '✅ Paramètres sauvegardés sur le serveur!';
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            statusDiv.style.color = '#f00';
            statusDiv.textContent = '❌ Erreur: ' + error.message;
        }
    } else {
        // Sauvegarder localement
        localStorage.setItem('gameSettings', JSON.stringify(settings));
        statusDiv.style.color = '#0f0';
        statusDiv.textContent = '✅ Paramètres sauvegardés localement!';
    }
    
    setTimeout(() => {
        statusDiv.textContent = '';
    }, 3000);
});

// Afficher les infos du compte
function displayAccountInfo() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const accountDiv = document.getElementById('account-info');
    
    if (user) {
        accountDiv.innerHTML = `
            <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <div style="color: #fff; font-size: 1.2rem; margin-bottom: 10px;">
                    <strong>Pseudo:</strong> <span style="color: #8b5cf6;">${user.username}</span>
                </div>
                <div style="color: var(--text-dim); font-size: 0.9rem;">
                    <strong>Email:</strong> ${user.email}
                </div>
                <div style="color: var(--text-dim); font-size: 0.85rem; margin-top: 10px;">
                    💾 Progression sauvegardée sur le serveur
                </div>
            </div>
        `;
    } else {
        accountDiv.innerHTML = `
            <div style="background: rgba(255, 0, 0, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                <p style="color: var(--text-dim); margin-bottom: 15px;">Vous n'êtes pas connecté</p>
                <a href="login.html" class="btn btn-primary">Se Connecter</a>
            </div>
        `;
    }
}

// Réinitialiser la progression
document.getElementById('reset-progress')?.addEventListener('click', async () => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser votre progression? Cette action est irréversible!')) {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (user && user.id) {
            try {
                const response = await fetch(`/api/progress/${user.id}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('✅ Progression réinitialisée sur le serveur!');
                } else {
                    throw new Error(data.error);
                }
            } catch (error) {
                alert('❌ Erreur: ' + error.message);
            }
        } else {
            // Réinitialiser localement
            localStorage.removeItem('gameProgress');
            localStorage.removeItem('playerStats');
            alert('✅ Progression locale réinitialisée!');
        }
    }
});

// Déconnexion
document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (confirm('Voulez-vous vraiment vous déconnecter?')) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
});

// Initialisation
loadSettings();
displayAccountInfo();
