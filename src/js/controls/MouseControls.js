import * as THREE from 'three';

export class MouseControls {
    constructor(renderer, camera, scene, blockManager, gridPlane, palette, cameraControls) {
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;
        this.blockManager = blockManager;
        this.gridPlane = gridPlane;
        this.palette = palette;
        this.cameraControls = cameraControls;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.draggedBlock = null;

        this.init();
    }

    init() {
        // Clics sur le canvas
        this.renderer.domElement.addEventListener('click', (e) => this.onCanvasClick(e));
        this.renderer.domElement.addEventListener('contextmenu', (e) => this.onCanvasRightClick(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Drag & drop
        this.renderer.domElement.addEventListener('dragover', (e) => this.onDragOver(e));
        this.renderer.domElement.addEventListener('drop', (e) => this.onDrop(e));

        // Contrôles tactiles pour mobile
        this.touchStartTime = 0;
        this.touchStartPosition = { x: 0, y: 0 };
        this.longPressTimer = null;
        this.touchIdentifier = null; // Identifier du touch pour suivre le même doigt

        this.renderer.domElement.addEventListener('touchstart', (e) => {
            // Ne gérer que si un seul doigt et pas en mode zoom
            if (e.touches.length === 1 && !this.cameraControls.isZoomingMode()) {
                const touch = e.touches[0];
                this.touchIdentifier = touch.identifier;
                this.touchStartTime = Date.now();
                this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
                
                // Timer pour le long press (suppression)
                this.longPressTimer = setTimeout(() => {
                    // Vérifier que c'est toujours le même touch et qu'on n'est pas en zoom
                    if (!this.cameraControls.isZoomingMode() && !this.cameraControls.getMouseMovedDuringDrag()) {
                        this.handleLongPress(touch);
                    }
                }, 500);
            } else {
                // Annuler le timer si on passe en mode zoom ou plusieurs doigts
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }
            }
        }, { passive: false });

        this.renderer.domElement.addEventListener('touchmove', (e) => {
            // Annuler le long press si on bouge ou si on passe en mode zoom
            if (this.longPressTimer && (e.touches.length !== 1 || this.cameraControls.isZoomingMode())) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        }, { passive: false });

        this.renderer.domElement.addEventListener('touchend', (e) => {
            // Annuler le timer de long press
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }

            // Ne gérer que si c'est le même touch qui a commencé et qu'on n'est pas en zoom
            if (e.changedTouches.length === 1 && !this.cameraControls.isZoomingMode()) {
                const touch = e.changedTouches[0];
                
                // Vérifier que c'est le même touch
                if (touch.identifier === this.touchIdentifier) {
                    const touchDuration = Date.now() - this.touchStartTime;
                    const touchDistance = Math.hypot(
                        touch.clientX - this.touchStartPosition.x,
                        touch.clientY - this.touchStartPosition.y
                    );

                    // Si c'est un tap court (< 300ms) et pas de mouvement significatif
                    if (touchDuration < 300 && touchDistance < 10) {
                        // Ne pas placer si on a déplacé la caméra
                        if (!this.cameraControls.getMouseMovedDuringDrag()) {
                            this.handleTouchClick(touch);
                        }
                        this.cameraControls.resetMouseMovedDuringDrag();
                    }
                }
            }
            
            // Réinitialiser l'identifier si tous les doigts sont levés
            if (e.touches.length === 0) {
                this.touchIdentifier = null;
            }
        }, { passive: false });
    }

