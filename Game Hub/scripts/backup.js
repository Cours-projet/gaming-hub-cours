#!/usr/bin/env node

/**
 * Script de sauvegarde automatique
 * Sauvegarde les données utilisateur et la progression
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

async function createBackup() {
    try {
        // Créer le dossier de sauvegarde
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
        await fs.mkdir(backupPath, { recursive: true });
        
        // Fichiers à sauvegarder
        const files = ['users.json', 'progress.json', 'logs.json'];
        
        for (const file of files) {
            const sourcePath = path.join(DATA_DIR, file);
            const destPath = path.join(backupPath, file);
            
            try {
                await fs.copyFile(sourcePath, destPath);
                console.log(`✅ ${file} sauvegardé`);
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.error(`❌ Erreur sauvegarde ${file}:`, error.message);
                }
            }
        }
        
        // Nettoyer les anciennes sauvegardes (garder les 7 dernières)
        await cleanOldBackups();
        
        console.log(`🎉 Sauvegarde créée: ${backupPath}`);
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        process.exit(1);
    }
}

async function cleanOldBackups() {
    try {
        const backups = await fs.readdir(BACKUP_DIR);
        const backupDirs = backups
            .filter(name => name.startsWith('backup-'))
            .sort()
            .reverse();
        
        // Supprimer les sauvegardes au-delà de 7
        for (let i = 7; i < backupDirs.length; i++) {
            const oldBackupPath = path.join(BACKUP_DIR, backupDirs[i]);
            await fs.rmdir(oldBackupPath, { recursive: true });
            console.log(`🗑️  Ancienne sauvegarde supprimée: ${backupDirs[i]}`);
        }
    } catch (error) {
        console.error('⚠️  Erreur nettoyage:', error.message);
    }
}

// Démarrage
console.log('💾 Démarrage de la sauvegarde...');
createBackup();