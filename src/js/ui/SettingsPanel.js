export class SettingsPanel {
    constructor(keyboardControls, cameraControls, lighting) {
        this.keyboardControls = keyboardControls;
        this.cameraControls = cameraControls;
        this.lighting = lighting;
        this.isOpen = false;
        this.waitingForKey = null;
        this.init();
    }

    init() {
        this.createPanel();
        this.setupEventListeners();
        this.updateUI();
    }

    createPanel() {
        // Créer le bouton toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'settings-toggle-btn';
        toggleBtn.className = 'settings-toggle-btn';
        toggleBtn.textContent = '⚙️ Paramètres';
        toggleBtn.title = 'Ouvrir/Fermer les paramètres';
        
        // Créer le panneau
        const panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-header">
                <h2>Paramètres</h2>
                <button id="settings-close-btn" class="settings-close-btn">×</button>
            </div>
            <div class="settings-content">
                <div class="settings-section">
                    <h3>Contrôles</h3>
                    <div class="setting-item">
                        <label for="move-speed">Vitesse de déplacement</label>
                        <input type="range" id="move-speed" min="0.05" max="1" step="0.05" value="0.2">
                        <span class="setting-value" id="move-speed-value">0.2</span>
                    </div>
                    <div class="setting-item">
                        <label for="vertical-speed">Vitesse verticale</label>
                        <input type="range" id="vertical-speed" min="0.05" max="0.5" step="0.05" value="0.1">
                        <span class="setting-value" id="vertical-speed-value">0.1</span>
                    </div>
                    <div class="setting-item">
                        <label for="orbit-sensitivity">Sensibilité d'orbite</label>
                        <input type="range" id="orbit-sensitivity" min="0.001" max="0.05" step="0.001" value="0.01">
                        <span class="setting-value" id="orbit-sensitivity-value">0.01</span>
                    </div>
                    <div class="setting-item">
                        <label for="zoom-sensitivity">Sensibilité du zoom</label>
                        <input type="range" id="zoom-sensitivity" min="0.001" max="0.05" step="0.001" value="0.01">
                        <span class="setting-value" id="zoom-sensitivity-value">0.01</span>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Raccourcis clavier</h3>
                    <div class="setting-item">
                        <label for="key-forward">Avancer</label>
                        <button class="key-binding-btn" id="key-forward" data-action="forward">W / ↑</button>
                    </div>
                    <div class="setting-item">
                        <label for="key-backward">Reculer</label>
                        <button class="key-binding-btn" id="key-backward" data-action="backward">S / ↓</button>
                    </div>
                    <div class="setting-item">
                        <label for="key-left">Gauche</label>
                        <button class="key-binding-btn" id="key-left" data-action="left">A / ←</button>
                    </div>
                    <div class="setting-item">
                        <label for="key-right">Droite</label>
                        <button class="key-binding-btn" id="key-right" data-action="right">D / →</button>
                    </div>
                    <div class="setting-item">
                        <label for="key-up">Monter</label>
                        <button class="key-binding-btn" id="key-up" data-action="up">Q</button>
                    </div>
                    <div class="setting-item">
                        <label for="key-down">Descendre</label>
                        <button class="key-binding-btn" id="key-down" data-action="down">E</button>
                    </div>
                    <div class="setting-hint">
                        <small>Cliquez sur un bouton puis appuyez sur une touche pour la définir</small>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Éclairage</h3>
                    <div class="setting-item">
                        <label for="ambient-intensity">Intensité ambiante</label>
                        <input type="range" id="ambient-intensity" min="0" max="2" step="0.1" value="0.6">
                        <span class="setting-value" id="ambient-intensity-value">0.6</span>
                    </div>
                    <div class="setting-item">
                        <label for="directional1-intensity">Intensité lumière principale</label>
                        <input type="range" id="directional1-intensity" min="0" max="2" step="0.1" value="0.8">
                        <span class="setting-value" id="directional1-intensity-value">0.8</span>
                    </div>
                    <div class="setting-item">
                        <label for="directional2-intensity">Intensité lumière secondaire</label>
                        <input type="range" id="directional2-intensity" min="0" max="2" step="0.1" value="0.4">
                        <span class="setting-value" id="directional2-intensity-value">0.4</span>
                    </div>
                    <div class="setting-item">
                        <label for="ambient-color">Couleur ambiante</label>
                        <input type="color" id="ambient-color" value="#ffffff">
                    </div>
                    <div class="setting-item">
                        <label for="directional1-color">Couleur lumière principale</label>
                        <input type="color" id="directional1-color" value="#ffffff">
                    </div>
                    <div class="setting-item">
                        <label for="directional2-color">Couleur lumière secondaire</label>
                        <input type="color" id="directional2-color" value="#ffffff">
                    </div>
                </div>
            </div>
        `;

        // Ajouter au DOM
        const leftPanel = document.querySelector('.left-panel');
        leftPanel.appendChild(toggleBtn);
        document.body.appendChild(panel);
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('settings-toggle-btn');
        const closeBtn = document.getElementById('settings-close-btn');
        const panel = document.getElementById('settings-panel');

        toggleBtn.addEventListener('click', () => this.toggle());
        closeBtn.addEventListener('click', () => this.close());

        // Contrôles
        document.getElementById('move-speed').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.keyboardControls.setMoveSpeed(value);
            document.getElementById('move-speed-value').textContent = value.toFixed(2);
        });

        document.getElementById('vertical-speed').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.keyboardControls.setVerticalSpeed(value);
            document.getElementById('vertical-speed-value').textContent = value.toFixed(2);
        });

        document.getElementById('orbit-sensitivity').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.cameraControls.setOrbitSensitivity(value);
            document.getElementById('orbit-sensitivity-value').textContent = value.toFixed(3);
        });

        document.getElementById('zoom-sensitivity').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.cameraControls.setZoomSensitivity(value);
            document.getElementById('zoom-sensitivity-value').textContent = value.toFixed(3);
        });

        // Éclairage
        document.getElementById('ambient-intensity').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.lighting.setAmbientIntensity(value);
            document.getElementById('ambient-intensity-value').textContent = value.toFixed(1);
        });

        document.getElementById('directional1-intensity').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.lighting.setDirectional1Intensity(value);
            document.getElementById('directional1-intensity-value').textContent = value.toFixed(1);
        });

        document.getElementById('directional2-intensity').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.lighting.setDirectional2Intensity(value);
            document.getElementById('directional2-intensity-value').textContent = value.toFixed(1);
        });

        document.getElementById('ambient-color').addEventListener('input', (e) => {
            this.lighting.setAmbientColor(e.target.value);
        });

        document.getElementById('directional1-color').addEventListener('input', (e) => {
            this.lighting.setDirectional1Color(e.target.value);
        });

        document.getElementById('directional2-color').addEventListener('input', (e) => {
            this.lighting.setDirectional2Color(e.target.value);
        });

        // Raccourcis clavier
        const keyBindingButtons = document.querySelectorAll('.key-binding-btn');
        keyBindingButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.startKeyBinding(btn);
            });
        });

        // Écouter les touches pour le remapping
        document.addEventListener('keydown', (e) => {
            if (this.waitingForKey) {
                e.preventDefault();
                e.stopPropagation();
                this.setKeyBinding(this.waitingForKey.action, e.key);
                this.waitingForKey = null;
            }
        });
    }

    startKeyBinding(button) {
        // Réinitialiser tous les boutons
        document.querySelectorAll('.key-binding-btn').forEach(btn => {
            btn.classList.remove('waiting');
        });

        // Marquer ce bouton comme en attente
        button.classList.add('waiting');
        button.textContent = 'Appuyez sur une touche...';
        this.waitingForKey = {
            action: button.dataset.action,
            button: button
        };
    }

    setKeyBinding(action, key) {
        // Convertir les flèches en format standard pour l'affichage
        const keyMap = {
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'ArrowLeft': '←',
            'ArrowRight': '→'
        };

        // Obtenir les touches actuelles pour cette action
        const currentKeys = this.keyboardControls.getKeyBinding(action);
        
        // Si c'est une flèche, garder les deux options (lettre + flèche)
        // Sinon, remplacer par la nouvelle touche
        let newKeys;
        if (key.startsWith('Arrow')) {
            // Si c'est une flèche, remplacer seulement la flèche correspondante
            const letterKey = this.getLetterForAction(action);
            newKeys = letterKey ? [letterKey, key] : [key];
        } else {
            // Si c'est une lettre, garder la flèche correspondante si elle existe
            const arrowKey = this.getArrowForAction(action);
            const normalizedKey = key.toLowerCase();
            newKeys = arrowKey ? [normalizedKey, arrowKey] : [normalizedKey];
        }

        this.keyboardControls.setKeyBinding(action, newKeys);
        
        // Mettre à jour l'affichage
        const button = this.waitingForKey.button;
        button.classList.remove('waiting');
        const displayText = newKeys.map(k => keyMap[k] || k.toUpperCase()).join(' / ');
        button.textContent = displayText;
        this.waitingForKey = null;
    }

    getLetterForAction(action) {
        const letterMap = {
            'forward': 'w',
            'backward': 's',
            'left': 'a',
            'right': 'd',
            'up': 'q',
            'down': 'e'
        };
        return letterMap[action];
    }

    getArrowForAction(action) {
        const arrowMap = {
            'forward': 'ArrowUp',
            'backward': 'ArrowDown',
            'left': 'ArrowLeft',
            'right': 'ArrowRight'
        };
        return arrowMap[action];
    }

    updateUI() {
        // Mettre à jour les valeurs depuis les settings actuels
        const keyboardSettings = this.keyboardControls.getSettings();
        const cameraSettings = this.cameraControls.getSettings();
        const lightingSettings = this.lighting.getSettings();

        document.getElementById('move-speed').value = keyboardSettings.moveSpeed;
        document.getElementById('move-speed-value').textContent = keyboardSettings.moveSpeed.toFixed(2);
        document.getElementById('vertical-speed').value = keyboardSettings.verticalSpeed;
        document.getElementById('vertical-speed-value').textContent = keyboardSettings.verticalSpeed.toFixed(2);
        document.getElementById('orbit-sensitivity').value = cameraSettings.orbitSensitivity;
        document.getElementById('orbit-sensitivity-value').textContent = cameraSettings.orbitSensitivity.toFixed(3);
        document.getElementById('zoom-sensitivity').value = cameraSettings.zoomSensitivity;
        document.getElementById('zoom-sensitivity-value').textContent = cameraSettings.zoomSensitivity.toFixed(3);

        document.getElementById('ambient-intensity').value = lightingSettings.ambientIntensity;
        document.getElementById('ambient-intensity-value').textContent = lightingSettings.ambientIntensity.toFixed(1);
        document.getElementById('directional1-intensity').value = lightingSettings.directional1Intensity;
        document.getElementById('directional1-intensity-value').textContent = lightingSettings.directional1Intensity.toFixed(1);
        document.getElementById('directional2-intensity').value = lightingSettings.directional2Intensity;
        document.getElementById('directional2-intensity-value').textContent = lightingSettings.directional2Intensity.toFixed(1);
        document.getElementById('ambient-color').value = lightingSettings.ambientColor;
        document.getElementById('directional1-color').value = lightingSettings.directional1Color;
        document.getElementById('directional2-color').value = lightingSettings.directional2Color;

        // Mettre à jour les raccourcis clavier
        const keyBindings = this.keyboardControls.getAllKeyBindings();
        const keyMap = {
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'ArrowLeft': '←',
            'ArrowRight': '→'
        };

        Object.keys(keyBindings).forEach(action => {
            const button = document.getElementById(`key-${action}`);
            if (button) {
                const keys = keyBindings[action];
                button.textContent = keys.map(k => keyMap[k] || k.toUpperCase()).join(' / ');
            }
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('settings-panel');
        if (this.isOpen) {
            panel.classList.add('open');
        } else {
            panel.classList.remove('open');
        }
    }

    close() {
        this.isOpen = false;
        document.getElementById('settings-panel').classList.remove('open');
    }
}

