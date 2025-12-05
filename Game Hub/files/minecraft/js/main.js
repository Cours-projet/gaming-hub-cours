let game = null;

window.addEventListener('DOMContentLoaded', () => {
    showLoadingScreen();
});

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                showMainMenu();
            }, 500);
        }
        
        loadingProgress.style.width = progress + '%';
        
        if (progress < 30) {
            loadingText.textContent = 'Génération du terrain...';
        } else if (progress < 60) {
            loadingText.textContent = 'Chargement des textures...';
        } else if (progress < 90) {
            loadingText.textContent = 'Initialisation du monde...';
        } else {
            loadingText.textContent = 'Presque prêt...';
        }
    }, 200);
}

function showMainMenu() {
    const mainMenu = document.getElementById('main-menu');
    mainMenu.classList.remove('hidden');
    
    const continueBtn = document.getElementById('continueBtn');
    if (hasSavedGame()) {
        continueBtn.style.display = 'block';
    } else {
        continueBtn.style.display = 'none';
    }
    
    const singleplayerBtn = document.getElementById('singleplayerBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const quitBtn = document.getElementById('quitBtn');
    
    const newSingleBtn = singleplayerBtn.cloneNode(true);
    const newContinueBtn = continueBtn.cloneNode(true);
    const newSettingsBtn = settingsBtn.cloneNode(true);
    const newQuitBtn = quitBtn.cloneNode(true);
    
    singleplayerBtn.parentNode.replaceChild(newSingleBtn, singleplayerBtn);
    continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
    settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);
    quitBtn.parentNode.replaceChild(newQuitBtn, quitBtn);
    
    newSingleBtn.addEventListener('click', () => {
        console.log('Nouvelle partie...');
        if (hasSavedGame()) {
            if (confirm('Écraser la sauvegarde existante ?')) {
                localStorage.removeItem('minecraftSave');
                mainMenu.classList.add('hidden');
                startGame();
            }
        } else {
            mainMenu.classList.add('hidden');
            startGame();
        }
    });
    
    newContinueBtn.addEventListener('click', () => {
        console.log('Chargement de la partie...');
        mainMenu.classList.add('hidden');
        startGame(true);
    });
    
    const newMultiplayerBtn = document.getElementById('multiplayerBtn').cloneNode(true);
    document.getElementById('multiplayerBtn').parentNode.replaceChild(newMultiplayerBtn, document.getElementById('multiplayerBtn'));
    
    newMultiplayerBtn.addEventListener('click', () => {
        alert('🌐 Multijoueur\n\nFonctionnalité à venir !\n\nBientôt disponible :\n- Serveurs en ligne\n- Jeu avec des amis\n- Chat en temps réel');
    });
    
    newSettingsBtn.addEventListener('click', () => {
        showSettingsMenu();
    });
    
    newQuitBtn.addEventListener('click', () => {
        const confirmQuit = confirm('Voulez-vous vraiment quitter le jeu ?');
        if (confirmQuit) {
            mainMenu.classList.add('hidden');
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.remove('hidden');
            document.getElementById('loadingText').textContent = 'Au revoir !';
            document.getElementById('loadingProgress').style.width = '100%';
            setTimeout(() => {
                window.history.back();
            }, 1000);
        }
    });
}

function startGame(loadSave = false) {
    console.log('=== DÉMARRAGE DU JEU ===');
    
    try {
        if (!game) {
            console.log('Création de la nouvelle instance de jeu...');
            game = new Game();
            console.log('✓ Jeu créé avec succès');
        } else {
            console.log('Réutilisation de l\'instance existante');
        }
        
        if (loadSave) {
            console.log('Chargement de la sauvegarde...');
            if (loadGame()) {
                console.log('✓ Sauvegarde chargée');
            } else {
                console.warn('Impossible de charger la sauvegarde');
            }
        }
        
        console.log('Démarrage du jeu...');
        game.start();
        console.log('✓ Jeu démarré avec succès');
        
        setupPauseMenu();
        
        setInterval(() => {
            if (game && !game.paused) {
                saveGame();
            }
        }, 30000);
        
    } catch (error) {
        console.error('❌ ERREUR lors du démarrage:', error);
        console.error('Stack:', error.stack);
        alert('Erreur: ' + error.message + '\n\nOuvrez la console (F12) pour plus de détails.');
        document.getElementById('game-container').classList.add('hidden');
        showMainMenu();
    }
}

function setupPauseMenu() {
    const resumeBtn = document.getElementById('resumeBtn');
    const saveBtn = document.getElementById('saveBtn');
    const mainMenuBtn = document.getElementById('mainMenuBtn');
    
    const newResumeBtn = resumeBtn.cloneNode(true);
    const newSaveBtn = saveBtn.cloneNode(true);
    const newMainMenuBtn = mainMenuBtn.cloneNode(true);
    
    resumeBtn.parentNode.replaceChild(newResumeBtn, resumeBtn);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    mainMenuBtn.parentNode.replaceChild(newMainMenuBtn, mainMenuBtn);
    
    newResumeBtn.addEventListener('click', () => {
        console.log('Reprise du jeu');
        game.ui.togglePause();
    });
    
    newSaveBtn.addEventListener('click', () => {
        console.log('Sauvegarde de la partie...');
        saveGame();
        alert('💾 Partie sauvegardée avec succès !');
    });
    
    newMainMenuBtn.addEventListener('click', () => {
        if (confirm('Retourner au menu principal ?\n(La progression sera perdue)')) {
            console.log('Retour au menu principal');
            document.getElementById('game-container').classList.add('hidden');
            document.getElementById('pause-menu').classList.add('hidden');
            document.exitPointerLock();
            document.body.classList.remove('playing');
            if (game) {
                game.paused = true;
                game.lockPointer = false;
            }
            showMainMenu();
        }
    });
}
