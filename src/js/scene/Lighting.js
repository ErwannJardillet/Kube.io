import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.ambientLight = null;
        this.directionalLight1 = null;
        this.directionalLight2 = null;
        this.settings = {
            ambientIntensity: 0.6,
            directional1Intensity: 0.8,
            directional2Intensity: 0.4,
            ambientColor: '#ffffff',
            directional1Color: '#ffffff',
            directional2Color: '#ffffff'
        };
    }

    setup() {
        // Lumière ambiante
        this.ambientLight = new THREE.AmbientLight(0xffffff, this.settings.ambientIntensity);
        this.scene.add(this.ambientLight);

        // Lumière directionnelle principale
        this.directionalLight1 = new THREE.DirectionalLight(0xffffff, this.settings.directional1Intensity);
        this.directionalLight1.position.set(10, 15, 10);
        this.directionalLight1.castShadow = true;
        this.directionalLight1.shadow.camera.left = -CONFIG.GRID_SIZE;
        this.directionalLight1.shadow.camera.right = CONFIG.GRID_SIZE;
        this.directionalLight1.shadow.camera.top = CONFIG.GRID_SIZE;
        this.directionalLight1.shadow.camera.bottom = -CONFIG.GRID_SIZE;
        this.directionalLight1.shadow.mapSize.width = 2048;
        this.directionalLight1.shadow.mapSize.height = 2048;
        this.scene.add(this.directionalLight1);

        // Lumière directionnelle secondaire
        this.directionalLight2 = new THREE.DirectionalLight(0xffffff, this.settings.directional2Intensity);
        this.directionalLight2.position.set(-10, 10, -10);
        this.scene.add(this.directionalLight2);
    }

    setAmbientIntensity(intensity) {
        this.settings.ambientIntensity = intensity;
        if (this.ambientLight) {
            this.ambientLight.intensity = intensity;
        }
    }

    setDirectional1Intensity(intensity) {
        this.settings.directional1Intensity = intensity;
        if (this.directionalLight1) {
            this.directionalLight1.intensity = intensity;
        }
    }

    setDirectional2Intensity(intensity) {
        this.settings.directional2Intensity = intensity;
        if (this.directionalLight2) {
            this.directionalLight2.intensity = intensity;
        }
    }

    setAmbientColor(color) {
        this.settings.ambientColor = color;
        if (this.ambientLight) {
            this.ambientLight.color.setHex(parseInt(color.replace('#', ''), 16));
        }
    }

    setDirectional1Color(color) {
        this.settings.directional1Color = color;
        if (this.directionalLight1) {
            this.directionalLight1.color.setHex(parseInt(color.replace('#', ''), 16));
        }
    }

    setDirectional2Color(color) {
        this.settings.directional2Color = color;
        if (this.directionalLight2) {
            this.directionalLight2.color.setHex(parseInt(color.replace('#', ''), 16));
        }
    }

    getSettings() {
        return { ...this.settings };
    }
}

