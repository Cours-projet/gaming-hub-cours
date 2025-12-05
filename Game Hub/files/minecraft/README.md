# 🎮 Minecraft 1.8.9 - Web Edition

Un clone complet de Minecraft 1.8.9 développé en HTML5, CSS3 et JavaScript pur !

## 🚀 Fonctionnalités

### ✅ Monde & Génération
- Génération procédurale infinie avec algorithme Perlin Noise
- 17 types de blocs différents (herbe, terre, pierre, minerais, etc.)
- Génération d'arbres aléatoires
- Chunks de 16x16 blocs
- Hauteur du monde : 64 blocs

### ✅ Gameplay
- **Déplacement** : WASD ou flèches directionnelles
- **Sauter** : Espace
- **Sprint** : Shift (en avançant)
- **Minage** : Clic gauche
- **Construction** : Clic droit
- **Inventaire** : Touche E
- **Pause** : Échap
- **Sélection rapide** : Touches 1-9

### ✅ Systèmes
- Physique réaliste (gravité, collisions)
- Inventaire 36 slots + hotbar 9 slots
- Système de crafting
- HUD complet (vie, faim, debug)
- Rendu 3D optimisé
- Distance de rendu configurable

### ✅ Blocs Disponibles
- 🟩 Herbe
- 🟫 Terre
- ⬜ Pierre
- ⬛ Roche (Cobblestone)
- 🟫 Bois
- 🟫 Planches
- 🟢 Feuilles
- ⬜ Verre
- 🟨 Sable
- 💧 Eau
- ⚫ Minerai de Charbon
- ⚪ Minerai de Fer
- 🟡 Minerai d'Or
- 💎 Minerai de Diamant
- ⬛ Bedrock (incassable)

## 📁 Structure du Projet

```
minecraft-web/
├── index.html          # Page principale
├── README.md          # Documentation
├── css/
│   └── style.css      # Styles du jeu
└── js/
    ├── config.js      # Configuration
    ├── blocks.js      # Définition des blocs
    ├── world.js       # Génération du monde
    ├── player.js      # Logique du joueur
    ├── renderer.js    # Moteur de rendu
    ├── inventory.js   # Système d'inventaire
    ├── crafting.js    # Table de craft
    ├── ui.js          # Interface utilisateur
    ├── game.js        # Boucle de jeu
    └── main.js        # Point d'entrée
```

## 🎯 Comment Jouer

1. Ouvrez `index.html` dans votre navigateur
2. Cliquez sur "Solo" dans le menu principal
3. Cliquez sur l'écran pour verrouiller la souris
4. Utilisez WASD pour vous déplacer
5. Regardez autour avec la souris
6. Clic gauche pour miner, clic droit pour placer
7. Appuyez sur E pour ouvrir l'inventaire
8. Utilisez 1-9 pour changer de slot rapidement

## ⚙️ Configuration

Modifiez `js/config.js` pour ajuster :
- Distance de rendu
- Vitesse de déplacement
- Sensibilité de la souris
- Gravité
- FOV (champ de vision)

## 🔧 Crafting

Recettes disponibles :
- **Planches** : 1 Bois → 4 Planches
- **Verre** : 1 Sable → 1 Verre

## 🎨 Personnalisation

### Ajouter un nouveau bloc

Dans `js/blocks.js` :
```javascript
NEW_BLOCK: {
    id: 18,
    name: 'Nouveau Bloc',
    icon: '🟦',
    solid: true,
    transparent: false,
    color: [0.5, 0.5, 1.0]
}
```

### Ajouter une recette de craft

Dans `js/crafting.js` :
```javascript
{
    result: { type: 'NEW_BLOCK', count: 1 },
    pattern: [
        ['STONE', 'STONE', null],
        ['STONE', 'STONE', null],
        [null, null, null]
    ]
}
```

## 🐛 Debug

Appuyez sur F12 pour ouvrir la console et voir :
- Position du joueur
- FPS
- Rotation (Yaw/Pitch)
- Informations de debug

## 📝 Notes Techniques

- **Moteur de rendu** : Canvas 2D avec projection 3D
- **Génération** : Perlin Noise pour terrain réaliste
- **Physique** : AABB collision detection
- **Performance** : Frustum culling, distance rendering

## 🎮 Compatibilité

- ✅ Chrome/Edge (recommandé)
- ✅ Firefox
- ✅ Safari
- ⚠️ Nécessite un navigateur moderne avec support Pointer Lock API

## 🚧 Améliorations Futures

- [ ] Mobs (zombies, creepers, etc.)
- [ ] Cycle jour/nuit
- [ ] Système de sauvegarde
- [ ] Multijoueur
- [ ] Sons et musique
- [ ] Plus de blocs et items
- [ ] Biomes variés
- [ ] Grottes et donjons

## 📄 Licence

Projet éducatif - Libre d'utilisation

## 👨‍💻 Développement

Créé avec ❤️ en HTML5, CSS3 et JavaScript pur (Vanilla JS)
Aucune dépendance externe requise !

---

**Bon jeu ! ⛏️**
