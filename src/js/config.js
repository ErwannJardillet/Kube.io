// Configuration globale de l'application
export const CONFIG = {
    GRID_SIZE: 20,
    BLOCK_SIZE: 1,
    CAMERA: {
        FOV: 75,
        NEAR: 0.1,
        FAR: 1000,
        INITIAL_POSITION: { x: 15, y: 15, z: 15 },
        MIN_RADIUS: 5,
        MAX_RADIUS: 50
    },
    COLORS: {
        BACKGROUND: 0x1a1a2e,
        GRID_MAIN: 0x444444,
        GRID_SECONDARY: 0x222222
    },
    CONTROLS: {
        MOVE_SPEED: 0.2,
        VERTICAL_SPEED: 0.1,
        ORBIT_SENSITIVITY: 0.01,
        ZOOM_SENSITIVITY: 0.01
    }
};

