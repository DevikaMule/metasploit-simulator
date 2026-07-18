import React, { createContext, useContext, useState, useEffect } from 'react';
import { vulnerabilities } from '../data/vulnerabilities';
import { simulatedTargets } from '../data/commands';

export type TabType = 'dashboard' | 'attackFlow' | 'console' | 'library' | 'visualSimulator' | 'defenderMode' | 'quiz';

export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'banner';
}

export interface MeterpreterSession {
  id: number;
  targetIp: string;
  vulnerabilityId: string;
  os: string;
  type: string;
}

export interface SimulatorState {
  activeTab: TabType;
  completedStages: number[];
  completedExploits: string[];
  studiedVulnerabilities: string[];
  quizHighScore: number;
  terminalHistory: TerminalLine[];
  currentExploit: string | null;
  options: {
    RHOSTS: string;
    LHOST: string;
    LPORT: string;
    PAYLOAD: string;
  };
  activeSessionId: number | null;
  sessions: MeterpreterSession[];
  commandMode: 'msf' | 'meterpreter' | 'shell';
}

interface SimulatorContextProps extends SimulatorState {
  setActiveTab: (tab: TabType) => void;
  markStageComplete: (stageIndex: number) => void;
  markVulnerabilityStudied: (vulnId: string) => void;
  setQuizHighScore: (score: number) => void;
  executeTerminalCommand: (command: string) => void;
  clearTerminalHistory: () => void;
  resetSimulator: () => void;
  triggerExploitSimulation: (vulnId: string, targetIp: string) => void;
}

const defaultOptions = {
  RHOSTS: '',
  LHOST: '192.168.1.10',
  LPORT: '4444',
  PAYLOAD: 'windows/x64/meterpreter/reverse_tcp'
};

const initialBannerLines: TerminalLine[] = [
  { text: '      .:okOOOo:.', type: 'banner' },
  { text: '    .cOOOOOOOOOOo.', type: 'banner' },
  { text: '   :OOOOOOOOOOOOOO:', type: 'banner' },
  { text: '  :OOOOOOOOOOOOOOOO:', type: 'banner' },
  { text: '  kOOOOOOOOOOOOMMMMO', type: 'banner' },
  { text: '  kOOOOOOOOOOOOOMMMO  METASPLOIT ATTACK SIMULATOR', type: 'banner' },
  { text: '  :OOOOOOOOOOOOOOOO:  [Educational Edition - Safe Mode]', type: 'banner' },
  { text: '   :OOOOOOOOOOOOOO:', type: 'banner' },
  { text: '    .cOOOOOOOOOOo.', type: 'banner' },
  { text: '      .:okOOOo:.', type: 'banner' },
  { text: '', type: 'output' },
  { text: '       =[ metasploit v6.3.0-dev                          ]', type: 'output' },
  { text: '+ -- --=[ 2154 exploits - 1143 auxiliary - 396 post      ]', type: 'output' },
  { text: '+ -- --=[ 876 payloads - 45 encoders - 11 nops            ]', type: 'output' },
  { text: '+ -- --=[ 9 evasion                                      ]', type: 'output' },
  { text: '', type: 'output' },
  { text: 'Type "help" to see available command list.', type: 'system' },
  { text: 'Note: All execution in this terminal is simulated for safety.', type: 'system' },
  { text: '', type: 'output' }
];

const SimulatorContext = createContext<SimulatorContextProps | undefined>(undefined);

