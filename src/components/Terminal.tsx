import React, { useState, useRef, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Terminal as TermIcon, Trash2, Command, CornerDownLeft } from 'lucide-react';

export const Terminal: React.FC = () => {
  const { 
    terminalHistory, 
    executeTerminalCommand, 
    clearTerminalHistory, 
    currentExploit, 
    commandMode,
    options
  } = useSimulator();

  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    executeTerminalCommand(inputVal);
    setInputVal('');
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Clickable command helper suggestions
  const msfPresets = [
    'help',
    'search smb',
    'use exploit/windows/smb/ms17_010_eternalblue',
    'show options',
    'set RHOSTS 192.168.1.50',
    'exploit',
    'sessions',
    'sessions -i 1'
  ];

  const meterpreterPresets = [
    'help',
    'sysinfo',
    'getuid',
    'ps',
    'hashdump',
    'shell',
    'exit'
  ];

  const shellPresets = [
    'help',
    'whoami',
    'ipconfig',
    'dir',
    'exit'
  ];

  // Get current active prompt prefix
  const getPrompt = () => {
    if (commandMode === 'msf') {
      if (currentExploit) {
        // Truncate path for beauty
        const shortName = currentExploit.replace('exploit/', '');
        return (
          <span className="font-mono text-xs">
            <span className="text-slate-200">msf6 </span>
            <span className="text-rose-500 font-bold">exploit({shortName})</span>
            <span className="text-slate-200"> &gt; </span>
          </span>
        );
      }
      return <span className="font-mono text-xs text-slate-200">msf6 &gt; </span>;
    } else if (commandMode === 'meterpreter') {
      return (
        <span className="font-mono text-xs">
          <span className="text-emerald-400 font-bold">meterpreter</span>
          <span className="text-slate-200"> &gt; </span>
        </span>
      );
    } else {
      // Shell mode
      const isWindows = options.RHOSTS === '192.168.1.50';
      return (
        <span className="font-mono text-xs text-amber-500">
          {isWindows ? 'C:\\Windows\\system32>' : 'root@target-host:~#'}
        </span>
      );
    }
  };

  const getLineClass = (type: string) => {
    switch (type) {
      case 'input': return 'text-slate-100 font-mono';
      case 'success': return 'text-emerald-400 font-mono font-medium';
      case 'error': return 'text-rose-500 font-mono';
      case 'system': return 'text-cyan-400 font-mono italic opacity-90';
      case 'banner': return 'text-emerald-500 font-mono whitespace-pre font-bold';
      default: return 'text-slate-400 font-mono';
    }
  };

  const handlePresetClick = (preset: string) => {
    executeTerminalCommand(preset);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Console Display */}
      <div className="xl:col-span-3 flex flex-col">
        <div className="bg-slate-900/80 border border-slate-800 rounded-t-xl px-4 py-2 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <TermIcon className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono text-slate-300 font-bold">msfconsole - Simulated Sandbox</span>
          </div>
          <button 
            onClick={clearTerminalHistory}
            className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer"
            title="Clear terminal history"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Terminal screen block */}
        <div 
          onClick={focusInput}
          className="relative bg-terminal-bg border-x border-b border-slate-800 h-[460px] overflow-y-auto p-4 flex flex-col justify-between crt-overlay cursor-text select-text"
        >
          {/* Scrollable contents */}
          <div className="space-y-1 pb-4">
            {terminalHistory.map((line, idx) => (
              <div key={idx} className="flex items-start text-xs leading-relaxed">
                {line.type === 'input' && (
                  <span className="text-slate-500 font-mono select-none mr-2">msf6 &gt;</span>
                )}
                <span className={getLineClass(line.type)}>{line.text}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Sticky Command Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center border-t border-slate-800/80 pt-3 mt-auto bg-terminal-bg sticky bottom-0">
            {getPrompt()}
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-xs font-mono text-slate-100 pl-1 caret-emerald-400"
              placeholder='Type a command or use presets...'
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <button type="submit" className="text-slate-500 hover:text-emerald-400 p-1 cursor-pointer">
              <CornerDownLeft className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Preset Command Deck / Cheat Sheet */}
      <div className="xl:col-span-1 glass-panel rounded-xl p-4 border-slate-800 flex flex-col justify-between h-[510px]">
        <div className="space-y-4 overflow-y-auto">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Command className="h-4 w-4" /> COMMAND CHEAT SHEET
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 leading-relaxed">
              Use these presets to simulate key steps of a Metasploit payload deployment lifecycle.
            </p>
          </div>

          {/* Preset Buttons matching CommandMode */}
          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block mb-1.5 uppercase font-bold text-[10px]">MSF Console Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {msfPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    className="text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-emerald-400 p-1.5 rounded transition-all cursor-pointer select-none"
                    disabled={commandMode !== 'msf'}
                    style={{ opacity: commandMode === 'msf' ? 1 : 0.4 }}
                  >
                    {preset.length > 28 ? preset.substring(0, 26) + '...' : preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1.5 uppercase font-bold text-[10px]">Meterpreter Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {meterpreterPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    className="text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-emerald-400 p-1.5 rounded transition-all cursor-pointer select-none"
                    disabled={commandMode !== 'meterpreter'}
                    style={{ opacity: commandMode === 'meterpreter' ? 1 : 0.4 }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1.5 uppercase font-bold text-[10px]">System Shell Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {shellPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    className="text-[10px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-amber-400 p-1.5 rounded transition-all cursor-pointer select-none"
                    disabled={commandMode !== 'shell'}
                    style={{ opacity: commandMode === 'shell' ? 1 : 0.4 }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-900/60 font-mono text-[10px] text-slate-500 leading-relaxed mt-4">
          <span className="text-emerald-500 font-bold block mb-1 border-b border-emerald-500/20 pb-0.5">Console Guidance:</span>
          1. Run <span className="text-slate-300">use exploit/...</span> to pick. <br />
          2. Use <span className="text-slate-300">set RHOSTS 192.168.1.50</span>. <br />
          3. Type <span className="text-slate-300">exploit</span>. <br />
          4. Type <span className="text-slate-300">sessions -i 1</span>.
        </div>
      </div>
    </div>
  );
};
