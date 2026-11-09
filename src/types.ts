export interface GameSettings {
  headColor: string;
  bodyColor: string;
  foodColor: string;
  foodShape: 'circle' | 'square' | 'triangle';
  backgroundColor: string;
  gridSize: number;
  initialSpeed: number; // delay in ms (e.g., 100ms)
  solidWalls: boolean;
  screenSize: number; // e.g. 600 (30x30 grid)
  showGridLines: boolean;
  soundEnabled: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right' | 'stop';

export interface GameStats {
  score: number;
  highScore: number;
  foodEaten: number;
  moves: number;
}

export type ActiveTab = 'game' | 'code' | 'controls' | 'cheatsheet';
