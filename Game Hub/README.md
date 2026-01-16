# 🎮 Game Hub - Plateforme de Jeux Centralisée

> **Système moderne d'authentification et de sauvegarde pour jeux web**

Game Hub est une plateforme complète qui centralise vos jeux avec un système d'authentification unifié, sauvegarde automatique de progression, et dashboard administrateur.

## ✨ Fonctionnalités

### 🔐 **Authentification Centralisée**
- Système de connexion/inscription sécurisé
- Tokens JWT avec expiration
- Hashage bcrypt des mots de passe
- Gestion des rôles (utilisateur/owner)

### 💾 **Sauvegarde Automatique**
- Progression sauvegardée toutes les 2 minutes
- Stockage JSON sécurisé
- Synchronisation cross-device
- Mode hors ligne disponible

### 👑 **Dashboard Administrateur**
- Interface d'administration complète
- Statistiques en temps réel
- Gestion des utilisateurs
- Journaux d'activité
- Compte owner par défaut

### 🎮 **Intégration Jeux**
- API simple pour les développeurs
- Système de succès/achievements
- Statistiques de jeu
- Profils utilisateur

## 🚀 Installation Rapide

```bash
# Cloner le projet
git clone <repository-url>
cd game-hub

# Démarrage automatique (installe les dépendances)
npm start
```

Le serveur sera accessible sur **http://localhost:3000**

## 📋 Comptes par Défaut

### 👑 **Compte Administrateur**
- **Email:** `owner@gamehub.com`
- **Mot de passe:** `GameHub2025!`
- **Dashboard:** http://localhost:3000/admin

## 🏗️ Architecture

```
Game Hub/
├── 📁 admin/              # Dashboard administrateur
│   ├── index.html         # Interface admin
│   ├── admin.css          # Styles admin
│   └── admin.js           # Logique admin
├── 📁 css/                # Styles principaux
│   ├── style.css          # Styles du hub
│   └── auth.css           # Styles d'authentification
├── 📁 js/                 # Scripts frontend
│   ├── auth.js            # Système d'authentification
│   ├── game-integration.js # Intégration jeux
│   └── script.js          # Scripts principaux
├── 📁 files/              # Jeux intégrés
│   ├── minecraft/         # Jeu Minecraft
│   └── upload labs/       # Jeu Upload Labs
├── 📁 scripts/            # Scripts utilitaires
│   ├── start.js           # Démarrage intelligent
│   └── backup.js          # Sauvegarde automatique
├── 📁 data/               # Données (créé automatiquement)
│   ├── users.json         # Base utilisateurs
│   ├── progress.json      # Progression jeux
│   └── logs.json          # Journaux d'activité
├── server.js              # Serveur Node.js
├── config.js              # Configuration
└── package.json           # Dépendances
```

## 🔧 Configuration

### Variables d'Environnement
```bash
PORT=3000                    # Port du serveur
JWT_SECRET=your-secret-key   # Clé JWT (IMPORTANT en production)
NODE_ENV=production          # Environnement
```

### Paramètres Avancés
Modifiez `config.js` pour personnaliser :
- Intervalles de sauvegarde
- Limites utilisateur
- Configuration sécurité
- Paramètres UI

## 🎮 Intégration dans vos Jeux

### Code Minimal
```javascript
// Initialiser l'intégration
const gameIntegration = new GameIntegration('mon-jeu');

// Vérifier la connexion
if (gameIntegration.isLoggedIn()) {
    // Charger la progression
    const progress = gameIntegration.getProgress();
    console.log('Niveau:', progress.level);
}

// Sauvegarder
await gameIntegration.saveProgress({
    level: 5,
    score: 1000,
    saveData: { position: { x: 100, y: 200 } }
});

// Débloquer un succès
gameIntegration.unlockAchievement('first_win', 'Première victoire !');
```

### Méthodes Disponibles
```javascript
// Progression
gameIntegration.updateScore(newScore);
gameIntegration.updateLevel(newLevel);
gameIntegration.updateSaveData('key', value);

// Succès
gameIntegration.unlockAchievement('id', 'nom');

// Paramètres
gameIntegration.updateSettings('volume', 0.8);
```

## 📊 API REST

### Authentification
```http
POST /api/auth/register     # Inscription
POST /api/auth/login        # Connexion
GET  /api/user/profile      # Profil utilisateur
```

### Progression
```http
GET  /api/progress          # Récupérer progression
POST /api/progress/save     # Sauvegarder progression
```

### Administration (Owner uniquement)
```http
GET  /api/admin/dashboard   # Statistiques dashboard
GET  /api/admin/users       # Liste utilisateurs
GET  /api/admin/logs        # Journaux d'activité
```

## 🛠️ Scripts Disponibles

```bash
npm start          # Démarrage avec vérifications
npm run dev        # Mode développement (nodemon)
npm run server     # Serveur uniquement
npm run admin      # Affiche l'URL admin
npm run backup     # Sauvegarde manuelle
npm run clean      # Réinstallation propre
```

## 🔒 Sécurité

### Mesures Implémentées
- ✅ Hashage bcrypt (10 rounds)
- ✅ Tokens JWT sécurisés
- ✅ Validation des entrées
- ✅ Protection CORS
- ✅ Logs d'activité
- ✅ Limitation de taux

### Recommandations Production
1. **Changez le JWT_SECRET**
2. **Utilisez HTTPS**
3. **Configurez un reverse proxy**
4. **Sauvegardez régulièrement**
5. **Surveillez les logs**

## 📈 Statistiques

Le dashboard admin fournit :
- 👥 Nombre d'utilisateurs (total/actifs/nouveaux)
- ⏱️ Temps de jeu total
- 🎮 Statistiques par jeu
- 📋 Activité récente
- 🔍 Journaux détaillés

## 🎯 Jeux Intégrés

### 🎯 Minecraft
- Système de niveaux
- Sauvegarde de progression
- Succès débloquables
- **URL:** `/files/minecraft/minecraft-hub.html`

### 📁 Upload Labs
- Jeu de logistique numérique
- Outils débloquables
- Système de labs
- **URL:** `/files/upload labs/upload-hub.html`

## 🤝 Développement

### Ajouter un Nouveau Jeu
1. Créer le dossier dans `files/`
2. Inclure les scripts d'auth
3. Utiliser `GameIntegration`
4. Ajouter la carte dans `index.html`

### Structure Recommandée
```javascript
// Dans votre jeu
class MonJeu {
    constructor() {
        this.gameIntegration = new GameIntegration('mon-jeu');
        this.init();
    }
    
    async init() {
        // Vérifier l'authentification
        if (this.gameIntegration.isLoggedIn()) {
            await this.loadProgress();
        }
        
        // Démarrer la sauvegarde auto
        this.startAutoSave();
    }
}
```

## 🐛 Dépannage

### Problèmes Courants

**Serveur ne démarre pas**
```bash
# Vérifier Node.js
node --version  # Doit être >= 14

# Réinstaller les dépendances
npm run clean
```

**Progression non sauvegardée**
```bash
# Vérifier les permissions
ls -la data/

# Vérifier les logs
tail -f data/logs.json
```

**Erreur de connexion**
- Vérifiez que le serveur est démarré
- Contrôlez l'URL de l'API
- Vérifiez la console navigateur

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE) pour plus de détails.

---

**🎮 Développé avec ❤️ par l'équipe Game Hub**

> Pour plus d'aide, consultez les logs ou créez une issue sur GitHub.