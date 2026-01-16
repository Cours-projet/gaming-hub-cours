# 🔐 Guide Administrateur - Game Hub

## Accès Administrateur

### Connexion Owner
- **URL Admin** : http://localhost:3000/admin
- **Email** : `owner@gamehub.com`
- **Mot de passe** : `GameHub2025!`

⚠️ **IMPORTANT** : Changez ces identifiants après la première connexion !

## Fonctionnalités Administrateur

### 📊 Dashboard
- Statistiques en temps réel
- Activité récente des utilisateurs
- Métriques de performance

### 👥 Gestion des Utilisateurs
- Liste complète des utilisateurs
- Recherche et filtrage
- Visualisation des profils

### 🖥️ Comptes Serveur
- Création de comptes pour services/bots
- Gestion des rôles (user/admin)
- Suppression sécurisée

### 📋 Journaux d'Activité
- Logs de connexion
- Actions utilisateurs
- Filtrage par type d'événement

### ⚙️ Paramètres
- Configuration serveur
- Informations système

## Sécurité

### Mesures Implémentées
- ✅ Rate limiting (10 tentatives/15min)
- ✅ Headers de sécurité HTTP
- ✅ Validation des entrées
- ✅ Hachage bcrypt des mots de passe
- ✅ Tokens JWT sécurisés
- ✅ CSP (Content Security Policy)

### Bonnes Pratiques
1. **Changez les identifiants par défaut**
2. **Utilisez des mots de passe forts**
3. **Surveillez les logs régulièrement**
4. **Limitez les accès admin**
5. **Sauvegardez les données régulièrement**

## Création de Comptes Serveur

Les comptes serveur sont destinés aux :
- Bots Discord/autres plateformes
- Services automatisés
- Applications tierces
- Scripts de maintenance

### Rôles Disponibles
- **user** : Accès standard aux jeux
- **admin** : Accès aux fonctions d'administration

## Maintenance

### Sauvegarde des Données
Les données sont stockées dans `/data/` :
- `users.json` : Comptes utilisateurs
- `progress.json` : Progression des jeux
- `logs.json` : Journaux d'activité

### Redémarrage Sécurisé
```bash
npm start
# ou
node server.js
```

## Support

En cas de problème :
1. Vérifiez les logs serveur
2. Consultez les journaux d'activité
3. Redémarrez le service si nécessaire

---

**⚠️ CONFIDENTIEL** - Ce document contient des informations sensibles