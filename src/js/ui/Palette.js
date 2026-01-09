export class Palette {
    constructor() {
        this.selectedColor = '#ff6b6b';
        this.init();
    }

    init() {
        const paletteItems = document.querySelectorAll('.block-item');

        paletteItems.forEach(item => {
            // Sélection par clic
            item.addEventListener('click', () => {
                this.selectedColor = item.dataset.color;
                this.updateSelection();
            });

            // Drag & drop
            item.addEventListener('dragstart', (e) => {
                const draggedBlock = {
                    color: item.dataset.color,
                    name: item.dataset.name
                };
                e.dataTransfer.effectAllowed = 'copy';
                item.style.opacity = '0.5';
                
                // Émettre un événement personnalisé pour informer MouseControls
                window.dispatchEvent(new CustomEvent('blockDragStart', { detail: draggedBlock }));
            });

            item.addEventListener('dragend', () => {
                item.style.opacity = '1';
                window.dispatchEvent(new CustomEvent('blockDragEnd'));
            });
        });

        // Sélection initiale
        this.updateSelection();
    }

    updateSelection() {
        const paletteItems = document.querySelectorAll('.block-item');
        paletteItems.forEach(item => {
            if (item.dataset.color === this.selectedColor) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    getSelectedColor() {
        return this.selectedColor;
    }
}

