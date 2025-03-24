// Game constants
export const MAX_BUBBLES = 20;

// Bubble layout configuration
export const BUBBLE_LAYOUT = {
  // Center point of the game area
  CENTER: {
    X: window.innerWidth / 2,
    Y: window.innerHeight / 3,
  },
  
  // Minimum distance between bubbles (considering max bubble size)
  MIN_BUBBLE_SPACING: 85, // 70px (max bubble size) + 15px spacing
  
  // Maximum radius from center where bubbles can be placed
  MAX_RADIUS: 300,
  
  // Grid configuration for bubble placement
  GRID: {
    COLS: 5,
    ROWS: 4,
  }
};

// Combine bubble sizes and layout constants
export { BUBBLE_SIZES, INITIAL_BUBBLE_SIZE } from './bubbleSizes'; 