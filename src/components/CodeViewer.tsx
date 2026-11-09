import React, { useState } from 'react';
import { Copy, Check, Download, Code2, Terminal, ExternalLink } from 'lucide-react';
import { GameSettings } from '../types';
import { generatePythonSnakeCode } from '../utils/defaultPythonCode';

interface CodeViewerProps {
  settings: GameSettings;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ settings }) => {
  const [copied, setCopied] = useState(false);
  const code = generatePythonSnakeCode(settings);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'snake_game.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span className="font-mono text-sm font-semibold text-slate-200">
            snake_game.py
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            Python 3 + Turtle Module
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="copy-python-code-btn"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            id="download-python-code-btn"
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-lg shadow-emerald-900/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py File</span>
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="relative flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed selection:bg-emerald-500 selection:text-slate-950">
        <pre className="overflow-x-auto">
          <code>
            {code.split('\n').map((line, idx) => {
              // Basic python token highlight styling
              let colorClass = 'text-slate-300';
              if (line.trim().startsWith('#')) {
                colorClass = 'text-slate-500 italic';
              } else if (
                line.includes('def ') ||
                line.includes('while ') ||
                line.includes('if ') ||
                line.includes('else:') ||
                line.includes('import ') ||
                line.includes('global ')
              ) {
                colorClass = 'text-purple-400';
              } else if (line.includes('turtle.')) {
                colorClass = 'text-emerald-400 font-semibold';
              }

              return (
                <div key={idx} className="table-row">
                  <span className="table-cell pr-4 text-right select-none text-slate-600 font-mono text-xs">
                    {idx + 1}
                  </span>
                  <span className={`table-cell whitespace-pre ${colorClass}`}>
                    {line}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-slate-500" />
          <span>Runs locally on Windows, macOS, or Linux via <code className="text-emerald-400 font-mono">python snake_game.py</code></span>
        </div>
      </div>
    </div>
  );
};
