# Constructeur 3D

Application web interactive de construction 3D avec des blocs colorés sur une grille, utilisant Three.js.

## 🚀 Fonctionnalités

- **Construction 3D** : Placez des blocs colorés sur une grille interactive
- **Contrôles intuitifs** : Navigation avec la souris et le clavier
- **Palette de couleurs** : Sélectionnez parmi 6 couleurs différentes
- **Drag & Drop** : Glissez-déposez des blocs depuis la palette
- **Empilement intelligent** : Les blocs s'empilent automatiquement ou se placent sur les côtés
- **Paramètres personnalisables** : Panneau de configuration pour ajuster les contrôles et l'éclairage en temps réel

## 📁 Structure du Projet

```
buildSite/
├── index.html              # Point d'entrée HTML
├── package.json            # Configuration npm
├── README.md              # Documentation
├── .gitignore             # Fichiers ignorés par Git
└── src/
    ├── js/
    │   ├── main.js        # Point d'entrée JavaScript
    │   ├── config.js      # Configuration globale
    │   ├── scene/         # Gestion de la scène 3D
    │   │   ├── SceneManager.js
    │   │   ├── Grid.js
    │   │   └── Lighting.js
    │   ├── blocks/        # Gestion des blocs
    │   │   └── BlockManager.js
    │   ├── controls/      # Contrôles utilisateur
    │   │   ├── CameraControls.js
    │   │   ├── KeyboardControls.js
    │   │   └── MouseControls.js
    │   └── ui/            # Interface utilisateur
    │       ├── Palette.js
    │       └── SettingsPanel.js
    └── css/
        ├── main.css       # Styles principaux
        ├── variables.css  # Variables CSS
        └── components/    # Styles des composants
            ├── palette.css
            ├── canvas.css
            ├── instructions.css
            ├── controls.css
            └── settings.css
```

## 🛠️ Installation

1. **Cloner le projet** (ou télécharger les fichiers)

2. **Installer les dépendances** (optionnel, pour développement local) :
```bash
npm install
```

3. **Lancer un serveur local** :
```bash
npm run dev
```

Ou utilisez n'importe quel serveur HTTP local (Python, PHP, etc.) :
```bash
# Python
python -m http.server 8000

# PHP
php -S localhost:8000
```

## 🎮 Contrôles

### Souris
- **Glisser** : Orbiter autour de la scène
- **Molette** : Zoomer/Dézoomer
- **Clic gauche** : Placer un bloc
- **Clic droit** : Supprimer un bloc
- **Drag & Drop** : Glisser un bloc depuis la palette vers la grille

### Clavier
- **WASD** ou **Flèches** : Déplacer la caméra
- **Q/E** : Monter/Descendre la caméra

## ⚙️ Paramètres

Un panneau de paramètres est disponible pour personnaliser l'expérience :

### Accès aux paramètres
Cliquez sur le bouton **"⚙️ Paramètres"** dans le panneau de gauche pour ouvrir le panneau de configuration.

### Paramètres de contrôle
- **Vitesse de déplacement** : Ajustez la vitesse de déplacement de la caméra (0.05 - 1.0)
- **Vitesse verticale** : Contrôlez la vitesse de montée/descente (0.05 - 0.5)
- **Sensibilité d'orbite** : Réglez la sensibilité de rotation de la caméra (0.001 - 0.05)
- **Sensibilité du zoom** : Ajustez la vitesse de zoom (0.001 - 0.05)

### Raccourcis clavier personnalisables
Vous pouvez personnaliser toutes les touches de contrôle :
- **Avancer** : Par défaut W / ↑ (configurable)
- **Reculer** : Par défaut S / ↓ (configurable)
- **Gauche** : Par défaut A / ← (configurable)
- **Droite** : Par défaut D / → (configurable)
- **Monter** : Par défaut Q (configurable)
- **Descendre** : Par défaut E (configurable)

**Comment personnaliser :**
1. Cliquez sur le bouton correspondant à l'action souhaitée
2. Appuyez sur la touche que vous voulez assigner
3. La nouvelle touche sera immédiatement active

Les touches de direction (flèches) sont conservées en complément des lettres pour chaque action de mouvement.

### Paramètres d'éclairage
- **Intensité ambiante** : Contrôlez l'intensité de la lumière ambiante (0 - 2.0)
- **Intensité lumière principale** : Ajustez l'intensité de la lumière directionnelle principale (0 - 2.0)
- **Intensité lumière secondaire** : Réglez l'intensité de la lumière directionnelle secondaire (0 - 2.0)
- **Couleur ambiante** : Changez la couleur de la lumière ambiante
- **Couleur lumière principale** : Modifiez la couleur de la lumière principale
- **Couleur lumière secondaire** : Ajustez la couleur de la lumière secondaire

Tous les paramètres sont appliqués en temps réel, vous permettant de voir immédiatement les changements dans la scène 3D.

## 🏗️ Architecture

Le projet utilise une architecture modulaire avec :

- **Séparation des responsabilités** : Chaque module a une fonction précise
- **Modules ES6** : Utilisation des imports/exports modernes
- **CSS modulaire** : Styles organisés par composant
- **Configuration centralisée** : Tous les paramètres dans `config.js`

## 📦 Dépendances

- **Three.js** : Bibliothèque 3D (chargée via CDN ou npm)

## 🌐 Compatibilité

- Navigateurs modernes supportant les modules ES6
- WebGL activé

## 📝 Licence

MIT

