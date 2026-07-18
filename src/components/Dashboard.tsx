import React from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { NetworkTopology } from './NetworkTopology';
import { Shield, BookOpen, Terminal, CheckSquare, Award, Play } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const Dashboard: React.FC = () => {
  const { 
    completedExploits, 
    studiedVulnerabilities, 
    completedStages, 
    quizHighScore,
    setActiveTab 
  } = useSimulator();

  // Simulated metrics
  const totalExploits = 5;
  const totalStages = 9;
  const totalVulnerabilities = 5;

  const cards = [
    {
      title: 'Exploits Executed',
      value: `${completedExploits.length} / ${totalExploits}`,
      percent: Math.round((completedExploits.length / totalExploits) * 100),
      icon: <Terminal className="h-6 w-6 text-emerald-400" />,
      color: 'border-l-4 border-emerald-500'
    },
    {
      title: 'Vulnerabilities Studied',
      value: `${studiedVulnerabilities.length} / ${totalVulnerabilities}`,
      percent: Math.round((studiedVulnerabilities.length / totalVulnerabilities) * 100),
      icon: <BookOpen className="h-6 w-6 text-cyan-400" />,
      color: 'border-l-4 border-cyan-500'
    },
    {
      title: 'Attack Stages Mastered',
      value: `${completedStages.length} / ${totalStages}`,
      percent: Math.round((completedStages.length / totalStages) * 100),
      icon: <Shield className="h-6 w-6 text-purple-400" />,
      color: 'border-l-4 border-purple-500'
    },
    {
      title: 'Quiz Performance',
      value: `${quizHighScore}0%`,
      percent: quizHighScore * 10,
      icon: <Award className="h-6 w-6 text-amber-400" />,
      color: 'border-l-4 border-amber-500'
    }
  ];

  // Recharts skill profile chart data
  const chartData = [
    { subject: 'Reconnaissance', A: completedStages.includes(0) ? 100 : 20, fullMark: 100 },
    { subject: 'Discovery', A: completedStages.includes(1) ? 100 : 20, fullMark: 100 },
    { subject: 'Exploitation', A: completedStages.includes(4) ? 100 : 20, fullMark: 100 },
    { subject: 'Priv Esc', A: completedStages.includes(6) ? 100 : 20, fullMark: 100 },
    { subject: 'Post Exploit', A: completedStages.includes(7) ? 100 : 20, fullMark: 100 },
    { subject: 'Mitigations', A: studiedVulnerabilities.length >= 3 ? 100 : studiedVulnerabilities.length * 20 + 20, fullMark: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-mono font-bold text-white tracking-wider">
            SYSTEM STATUS: <span className="text-emerald-400">READY</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Welcome to the Metasploit Attack Simulator. Navigate the sidebar modules or start by scanning targets on the network mapping system below.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('console')}
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Play className="h-4 w-4 fill-slate-950" /> LAUNCH CONSOLE
        </button>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`glass-panel rounded-xl p-4 flex items-center justify-between ${c.color}`}>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-mono font-medium block">{c.title}</span>
              <span className="text-xl font-bold font-mono text-slate-200">{c.value}</span>
              
              {/* Mini progress bar */}
              <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${Math.max(c.percent, 5)}%`, backgroundColor: c.percent > 0 ? undefined : '#475569' }}
                ></div>
              </div>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Network Topology + Radar Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <NetworkTopology />
        </div>

        {/* Radar Skill Profile Chart */}
        <div className="glass-panel rounded-xl p-6 border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-mono text-emerald-400 mb-2 flex items-center gap-2">
              <CheckSquare className="h-5 w-5" /> CAPABILITY RADAR
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mb-4 leading-relaxed">
              Completing simulated console exploits, studying remediation databases, and finishing attack phases improves your cyber capability profile.
            </p>
          </div>
          
          <div className="h-[220px] w-full flex items-center justify-center font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={false} />
                <Radar
                  name="Attacker Competency"
                  dataKey="A"
                  stroke="#00ff66"
                  fill="#00ff66"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] bg-slate-950/60 border border-slate-800 p-3 rounded-lg font-mono">
            <span className="text-slate-400 block font-bold mb-0.5">Recommended Next Step:</span>
            <button
              onClick={() => {
                if (completedExploits.length === 0) setActiveTab('console');
                else if (studiedVulnerabilities.length < 3) setActiveTab('library');
                else setActiveTab('quiz');
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1 cursor-pointer mt-1"
            >
              {completedExploits.length === 0 
                ? 'Launch msfconsole terminal →' 
                : studiedVulnerabilities.length < 3 
                  ? 'Study remediations library →' 
                  : 'Take the cybersecurity quiz →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
