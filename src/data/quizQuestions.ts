export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Which of the following describes the correct order of the initial phases of a penetration test using Metasploit?",
    options: [
      "Exploitation -> Post-Exploitation -> Reconnaissance -> Reporting",
      "Reconnaissance -> Vulnerability Discovery -> Exploit Selection -> Exploitation",
      "Session Creation -> Payload Selection -> Privilege Escalation -> Reporting",
      "Vulnerability Discovery -> Reporting -> Exploit Selection -> Exploitation"
    ],
    correctIndex: 1,
    explanation: "A standard penetration testing lifecycle always begins with Reconnaissance (information gathering), followed by Vulnerability Discovery (identifying weaknesses), Exploit Selection (choosing the right tool to target the weakness), and finally Exploitation."
  },
  {
    id: 2,
    question: "In the Metasploit Console (msfconsole), what command is used to select an exploit module to work with?",
    options: [
      "select <exploit_path>",
      "load <exploit_path>",
      "use <exploit_path>",
      "run <exploit_path>"
    ],
    correctIndex: 2,
    explanation: "The 'use' command is standard in msfconsole to set the context to a specific exploit, auxiliary, or post-exploitation module. For example: 'use exploit/windows/smb/ms17_010_eternalblue'."
  },
  {
    id: 3,
    question: "What is the difference between an 'Exploit' and a 'Payload' in Metasploit terminology?",
    options: [
      "An exploit runs on the attacker's machine, while a payload runs on the firewall.",
      "An exploit is the vulnerability, while a payload is the mitigation script.",
      "An exploit takes advantage of a vulnerability to gain access, while a payload is the code that runs on the target after access is achieved (e.g., Meterpreter).",
      "There is no difference; they are interchangeable terms."
    ],
    correctIndex: 2,
    explanation: "An exploit is the vehicle/method used to leverage a vulnerability to bypass security. A payload is the actual code executed on the target system after the exploit succeeds, which provides the attacker with control (like a shell or meterpreter session)."
  },
  {
    id: 4,
    question: "You want to check what options (like target IP, local port, etc.) need to be configured for a selected Metasploit module. Which command do you run?",
    options: [
      "show options",
      "list variables",
      "get options",
      "show parameters"
    ],
    correctIndex: 0,
    explanation: "The 'show options' command displays all the required and optional parameters for the current module context, indicating their current values and whether they are required for execution."
  },
  {
    id: 5,
    question: "What does the command 'set RHOSTS 192.168.1.50' do in Metasploit?",
    options: [
      "Sets the local attacker IP address to 192.168.1.50.",
      "Sets the remote target host's IP address (or range) to 192.168.1.50.",
      "Launches the exploit against the target IP 192.168.1.50.",
      "Sets the router gateway address for the simulator."
    ],
    correctIndex: 1,
    explanation: "RHOSTS stands for 'Remote Hosts'. Setting RHOSTS configures the target machine's IP address or subnet that Metasploit will scan or exploit."
  },
  {
    id: 6,
    question: "What is 'Meterpreter' in Metasploit?",
    options: [
      "A network sniffing tool that measures bandwidth.",
      "An advanced, dynamic payload that runs in-memory on the victim, providing a rich command shell and post-exploitation tools.",
      "A firewall evasion script that masquerades packets.",
      "The logging dashboard used by incident responders."
    ],
    correctIndex: 1,
    explanation: "Meterpreter is Metasploit's signature payload. It is loaded entirely in the target's memory (RAM) to avoid detection on the disk, and it allows attackers to run a variety of commands like viewing system info, listing processes, and executing post-exploitation tasks."
  },
  {
    id: 7,
    question: "If an incident responder notices an outbound connection from an internal database server to an external IP on port 4444, what might this indicate?",
    options: [
      "A standard database software update.",
      "A DNS zone transfer attempt.",
      "A reverse shell session (such as Metasploit's default LPORT 4444 connection) establishing control.",
      "A normal web browser session using HTTPS."
    ],
    correctIndex: 2,
    explanation: "Port 4444 is the default local port (LPORT) used by Metasploit payloads. Outbound traffic to an external IP on port 4444, especially from critical internal servers, strongly suggests an active reverse shell/Meterpreter session."
  },
  {
    id: 8,
    question: "Which of the following is a primary mitigation for the MS17-010 (EternalBlue) vulnerability?",
    options: [
      "Disable the HTTP service.",
      "Apply the Microsoft MS17-010 security patch and disable SMBv1.",
      "Reset all user passwords in Active Directory.",
      "Uninstall Java from the target computer."
    ],
    correctIndex: 1,
    explanation: "EternalBlue exploits a flaw in Microsoft's SMBv1 implementation. Applying the MS17-010 security patch and disabling the outdated SMBv1 protocol are the direct and most effective mitigations."
  },
  {
    id: 9,
    question: "How can defenders detect a JNDI injection attack like Log4Shell (CVE-2021-44228) before it reaches the backend server?",
    options: [
      "By blocking all TCP port 80 traffic.",
      "By inspecting incoming HTTP request headers and payloads for strings matching patterns like '${jndi:ldap://' using an IDS/IPS or WAF.",
      "By disabling antivirus on the server.",
      "By enforcing HTTPS on all web applications."
    ],
    correctIndex: 1,
    explanation: "Log4Shell attacks require sending lookup strings (e.g., '${jndi:') to the application. Web Application Firewalls (WAF) or Intrusion Detection Systems (IDS) can be configured with signatures to detect and block these string patterns in HTTP requests."
  },
  {
    id: 10,
    question: "What is 'Privilege Escalation' in an attack lifecycle?",
    options: [
      "The process of deleting log files to hide logs.",
      "The act of moving from one system to another on the same network.",
      "The process of upgrading access from a low-privilege user account (e.g., guest) to a higher privilege level (e.g., root or SYSTEM).",
      "Writing the final penetration test report for the client."
    ],
    correctIndex: 2,
    explanation: "Privilege Escalation involves taking advantage of operating system bugs, misconfigurations, or password files to upgrade an attacker's session permissions from a limited account to administrative or root system access."
  }
];
