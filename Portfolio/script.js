/* script.js
   - Matrix background animation
   - Terminal hover preview
   - Terminal modal (click to open)
   No eval(), no external dependencies.
*/

(() => {
  'use strict';

  /* ── Year in footer ── */
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /* ── Matrix Canvas ── */
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = canvas.width  = innerWidth;
  let h = canvas.height = innerHeight;

  const chars   = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789@#%&()*+-<>/\\[]{}';
  const fontSize = 14;
  let columns    = Math.floor(w / fontSize);
  let drops      = Array(columns).fill(0);

  function resize() {
    w = canvas.width  = innerWidth;
    h = canvas.height = innerHeight;
    columns = Math.floor(w / fontSize);
    drops   = Array(columns).fill(0);
  }
  addEventListener('resize', resize);

  function drawMatrix() {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 0, w, h);
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

  /* ── Terminal demo content ── */
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

  /* All outputs are predefined static strings — no user input is evaluated */
  function generateFakeOutput(cmd) {
    if (cmd.startsWith('whoami'))         return 'ratnesh';
    if (cmd.startsWith('nmap'))           return 'Starting Nmap 7.92 ( https://nmap.org )\nPORT    STATE  SERVICE  VERSION\n22/tcp  open   ssh      OpenSSH 8.2p1\n80/tcp  open   http     Apache httpd 2.4.41\n443/tcp open   https    Apache httpd 2.4.41\nNmap done: 1 IP address scanned in 2.34 seconds';
    if (cmd.includes('wireshark'))        return 'Capturing on \'eth0\'\n10 packets captured\nEthernet II, Src: 00:11:22:33:44:55\nInternet Protocol Version 4, Src: 192.168.1.1\nCapture complete.';
    if (cmd.includes('msfconsole'))       return '[+] Started reverse TCP handler on 192.168.1.50:4444\n[*] Sending exploit...\n[*] Meterpreter session 1 opened\nMeterpreter > sysinfo\nComputer: TARGET-PC\nOS: Windows 10 Pro x64';
    if (cmd.includes('burp'))             return 'Burp Suite Professional v2023.10.1\nProxy service started on 127.0.0.1:8080\n[INFO] Intercepting requests...';
    if (cmd.includes('splunk'))           return 'action  count\nallow   15234\nblock   567\nQuery executed in 0.45 seconds.';
    if (cmd.includes('grep'))             return 'Oct 1 12:05:43 sshd: Failed password for invalid user admin from 192.168.1.100\nOct 1 12:05:47 sshd: Accepted password for ratnesh from 192.168.1.200\n[WARNING] Multiple failed login attempts detected.';
    if (cmd.includes('lynis'))            return '[LYNIS] Lynis 3.0.8\n[+] Plugins: enabled\n[-] Boot loader: GRUB not password protected\n[-] World-writable files found\n[INFO] Issues: high: 3, medium: 5, low: 12';
    if (cmd.includes('sshd_config'))      return 'PermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nX11Forwarding no\nSubsystem sftp /usr/lib/openssh/sftp-server';
    if (cmd.includes('nikto'))            return 'Nikto v2.1.6\n+ Server: Apache/2.4.41 (Ubuntu)\n+ X-Frame-Options header not present\n+ X-XSS-Protection header not defined\n+ OSVDB-3092: /admin/ found\n+ 6544 items checked: 12 item(s) reported';
    if (cmd.includes('echo'))             return 'All checks complete. System secure.';
    return '[ERROR] Command not recognized. Type \'help\' for options.';
  }

  /* Typed animation — returns a stopper function */
  function startTyping(targetEl, speed, pause) {
    speed = speed || 18;
    pause = pause || 900;
    let cmdIndex = 0;
    let charIndex = 0;
    let timer     = null;
    let stopped   = false;

    function step() {
      if (stopped) return;
      const current = demoCommands[cmdIndex];

      if (charIndex <= current.length) {
        targetEl.textContent = '> ' + current.slice(0, charIndex) + (charIndex % 2 === 0 ? ' ▌' : ' ');
        charIndex++;
        timer = setTimeout(step, speed);
      } else {
        setTimeout(function() {
          if (stopped) return;
          const out = generateFakeOutput(current);
          targetEl.textContent += '\n' + out;
          setTimeout(function() {
            if (stopped) return;
            targetEl.textContent += '\n';
            cmdIndex = (cmdIndex + 1) % demoCommands.length;
            charIndex = 0;
            timer = setTimeout(step, speed);
          }, pause);
        }, 120);
      }
    }

    step();
    return function stop() { stopped = true; clearTimeout(timer); };
  }

  /* ── DOM references ── */
  const trigger   = document.getElementById('terminal-trigger');
  const preview   = document.getElementById('terminal-preview');
  const modal     = document.getElementById('terminal-modal');
  const closeBtn  = document.getElementById('terminal-close');
  const clearBtn  = document.getElementById('terminal-clear');
  const copyBtn   = document.getElementById('terminal-copy');
  const previewLines = document.getElementById('preview-lines');
  const modalLines   = document.getElementById('modal-lines');

  if (!trigger || !preview || !modal) return;

  let previewStopper = null;
  let modalStopper   = null;

  /* Position preview tooltip near the trigger button */
  function positionPreview() {
    const rect = trigger.getBoundingClientRect();
    const px = rect.left + (rect.width / 2) - (preview.offsetWidth / 2);
    const py = rect.bottom + window.scrollY + 12;
    preview.style.left = Math.max(12, px) + 'px';
    preview.style.top  = py + 'px';
  }

  /* Show preview on hover */
  trigger.addEventListener('mouseenter', function() {
    preview.style.display = 'block';
    preview.setAttribute('aria-hidden', 'false');
    positionPreview();
    previewStopper = startTyping(previewLines, 20, 700);
  });

  trigger.addEventListener('mouseleave', function() {
    preview.style.display = 'none';
    preview.setAttribute('aria-hidden', 'true');
    previewLines.textContent = '';
    if (previewStopper) { previewStopper(); previewStopper = null; }
  });

  addEventListener('scroll',  function() { if (preview.style.display === 'block') positionPreview(); }, { passive: true });
  addEventListener('resize',  function() { if (preview.style.display === 'block') positionPreview(); });

  /* Open modal */
  function openModal() {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    modalLines.textContent = '';
    modalStopper = startTyping(modalLines, 18, 850);
    document.getElementById('terminal-body').focus();
  }

  /* Close modal */
  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    modalLines.textContent = '';
    if (modalStopper) { modalStopper(); modalStopper = null; }
  }

  trigger.addEventListener('click', openModal);
  trigger.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
  });

  closeBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('keydown', function(e) { if (e.key === 'Enter') closeModal(); });

  /* Clear & Copy */
  clearBtn.addEventListener('click', function() { modalLines.textContent = ''; });

  copyBtn.addEventListener('click', function() {
    const txt = modalLines.textContent || '';
    if (!txt) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() { copyBtn.textContent = 'Copy Log'; }, 1400);
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      const ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.position = 'fixed';
      ta.style.opacity  = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
      } catch (err) {
        copyBtn.textContent = 'Failed';
      }
      document.body.removeChild(ta);
      setTimeout(function() { copyBtn.textContent = 'Copy Log'; }, 1400);
    }
  });

  /* Close when clicking the overlay backdrop */
  modal.addEventListener('click', function(ev) {
    if (ev.target === modal) closeModal();
  });

  /* Escape key closes modal */
  addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  /* Smooth scroll for any in-page anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const target = document.getElementById(this.getAttribute('href').substring(1));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
