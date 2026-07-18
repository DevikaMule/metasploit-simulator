import React from 'react';
import { useSimulator } from './context/SimulatorContext';
import { Dashboard } from './components/Dashboard';
import { AttackFlow } from './components/AttackFlow';
import { Terminal } from './components/Terminal';
import { ExploitLibrary } from './components/ExploitLibrary';
import { ExploitSimulator } from './components/ExploitSimulator';
import { DefenderMode } from './components/DefenderMode';
import { QuizModule } from './components/QuizModule';

import { 
  LayoutDashboard, 
  GitBranch, 
  Terminal as ConsoleIcon, 
  BookOpen, 
  Cpu, 
  ShieldCheck, 
  HelpCircle, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

const App: React.FC = () => {
  const { activeTab, setActiveTab, resetSimulator } = useSimulator();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'attackFlow', label: 'Attack Lifecycle', icon: <GitBranch className="h-4 w-4" /> },
    { id: 'console', label: 'msfconsole Console', icon: <ConsoleIcon className="h-4 w-4" /> },
    { id: 'visualSimulator', label: 'Exploitation Sim', icon: <Cpu className="h-4 w-4" /> },
    { id: 'library', label: 'Vulnerability Library', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'defenderMode', label: 'Defender Log SIEM', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'quiz', label: 'Quiz Module', icon: <HelpCircle className="h-4 w-4" /> },
  ] as const;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'attackFlow':
        return <AttackFlow />;
      case 'console':
        return <Terminal />;
      case 'visualSimulator':
        return <ExploitSimulator />;
      case 'library':
        return <ExploitLibrary />;
      case 'defenderMode':
        return <DefenderMode />;
      case 'quiz':
        return <QuizModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex flex-col antialiased">
      {/* Top Navigation / Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-lg text-emerald-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-md font-mono font-bold text-white tracking-widest uppercase">
                METASPLOIT ATTACK SIMULATOR
              </h1>
              <p className="text-[9px] text-emerald-400 font-mono tracking-wider">
                CYBERSECURITY TRAINING LAB // SAFE SANDBOX
              </p>
            </div>
          </div>

          <button
            onClick={resetSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 rounded-lg text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Reset training progress data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">RESET LAB</span>
          </button>
        </div>
      </header>

      {/* Main layout container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar Nav */}
        <aside className="md:w-64 shrink-0">
          <nav className="glass-panel rounded-xl p-3 border-slate-800 sticky top-22 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest px-3 mb-2 block">
              TRAINING MODULES
            </span>
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left font-mono text-xs px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className={`${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* View Content Area */}
        <main className="flex-1 min-w-0">
          {renderActiveTab()}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950/40 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-mono text-slate-600">
          <span>&copy; 2026 Metasploit Attack Simulator. Educational Cyber Defense Labs.</span>
          <span className="text-emerald-500/60">Warning: For educational purposes only. No real exploits are executed.</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
