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
}

