import { BUBBLE_LAYOUT, MAX_BUBBLES } from '../config/gameConstants';
import { BUBBLE_SIZES } from '../config/bubbleSizes';

export const bubbleLayoutManager = {
  positions: [],
  occupiedPositions: new Set(),
  reservedPositions: new Set(),

  initializePositions({ minX, maxX, minY, maxY }) {
    this.positions = [];
    const spacing = 80; // Adjust based on your bubble size
    
    for (let y = minY; y <= maxY; y += spacing) {
      for (let x = minX; x <= maxX; x += spacing) {
        this.positions.push({
          x,
          y,
          occupied: false,
          reserved: false
        });
      }
    }
  },

  generatePositions() {
    const positions = [];
    const centerX = BUBBLE_LAYOUT.CENTER.X;
    const centerY = BUBBLE_LAYOUT.CENTER.Y;
    const maxBubbleSize = Math.max(...Object.values(BUBBLE_SIZES).map(size => size.width));
    const spacing = maxBubbleSize + 20;
    
    // Create a grid of possible positions with some randomization
    const gridSize = 7; // 7x7 grid
    const totalWidth = spacing * (gridSize - 1);
    const totalHeight = spacing * (gridSize - 1);
    const startX = centerX - totalWidth / 2;
    const startY = centerY - totalHeight / 2;

    // Generate more positions than needed to allow for randomization
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Add significant random offset but keep within bounds
        const randomOffsetX = (Math.random() - 0.5) * spacing * 0.8;
        const randomOffsetY = (Math.random() - 0.5) * spacing * 0.8;
        
        const x = startX + (spacing * i) + randomOffsetX;
        const y = startY + (spacing * j) + randomOffsetY;
        
        // Calculate distance from center
        const distanceFromCenter = Math.hypot(x - centerX, y - centerY);
        
        // Only add positions within a circular area
        if (distanceFromCenter < (gridSize * spacing) / 2) {
          positions.push({
            x,
            y,
            occupied: false,
            reserved: false,
            priority: Math.floor(distanceFromCenter / spacing)
          });
        }
      }
    }

    // Shuffle positions array
    return this.shuffleArray(positions);
  },

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  findNearestAvailablePosition() {
    const totalOccupied = this.occupiedPositions.size + this.reservedPositions.size;
    
    // Check against MAX_BUBBLES including reserved positions
    if (totalOccupied >= MAX_BUBBLES) {
      return null;
    }

    // Get available positions and shuffle them
    const availablePositions = this.shuffleArray(
      this.positions.filter(pos => !pos.occupied && !pos.reserved)
    );
    
    if (availablePositions.length === 0) return null;

    // Find positions with minimum neighbors from shuffled array
    const positionScores = availablePositions.map(pos => ({
      position: pos,
      score: this.countOccupiedNeighbors(pos) + (Math.random() * 0.5) // Add randomness to scoring
    }));

    // Get one of the top 3 positions randomly
    const sortedPositions = positionScores
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
    
    const bestPosition = sortedPositions[
      Math.floor(Math.random() * sortedPositions.length)
    ].position;

    // Reserve this position immediately
    bestPosition.reserved = true;
    this.reservedPositions.add(`${bestPosition.x},${bestPosition.y}`);

    return bestPosition;
  },

  occupyPosition(position) {
    const pos = this.positions.find(
      p => Math.abs(p.x - position.x) < 1 && Math.abs(p.y - position.y) < 1
    );
    if (pos) {
      pos.occupied = true;
      pos.reserved = false; // Clear reservation
      this.occupiedPositions.add(`${position.x},${position.y}`);
      this.reservedPositions.delete(`${position.x},${position.y}`);
    }
  },

  releasePosition(position) {
    const pos = this.positions.find(
      p => Math.abs(p.x - position.x) < 1 && Math.abs(p.y - position.y) < 1
    );
    if (pos) {
      pos.occupied = false;
      pos.reserved = false;
      this.occupiedPositions.delete(`${position.x},${position.y}`);
      this.reservedPositions.delete(`${position.x},${position.y}`);
    }
  },

  countOccupiedNeighbors(position) {
    const spacing = BUBBLE_LAYOUT.MIN_BUBBLE_SPACING;
    let count = 0;

    this.positions.forEach(pos => {
      if (pos.occupied || pos.reserved) {
        const distance = Math.hypot(pos.x - position.x, pos.y - position.y);
        if (distance < spacing * 1.5) {
          count++;
        }
      }
    });

    return count;
  }
}; 