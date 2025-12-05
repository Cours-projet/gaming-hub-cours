function showSettingsMenu() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
        <div class="settings-content">
            <h2>⚙️ OPTIONS</h2>
            
            <div class="setting-group">
                <label>Distance de rendu: <span id="renderValue">${CONFIG.RENDER_DISTANCE}</span> chunks</label>
                <input type="range" id="renderDistance" min="1" max="4" value="${CONFIG.RENDER_DISTANCE}" step="1">
            </div>
            
            <div class="setting-group">
                <label>FOV: <span id="fovValue">${CONFIG.FOV}</span>°</label>
                <input type="range" id="fov" min="60" max="110" value="${CONFIG.FOV}" step="5">
            </div>
            
            <div class="setting-group">
                <label>Sensibilité souris: <span id="sensValue">${Math.round(CONFIG.MOUSE_SENSITIVITY * 1000)}</span>%</label>
                <input type="range" id="sensitivity" min="1" max="10" value="${CONFIG.MOUSE_SENSITIVITY * 1000}" step="0.5">
            </div>
            
            <div class="setting-group">
                <label>
                    <input type="checkbox" id="invertMouse" ${CONFIG.INVERT_MOUSE ? 'checked' : ''}>
                    Inverser la souris (Y)
                </label>
            </div>
            
            <div class="setting-buttons">
                <button class="menu-btn" id="saveSettings">💾 Sauvegarder</button>
                <button class="menu-btn" id="closeSettings">✕ Fermer</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('renderDistance').addEventListener('input', (e) => {
        CONFIG.RENDER_DISTANCE = parseInt(e.target.value);
        document.getElementById('renderValue').textContent = CONFIG.RENDER_DISTANCE;
    });
    
    document.getElementById('fov').addEventListener('input', (e) => {
        CONFIG.FOV = parseInt(e.target.value);
        document.getElementById('fovValue').textContent = CONFIG.FOV;
        if (game && game.renderer) {
            game.renderer.camera.fov = CONFIG.FOV;
            game.renderer.camera.updateProjectionMatrix();
        }
    });
    
    document.getElementById('sensitivity').addEventListener('input', (e) => {
        CONFIG.MOUSE_SENSITIVITY = parseFloat(e.target.value) / 1000;
        document.getElementById('sensValue').textContent = Math.round(CONFIG.MOUSE_SENSITIVITY * 1000);
    });
    
    document.getElementById('invertMouse').addEventListener('change', (e) => {
        CONFIG.INVERT_MOUSE = e.target.checked;
    });
    
    document.getElementById('saveSettings').addEventListener('click', () => {
        saveSettings();
        alert('✓ Paramètres sauvegardés !');
    });
    
    document.getElementById('closeSettings').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}


function saveGame() {
    if (!game) return;
    
    const saveData = {
        player: {
            position: game.player.position,
            rotation: game.player.rotation,
            health: game.player.health,
            hunger: game.player.hunger
        },
        inventory: game.inventory.slots,
        timestamp: Date.now()
    };
    
    localStorage.setItem('minecraftSave', JSON.stringify(saveData));
    console.log('✓ Partie sauvegardée');
}

function loadGame() {
    const saved = localStorage.getItem('minecraftSave');
    if (!saved || !game) return false;
    
    try {
        const saveData = JSON.parse(saved);
        
        game.player.position = saveData.player.position;
        game.player.rotation = saveData.player.rotation;
        game.player.health = saveData.player.health;
        game.player.hunger = saveData.player.hunger;
        game.inventory.slots = saveData.inventory;
        
        game.ui.update();
        
        console.log('✓ Partie chargée');
        return true;
    } catch (error) {
        console.error('Erreur chargement:', error);
        return false;
    }
}

function hasSavedGame() {
    return localStorage.getItem('minecraftSave') !== null;
}
