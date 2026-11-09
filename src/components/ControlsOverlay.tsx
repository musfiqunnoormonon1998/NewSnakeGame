import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Direction } from '../types';

interface ControlsOverlayProps {
  direction: Direction;
  onDirectionChange: (dir: Direction) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  gameOver: boolean;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  direction,
  onDirectionChange,
  isPaused,
  onTogglePause,
  onRestart,
  gameOver,
}) => {
  return (
    <div className="flex flex-col items-center w-full space-y-4">
      {/* Quick Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          id="pause-resume-btn"
          onClick={onTogglePause}
          disabled={gameOver}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs sm:text-sm font-semibold transition border border-slate-700 shadow-md"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Pause</span>
            </>
          )}
        </button>

        <button
          id="restart-game-btn"
          onClick={onRestart}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-emerald-900/30"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Game</span>
        </button>
      </div>

      {/* On-Screen D-Pad Controls for Mobile & Touch Devices */}
      <div className="flex flex-col items-center p-3 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl w-full max-w-xs">
        <span className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
          Onscreen D-Pad Controls
        </span>
        <div className="grid grid-cols-3 gap-2 w-36 h-36">
          <div />
          <button
            id="dpad-up-btn"
            onClick={() => onDirectionChange('up')}
            disabled={direction === 'down' || gameOver}
            className={`flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 transition p-3 shadow border border-slate-700 ${
              direction === 'up' ? 'ring-2 ring-emerald-500 bg-emerald-950/60' : ''
            }`}
            aria-label="Up"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <div />

          <button
            id="dpad-left-btn"
            onClick={() => onDirectionChange('left')}
            disabled={direction === 'right' || gameOver}
            className={`flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 transition p-3 shadow border border-slate-700 ${
              direction === 'left' ? 'ring-2 ring-emerald-500 bg-emerald-950/60' : ''
            }`}
            aria-label="Left"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            id="dpad-center-reset-btn"
            onClick={onRestart}
            className="flex items-center justify-center rounded-xl bg-slate-950 text-slate-400 hover:text-emerald-400 transition p-3 border border-slate-800 text-xs font-mono"
            title="Reset"
          >
            R
          </button>

          <button
            id="dpad-right-btn"
            onClick={() => onDirectionChange('right')}
            disabled={direction === 'left' || gameOver}
            className={`flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 transition p-3 shadow border border-slate-700 ${
              direction === 'right' ? 'ring-2 ring-emerald-500 bg-emerald-950/60' : ''
            }`}
            aria-label="Right"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          <div />
          <button
            id="dpad-down-btn"
            onClick={() => onDirectionChange('down')}
            disabled={direction === 'up' || gameOver}
            className={`flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-slate-200 transition p-3 shadow border border-slate-700 ${
              direction === 'down' ? 'ring-2 ring-emerald-500 bg-emerald-950/60' : ''
            }`}
            aria-label="Down"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <div />
        </div>
      </div>
    </div>
  );
};
