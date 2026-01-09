import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class KeyboardControls {
    constructor(camera, cameraControls) {
        this.camera = camera;
        this.cameraControls = cameraControls;
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            q: false,
            e: false,
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };
        this.settings = {
            moveSpeed: CONFIG.CONTROLS.MOVE_SPEED,
            verticalSpeed: CONFIG.CONTROLS.VERTICAL_SPEED,
            keyBindings: {
                forward: ['w', 'ArrowUp'],
                backward: ['s', 'ArrowDown'],
                left: ['a', 'ArrowLeft'],
                right: ['d', 'ArrowRight'],
                up: ['q'],
                down: ['e']
            }
        };

        this.init();
    }

    setMoveSpeed(speed) {
        this.settings.moveSpeed = speed;
    }

    setVerticalSpeed(speed) {
        this.settings.verticalSpeed = speed;
    }

    setKeyBinding(action, keys) {
        if (this.settings.keyBindings.hasOwnProperty(action)) {
            this.settings.keyBindings[action] = Array.isArray(keys) ? keys : [keys];
        }
    }

    getKeyBinding(action) {
        return this.settings.keyBindings[action] || [];
    }

    getAllKeyBindings() {
        return { ...this.settings.keyBindings };
    }

    getSettings() {
        return { ...this.settings };
    }

    init() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(event) {
        const key = event.key.toLowerCase();
        const keyCode = event.key;
        
        // Vérifier si la touche est dans les bindings configurés
        const allBoundKeys = Object.values(this.settings.keyBindings).flat();
        const isBound = allBoundKeys.some(boundKey => {
            const boundKeyLower = boundKey.toLowerCase();
            return key === boundKeyLower || keyCode === boundKey || key === boundKey;
        });
        
        if (isBound) {
            this.keys[key] = true;
            this.keys[keyCode] = true;
        }
    }

    onKeyUp(event) {
        const key = event.key.toLowerCase();
        const keyCode = event.key;
        
        // Vérifier si la touche est dans les bindings configurés
        const allBoundKeys = Object.values(this.settings.keyBindings).flat();
        const isBound = allBoundKeys.some(boundKey => {
            const boundKeyLower = boundKey.toLowerCase();
            return key === boundKeyLower || keyCode === boundKey || key === boundKey;
        });
        
        if (isBound) {
            this.keys[key] = false;
            this.keys[keyCode] = false;
        }
    }

    update() {
        const moveSpeed = this.settings.moveSpeed;
        const verticalSpeed = this.settings.verticalSpeed;

        // Calculer la direction de la caméra dans le plan horizontal
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Garder seulement le plan horizontal
        cameraDirection.normalize();

        // Calculer la direction perpendiculaire (pour le mouvement latéral)
        const rightDirection = new THREE.Vector3();
        rightDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
        rightDirection.normalize();

        const cameraTarget = this.cameraControls.getCameraTarget();

        // Déplacement de la caméra - utiliser les touches configurées
        const forwardKeys = this.settings.keyBindings.forward;
        const backwardKeys = this.settings.keyBindings.backward;
        const leftKeys = this.settings.keyBindings.left;
        const rightKeys = this.settings.keyBindings.right;
        const upKeys = this.settings.keyBindings.up;
        const downKeys = this.settings.keyBindings.down;

        // Fonction helper pour vérifier si une touche est pressée
        const isKeyPressed = (keys) => {
            return keys.some(k => {
                const kLower = k.toLowerCase();
                return this.keys[kLower] || this.keys[k] || 
                       (k.startsWith('Arrow') && this.keys[k]);
            });
        };

        // Avancer
        if (isKeyPressed(forwardKeys)) {
            this.camera.position.addScaledVector(cameraDirection, moveSpeed);
            cameraTarget.addScaledVector(cameraDirection, moveSpeed);
        }
        // Reculer
        if (isKeyPressed(backwardKeys)) {
            this.camera.position.addScaledVector(cameraDirection, -moveSpeed);
            cameraTarget.addScaledVector(cameraDirection, -moveSpeed);
        }
        // Gauche
        if (isKeyPressed(leftKeys)) {
            this.camera.position.addScaledVector(rightDirection, -moveSpeed);
            cameraTarget.addScaledVector(rightDirection, -moveSpeed);
        }
        // Droite
        if (isKeyPressed(rightKeys)) {
            this.camera.position.addScaledVector(rightDirection, moveSpeed);
            cameraTarget.addScaledVector(rightDirection, moveSpeed);
        }

        // Déplacement vertical (change le rayon de la caméra)
        const cameraSpherical = this.cameraControls.getCameraSpherical();
        if (isKeyPressed(upKeys)) {
            cameraSpherical.radius -= verticalSpeed;
            cameraSpherical.radius = Math.max(
                CONFIG.CAMERA.MIN_RADIUS,
                Math.min(CONFIG.CAMERA.MAX_RADIUS, cameraSpherical.radius)
            );
        }
        if (isKeyPressed(downKeys)) {
            cameraSpherical.radius += verticalSpeed;
            cameraSpherical.radius = Math.max(
                CONFIG.CAMERA.MIN_RADIUS,
                Math.min(CONFIG.CAMERA.MAX_RADIUS, cameraSpherical.radius)
            );
        }
    }
}

