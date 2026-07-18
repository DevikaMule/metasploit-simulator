import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { simulatedTargets } from '../data/commands';
import type { SimulatedTarget } from '../data/commands';
import { Shield, ShieldAlert, Monitor, Server, Terminal, Zap, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NetworkTopology: React.FC = () => {
  const { triggerExploitSimulation, completedExploits } = useSimulator();
  const [selectedTarget, setSelectedTarget] = useState<SimulatedTarget | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);

  // Position coordinates for SVGs
  const attackerNode = { x: 80, y: 150, label: 'Attacker Machine', ip: '192.168.1.10' };
  
  const targetNodes = [
    { id: 'eternalblue', x: 380, y: 50, color: 'text-blue-400', glow: 'border-glow-blue' },
    { id: 'log4shell', x: 380, y: 120, color: 'text-amber-400', glow: 'border-glow-amber' },
    { id: 'vsftpd_backdoor', x: 380, y: 190, color: 'text-red-400', glow: 'border-glow-red' },
    { id: 'ssh_bruteforce', x: 380, y: 260, color: 'text-purple-400', glow: 'border-glow-purple' }
  ];

  return (
    <div className="glass-panel rounded-xl p-6 border-slate-800 relative overflow-hidden">
      <div className="absolute top-2 right-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="text-xs text-slate-500 font-mono">SIMULATION LIVE</span>
      </div>

      <h3 className="text-lg font-mono text-emerald-400 mb-4 flex items-center gap-2">
        <Terminal className="h-5 w-5" /> NETWORK TOPOLOGY
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        {/* SVG Topography Map */}
        <div className="lg:col-span-3 flex justify-center bg-slate-950/70 rounded-xl p-4 border border-slate-800 relative min-h-[320px]">
          {/* Cyber Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,24,39,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,24,39,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40"></div>
          
          <svg className="w-full max-w-[480px] h-[300px]" viewBox="0 0 480 300">
            {/* Connection Links */}
            {simulatedTargets.map((target, idx) => {
              const nodeConfig = targetNodes.find(n => n.id === target.vulnerabilityId);
              if (!nodeConfig) return null;
              
              const isExploited = completedExploits.includes(target.vulnerabilityId);
              const isHovered = hoveredTarget === target.ip;
              
              return (
                <g key={target.ip}>
                  {/* Base path */}
                  <line
                    x1={attackerNode.x}
                    y1={attackerNode.y}
                    x2={nodeConfig.x}
                    y2={nodeConfig.y}
                    className={`stroke-2 transition-all ${
                      isExploited 
                        ? 'stroke-emerald-500/50' 
                        : isHovered
                          ? 'stroke-cyan-500/60'
                          : 'stroke-slate-800'
                    }`}
                  />
                  {/* Ping packet pulse */}
                  <motion.circle
                    r="4"
                    fill={isExploited ? '#00ff66' : '#00f0ff'}
                    initial={{ offset: 0 }}
                    animate={{
                      cx: [attackerNode.x, nodeConfig.x],
                      cy: [attackerNode.y, nodeConfig.y]
                    }}
                    transition={{
                      duration: 3 + idx,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </g>
              );
            })}

            {/* Attacker Node SVG representation */}
            <g transform={`translate(${attackerNode.x - 24}, ${attackerNode.y - 24})`}>
              <circle cx="24" cy="24" r="28" fill="rgba(15, 23, 42, 0.9)" stroke="#00f0ff" strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]" />
              <foreignObject x="12" y="12" width="24" height="24">
                <Laptop className="h-6 w-6 text-cyan-400" />
              </foreignObject>
              <text x="24" y="62" textAnchor="middle" fill="#00f0ff" className="text-[10px] font-mono font-bold">KALI-VM</text>
              <text x="24" y="74" textAnchor="middle" fill="#64748b" className="text-[9px] font-mono">192.168.1.10</text>
            </g>

            {/* Target Nodes */}
            {simulatedTargets.map((target) => {
              const nodeConfig = targetNodes.find(n => n.id === target.vulnerabilityId);
              if (!nodeConfig) return null;
              
              const isExploited = completedExploits.includes(target.vulnerabilityId);
              const isSelected = selectedTarget?.ip === target.ip;
              const isHovered = hoveredTarget === target.ip;
              
              const strokeColor = isExploited ? '#00ff66' : isSelected ? '#38bdf8' : '#334155';
              const shadowGlow = isExploited ? 'rgba(0, 255, 102, 0.4)' : isSelected ? 'rgba(56, 189, 248, 0.4)' : 'rgba(0, 0, 0, 0)';

              return (
                <g 
                  key={target.ip} 
                  transform={`translate(${nodeConfig.x - 20}, ${nodeConfig.y - 20})`}
                  className="cursor-pointer"
                  onClick={() => setSelectedTarget(target)}
                  onMouseEnter={() => setHoveredTarget(target.ip)}
                  onMouseLeave={() => setHoveredTarget(null)}
                >
                  {/* Ping/glow ring */}
                  <circle cx="20" cy="20" r="24" fill="rgba(15, 23, 42, 0.9)" stroke={strokeColor} strokeWidth={isHovered ? 3 : 2} style={{ filter: `drop-shadow(0 0 8px ${shadowGlow})` }} className="transition-all" />
                  
                  <foreignObject x="10" y="10" width="20" height="20">
                    {target.os.includes('Windows') ? (
                      <Monitor className={`h-5 w-5 ${isExploited ? 'text-emerald-400' : 'text-slate-400'}`} />
                    ) : (
                      <Server className={`h-5 w-5 ${isExploited ? 'text-emerald-400' : 'text-slate-400'}`} />
                    )}
                  </foreignObject>
                  
                  <text x="65" y="18" fill={isExploited ? '#10b981' : '#e2e8f0'} className="text-[10px] font-mono font-bold">{target.hostname}</text>
                  <text x="65" y="30" fill="#64748b" className="text-[9px] font-mono">{target.ip}</text>

                  {/* Status Indicator Badges */}
                  {isExploited && (
                    <g transform="translate(30, -5)">
                      <circle cx="6" cy="6" r="6" fill="#00ff66" />
                      <path d="M3.5 6l1.5 1.5 3.5-3.5" stroke="#000" strokeWidth="1.5" fill="none" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Target Profile Details Panel */}
        <div className="lg:col-span-2 min-h-[300px]">
          <AnimatePresence mode="wait">
            {selectedTarget ? (
              <motion.div
                key={selectedTarget.ip}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-between"
              >
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex-1">
                  <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="font-mono text-emerald-400 font-bold">{selectedTarget.hostname}</h4>
                      <p className="text-xs text-slate-500 font-mono">{selectedTarget.ip}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                      completedExploits.includes(selectedTarget.vulnerabilityId)
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {completedExploits.includes(selectedTarget.vulnerabilityId) ? 'EXPLOITED' : 'SECURE'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-mono block">OS Platform:</span>
                      <span className="text-slate-300 font-mono font-bold">{selectedTarget.os}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-mono block mb-1">Identified Services:</span>
                      <div className="space-y-1">
                        {selectedTarget.ports.map(p => (
                          <div key={p.port} className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded border border-slate-800/50 font-mono">
                            <span className="text-cyan-400">Port {p.port} ({p.service})</span>
                            <span className="text-slate-400 text-[10px] truncate max-w-[120px]">{p.version}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
                      <div className="flex gap-1.5 items-center text-[10px] font-bold text-amber-500 font-mono mb-1">
                        <ShieldAlert className="h-3.5 w-3.5" /> POTENTIAL EXPLOIT PATH:
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                        {selectedTarget.vulnerabilityId === 'eternalblue' && 'Vulnerable to MS17-010 SMB remote execution. Attacker can compromise using EternalBlue module.'}
                        {selectedTarget.vulnerabilityId === 'log4shell' && 'Log4j JNDI lookup vulnerability on port 8080. Attacker can inject lookup keys.'}
                        {selectedTarget.vulnerabilityId === 'vsftpd_backdoor' && 'Backdoored FTP version 2.3.4 detects smiley username syntax and yields shell.'}
                        {selectedTarget.vulnerabilityId === 'ssh_bruteforce' && 'SSH service configuration allows password bruteforce. Weak account admin/admin123 detected.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => triggerExploitSimulation(selectedTarget.vulnerabilityId, selectedTarget.ip)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-900 font-mono font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Zap className="h-4 w-4 fill-slate-900" />
                    SIMULATE ATTACK PIPELINE
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Shield className="h-10 w-10 text-slate-600 mb-2 animate-pulse" />
                <p className="text-xs font-mono">Select a target machine node in the topology layout to inspect host profile configurations and simulate exploit execution flows.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
