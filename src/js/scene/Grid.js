import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Grid {
    constructor(scene) {
        this.scene = scene;
        this.gridHelper = null;
        this.gridPlane = null;
    }

    create() {
        // Création de la grille visuelle
        this.gridHelper = new THREE.GridHelper(
            CONFIG.GRID_SIZE,
            CONFIG.GRID_SIZE,
            CONFIG.COLORS.GRID_MAIN,
            CONFIG.COLORS.GRID_SECONDARY
        );
        this.gridHelper.position.y = 0;
        this.scene.add(this.gridHelper);

        // Plan invisible pour le raycasting (pour détecter les clics sur la grille)
        const planeGeometry = new THREE.PlaneGeometry(CONFIG.GRID_SIZE, CONFIG.GRID_SIZE);
        const planeMaterial = new THREE.MeshBasicMaterial({
            visible: false,
            side: THREE.DoubleSide
        });
        this.gridPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.gridPlane.rotation.x = -Math.PI / 2;
        this.gridPlane.position.y = 0;
        this.gridPlane.userData.isGridPlane = true;
        this.scene.add(this.gridPlane);

        return this.gridPlane;
    }

    getGridPlane() {
        return this.gridPlane;
    }
}

