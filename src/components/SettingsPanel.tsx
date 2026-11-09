import React from 'react';
import { GameSettings } from '../types';
import { Sliders, Volume2, VolumeX, ShieldAlert, Sparkles, Grid } from 'lucide-react';

interface SettingsPanelProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const headColors = [
    { name: 'Turtle Green', value: '#10b981' },
    { name: 'Cyan Neon', value: '#06b6d4' },
    { name: 'Amber Gold', value: '#f59e0b' },
    { name: 'Purple Ray', value: '#a855f7' },
    { name: 'Classic White', value: '#f8fafc' },
  ];

  const foodShapes = [
    { id: 'circle', label: 'Circle (Dot)' },
    { id: 'square', label: 'Square' },
    { id: 'triangle', label: 'Triangle' },
  ];

  return (
    <div className="flex flex-col space-y-5 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-slate-200">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <Sliders className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-base text-slate-100">
          Turtle Game Customizer & Parameters
        </h3>
      </div>

      {/* Speed Slider */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
          <span className="text-slate-300">Snake Movement Delay (Speed):</span>
          <span className="font-mono text-emerald-400 font-bold">
            {settings.initialSpeed} ms ({1000 / settings.initialSpeed} steps/sec)
          </span>
        </div>
        <input
          id="speed-slider-input"
          type="range"
          min="40"
          max="200"
          step="10"
          value={settings.initialSpeed}
          onChange={(e) =>
            onUpdateSettings({ initialSpeed: Number(e.target.value) })
          }
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>Fast (40ms)</span>
          <span>Normal (100ms)</span>
          <span>Slow (200ms)</span>
        </div>
      </div>

      {/* Head Color Picker */}
      <div className="flex flex-col space-y-2">
        <span className="text-xs sm:text-sm font-medium text-slate-300">
          Turtle Head Color:
        </span>
        <div className="flex flex-wrap gap-2">
          {headColors.map((color) => (
            <button
              key={color.value}
              onClick={() => onUpdateSettings({ headColor: color.value })}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                settings.headColor === color.value
                  ? 'border-emerald-400 bg-slate-800 text-white ring-2 ring-emerald-500/30'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full border border-slate-700"
                style={{ backgroundColor: color.value }}
              />
              <span>{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Food Shape & Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        <div className="flex flex-col space-y-2">
          <span className="text-xs sm:text-sm font-medium text-slate-300">
            Food Turtle Shape:
          </span>
          <div className="flex gap-1.5">
            {foodShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() =>
                  onUpdateSettings({
                    foodShape: shape.id as GameSettings['foodShape'],
                  })
                }
                className={`flex-1 py-1.5 px-2 text-xs rounded-lg border font-medium transition text-center ${
                  settings.foodShape === shape.id
                    ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <span className="text-xs sm:text-sm font-medium text-slate-300">
            Food Color:
          </span>
          <div className="flex gap-2">
            {[
              { label: 'Red', val: '#ef4444' },
              { label: 'Yellow', val: '#eab308' },
              { label: 'Pink', val: '#ec4899' },
              { label: 'Cyan', val: '#06b6d4' },
            ].map((c) => (
              <button
                key={c.val}
                onClick={() => onUpdateSettings({ foodColor: c.val })}
                className={`w-8 h-8 rounded-lg border transition flex items-center justify-center ${
                  settings.foodColor === c.val
                    ? 'border-white ring-2 ring-emerald-500'
                    : 'border-slate-800'
                }`}
                style={{ backgroundColor: c.val }}
                title={c.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
        <button
          onClick={() =>
            onUpdateSettings({ solidWalls: !settings.solidWalls })
          }
          className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition ${
            settings.solidWalls
              ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
              : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Border Wall:</span>
          </div>
          <span className="font-mono">{settings.solidWalls ? 'SOLID' : 'PASS-THROUGH'}</span>
        </button>

        <button
          onClick={() =>
            onUpdateSettings({ showGridLines: !settings.showGridLines })
          }
          className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition ${
            settings.showGridLines
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Grid className="w-4 h-4" />
            <span>Turtle Grid:</span>
          </div>
          <span className="font-mono">{settings.showGridLines ? 'ON' : 'OFF'}</span>
        </button>

        <button
          onClick={() =>
            onUpdateSettings({ soundEnabled: !settings.soundEnabled })
          }
          className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition ${
            settings.soundEnabled
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span>Sound Effects:</span>
          </div>
          <span className="font-mono">{settings.soundEnabled ? 'ON' : 'MUTED'}</span>
        </button>
      </div>
    </div>
  );
};
