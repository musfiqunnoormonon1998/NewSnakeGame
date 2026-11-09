import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameSettings,
  Point,
  Direction,
  ActiveTab,
  GameStats,
} from './types';
import { TurtleCanvas } from './components/TurtleCanvas';
import { CodeViewer } from './components/CodeViewer';
import { ControlsOverlay } from './components/ControlsOverlay';
import { SettingsPanel } from './components/SettingsPanel';
import { CheatSheet } from './components/CheatSheet';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { sounds } from './utils/audio';
import {
  Gamepad2,
  Code2,
  Sliders,
  BookOpen,
  Trophy,
  RotateCcw,
  Sparkles,
  Volume2,
  Terminal,
} from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  headColor: '#10b981',
  bodyColor: '#059669',
  foodColor: '#ef4444',
  foodShape: 'circle',
  backgroundColor: '#020617',
  gridSize: 20,
  initialSpeed: 100, // 100ms interval
  solidWalls: true,
  screenSize: 500, // 500x500 canvas
  showGridLines: true,
  soundEnabled: true,
};

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('game');

  // Game Engine State
  const [headPos, setHeadPos] = useState<Point>({ x: 0, y: 0 });
  const [segments, setSegments] = useState<Point[]>([]);
  const [foodPos, setFoodPos] = useState<Point>({ x: 0, y: 100 });
  const [direction, setDirection] = useState<Direction>('stop');
  const nextDirectionRef = useRef<Direction>('stop');

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('python_turtle_snake_highscore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    foodEaten: 0,
    moves: 0,
  });

  // Save High Score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('python_turtle_snake_highscore', score.toString());
      if (settings.soundEnabled && score > 0) {
        sounds.playHighScoreSound();
      }
    }
  }, [score, highScore, settings.soundEnabled]);

  // Helper: Generate Random Grid Aligned Point
  const generateRandomFood = useCallback(
    (currentSegments: Point[], currentHead: Point): Point => {
      const boundary = settings.screenSize / 2 - 40;
      const steps = Math.floor(boundary / settings.gridSize);

      let newX = 0;
      let newY = 0;
      let valid = false;
      let attempts = 0;

      while (!valid && attempts < 100) {
        attempts++;
        newX =
          (Math.floor(Math.random() * (steps * 2 + 1)) - steps) *
          settings.gridSize;
        newY =
          (Math.floor(Math.random() * (steps * 2 + 1)) - steps) *
          settings.gridSize;

        const onHead = newX === currentHead.x && newY === currentHead.y;
        const onSegment = currentSegments.some(
          (s) => s.x === newX && s.y === newY
        );

        if (!onHead && !onSegment) {
          valid = true;
        }
      }

      return { x: newX, y: newY };
    },
    [settings.screenSize, settings.gridSize]
  );

  // Restart Game
  const restartGame = useCallback(() => {
    setHeadPos({ x: 0, y: 0 });
    setSegments([]);
    setDirection('stop');
    nextDirectionRef.current = 'stop';
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setFoodPos(generateRandomFood([], { x: 0, y: 0 }));
  }, [generateRandomFood]);

  // Direction Change Handler with opposite direction checks
  const handleDirectionChange = useCallback(
    (newDir: Direction) => {
      if (gameOver) return;

      const current = nextDirectionRef.current;
      if (newDir === 'up' && current !== 'down') {
        nextDirectionRef.current = 'up';
        setDirection('up');
      } else if (newDir === 'down' && current !== 'up') {
        nextDirectionRef.current = 'down';
        setDirection('down');
      } else if (newDir === 'left' && current !== 'right') {
        nextDirectionRef.current = 'left';
        setDirection('left');
      } else if (newDir === 'right' && current !== 'left') {
        nextDirectionRef.current = 'right';
        setDirection('right');
      }

      if (settings.soundEnabled && newDir !== 'stop') {
        sounds.playMoveSound();
      }
    },
    [gameOver, settings.soundEnabled]
  );

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrow keys or space
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        handleDirectionChange('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        handleDirectionChange('down');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleDirectionChange('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleDirectionChange('right');
      } else if (e.key === ' ') {
        if (gameOver) {
          restartGame();
        } else {
          setIsPaused((prev) => !prev);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        restartGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectionChange, gameOver, restartGame]);

  // Main Game Loop Engine
  useEffect(() => {
    if (gameOver || isPaused || direction === 'stop') return;

    const interval = setInterval(() => {
      setHeadPos((prevHead) => {
        let newX = prevHead.x;
        let newY = prevHead.y;
        const moveDist = settings.gridSize;
        const currentDir = nextDirectionRef.current;

        if (currentDir === 'up') newY += moveDist;
        if (currentDir === 'down') newY -= moveDist;
        if (currentDir === 'left') newX -= moveDist;
        if (currentDir === 'right') newX += moveDist;

        const limit = settings.screenSize / 2 - 10;

        // Wall Collision Check
        if (settings.solidWalls) {
          if (
            newX > limit ||
            newX < -limit ||
            newY > limit ||
            newY < -limit
          ) {
            setGameOver(true);
            if (settings.soundEnabled) sounds.playGameOverSound();
            return prevHead;
          }
        } else {
          // Wrap Around Boundaries
          if (newX > limit) newX = -limit;
          else if (newX < -limit) newX = limit;
          if (newY > limit) newY = -limit;
          else if (newY < -limit) newY = limit;
        }

        // Body Segment Collision Check
        const hitBody = segments.some(
          (seg) => seg.x === newX && seg.y === newY
        );
        if (hitBody) {
          setGameOver(true);
          if (settings.soundEnabled) sounds.playGameOverSound();
          return prevHead;
        }

        const newHeadPoint = { x: newX, y: newY };

        // Check Food Collision
        const ateFood =
          Math.abs(newX - foodPos.x) < settings.gridSize &&
          Math.abs(newY - foodPos.y) < settings.gridSize;

        if (ateFood) {
          if (settings.soundEnabled) sounds.playEatSound();
          setScore((s) => s + 10);
          setStats((st) => ({ ...st, foodEaten: st.foodEaten + 1 }));

          // Add body segment
          setSegments((prevSegs) => [prevHead, ...prevSegs]);

          // Spawn new food
          setFoodPos(generateRandomFood(segments, newHeadPoint));
        } else {
          // Advance body segments
          setSegments((prevSegs) => {
            if (prevSegs.length === 0) return [];
            return [prevHead, ...prevSegs.slice(0, prevSegs.length - 1)];
          });
        }

        setStats((st) => ({ ...st, moves: st.moves + 1 }));
        return newHeadPoint;
      });
    }, settings.initialSpeed);

    return () => clearInterval(interval);
  }, [
    direction,
    gameOver,
    isPaused,
    foodPos,
    segments,
    settings,
    generateRandomFood,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 shadow-lg shadow-emerald-900/40">
              <Terminal className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Python Turtle Snake Game
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  turtle.py
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Interactive Canvas Emulator & Clean Python Script Generator
              </p>
            </div>
          </div>

          {/* Right Header Actions: Install Button + Score Tracker */}
          <div className="flex items-center space-x-3">
            <PWAInstallButton />

            {/* Top Score Tracker */}
            <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-slate-400 uppercase">
                  Score:
                </span>
                <span className="text-base font-mono font-extrabold text-emerald-400">
                  {score}
                </span>
              </div>

              <div className="h-4 w-px bg-slate-800" />

              <div className="flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-slate-400 uppercase">
                  Best:
                </span>
                <span className="text-base font-mono font-extrabold text-amber-400">
                  {highScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Connectivity Banner */}
      <OfflineIndicator />

      {/* Navigation Tabs */}
      <nav className="bg-slate-900/60 border-b border-slate-800/80 px-4">
        <div className="max-w-6xl mx-auto flex overflow-x-auto space-x-2 py-2 no-scrollbar">
          <button
            id="tab-play-game-btn"
            onClick={() => setActiveTab('game')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'game'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play Canvas Game</span>
          </button>

          <button
            id="tab-python-code-btn"
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Python Code (.py)</span>
          </button>

          <button
            id="tab-settings-btn"
            onClick={() => setActiveTab('cheatsheet')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'cheatsheet'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Turtle Cheat Sheet</span>
          </button>
        </div>
      </nav>

      {/* Main Body Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tab Content: Play Game */}
        {activeTab === 'game' && (
          <>
            {/* Left Column: Canvas Screen */}
            <div className="lg:col-span-7 flex flex-col items-center justify-start space-y-4">
              <TurtleCanvas
                settings={settings}
                headPos={headPos}
                segments={segments}
                foodPos={foodPos}
                direction={direction}
                score={score}
                highScore={highScore}
                gameOver={gameOver}
                isPaused={isPaused}
                onRestart={restartGame}
                fps={Math.round(1000 / settings.initialSpeed)}
              />

              <ControlsOverlay
                direction={direction}
                onDirectionChange={handleDirectionChange}
                isPaused={isPaused}
                onTogglePause={() => setIsPaused((p) => !p)}
                onRestart={restartGame}
                gameOver={gameOver}
              />
            </div>

            {/* Right Column: Customizer & Quick Controls */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <SettingsPanel
                settings={settings}
                onUpdateSettings={(newSet) =>
                  setSettings((prev) => ({ ...prev, ...newSet }))
                }
              />

              {/* Instruction Card */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 space-y-2">
                <span className="font-semibold text-slate-200 block text-sm">
                  Keyboard Controls & Instructions
                </span>
                <ul className="list-disc list-inside space-y-1 font-mono text-slate-300">
                  <li>
                    <span className="text-emerald-400">Arrow Keys / WASD</span>: Move Turtle Head
                  </li>
                  <li>
                    <span className="text-emerald-400">Spacebar</span>: Pause / Resume / Restart
                  </li>
                  <li>
                    <span className="text-emerald-400">R</span>: Instant Game Reset
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Tab Content: Code Viewer */}
        {activeTab === 'code' && (
          <div className="lg:col-span-12">
            <CodeViewer settings={settings} />
          </div>
        )}

        {/* Tab Content: Cheat Sheet */}
        {activeTab === 'cheatsheet' && (
          <div className="lg:col-span-12">
            <CheatSheet />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        Built with React + TypeScript & Canvas Turtle Renderer • 100% Offline-Ready PWA • Compatible with Python 3.x <code className="text-emerald-400">import turtle</code>
      </footer>
    </div>
  );
}
