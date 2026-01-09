import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }

    init() {
        // Création de la scène
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.COLORS.BACKGROUND);

        // Création de la caméra
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.FOV,
            this.container.clientWidth / this.container.clientHeight,
            CONFIG.CAMERA.NEAR,
            CONFIG.CAMERA.FAR
        );
        this.camera.position.set(
            CONFIG.CAMERA.INITIAL_POSITION.x,
            CONFIG.CAMERA.INITIAL_POSITION.y,
            CONFIG.CAMERA.INITIAL_POSITION.z
        );
        this.camera.lookAt(0, 0, 0);

        // Création du renderer avec haute résolution pour éviter le pixelisé
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        
        // Utiliser devicePixelRatio pour améliorer la qualité sur écrans haute résolution
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2); // Limiter à 2 pour performance
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Gestion du redimensionnement
        window.addEventListener('resize', () => this.onWindowResize());

        return {
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer
        };
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

