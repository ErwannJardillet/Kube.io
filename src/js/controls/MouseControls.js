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
    }

    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
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

    onCanvasRightClick(event) {
        event.preventDefault();

        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Chercher les blocs intersectés
        const placedBlocks = this.blockManager.getPlacedBlocks();
        const intersects = this.raycaster.intersectObjects(placedBlocks, true);
        if (intersects.length > 0) {
            const clickedBlock = intersects[0].object;
            this.blockManager.removeBlock(clickedBlock);
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

