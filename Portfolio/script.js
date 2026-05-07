// Example JavaScript for additional interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Example: Add a smooth scroll effect to anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Example: Highlight active section in navigation based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.section');
        let currentActive = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 50;
            const sectionBottom = sectionTop + section.offsetHeight;
            const scrollPosition = window.scrollY;
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentActive = `#${section.id}`;
            }
        });

        // Add 'active' class to the corresponding navigation link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentActive) {
                link.classList.add('active');
            }
        });
    });
});
/* script.js
   - matrix background
   - terminal preview (hover)
   - terminal modal (click open)
   No eval, no external dependencies.
*/

(() => {
  /* --- Matrix Canvas --- */
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const chars = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789@#%&()*+-<>/\\[]{}';
  const fontSize = 14;
  const columns = Math.floor(w / fontSize);
  const drops = Array(columns).fill(0);

  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  }
  addEventListener('resize', resize);

  function drawMatrix() {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#00ff88';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillStyle = (Math.random() > 0.97) ? '#d4af37' : '#00ff88'; // occasional gold chars
      ctx.fillText(text, x, y);
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  /* --- Terminal simulation content --- */
  const previewLines = document.getElementById('preview-lines');
  const modalLines = document.getElementById('modal-lines');
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const demoCommands = [
  'whoami',
  'nmap -sV --top-ports 100 192.168.1.0/24',
  'wireshark -i eth0 -c 10 -w capture.pcap',
  'msfconsole -q -x "use exploit/multi/http/struts2_content_type_ognl; set RHOSTS 192.168.1.100; exploit"',
  'burp -proxy -listen 8080',
  'splunk search "index=firewall sourcetype=cisco_asa | stats count by action"',
  'grep -r "password" /var/log/auth.log | tail -n 10',
  'sudo lynis audit system --quick',
  'cat /etc/ssh/sshd_config | egrep -v "^#"',
  'nikto -h http://example.com',
  'echo "All checks complete."'
];

  /* Utility: typed output to an element (looping) */
  function startTyping(targetEl, speed = 18, pause = 900) {
    let cmdIndex = 0;
    let charIndex = 0;
    let lineBuf = '';
    let timer = null;

    function step() {
      const current = demoCommands[cmdIndex];
      if (charIndex <= current.length) {
        lineBuf = '> ' + current.slice(0, charIndex);
        targetEl.textContent = lineBuf + (charIndex % 2 === 0 ? ' ▌' : ' ');
        charIndex++;
        timer = setTimeout(step, speed);
      } else {
        // after finishing, simulate command output
        setTimeout(() => {
          const out = generateFakeOutput(current);
          targetEl.textContent += '\n' + out;
          // move to next command after pause
          setTimeout(() => {
            targetEl.textContent += '\n';
            cmdIndex = (cmdIndex + 1) % demoCommands.length;
            charIndex = 0;
            timer = setTimeout(step, speed);
          }, pause);
        }, 120);
      }
    }
    step();
    return () => clearTimeout(timer);
  }

   function generateFakeOutput(cmd) {
   // All outputs are predefined and safe; no user input processed.
   if (cmd.startsWith('whoami')) return 'ratnesh';
   if (cmd.startsWith('nmap')) return 'Starting Nmap 7.92 ( https://nmap.org ) at 2023-10-01 12:00 EDT\nPORT    STATE  SERVICE  VERSION\n22/tcp  open   ssh      OpenSSH 8.2p1\n80/tcp  open   http     Apache httpd 2.4.41\n443/tcp open   https    Apache httpd 2.4.41\nService detection performed. Please report any incorrect results at https://nmap.org/submit/ .\nNmap done: 1 IP address (1 host up) scanned in 2.34 seconds';
   if (cmd.includes('wireshark')) return 'Capturing on \'eth0\'\n10 packets captured\nFrame 1: 74 bytes on wire (592 bits), 74 bytes captured\nEthernet II, Src: 00:11:22:33:44:55, Dst: ff:ff:ff:ff:ff:ff\nInternet Protocol Version 4, Src: 192.168.1.1, Dst: 192.168.1.255\nUser Datagram Protocol, Src Port: 137, Dst Port: 137\nNetBIOS Name Service\nCapture complete.';
   if (cmd.includes('msfconsole')) return '[+] Started reverse TCP handler on 192.168.1.50:4444\n[*] 192.168.1.100:80 - Sending exploit...\n[*] Meterpreter session 1 opened (192.168.1.50:4444 -> 192.168.1.100:12345)\nMeterpreter > sysinfo\nComputer: TARGET-PC\nOS: Windows 10 Pro\nArchitecture: x64\nSystem Language: en_US\nDomain: WORKGROUP';
   if (cmd.includes('burp')) return 'Burp Suite Professional v2023.10.1\nProxy service started on 127.0.0.1:8080\n[INFO] Intercepting requests...\n[INFO] 5 requests intercepted in the last minute.';
   if (cmd.includes('splunk')) return 'index=firewall sourcetype=cisco_asa | stats count by action\n\naction  count\nallow   15234\nblock   567\n\nQuery executed in 0.45 seconds. 15,801 events returned.';
   if (cmd.includes('grep')) return 'Oct 1 12:05:43 server sshd[1234]: Failed password for invalid user admin from 192.168.1.100 port 22 ssh2\nOct 1 12:05:45 server sshd[1234]: Failed password for invalid user root from 192.168.1.100 port 22 ssh2\nOct 1 12:05:47 server sshd[1234]: Accepted password for ratnesh from 192.168.1.200 port 22 ssh2\n[WARNING] Multiple failed login attempts detected.';
   if (cmd.includes('lynis')) return '[LYNIS] Lynis 3.0.8\n[+] System tools: found\n[+] Plugins: enabled\n[-] Boot loader: GRUB not password protected\n[-] File permissions: world-writable files found\n[+] Malware scanners: none found\n[INFO] Quick scan completed: high-level issues: 3, medium: 5, low: 12';
   if (cmd.includes('sshd_config')) return 'PermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nChallengeResponseAuthentication no\nUsePAM yes\nX11Forwarding no\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server';
   if (cmd.includes('nikto')) return 'Nikto v2.1.6\n---------------------------------------------------------------------------\n+ Target IP:          192.168.1.100\n+ Target Hostname:    example.com\n+ Target Port:        80\n+ Start Time:         2023-10-01 12:00\n---------------------------------------------------------------------------\n+ Server: Apache/2.4.41 (Ubuntu)\n+ Retrieved x-powered-by header: PHP/7.4.3\n+ The anti-clickjacking X-Frame-Options header is not present.\n+ The X-XSS-Protection header is not defined.\n+ Uncommon header \'x-generator\' found, with contents: Drupal 7\n+ OSVDB-3092: /admin/: Admin login page/section found.\n+ 6544 items checked: 3 error(s) and 12 item(s) reported on remote host\n+ End Time:           2023-10-01 12:01 (1 second)\n---------------------------------------------------------------------------\n+ 1 host(s) tested';
   if (cmd.includes('echo')) return 'All checks complete. System secure.';
   return '[ERROR] Command not recognized. Type \'help\' for options.';
   }

  /* Start preview typing when visible -- controlled by hover handlers below */
  let previewStopper = null;
  let modalStopper = null;

  /* --- Hover preview & click-to-open logic --- */
  const trigger = document.getElementById('terminal-trigger');
  const preview = document.getElementById('terminal-preview');
  const modal = document.getElementById('terminal-modal');
  const closeBtn = document.getElementById('terminal-close');
  const clearBtn = document.getElementById('terminal-clear');
  const copyBtn = document.getElementById('terminal-copy');

  // position preview near the trigger
  function positionPreview() {
    const rect = trigger.getBoundingClientRect();
    const px = rect.left + (rect.width / 2) - (preview.offsetWidth / 2);
    const py = rect.bottom + 12;
    preview.style.left = Math.max(12, px) + 'px';
    preview.style.top = (py) + 'px';
  }
  // show preview on hover
  trigger.addEventListener('mouseenter', () => {
    preview.style.display = 'block';
    preview.setAttribute('aria-hidden', 'false');
    positionPreview();
    previewStopper = startTyping(previewLines, 20, 700);
  });
  trigger.addEventListener('mouseleave', () => {
    preview.style.display = 'none';
    preview.setAttribute('aria-hidden', 'true');
    previewLines.textContent = '';
    if (previewStopper) previewStopper();
    previewStopper = null;
  });

  // Keep preview positioned if window scroll/resize
  addEventListener('scroll', () => { if (preview.style.display === 'block') positionPreview(); }, { passive:true });
  addEventListener('resize', () => { if (preview.style.display === 'block') positionPreview(); });

  // open modal on click (keyboard accessible)
  function openModal() {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    // clear old
    modalLines.textContent = '';
    modalStopper = startTyping(modalLines, 18, 850);
    // focus the terminal body so keyboard users can scroll
    document.getElementById('terminal-body').focus();
  }
  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    modalLines.textContent = '';
    if (modalStopper) modalStopper();
    modalStopper = null;
  }

  trigger.addEventListener('click', openModal);
  trigger.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });

  closeBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter') closeModal(); });

  // Clear & Copy buttons
  clearBtn.addEventListener('click', () => { modalLines.textContent = ''; });
  copyBtn.addEventListener('click', () => {
    const txt = modalLines.textContent || '';
    if (!txt) return;
    navigator.clipboard?.writeText(txt).then(() => {
      copyBtn.textContent = 'Copied';
      setTimeout(() => copyBtn.textContent = 'Copy Log', 1200);
    }).catch(() => {
      // fallback copy - create temp textarea
      const ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); copyBtn.textContent = 'Copied'; } catch (e) { alert('Copy failed'); }
      ta.remove();
      setTimeout(() => copyBtn.textContent = 'Copy Log', 1200);
    });
  });

  // Close modal when clicking outside terminal window
  modal.addEventListener('click', (ev) => {
    if (ev.target === modal) closeModal();
  });

  // Escape key to close modal
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display === 'flex') closeModal(); });

  // keep preview at right size if fonts load
  addEventListener('load', positionPreview);
})();
