#!/usr/bin/env node

/**
 * Script de démarrage intelligent pour Game Hub
 * Vérifie les dépendances et démarre le serveur
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Couleurs pour les logs
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader() {
    log('🎮 ================================', 'cyan');
    log('🚀 Game Hub - Démarrage', 'bright');
    log('🎮 ================================', 'cyan');
    log('');
}

function logFooter() {
    log('');
    log('🎮 ================================', 'cyan');
    log('✅ Serveur prêt !', 'green');
    log('🌐 Interface: http://localhost:3000', 'blue');
    log('👑 Admin: http://localhost:3000/admin', 'magenta');
    log('🔄 Ctrl+C pour arrêter', 'yellow');
    log('🎮 ================================', 'cyan');
}

async function checkNodeVersion() {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    
    if (major < 14) {
        log('❌ Node.js version 14+ requis', 'red');
        log(`   Version actuelle: ${version}`, 'yellow');
        log('   Téléchargez depuis: https://nodejs.org/', 'blue');
        process.exit(1);
    }
    
    log(`✅ Node.js ${version}`, 'green');
}

async function checkDependencies() {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
    
    if (!fs.existsSync(packagePath)) {
        log('❌ package.json non trouvé', 'red');
        process.exit(1);
    }
    
    if (!fs.existsSync(nodeModulesPath)) {
        log('📦 Installation des dépendances...', 'yellow');
        
        return new Promise((resolve, reject) => {
            const npm = spawn('npm', ['install'], {
                cwd: path.join(__dirname, '..'),
                stdio: 'inherit'
            });
            
            npm.on('close', (code) => {
                if (code === 0) {
                    log('✅ Dépendances installées', 'green');
                    resolve();
                } else {
                    log('❌ Erreur installation dépendances', 'red');
                    reject(new Error('Installation failed'));
                }
            });
        });
    } else {
        log('✅ Dépendances présentes', 'green');
    }
}

async function createDataDirectory() {
    const dataDir = path.join(__dirname, '..', 'data');
    
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        log('📁 Dossier data créé', 'green');
    } else {
        log('✅ Dossier data présent', 'green');
    }
}

async function startServer() {
    log('🚀 Démarrage du serveur...', 'blue');
    
    const server = spawn('node', ['server.js'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
    });
    
    // Gestion de l'arrêt propre
    process.on('SIGINT', () => {
        log('\n🛑 Arrêt du serveur...', 'yellow');
        server.kill('SIGINT');
        process.exit(0);
    });
    
    server.on('close', (code) => {
        if (code !== 0) {
            log(`❌ Serveur arrêté avec le code ${code}`, 'red');
        }
        process.exit(code);
    });
    
    // Attendre un peu puis afficher le footer
    setTimeout(logFooter, 2000);
}

async function main() {
    try {
        logHeader();
        
        await checkNodeVersion();
        await checkDependencies();
        await createDataDirectory();
        
        log('');
        await startServer();
        
    } catch (error) {
        log(`❌ Erreur: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Démarrage
main();