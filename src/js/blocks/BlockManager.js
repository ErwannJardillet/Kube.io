import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class BlockManager {
    constructor(scene) {
        this.scene = scene;
        this.placedBlocks = [];
        this.blockMap = {}; // Clé: "x,z" pour accès rapide
    }

    placeBlock(x, z, color) {
        // Snap sur la grille
        const snappedX = Math.round(x);
        const snappedZ = Math.round(z);

        // Vérifier les limites de la grille
        const halfSize = CONFIG.GRID_SIZE / 2;
        if (snappedX < -halfSize || snappedX >= halfSize ||
            snappedZ < -halfSize || snappedZ >= halfSize) {
            return null;
        }

        // Trouver la hauteur la plus élevée à cette position pour l'empilement
        const key = `${snappedX},${snappedZ}`;
        let stackHeight = 0;

        if (this.blockMap[key] && this.blockMap[key].length > 0) {
            // Trouver le bloc le plus haut dans cette pile
            const stack = this.blockMap[key];
            stackHeight = Math.max(...stack.map(block => block.position.y + CONFIG.BLOCK_SIZE / 2));
        } else {
            // Première pile à cette position
            this.blockMap[key] = [];
            stackHeight = 0;
        }

        // Créer le bloc
        const geometry = new THREE.BoxGeometry(CONFIG.BLOCK_SIZE, CONFIG.BLOCK_SIZE, CONFIG.BLOCK_SIZE);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const block = new THREE.Mesh(geometry, material);

        // Placer le bloc au-dessus de la pile existante
        block.position.set(snappedX, stackHeight + CONFIG.BLOCK_SIZE / 2, snappedZ);
        block.castShadow = true;
        block.receiveShadow = true;
        block.userData.gridX = snappedX;
        block.userData.gridZ = snappedZ;
        block.userData.stackIndex = this.blockMap[key].length;

        // Ajouter à la scène
        this.scene.add(block);
        this.placedBlocks.push(block);
        this.blockMap[key].push(block);

        return block;
    }

    placeBlockAtHeight(x, z, height, color) {
        // Snap sur la grille
        const snappedX = Math.round(x);
        const snappedZ = Math.round(z);

        // Vérifier les limites de la grille
        const halfSize = CONFIG.GRID_SIZE / 2;
        if (snappedX < -halfSize || snappedX >= halfSize ||
            snappedZ < -halfSize || snappedZ >= halfSize) {
            return null;
        }

        // Vérifier si un bloc existe déjà à cette position et cette hauteur
        const key = `${snappedX},${snappedZ}`;
        const targetY = height + CONFIG.BLOCK_SIZE / 2;

        if (this.blockMap[key] && this.blockMap[key].length > 0) {
            // Vérifier si un bloc existe déjà à cette hauteur (avec une petite tolérance)
            const existingBlock = this.blockMap[key].find(block =>
                Math.abs(block.position.y - targetY) < 0.1
            );
            if (existingBlock) {
                return null; // Bloc déjà présent à cette hauteur
            }
        } else {
            this.blockMap[key] = [];
        }

        // Créer le bloc
        const geometry = new THREE.BoxGeometry(CONFIG.BLOCK_SIZE, CONFIG.BLOCK_SIZE, CONFIG.BLOCK_SIZE);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const block = new THREE.Mesh(geometry, material);

        // Placer le bloc à la hauteur spécifiée
        block.position.set(snappedX, targetY, snappedZ);
        block.castShadow = true;
        block.receiveShadow = true;
        block.userData.gridX = snappedX;
        block.userData.gridZ = snappedZ;
        block.userData.stackIndex = this.blockMap[key].length;

        // Ajouter à la scène
        this.scene.add(block);
        this.placedBlocks.push(block);
        this.blockMap[key].push(block);

        return block;
    }

    removeBlock(block) {
        // Trouver le bloc dans le tableau (peut être un enfant du mesh)
        let targetBlock = block;
        while (targetBlock.parent && targetBlock.parent !== this.scene) {
            targetBlock = targetBlock.parent;
        }

        if (!this.placedBlocks.includes(targetBlock)) {
            return;
        }

        // Retirer de la scène
        this.scene.remove(targetBlock);

        // Retirer du tableau
        const index = this.placedBlocks.indexOf(targetBlock);
        if (index > -1) {
            this.placedBlocks.splice(index, 1);
        }

        // Retirer du dictionnaire (tableau de blocs)
        const key = `${targetBlock.userData.gridX},${targetBlock.userData.gridZ}`;
        if (this.blockMap[key]) {
            const stackIndex = this.blockMap[key].indexOf(targetBlock);
            if (stackIndex > -1) {
                this.blockMap[key].splice(stackIndex, 1);
            }
            // Si la pile est vide, supprimer la clé
            if (this.blockMap[key].length === 0) {
                delete this.blockMap[key];
            }
        }

        // Nettoyer la géométrie et le matériau
        targetBlock.geometry.dispose();
        targetBlock.material.dispose();
    }

    clearAll() {
        this.placedBlocks.forEach(block => {
            this.scene.remove(block);
            block.geometry.dispose();
            block.material.dispose();
        });
        this.placedBlocks = [];
        this.blockMap = {};
    }

    getPlacedBlocks() {
        return this.placedBlocks;
    }

    getAdjacentPosition(block, faceNormal) {
        const blockX = block.userData.gridX;
        const blockZ = block.userData.gridZ;

        // Si on clique sur le dessus (y positif) ou le dessous (y négatif), empiler verticalement
        if (Math.abs(faceNormal.y) > 0.7) {
            return { x: blockX, z: blockZ, stack: true };
        }

        // Pour les côtés, déterminer la direction principale
        let normalX = 0;
        let normalZ = 0;

        // Déterminer la direction principale (x ou z)
        if (Math.abs(faceNormal.x) > 0.7) {
            normalX = Math.round(faceNormal.x);
        } else if (Math.abs(faceNormal.z) > 0.7) {
            normalZ = Math.round(faceNormal.z);
        }

        // Si on a une direction valide, placer sur le côté
        if (normalX !== 0 || normalZ !== 0) {
            return {
                x: blockX + normalX,
                z: blockZ + normalZ,
                stack: false,
                height: block.position.y - CONFIG.BLOCK_SIZE / 2 // Hauteur du bas du bloc pour aligner
            };
        }

        // Par défaut, empiler verticalement
        return { x: blockX, z: blockZ, stack: true };
    }
}

