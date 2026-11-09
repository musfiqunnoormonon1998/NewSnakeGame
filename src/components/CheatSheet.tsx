import React from 'react';
import { BookOpen, HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const CheatSheet: React.FC = () => {
  const commands = [
    {
      concept: 'Screen Initialization',
      python: 'wn = turtle.Screen()\nwn.bgcolor("black")\nwn.setup(600, 600)',
      explanation: 'Creates the main window canvas with background color and dimensions.',
    },
    {
      concept: 'Disabling Animation Lag',
      python: 'wn.tracer(0)\n# inside loop:\nwn.update()',
      explanation: 'Turns off automatic screen updates for instant, smooth rendering without flickering.',
    },
    {
      concept: 'Creating Turtle Objects',
      python: 'head = turtle.Turtle()\nhead.shape("square")\nhead.color("green")\nhead.penup()',
      explanation: 'Creates a graphic object. penup() prevents drawing trail lines on movement.',
    },
    {
      concept: 'Keyboard Event Bindings',
      python: 'wn.listen()\nwn.onkeypress(go_up, "Up")\nwn.onkeypress(go_left, "a")',
      explanation: 'Listens for keydown events and triggers custom Python handler functions.',
    },
    {
      concept: 'Distance & Collisions',
      python: 'if head.distance(food) < 20:\n    # Collided with food',
      explanation: 'Calculates Euclidean distance between two turtle objects on Cartesian plane.',
    },
    {
      concept: 'Writing Text / Scoreboard',
      python: 'pen.write("Score: 0", align="center", font=("Courier", 24, "bold"))',
      explanation: 'Uses a hidden pen turtle to render text and scores at top screen coordinates.',
    },
  ];

  return (
    <div className="flex flex-col space-y-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-slate-200">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <BookOpen className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-base text-slate-100">
          Python Turtle Graphics Cheat Sheet & Reference
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commands.map((cmd, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col space-y-2 hover:border-slate-700 transition"
          >
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4" />
              <span>{cmd.concept}</span>
            </div>
            <pre className="p-2.5 bg-slate-900/90 rounded-lg text-xs font-mono text-slate-200 border border-slate-800/60 overflow-x-auto selection:bg-emerald-500 selection:text-slate-950">
              <code>{cmd.python}</code>
            </pre>
            <p className="text-xs text-slate-400 leading-relaxed">
              {cmd.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