export const SimulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<TabType>('dashboard');
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [completedExploits, setCompletedExploits] = useState<string[]>([]);
  const [studiedVulnerabilities, setStudiedVulnerabilities] = useState<string[]>([]);
  const [quizHighScore, setQuizHighScoreState] = useState<number>(0);
  
  // Terminal States
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>(initialBannerLines);
  const [currentExploit, setCurrentExploit] = useState<string | null>(null);
  const [options, setOptions] = useState(defaultOptions);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<MeterpreterSession[]>([]);
  const [commandMode, setCommandMode] = useState<'msf' | 'meterpreter' | 'shell'>('msf');

  // Trigger metrics sync
  useEffect(() => {
    // Stage 0: Recon, Stage 1: Vuln discovery are completed if user has run commands
    if (completedExploits.length > 0 && !completedStages.includes(4)) {
      // Exploitation completed
      setCompletedStages(prev => [...Array.from(new Set([...prev, 0, 1, 2, 3, 4, 5]))]);
    }
  }, [completedExploits]);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
  };

  const markStageComplete = (stageIndex: number) => {
    if (!completedStages.includes(stageIndex)) {
      setCompletedStages(prev => [...prev, stageIndex].sort((a, b) => a - b));
    }
  };

  const markVulnerabilityStudied = (vulnId: string) => {
    if (!studiedVulnerabilities.includes(vulnId)) {
      setStudiedVulnerabilities(prev => [...prev, vulnId]);
    }
  };

  const setQuizHighScore = (score: number) => {
    if (score > quizHighScore) {
      setQuizHighScoreState(score);
    }
  };

  const clearTerminalHistory = () => {
    setTerminalHistory([{ text: 'Console cleared. Type "help" for info.', type: 'system' }]);
  };

  const resetSimulator = () => {
    setCompletedStages([]);
    setCompletedExploits([]);
    setStudiedVulnerabilities([]);
    setQuizHighScoreState(0);
    setTerminalHistory(initialBannerLines);
    setCurrentExploit(null);
    setOptions(defaultOptions);
    setActiveSessionId(null);
    setSessions([]);
    setCommandMode('msf');
    setActiveTabState('dashboard');
  };

  // Directly trigger an exploit execution from other parts of the app (e.g., visual simulator)
  const triggerExploitSimulation = (vulnId: string, targetIp: string) => {
    const vuln = vulnerabilities.find(v => v.id === vulnId);
    if (!vuln) return;

    // Transition state
    setCurrentExploit(vuln.metasploitPath);
    const payload = vuln.category === 'SMB' ? 'windows/x64/meterpreter/reverse_tcp' :
                    vuln.category === 'FTP' ? 'cmd/unix/interact' :
                    vuln.category === 'SSH' ? 'generic/shell_bind_tcp' :
                    'java/meterpreter/reverse_tcp';
                    
    setOptions({
      RHOSTS: targetIp,
      LHOST: '192.168.1.10',
      LPORT: '4444',
      PAYLOAD: payload
    });

    // Run custom sequence in terminal
    const simulatedLogs: TerminalLine[] = [
      { text: `use ${vuln.metasploitPath}`, type: 'input' },
      { text: `set RHOSTS ${targetIp}`, type: 'input' },
      { text: `set LHOST 192.168.1.10`, type: 'input' },
      { text: `exploit`, type: 'input' },
      { text: `[*] Exploit running against ${targetIp} on port ${vuln.port}...`, type: 'output' },
      { text: `[*] Connecting to vulnerable service...`, type: 'output' },
      { text: `[+] Connection established. Attempting to trigger vulnerability...`, type: 'output' },
      { text: `[*] Sending payload: ${payload}`, type: 'output' }
    ];

    setTimeout(() => {
      const sessionId = sessions.length + 1;
      const newSession: MeterpreterSession = {
        id: sessionId,
        targetIp,
        vulnerabilityId: vuln.id,
        os: simulatedTargets.find(t => t.ip === targetIp)?.os || 'Unknown OS',
        type: vuln.metasploitPath.includes('meterpreter') || payload.includes('meterpreter') ? 'meterpreter' : 'shell'
      };

      setSessions(prev => [...prev, newSession]);
      setCompletedExploits(prev => Array.from(new Set([...prev, vuln.id])));
      
      setTerminalHistory(prev => [
        ...prev,
        ...simulatedLogs,
        { text: `[+] Exploit completed successfully!`, type: 'success' },
        { text: `[+] ${newSession.type === 'meterpreter' ? 'Meterpreter' : 'Command'} session ${sessionId} opened (192.168.1.10:4444 -> ${targetIp}:${vuln.port})`, type: 'success' }
      ]);

      // Automatically transition to console tab
      setActiveTabState('console');
    }, 200);
  };

  // MSF Console Interpreter
  const handleMsfCommand = (cmd: string, args: string[]) => {
    const history: TerminalLine[] = [];

    switch (cmd) {
      case 'help':
      case '?':
        history.push(
          { text: 'Core Metasploit Commands (Simulated):', type: 'system' },
          { text: '  help                        Display help menu', type: 'output' },
          { text: '  search <keyword>            Search for vulnerabilities (e.g. smb, log4j, ftp, ssh)', type: 'output' },
          { text: '  use <exploit_path>          Select an exploit module (e.g. use exploit/windows/smb/ms17_010_eternalblue)', type: 'output' },
          { text: '  show options                Display configuration parameters for the current module', type: 'output' },
          { text: '  set <OPTION> <VALUE>        Set a configuration option (e.g. set RHOSTS 192.168.1.50)', type: 'output' },
          { text: '  exploit / run               Execute the selected exploit module', type: 'output' },
          { text: '  sessions                    List active sessions', type: 'output' },
          { text: '  sessions -i <id>            Interact with an active session', type: 'output' },
          { text: '  clear                       Clear console output history', type: 'output' },
          { text: '  exit                        Exit the framework context', type: 'output' },
          { text: '', type: 'output' }
        );
        break;

      case 'clear':
        clearTerminalHistory();
        return;

      case 'search':
        if (args.length === 0) {
          history.push({ text: 'Usage: search <keyword> (e.g., search smb, search log4j)', type: 'error' });
        } else {
          const keyword = args[0].toLowerCase();
          const matches = vulnerabilities.filter(v => 
            v.name.toLowerCase().includes(keyword) || 
            v.cve.toLowerCase().includes(keyword) ||
            v.category.toLowerCase().includes(keyword) ||
            v.metasploitPath.toLowerCase().includes(keyword)
          );

          if (matches.length === 0) {
            history.push({ text: `No matching modules found for keyword: ${keyword}`, type: 'error' });
          } else {
            history.push(
              { text: `Matching Modules (${matches.length}):`, type: 'system' },
              { text: `  #   Name                                                  Disclosure Date  Rank    Check  Description`, type: 'system' },
              { text: `  -   ----                                                  ---------------  ----    -----  -----------`, type: 'system' }
            );
            matches.forEach((m, idx) => {
              history.push({ text: `  ${idx}   ${m.metasploitPath.padEnd(54)} 2011-2021       excellent  Yes    Simulated ${m.name}`, type: 'output' });
            });
            history.push({ text: '', type: 'output' });
          }
        }
        break;

      case 'use':
        if (args.length === 0) {
          history.push({ text: 'Usage: use <exploit_path>', type: 'error' });
        } else {
          const path = args[0];
          const matchedVuln = vulnerabilities.find(v => v.metasploitPath === path);
          if (matchedVuln) {
            setCurrentExploit(path);
            // Auto configure default payload type based on exploit category
            const payload = matchedVuln.category === 'SMB' ? 'windows/x64/meterpreter/reverse_tcp' :
                            matchedVuln.category === 'FTP' ? 'cmd/unix/interact' :
                            matchedVuln.category === 'SSH' ? 'generic/shell_bind_tcp' :
                            'java/meterpreter/reverse_tcp';
            setOptions(prev => ({ ...prev, PAYLOAD: payload }));
            history.push({ text: `Using exploit module: ${path}`, type: 'success' });
          } else {
            history.push({ text: `[-] Unknown module path: ${path}. Try searching (e.g. "search smb")`, type: 'error' });
          }
        }
        break;

      case 'show':
        if (args.length > 0 && args[0] === 'options') {
          if (!currentExploit) {
            history.push({ text: '[-] No exploit module currently selected. Use "use <exploit>" first.', type: 'error' });
          } else {
            const matchedVuln = vulnerabilities.find(v => v.metasploitPath === currentExploit);
            history.push(
              { text: `Module options (${currentExploit}):`, type: 'system' },
              { text: `\n  Name     Current Setting  Required  Description`, type: 'system' },
              { text: `  ----     ---------------  --------  -----------`, type: 'system' },
              { text: `  RHOSTS   ${options.RHOSTS || 'not set'.padEnd(16)} yes       Target address (vulnerable host IP)`, type: 'output' },
              { text: `  RPORT    ${(matchedVuln?.port.toString() || 'not set').padEnd(16)} yes       Target port`, type: 'output' },
              { text: `  LHOST    ${options.LHOST.padEnd(16)} yes       Attacker listening address`, type: 'output' },
              { text: `  LPORT    ${options.LPORT.padEnd(16)} yes       Attacker listening port`, type: 'output' },
              { text: `\nPayload options (${options.PAYLOAD}):`, type: 'system' },
              { text: `  Name     Current Setting  Required  Description`, type: 'system' },
              { text: `  ----     ---------------  --------  -----------`, type: 'system' },
              { text: `  EXITFUNC thread           no        Exit technique (thread, process, none)`, type: 'output' },
              { text: '', type: 'output' }
            );
          }
        } else {
          history.push({ text: 'Usage: show options', type: 'error' });
        }
        break;

      case 'set':
        if (args.length < 2) {
          history.push({ text: 'Usage: set <OPTION> <VALUE> (e.g., set RHOSTS 192.168.1.50)', type: 'error' });
        } else {
          const optionName = args[0].toUpperCase();
          const optionValue = args[1];

          if (optionName === 'RHOSTS') {
            // Check if RHOSTS is one of our simulated targets
            const target = simulatedTargets.find(t => t.ip === optionValue);
            if (target) {
              setOptions(prev => ({ ...prev, RHOSTS: optionValue }));
              history.push({ text: `RHOSTS => ${optionValue}`, type: 'success' });
            } else {
              history.push(
                { text: `[-] Warning: ${optionValue} is not a registered simulated target.`, type: 'error' },
                { text: `Available target IPs for testing:`, type: 'system' },
                ...simulatedTargets.map(t => ({ text: `  - ${t.ip} (${t.hostname} - ${t.os})`, type: 'output' as const }))
              );
            }
          } else if (optionName === 'LHOST') {
            setOptions(prev => ({ ...prev, LHOST: optionValue }));
            history.push({ text: `LHOST => ${optionValue}`, type: 'success' });
          } else if (optionName === 'LPORT') {
            setOptions(prev => ({ ...prev, LPORT: optionValue }));
            history.push({ text: `LPORT => ${optionValue}`, type: 'success' });
          } else if (optionName === 'PAYLOAD') {
            setOptions(prev => ({ ...prev, PAYLOAD: optionValue }));
            history.push({ text: `PAYLOAD => ${optionValue}`, type: 'success' });
          } else {
            history.push({ text: `[-] Unknown configuration option: ${optionName}`, type: 'error' });
          }
        }
        break;

      case 'exploit':
      case 'run':
        if (!currentExploit) {
          history.push({ text: '[-] No exploit module selected. Use "use <exploit>" first.', type: 'error' });
        } else if (!options.RHOSTS) {
          history.push({ text: '[-] Error: RHOSTS option must be configured before exploiting.', type: 'error' });
        } else {
          const matchedVuln = vulnerabilities.find(v => v.metasploitPath === currentExploit);
          const target = simulatedTargets.find(t => t.ip === options.RHOSTS);

          if (!matchedVuln || !target) {
            history.push({ text: `[-] Target configurations mismatch. Ensure you are targeting the appropriate IP.`, type: 'error' });
          } else if (target.vulnerabilityId !== matchedVuln.id) {
            history.push(
              { text: `[*] Exploit running against ${options.RHOSTS} on port ${matchedVuln.port}...`, type: 'output' },
              { text: `[*] Connecting to service...`, type: 'output' },
              { text: `[-] Exploit failed: Service did not respond with expected vulnerable headers.`, type: 'error' },
              { text: `[!] Tip: Check that the selected exploit matches the vulnerability on host ${options.RHOSTS}.`, type: 'system' }
            );
          } else {
            // Success exploit sequence!
            history.push(
              { text: `[*] Exploit running against ${options.RHOSTS} on port ${matchedVuln.port}...`, type: 'output' },
              { text: `[*] Connecting to vulnerable service...`, type: 'output' },
              { text: `[+] Connection established. Triggering vulnerability ${matchedVuln.cve}...`, type: 'output' },
              { text: `[*] Sending stage (${(Math.floor(Math.random() * 100) + 100)} KB) to ${options.RHOSTS}...`, type: 'output' }
            );

            // Generate session in state
            const sessionId = sessions.length + 1;
            const newSession: MeterpreterSession = {
              id: sessionId,
              targetIp: target.ip,
              vulnerabilityId: matchedVuln.id,
              os: target.os,
              type: currentExploit.includes('meterpreter') || options.PAYLOAD.includes('meterpreter') ? 'meterpreter' : 'shell'
            };

            setTimeout(() => {
              setSessions(prev => [...prev, newSession]);
              setCompletedExploits(prev => Array.from(new Set([...prev, matchedVuln.id])));
              
              setTerminalHistory(prev => [
                ...prev,
                { text: `[+] Exploit completed successfully!`, type: 'success' },
                { text: `[+] ${newSession.type === 'meterpreter' ? 'Meterpreter' : 'Command'} session ${sessionId} opened (${options.LHOST}:${options.LPORT} -> ${target.ip}:${matchedVuln.port})`, type: 'success' },
                { text: `[*] Use "sessions -i ${sessionId}" to interact with the new session.`, type: 'system' }
              ]);
            }, 1000);
          }
        }
        break;

      case 'sessions':
        if (args.length === 0) {
          if (sessions.length === 0) {
            history.push({ text: 'No active sessions currently open.', type: 'output' });
          } else {
            history.push(
              { text: 'Active sessions:', type: 'system' },
              { text: '  Id  Type            Information                              Connection', type: 'system' },
              { text: '  --  ----            -----------                              ----------', type: 'system' },
              ...sessions.map(s => ({
                text: `  ${s.id}   ${s.type.padEnd(15)} ${s.os.padEnd(40)} ${options.LHOST}:4444 -> ${s.targetIp}`,
                type: 'output' as const
              }))
            );
          }
        } else if (args[0] === '-i') {
          if (args.length < 2) {
            history.push({ text: 'Usage: sessions -i <session_id>', type: 'error' });
          } else {
            const sid = parseInt(args[1]);
            const targetSession = sessions.find(s => s.id === sid);
            if (targetSession) {
              setActiveSessionId(sid);
              setCommandMode(targetSession.type === 'meterpreter' ? 'meterpreter' : 'shell');
              history.push(
                { text: `[*] Starting interaction with session ${sid}...`, type: 'system' },
                { text: `Welcome to the simulated ${targetSession.type} shell on ${targetSession.targetIp}.`, type: 'success' },
                { text: `Type "help" to see available shell commands.`, type: 'success' }
              );
            } else {
              history.push({ text: `[-] Session ${sid} does not exist. Run "sessions" to list active sessions.`, type: 'error' });
            }
          }
        } else {
          history.push({ text: 'Usage: sessions OR sessions -i <session_id>', type: 'error' });
        }
        break;

      case 'exit':
        history.push({ text: 'Exiting Metasploit Simulator Console... Type "help" to restart.', type: 'system' });
        setCurrentExploit(null);
        break;

      default:
        history.push({ text: `[-] Unknown command: ${cmd}. Type "help" for a list of valid commands.`, type: 'error' });
    }

    setTerminalHistory(prev => [...prev, ...history]);
  };

  // Meterpreter Console Interpreter
  const handleMeterpreterCommand = (cmd: string, _args: string[]) => {
    const history: TerminalLine[] = [];
    const session = sessions.find(s => s.id === activeSessionId);
    
    if (!session) {
      setCommandMode('msf');
      setActiveSessionId(null);
      return;
    }

    const target = simulatedTargets.find(t => t.ip === session.targetIp);

    switch (cmd) {
      case 'help':
      case '?':
        history.push(
          { text: 'Meterpreter Commands (Simulated):', type: 'system' },
          { text: '  sysinfo          Get system details (OS, Architecture, Hostname)', type: 'output' },
          { text: '  getuid           Show user context running the shell', type: 'output' },
          { text: '  ps               List active processes running on target', type: 'output' },
          { text: '  hashdump         Dump administrative account password hashes (SAM database)', type: 'output' },
          { text: '  shell            Drop into target OS command shell (CMD / Bash)', type: 'output' },
          { text: '  exit             Close Meterpreter session and return to msfconsole', type: 'output' }
        );
        break;

      case 'sysinfo':
        history.push(
          { text: `Computer        : ${target?.hostname || 'Unknown'}`, type: 'output' },
          { text: `OS              : ${session.os}`, type: 'output' },
          { text: `Architecture    : x64`, type: 'output' },
          { text: `System Language : en_US`, type: 'output' },
          { text: `Meterpreter     : x64/windows`, type: 'output' }
        );
        // Completed privilege escalation or post-exploitation stage? Mark stage complete
        markStageComplete(7); // Post Exploitation stage
        break;

      case 'getuid':
        const uid = session.vulnerabilityId === 'eternalblue' ? 'NT AUTHORITY\\SYSTEM' :
                    session.vulnerabilityId === 'vsftpd_backdoor' ? 'root' :
                    'admin';
        history.push({ text: `Server username: ${uid}`, type: 'output' });
        if (uid === 'NT AUTHORITY\\SYSTEM' || uid === 'root') {
          markStageComplete(6); // Privilege Escalation stage
        }
        break;

      case 'ps':
        history.push(
          { text: `PID   PPID  Name                    Arch  Session  User                          Path`, type: 'system' },
          { text: `---   ----  ----                    ----  -------  ----                          ----`, type: 'system' },
          { text: `0     0     [System Process]`, type: 'output' },
          { text: `4     0     System                  x64   0        NT AUTHORITY\\SYSTEM`, type: 'output' },
          { text: `142   4     smss.exe                x64   0        NT AUTHORITY\\SYSTEM           C:\\Windows\\System32\\smss.exe`, type: 'output' },
          { text: `412   380   wininit.exe             x64   0        NT AUTHORITY\\SYSTEM           C:\\Windows\\System32\\wininit.exe`, type: 'output' },
          { text: `592   580   services.exe            x64   0        NT AUTHORITY\\SYSTEM           C:\\Windows\\System32\\services.exe`, type: 'output' },
          { text: `620   580   lsass.exe               x64   0        NT AUTHORITY\\SYSTEM           C:\\Windows\\System32\\lsass.exe`, type: 'output' },
          { text: `1024  592   svchost.exe             x64   0        NT AUTHORITY\\SYSTEM           C:\\Windows\\System32\\svchost.exe`, type: 'output' },
          { text: `2100  1024  explorer.exe            x64   1        ${target?.hostname}\\Administrator  C:\\Windows\\explorer.exe`, type: 'output' }
        );
        break;

      case 'hashdump':
        if (session.vulnerabilityId === 'eternalblue') {
          history.push(
            { text: `Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::`, type: 'output' },
            { text: `Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::`, type: 'output' },
            { text: `krbtgt:502:aad3b435b51404eeaad3b435b51404ee:d88924b17ed722d3b0ee6b44a4968434:::`, type: 'output' }
          );
        } else if (session.vulnerabilityId === 'vsftpd_backdoor') {
          history.push(
            { text: `root:$6$4b2H/Gls$z81d0fM2O9vU5oN4Y63g09H9e/Wq7oH9h0O98rT/Y71x0sO92V4v3eG88u7N0H:0:0:root:/root:/bin/bash`, type: 'output' },
            { text: `daemon:*:1:1:daemon:/usr/sbin:/bin/sh`, type: 'output' },
            { text: `ftp:*:105:111:ftp daemon:/srv/ftp:/bin/false`, type: 'output' }
          );
        } else {
          history.push({ text: `[-] Hashdump module failed: privilege level not high enough. Run 'getuid' to check context.`, type: 'error' });
        }
        break;

      case 'shell':
        setCommandMode('shell');

        history.push(
          { text: `[*] Spawning interactive OS shell...`, type: 'system' },
          { text: `Process 4528 spawned. Channel 1 created.`, type: 'output' },
          { text: `Microsoft Windows [Version 6.3.9600] (c) 2013 Microsoft Corporation. All rights reserved.`, type: 'output' },
          { text: '', type: 'output' }
        );
        break;

      case 'exit':
        setCommandMode('msf');
        setActiveSessionId(null);
        history.push({ text: `[*] Backgrounding session ${activeSessionId}...`, type: 'system' });
        break;

      default:
        history.push({ text: `[-] Unknown Meterpreter command: ${cmd}. Type "help" for valid options.`, type: 'error' });
    }

    setTerminalHistory(prev => [...prev, ...history]);
  };

  // OS Native Command Shell Interpreter (inside Meterpreter)
  const handleShellCommand = (cmd: string, args: string[]) => {
    const history: TerminalLine[] = [];
    const session = sessions.find(s => s.id === activeSessionId);
    
    if (!session) {
      setCommandMode('msf');
      setActiveSessionId(null);
      return;
    }

    const isWindows = session.os.toLowerCase().includes('windows');

    switch (cmd) {
      case 'help':
        if (isWindows) {
          history.push({ text: 'Available commands: whoami, ipconfig, dir, echo, ping, exit', type: 'output' });
        } else {
          history.push({ text: 'Available commands: whoami, ifconfig, ls, echo, ping, exit', type: 'output' });
        }
        break;

      case 'whoami':
        const username = session.vulnerabilityId === 'eternalblue' ? 'nt authority\\system' :
                         session.vulnerabilityId === 'vsftpd_backdoor' ? 'root' :
                         'admin';
        history.push({ text: username, type: 'output' });
        break;

      case 'ipconfig':
      case 'ifconfig':
        history.push(
          { text: `Ethernet adapter Local Area Connection:`, type: 'output' },
          { text: `   Connection-specific DNS Suffix  . : localdomain`, type: 'output' },
          { text: `   IPv4 Address. . . . . . . . . . . : ${session.targetIp}`, type: 'output' },
          { text: `   Subnet Mask . . . . . . . . . . . : 255.255.255.0`, type: 'output' },
          { text: `   Default Gateway . . . . . . . . . : 192.168.1.1`, type: 'output' }
        );
        break;

      case 'dir':
      case 'ls':
        if (isWindows) {
          history.push(
            { text: ` Directory of C:\\Windows\\system32`, type: 'system' },
            { text: `16-07-2026  13:52    <DIR>          .`, type: 'output' },
            { text: `16-07-2026  13:52    <DIR>          ..`, type: 'output' },
            { text: `10-04-2015  05:22             2,412 license.rtf`, type: 'output' },
            { text: `18-06-2026  10:14            45,628 cmd.exe`, type: 'output' },
            { text: `20-03-2026  14:35           140,820 lsass.exe`, type: 'output' },
            { text: `               3 File(s)        188,860 bytes`, type: 'output' }
          );
        } else {
          history.push(
            { text: `drwxr-xr-x  2 root root  4096 Jul 16 13:52 .`, type: 'output' },
            { text: `drwxr-xr-x 22 root root  4096 Jul 16 13:52 ..`, type: 'output' },
            { text: `-rw-r--r--  1 root root   220 May 15  2020 .bash_logout`, type: 'output' },
            { text: `-rw-r--r--  1 root root  3771 May 15  2020 .bashrc`, type: 'output' },
            { text: `-rw-r--r--  1 root root   807 May 15  2020 .profile`, type: 'output' }
          );
        }
        break;

      case 'ping':
        if (args.length === 0) {
          history.push({ text: 'Usage: ping <destination_ip>', type: 'error' });
        } else {
          history.push(
            { text: `Pinging ${args[0]} with 32 bytes of data:`, type: 'output' },
            { text: `Reply from ${args[0]}: bytes=32 time<1ms TTL=64`, type: 'output' },
            { text: `Reply from ${args[0]}: bytes=32 time<1ms TTL=64`, type: 'output' },
            { text: `Ping statistics for ${args[0]}:`, type: 'output' },
            { text: `    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`, type: 'output' }
          );
        }
        break;

      case 'exit':
        setCommandMode('meterpreter');
        history.push({ text: `[*] Closing channel 1... Exiting OS command shell.`, type: 'system' });
        break;

      default:
        history.push({ text: `'${cmd}' is not recognized as an internal or external command, operable program or batch file. Type "help" for a list of commands.`, type: 'error' });
    }

    setTerminalHistory(prev => [...prev, ...history]);
  };

  const executeTerminalCommand = (rawCommand: string) => {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;

    // Log the input
    setTerminalHistory(prev => [...prev, { text: trimmed, type: 'input' }]);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (commandMode === 'msf') {
      handleMsfCommand(cmd, args);
    } else if (commandMode === 'meterpreter') {
      handleMeterpreterCommand(cmd, args);
    } else if (commandMode === 'shell') {
      handleShellCommand(cmd, args);
    }
  };

  return (
    <SimulatorContext.Provider
      value={{
        activeTab,
        completedStages,
        completedExploits,
        studiedVulnerabilities,
        quizHighScore,
        terminalHistory,
        currentExploit,
        options,
        activeSessionId,
        sessions,
        commandMode,
        setActiveTab,
        markStageComplete,
        markVulnerabilityStudied,
        setQuizHighScore,
        executeTerminalCommand,
        clearTerminalHistory,
        resetSimulator,
        triggerExploitSimulation
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
};