    handleTouchClick(touch) {
        // Vérifier une dernière fois qu'on n'a pas bougé la caméra
        if (this.cameraControls.getMouseMovedDuringDrag()) {
            this.cameraControls.resetMouseMovedDuringDrag();
            return;
        }
        
        const event = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {}
        };
        this.onCanvasClick(event);
    }

    handleLongPress(touch) {
        const event = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {}
        };
        this.onCanvasRightClick(event, true); // true = depuis mobile
    }

    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0;
        const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0;
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    onCanvasClick(event) {
        // Ne pas placer de bloc si on a déplacé la caméra
        if (this.cameraControls.getMouseMovedDuringDrag()) {
            this.cameraControls.resetMouseMovedDuringDrag();
            return;
        }

        event.preventDefault();

        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Vérifier d'abord si on clique sur un bloc existant
        const placedBlocks = this.blockManager.getPlacedBlocks();
        const blockIntersects = this.raycaster.intersectObjects(placedBlocks, true);
        if (blockIntersects.length > 0) {
            const intersect = blockIntersects[0];
            // Trouver le bloc cliqué (peut être un enfant du mesh)
            let clickedBlock = intersect.object;
            while (clickedBlock.parent && clickedBlock.parent !== this.scene) {
                clickedBlock = clickedBlock.parent;
            }

            // Si c'est un bloc valide, déterminer où placer le nouveau bloc
            if (clickedBlock.userData.gridX !== undefined && clickedBlock.userData.gridZ !== undefined) {
                // Obtenir la normale de la face cliquée
                const faceNormal = intersect.face.normal.clone();

                // Obtenir la position adjacente
                const adjacentPos = this.blockManager.getAdjacentPosition(clickedBlock, faceNormal);

                const selectedColor = this.palette.getSelectedColor();
                if (adjacentPos.stack) {
                    // Empiler verticalement
                    this.blockManager.placeBlock(adjacentPos.x, adjacentPos.z, selectedColor);
                } else {
                    // Placer sur le côté à la même hauteur
                    this.blockManager.placeBlockAtHeight(adjacentPos.x, adjacentPos.z, adjacentPos.height, selectedColor);
                }
                return;
            }
        }

        // Sinon, vérifier si on clique sur la grille
        const intersects = this.raycaster.intersectObject(this.gridPlane);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            const selectedColor = this.palette.getSelectedColor();
            this.blockManager.placeBlock(point.x, point.z, selectedColor);
        }
    }

    onCanvasRightClick(event, isMobile = false) {
        event.preventDefault();

        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Chercher les blocs intersectés
        const placedBlocks = this.blockManager.getPlacedBlocks();
        const intersects = this.raycaster.intersectObjects(placedBlocks, true);
        if (intersects.length > 0) {
            const clickedBlock = intersects[0].object;
            this.blockManager.removeBlock(clickedBlock);
            
            // Vibrer sur mobile si un bloc a été supprimé
            if (isMobile) {
                this.vibrate();
            }
        }
    }

    vibrate() {
        // Vérifier si l'API Vibration est disponible
        if ('vibrate' in navigator) {
            try {
                // Vibration courte : 50ms
                navigator.vibrate(50);
            } catch (e) {
                // Ignorer les erreurs si l'API n'est pas supportée
                console.debug('Vibration non supportée');
            }
        }
    }

    onMouseMove(event) {
        this.updateMousePosition(event);
    }

    onDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    onDrop(event) {
        event.preventDefault();

        if (!this.draggedBlock) return;

        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Vérifier d'abord si on drop sur un bloc existant
        const placedBlocks = this.blockManager.getPlacedBlocks();
        const blockIntersects = this.raycaster.intersectObjects(placedBlocks, true);
        if (blockIntersects.length > 0) {
            const intersect = blockIntersects[0];
            // Trouver le bloc cliqué (peut être un enfant du mesh)
            let clickedBlock = intersect.object;
            while (clickedBlock.parent && clickedBlock.parent !== this.scene) {
                clickedBlock = clickedBlock.parent;
            }

            // Si c'est un bloc valide, déterminer où placer le nouveau bloc
            if (clickedBlock.userData.gridX !== undefined && clickedBlock.userData.gridZ !== undefined) {
                // Obtenir la normale de la face cliquée
                const faceNormal = intersect.face.normal.clone();

                // Obtenir la position adjacente
                const adjacentPos = this.blockManager.getAdjacentPosition(clickedBlock, faceNormal);

                if (adjacentPos.stack) {
                    // Empiler verticalement
                    this.blockManager.placeBlock(adjacentPos.x, adjacentPos.z, this.draggedBlock.color);
                } else {
                    // Placer sur le côté à la même hauteur
                    this.blockManager.placeBlockAtHeight(adjacentPos.x, adjacentPos.z, adjacentPos.height, this.draggedBlock.color);
                }
                return;
            }
        }

        // Sinon, vérifier si on drop sur la grille
        const intersects = this.raycaster.intersectObject(this.gridPlane);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            this.blockManager.placeBlock(point.x, point.z, this.draggedBlock.color);
        }
    }

    setDraggedBlock(block) {
        this.draggedBlock = block;
    }

    clearDraggedBlock() {
        this.draggedBlock = null;
    }
}

