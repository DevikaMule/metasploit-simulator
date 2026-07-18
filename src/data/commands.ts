export interface SimulatedTarget {
  ip: string;
  hostname: string;
  os: string;
  vulnerabilityId: string;
  ports: { port: number; service: string; version: string }[];
}

export const simulatedTargets: SimulatedTarget[] = [
  {
    ip: '192.168.1.50',
    hostname: 'WIN-DC-01',
    os: 'Windows Server 2012 R2',
    vulnerabilityId: 'eternalblue',
    ports: [
      { port: 135, service: 'msrpc', version: 'Microsoft Windows RPC' },
      { port: 139, service: 'netbios-ssn', version: 'Microsoft Windows netbios-ssn' },
      { port: 445, service: 'microsoft-ds', version: 'Windows Server 2008 R2 - 2012 Microsoft-DS' }
    ]
  },
  {
    ip: '192.168.1.80',
    hostname: 'web-prod-app',
    os: 'Ubuntu Server 20.04 LTS',
    vulnerabilityId: 'log4shell',
    ports: [
      { port: 80, service: 'http', version: 'Apache httpd 2.4.41' },
      { port: 8080, service: 'http', version: 'Apache Tomcat 9.0.37 (Log4j v2.14.1)' }
    ]
  },
  {
    ip: '192.168.1.110',
    hostname: 'ftp-backup-srv',
    os: 'Debian 6.0 (Squeeze)',
    vulnerabilityId: 'vsftpd_backdoor',
    ports: [
      { port: 21, service: 'ftp', version: 'vsftpd 2.3.4' }
    ]
  },
  {
    ip: '192.168.1.120',
    hostname: 'ssh-gateway',
    os: 'CentOS 7',
    vulnerabilityId: 'ssh_bruteforce',
    ports: [
      { port: 22, service: 'ssh', version: 'OpenSSH 7.4' }
    ]
  }
];

export interface CommandHelp {
  command: string;
  description: string;
  usage: string;
}

export const consoleCommandsHelp: CommandHelp[] = [
  {
    command: 'help',
    description: 'Displays a list of available commands and their descriptions.',
    usage: 'help'
  },
  {
    command: 'search',
    description: 'Searches for exploit or auxiliary modules in the Metasploit database.',
    usage: 'search <keyword>'
  },
  {
    command: 'use',
    description: 'Selects a module by its path to start configuring and running it.',
    usage: 'use <exploit/path/name>'
  },
  {
    command: 'show options',
    description: 'Displays current configurations and requirements for the selected module.',
    usage: 'show options'
  },
  {
    command: 'set',
    description: 'Sets a configuration option for the current module to a specific value.',
    usage: 'set <OPTION_NAME> <VALUE>'
  },
  {
    command: 'exploit / run',
    description: 'Launches the selected module against the configured RHOSTS.',
    usage: 'exploit'
  },
  {
    command: 'sessions',
    description: 'Lists active sessions or interacts with a specific opened session.',
    usage: 'sessions (lists) OR sessions -i <id> (interacts)'
  },
  {
    command: 'exit',
    description: 'Exits the current context (e.g. returns from Meterpreter to console, or exits console).',
    usage: 'exit'
  }
];

export const meterpreterCommandsHelp: CommandHelp[] = [
  {
    command: 'help',
    description: 'Displays Meterpreter commands.',
    usage: 'help'
  },
  {
    command: 'sysinfo',
    description: 'Retrieves system information of the target machine (OS, Computer Name, Architecture).',
    usage: 'sysinfo'
  },
  {
    command: 'getuid',
    description: 'Retrieves the user ID that the shell session is currently running under.',
    usage: 'getuid'
  },
  {
    command: 'ps',
    description: 'Lists all active processes running on the target machine.',
    usage: 'ps'
  },
  {
    command: 'hashdump',
    description: 'Attempts to dump database credentials/password hashes (SAM database on Windows, shadow file on Linux).',
    usage: 'hashdump'
  },
  {
    command: 'shell',
    description: 'Spawns an interactive system command shell (CMD or Bash) from the victim\'s OS.',
    usage: 'shell'
  },
  {
    command: 'exit',
    description: 'Closes the current Meterpreter session and returns to the msfconsole prompt.',
    usage: 'exit'
  }
];
