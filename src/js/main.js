import { CONFIG } from './config.js';
import { SceneManager } from './scene/SceneManager.js';
import { Grid } from './scene/Grid.js';
import { Lighting } from './scene/Lighting.js';
import { BlockManager } from './blocks/BlockManager.js';
import { CameraControls } from './controls/CameraControls.js';
import { KeyboardControls } from './controls/KeyboardControls.js';
import { MouseControls } from './controls/MouseControls.js';
import { Palette } from './ui/Palette.js';
import { SettingsPanel } from './ui/SettingsPanel.js';

class App {
    constructor() {
        this.sceneManager = null;
        this.grid = null;
        this.lighting = null;
        this.blockManager = null;
        this.cameraControls = null;
        this.keyboardControls = null;
        this.mouseControls = null;
        this.palette = null;
        this.settingsPanel = null;
    }

    init() {
        // Initialisation de la scène
        this.sceneManager = new SceneManager('canvas-container');
        const { scene, camera, renderer } = this.sceneManager.init();

        // Création de la grille
        this.grid = new Grid(scene);
        const gridPlane = this.grid.create();

        // Configuration de l'éclairage
        this.lighting = new Lighting(scene);
        this.lighting.setup();

        // Gestion des blocs
        this.blockManager = new BlockManager(scene);

        // Contrôles de caméra
        this.cameraControls = new CameraControls(camera, renderer);

        // Contrôles clavier
        this.keyboardControls = new KeyboardControls(camera, this.cameraControls);

        // Initialisation de la palette
        this.palette = new Palette();

        // Contrôles souris
        this.mouseControls = new MouseControls(
            renderer,
            camera,
            scene,
            this.blockManager,
            gridPlane,
            this.palette,
            this.cameraControls
        );

        // Gestion des événements de drag & drop
        window.addEventListener('blockDragStart', (e) => {
            this.mouseControls.setDraggedBlock(e.detail);
        });

        window.addEventListener('blockDragEnd', () => {
            this.mouseControls.clearDraggedBlock();
        });

        // Bouton effacer tout
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.blockManager.clearAll();
        });

        // Panneau de paramètres
        this.settingsPanel = new SettingsPanel(
            this.keyboardControls,
            this.cameraControls,
            this.lighting
        );

        // Démarrer l'animation
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Mettre à jour les contrôles clavier
        this.keyboardControls.update();

        // Mettre à jour les contrôles de caméra
        this.cameraControls.update();

        // Rendu
        this.sceneManager.render();
    }
}

// Démarrer l'application
const app = new App();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

