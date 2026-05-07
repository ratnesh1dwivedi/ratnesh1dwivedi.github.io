// ====================================================
// CYBERSECURITY PORTFOLIO - ENHANCED INTERACTIVE SCRIPT
// Matrix animation, terminal simulation, theme toggle, animations
// ====================================================

(() => {
  'use strict';

  // ============ PERFORMANCE: Reduce Repaints ============
  const raf = window.requestAnimationFrame || ((cb) => setTimeout(cb, 1000 / 60));

  // ============ UTILITY FUNCTIONS ============
  const safeGet = (id) => document.getElementById(id);
  const show = (el) => { if (el) el.style.display = ''; };
  const hide = (el) => { if (el) el.style.display = 'none'; };

  // Toast notifications
  const showToast = (msg, duration = 2000) => {
    const toast = safeGet('toast-notification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  };

  // ============ PAGE LOADER ============
  const hideLoader = () => {
    const loader = safeGet('page-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => hide(loader), 300);
    }
  };
  window.addEventListener('load', hideLoader);

  // ============ DARK MODE TOGGLE ============
  const themeToggle = safeGet('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
  
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  };

  setTheme(currentTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }
  prefersDark.addEventListener('change', (e) => setTheme(e.matches ? 'dark' : 'light'));

  // ============ MATRIX CANVAS ANIMATION ============
  const canvas = safeGet('matrix-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const chars = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789@#%&()*+-<>/\\[]{}|';
    const fontSize = 14;
    const columns = Math.floor(w / fontSize);
    const drops = Array(columns).fill(0);
    let animationId;
    let isAnimating = true;

    // Reduce motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) isAnimating = false;

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const drawMatrix = () => {
      if (!isAnimating) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00ff88';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = (Math.random() > 0.97) ? '#d4af37' : '#00ff88';
        ctx.fillText(text, x, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animationId = raf(drawMatrix);
    };
    drawMatrix();

    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(animationId);
    });
  }

  // ============ YEAR FOOTER UPDATE ============
  const yearSpan = safeGet('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ============ SMOOTH SCROLL NAVIGATION ============
  document.addEventListener('DOMContentLoaded', () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#' || href === '') return;
        e.preventDefault();
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  });

  // ============ INTERSECTION OBSERVER FOR ANIMATIONS ============
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section').forEach(section => observer.observe(section));

  // ============ TERMINAL SIMULATION ============
  const terminalPreview = safeGet('terminal-preview');
  const terminalModal = safeGet('terminal-modal');
  const terminalTrigger = safeGet('terminal-trigger');
  const terminalClose = safeGet('terminal-close');
  const terminalClear = safeGet('terminal-clear');
  const terminalCopy = safeGet('terminal-copy');
  const previewLines = safeGet('preview-lines');
  const modalLines = safeGet('modal-lines');
  const terminalBody = safeGet('terminal-body');

  if (!terminalPreview || !terminalModal || !terminalTrigger) {
    console.warn('Terminal elements not found - skipping initialization');
  } else {
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
      'john --wordlist=/usr/share/wordlists/rockyou.txt --format=bcrypt hashes.txt',
      'hashcat -m 1400 -a 0 hashes.txt wordlist.txt',
      'echo "All security checks complete."'
    ];

    const generateFakeOutput = (cmd) => {
      if (cmd.startsWith('whoami')) return 'ratnesh\nratnesh@cybersec:~$';
      if (cmd.startsWith('nmap')) return 'Starting Nmap 7.92 at 2025-05-07 14:32 UTC\nNmap scan report for 192.168.1.0/24\nPORT    STATE  SERVICE\n22/tcp  open   ssh\n80/tcp  open   http\n443/tcp open   https\nNmap done at 2025-05-07 14:35 UTC';
      if (cmd.includes('wireshark')) return 'Capturing on eth0\n10 packets captured in 2.5 seconds\nPacket 1: TCP 192.168.1.50:51234 > 8.8.8.8:53\nPacket 2: UDP 192.168.1.50:51235 > 8.8.4.4:53';
      if (cmd.includes('msfconsole')) return '[+] Started reverse TCP handler on 192.168.1.50:4444\n[*] Sending exploit...\n[+] Meterpreter session 1 opened';
      if (cmd.includes('burp')) return 'Burp Suite Professional v2025.5\nProxy service started on 127.0.0.1:8080\n[INFO] 0 requests intercepted';
      if (cmd.includes('splunk')) return 'Search executed successfully\naction | count\nallow | 15234\nblock | 567';
      if (cmd.includes('grep')) return 'May 7 14:32:15 server sshd[1234]: Failed password for user admin\nMay 7 14:32:17 server sshd[1234]: Failed password for user root';
      if (cmd.includes('lynis')) return '[LYNIS] System Audit Tool 3.0.8\n[+] System tools: found\n[+] Plugins: enabled\n[-] Boot loader: not password protected';
      if (cmd.includes('sshd_config')) return 'PermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nX11Forwarding no';
      if (cmd.includes('nikto')) return 'Nikto v2.1.6 - Target: http://example.com\n+ Server: Apache/2.4.41\n+ Retrieved robots.txt';
      if (cmd.includes('john')) return 'Loaded 5 password hashes\nPassword cracking started...\npassword123 (user1)';
      if (cmd.includes('hashcat')) return 'hashcat (v6.2.6) starting...\nRecovered: 3/5 hashes';
      if (cmd.includes('echo')) return 'All security checks complete. System secure. ✓';
      return '[ERROR] Command not recognized. Type \'help\' for options.';
    };

    let previewStopper = null;
    let modalStopper = null;

    const startTyping = (targetEl, speed = 18, pause = 900) => {
      if (!targetEl) return () => {};
      let cmdIndex = 0;
      let charIndex = 0;
      let timers = [];
      const clearTimers = () => { timers.forEach(t => clearTimeout(t)); timers = []; };
      const step = () => {
        const current = demoCommands[cmdIndex];
        if (charIndex <= current.length) {
          const lineBuf = '> ' + current.slice(0, charIndex);
          targetEl.textContent = lineBuf + (charIndex % 2 === 0 ? ' ▌' : ' ');
          charIndex++;
          timers.push(setTimeout(step, speed));
        } else {
          timers.push(setTimeout(() => {
            const out = generateFakeOutput(current);
            targetEl.textContent += '\n' + out;
            timers.push(setTimeout(() => {
              targetEl.textContent += '\n';
              cmdIndex = (cmdIndex + 1) % demoCommands.length;
              charIndex = 0;
              timers.push(setTimeout(step, speed));
            }, pause));
          }, 120));
        }
      };
      step();
      return clearTimers;
    };

    const positionPreview = () => {
      if (!terminalPreview) return;
      const rect = terminalTrigger.getBoundingClientRect();
      const px = rect.left + (rect.width / 2) - (terminalPreview.offsetWidth / 2);
      const py = rect.bottom + 12;
      terminalPreview.style.left = Math.max(12, Math.min(px, window.innerWidth - terminalPreview.offsetWidth - 12)) + 'px';
      terminalPreview.style.top = Math.min(py, window.innerHeight - terminalPreview.offsetHeight - 12) + 'px';
    };

    terminalTrigger.addEventListener('mouseenter', () => {
      show(terminalPreview);
      terminalPreview.setAttribute('aria-hidden', 'false');
      positionPreview();
      if (previewStopper) previewStopper();
      previewStopper = startTyping(previewLines, 20, 700);
    });

    terminalTrigger.addEventListener('mouseleave', () => {
      hide(terminalPreview);
      terminalPreview.setAttribute('aria-hidden', 'true');
      previewLines.textContent = '';
      if (previewStopper) previewStopper();
      previewStopper = null;
    });

    window.addEventListener('scroll', () => {
      if (terminalPreview.style.display !== 'none') positionPreview();
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (terminalPreview.style.display !== 'none') positionPreview();
    }, { passive: true });

    const openModal = () => {
      show(terminalModal);
      terminalModal.setAttribute('aria-hidden', 'false');
      terminalTrigger.setAttribute('aria-expanded', 'true');
      modalLines.textContent = '';
      if (modalStopper) modalStopper();
      modalStopper = startTyping(modalLines, 18, 850);
      if (terminalBody) terminalBody.focus();
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      hide(terminalModal);
      terminalModal.setAttribute('aria-hidden', 'true');
      terminalTrigger.setAttribute('aria-expanded', 'false');
      modalLines.textContent = '';
      if (modalStopper) modalStopper();
      modalStopper = null;
      document.body.style.overflow = '';
    };

    terminalTrigger.addEventListener('click', openModal);
    terminalTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
    });

    terminalClose.addEventListener('click', closeModal);
    terminalClose.addEventListener('keydown', (e) => { if (e.key === 'Enter') closeModal(); });

    terminalClear?.addEventListener('click', () => { modalLines.textContent = ''; });

    terminalCopy?.addEventListener('click', () => {
      const txt = modalLines.textContent || '';
      if (!txt) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(() => {
          showToast('✓ Copied to clipboard!');
          terminalCopy.textContent = '✓ Copied';
          setTimeout(() => { terminalCopy.textContent = 'Copy Log'; }, 1500);
        }).catch(() => fallbackCopy());
      } else {
        fallbackCopy();
      }
      function fallbackCopy() {
        const ta = document.createElement('textarea');
        ta.value = txt;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          showToast('✓ Copied to clipboard!');
          terminalCopy.textContent = '✓ Copied';
          setTimeout(() => { terminalCopy.textContent = 'Copy Log'; }, 1500);
        } catch (e) {
          console.error('Copy failed:', e);
        } finally {
          ta.remove();
        }
      }
    });

    terminalModal.addEventListener('click', (e) => { if (e.target === terminalModal) closeModal(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && terminalModal.style.display !== 'none') closeModal(); });
    window.addEventListener('load', positionPreview, { once: true });
  }
})();
