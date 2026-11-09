import React, { useEffect, useRef } from 'react';
import { GameSettings, Point, Direction } from '../types';

interface TurtleCanvasProps {
  settings: GameSettings;
  headPos: Point;
  segments: Point[];
  foodPos: Point;
  direction: Direction;
  score: number;
  highScore: number;
  gameOver: boolean;
  isPaused: boolean;
  onRestart: () => void;
  fps: number;
}

export const TurtleCanvas: React.FC<TurtleCanvasProps> = ({
  settings,
  headPos,
  segments,
  foodPos,
  direction,
  score,
  highScore,
  gameOver,
  isPaused,
  onRestart,
  fps,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const halfW = width / 2;
    const halfH = height / 2;

    // Helper: Convert Python Turtle Cartesian coords (0,0 center) to Canvas screen coords (0,0 top-left)
    const toCanvasX = (turtleX: number) => halfW + turtleX;
    const toCanvasY = (turtleY: number) => halfH - turtleY;

    // 1. Draw Background
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Optional Grid Lines (Classic Turtle Coordinate Mesh)
    if (settings.showGridLines) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = -halfW; x <= halfW; x += settings.gridSize) {
        const cx = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
      }
      // Horizontal lines
      for (let y = -halfH; y <= halfH; y += settings.gridSize) {
        const cy = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();
      }

      // Center Axis lines (X and Y axis in subtle cyan)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.beginPath();
      ctx.moveTo(halfW, 0);
      ctx.lineTo(halfW, height);
      ctx.moveTo(0, halfH);
      ctx.lineTo(width, halfH);
      ctx.stroke();
    }

    // 3. Draw Outer Border Wall (Turtle Screen Boundary)
    ctx.strokeStyle = settings.solidWalls ? '#ef4444' : '#10b981';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // 4. Draw Food (Turtle Food shape)
    const foodCX = toCanvasX(foodPos.x);
    const foodCY = toCanvasY(foodPos.y);
    const radius = settings.gridSize / 2 - 1;

    ctx.fillStyle = settings.foodColor;
    ctx.shadowColor = settings.foodColor;
    ctx.shadowBlur = 10;

    if (settings.foodShape === 'circle') {
      ctx.beginPath();
      ctx.arc(foodCX, foodCY, radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (settings.foodShape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(foodCX, foodCY - radius);
      ctx.lineTo(foodCX - radius, foodCY + radius);
      ctx.lineTo(foodCX + radius, foodCY + radius);
      ctx.closePath();
      ctx.fill();
    } else {
      // Square
      ctx.fillRect(
        foodCX - radius,
        foodCY - radius,
        settings.gridSize - 2,
        settings.gridSize - 2
      );
    }
    ctx.shadowBlur = 0; // Reset glow

    // 5. Draw Snake Segments (Turtle Stamp Segments)
    segments.forEach((seg, idx) => {
      const cx = toCanvasX(seg.x);
      const cy = toCanvasY(seg.y);
      const segSize = settings.gridSize - 2;

      // Color gradient or solid color
      ctx.fillStyle = settings.bodyColor;

      // Draw rounded rect for segment
      ctx.beginPath();
      ctx.roundRect(cx - segSize / 2, cy - segSize / 2, segSize, segSize, 4);
      ctx.fill();

      // Inner subtle detail
      if (idx % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(cx - segSize / 4, cy - segSize / 4, segSize / 2, segSize / 2);
      }
    });

    // 6. Draw Snake Head
    const headCX = toCanvasX(headPos.x);
    const headCY = toCanvasY(headPos.y);
    const headSize = settings.gridSize - 1;

    ctx.fillStyle = settings.headColor;
    ctx.shadowColor = settings.headColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.roundRect(
      headCX - headSize / 2,
      headCY - headSize / 2,
      headSize,
      headSize,
      6
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw eyes on the Turtle Snake Head based on direction
    ctx.fillStyle = '#ffffff';
    const eyeRadius = 3;
    let eye1X = headCX - 4;
    let eye1Y = headCY - 4;
    let eye2X = headCX + 4;
    let eye2Y = headCY - 4;

    if (direction === 'up') {
      eye1X = headCX - 4;
      eye1Y = headCY - 5;
      eye2X = headCX + 4;
      eye2Y = headCY - 5;
    } else if (direction === 'down') {
      eye1X = headCX - 4;
      eye1Y = headCY + 5;
      eye2X = headCX + 4;
      eye2Y = headCY + 5;
    } else if (direction === 'left') {
      eye1X = headCX - 5;
      eye1Y = headCY - 4;
      eye2X = headCX - 5;
      eye2Y = headCY + 4;
    } else if (direction === 'right') {
      eye1X = headCX + 5;
      eye1Y = headCY - 4;
      eye2X = headCX + 5;
      eye2Y = headCY + 4;
    }

    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, 1.5, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Draw Python Turtle Pen Header (Scoreboard)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `Score: ${score}   High Score: ${highScore}`,
      halfW,
      18
    );

    // Python Turtle status line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '11px "Courier New", Courier, monospace';
    ctx.fillText(
      `Python Turtle Screen: wn.setup(${width}, ${height})  head.direction = "${direction}"`,
      halfW,
      height - 18
    );

    // 8. Overlay: Game Over Screen
    if (gameOver) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ef4444';
      ctx.font = '900 36px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME OVER', halfW, halfH - 40);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`Final Score: ${score}`, halfW, halfH + 10);

      ctx.fillStyle = '#10b981';
      ctx.font = '14px monospace';
      ctx.fillText('pen.write("GAME OVER", align="center")', halfW, halfH + 45);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText('Press SPACE or TAP button below to Restart', halfW, halfH + 80);
    } else if (isPaused) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '900 32px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', halfW, halfH - 10);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px monospace';
      ctx.fillText('Press SPACE to Resume', halfW, halfH + 30);
    }
  }, [
    settings,
    headPos,
    segments,
    foodPos,
    direction,
    score,
    highScore,
    gameOver,
    isPaused,
    fps,
  ]);

  return (
    <div className="relative flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
      <canvas
        id="turtle-game-canvas"
        ref={canvasRef}
        width={settings.screenSize}
        height={settings.screenSize}
        onClick={() => {
          if (gameOver) onRestart();
        }}
        className="rounded-xl shadow-inner cursor-pointer max-w-full h-auto touch-none"
      />
    </div>
  );
};
