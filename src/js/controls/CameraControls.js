import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class CameraControls {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.cameraTarget = new THREE.Vector3(0, 0, 0);
        this.cameraSpherical = new THREE.Spherical();
        this.isOrbiting = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.mouseMovedDuringDrag = false;
        this.settings = {
            orbitSensitivity: CONFIG.CONTROLS.ORBIT_SENSITIVITY,
            zoomSensitivity: CONFIG.CONTROLS.ZOOM_SENSITIVITY
        };
        
        // Variables pour les contrôles tactiles (déclarées comme propriétés de classe)
        this.touchStartDistance = 0;
        this.touchStartRadius = 0;
        this.isTouching = false;
        this.isZooming = false; // Indique si on est en mode zoom (2 doigts)

        this.init();
    }

    setOrbitSensitivity(sensitivity) {
        this.settings.orbitSensitivity = sensitivity;
    }

    setZoomSensitivity(sensitivity) {
        this.settings.zoomSensitivity = sensitivity;
    }

    getSettings() {
        return { ...this.settings };
    }

    init() {
        // Initialiser la position sphérique de la caméra
        const offset = new THREE.Vector3().subVectors(this.camera.position, this.cameraTarget);
        this.cameraSpherical.setFromVector3(offset);
        this.cameraSpherical.radius = Math.max(
            CONFIG.CAMERA.MIN_RADIUS,
            Math.min(CONFIG.CAMERA.MAX_RADIUS, this.cameraSpherical.radius)
        );

        // Contrôles de rotation avec la souris
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Clic gauche seulement pour orbiter
                this.isOrbiting = true;
                this.mouseMovedDuringDrag = false;
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        const orbitMouseMove = (e) => {
            if (this.isOrbiting) {
                const deltaX = e.clientX - this.previousMousePosition.x;
                const deltaY = e.clientY - this.previousMousePosition.y;

                // Si la souris a bougé significativement, on considère que c'est un drag
                if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
                    this.mouseMovedDuringDrag = true;
                }

                if (this.mouseMovedDuringDrag) {
                    this.cameraSpherical.theta -= deltaX * this.settings.orbitSensitivity;
                    this.cameraSpherical.phi -= deltaY * this.settings.orbitSensitivity;

                    // Limiter l'angle phi pour garder la vue du dessus
                    this.cameraSpherical.phi = Math.max(0.1, Math.min(Math.PI / 2.2, this.cameraSpherical.phi));
                }

                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        };

        this.renderer.domElement.addEventListener('mousemove', orbitMouseMove);

        this.renderer.domElement.addEventListener('mouseup', () => {
            this.isOrbiting = false;
        });

        this.renderer.domElement.addEventListener('mouseleave', () => {
            this.isOrbiting = false;
        });

        // Zoom avec la molette
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY * this.settings.zoomSensitivity;
            this.cameraSpherical.radius += delta;
            this.cameraSpherical.radius = Math.max(
                CONFIG.CAMERA.MIN_RADIUS,
                Math.min(CONFIG.CAMERA.MAX_RADIUS, this.cameraSpherical.radius)
            );
        });

        // Contrôles tactiles pour mobile
        this.touchStartRadius = this.cameraSpherical.radius;

        this.renderer.domElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                // Un seul doigt : orbiter
                this.isTouching = true;
                this.isZooming = false;
                this.isOrbiting = true;
                this.mouseMovedDuringDrag = false;
                const touch = e.touches[0];
                this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
            } else if (e.touches.length === 2) {
                // Deux doigts : zoom (pincer)
                this.isTouching = true;
                this.isZooming = true;
                this.isOrbiting = false;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                this.touchStartDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                this.touchStartRadius = this.cameraSpherical.radius;
            }
        }, { passive: false });

        this.renderer.domElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && this.isTouching && !this.isZooming) {
                // Orbiter avec un doigt (seulement si pas en mode zoom)
                const touch = e.touches[0];
                const deltaX = touch.clientX - this.previousMousePosition.x;
                const deltaY = touch.clientY - this.previousMousePosition.y;

                // Seuil plus élevé sur mobile pour éviter les faux positifs (5px au lieu de 2px)
                if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                    this.mouseMovedDuringDrag = true;
                }

                if (this.mouseMovedDuringDrag) {
                    this.cameraSpherical.theta -= deltaX * this.settings.orbitSensitivity * 2; // Plus sensible sur mobile
                    this.cameraSpherical.phi -= deltaY * this.settings.orbitSensitivity * 2;
                    this.cameraSpherical.phi = Math.max(0.1, Math.min(Math.PI / 2.2, this.cameraSpherical.phi));
                }

                this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
            } else if (e.touches.length === 2) {
                // Zoom avec deux doigts
                // Si on passe de 1 à 2 doigts, initialiser les valeurs de zoom
                if (!this.isZooming && this.isTouching) {
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    this.touchStartDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    this.touchStartRadius = this.cameraSpherical.radius;
                }
                
                this.isZooming = true;
                this.isOrbiting = false;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                // Éviter la division par zéro
                if (this.touchStartDistance > 0 && currentDistance > 0) {
                    const scale = this.touchStartDistance / currentDistance;
                    this.cameraSpherical.radius = this.touchStartRadius * scale;
                    this.cameraSpherical.radius = Math.max(
                        CONFIG.CAMERA.MIN_RADIUS,
                        Math.min(CONFIG.CAMERA.MAX_RADIUS, this.cameraSpherical.radius)
                    );
                }
            }
        }, { passive: false });

        this.renderer.domElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (e.touches.length === 0) {
                // Tous les doigts levés
                this.isTouching = false;
                this.isZooming = false;
                this.isOrbiting = false;
            } else if (e.touches.length === 1) {
                // Revenir en mode orbite si on passe de 2 à 1 doigt
                this.isZooming = false;
                this.isOrbiting = true;
                this.mouseMovedDuringDrag = false;
                const touch = e.touches[0];
                this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
            }
        }, { passive: false });
    }

    update() {
        const offset = new THREE.Vector3();
        offset.setFromSpherical(this.cameraSpherical);
        this.camera.position.copy(this.cameraTarget).add(offset);
        this.camera.lookAt(this.cameraTarget);
    }

    getMouseMovedDuringDrag() {
        return this.mouseMovedDuringDrag;
    }

    resetMouseMovedDuringDrag() {
        this.mouseMovedDuringDrag = false;
    }

    getCameraTarget() {
        return this.cameraTarget;
    }

    getCameraSpherical() {
        return this.cameraSpherical;
    }

    isZoomingMode() {
        return this.isZooming;
    }

    isTouchingMode() {
        return this.isTouching;
    }
}

