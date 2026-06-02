/**
 * CYBERGSEC — RATNESH RAJ DWIVEDI
 * script.js | Companion JS for standalone/fallback use
 * Version: 4.0 | Security-hardened | Multi-platform
 *
 * This file is a standalone companion — index.html is self-contained.
 * Use this if you split the project into separate files.
 *
 * Security: no eval(), no innerHTML from external data,
 *           all fetch() calls use safeFetch() wrapper,
 *           all external strings sanitized before DOM insertion.
 */

'use strict';

/* ════════════════════════════════════════════════════
   1. SECURITY HELPERS
   ════════════════════════════════════════════════════ */

/**
 * Strip all HTML tags and encode dangerous characters.
 * Use for any string that comes from an external source
 * before inserting into the DOM.
 */
function sanitize(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 500);
}

/**
 * Allow only https:// URLs. Returns empty string for anything else.
 * Prevents javascript: protocol injection and mixed-content.
 */
function sanitizeUrl(url) {
  try {
    const u = new URL(String(url || ''));
    return u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
}

/**
 * Remove HTML special chars — lighter than sanitize(),
 * for plain text that will only use textContent.
 */
function sanitizeText(str) {
  return String(str || '').replace(/[<>"'`]/g, '').slice(0, 500);
}

/**
 * Safe fetch wrapper:
 * - Validates HTTPS-only URLs
 * - Enforces request timeout (default 10s)
 * - Returns null instead of throwing on failure
 */
async function safeFetch(url, opts, timeoutMs) {
  timeoutMs = timeoutMs || 10000;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') {
      console.warn('[security] Non-HTTPS fetch blocked:', url);
      return null;
    }
  } catch {
    return null;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, Object.assign({}, opts || {}, { signal: ctrl.signal }));
    clearTimeout(timer);
    return r.ok ? r : null;
  } catch (e) {
    clearTimeout(timer);
    if (e.name !== 'AbortError') {
      console.warn('[safeFetch] failed:', url, e.message);
    }
    return null;
  }
}

/* ════════════════════════════════════════════════════
   2. PLATFORM DETECTION & MULTI-PLATFORM SETUP
   ════════════════════════════════════════════════════ */

(function platformSetup() {
  const ua  = navigator.userAgent;
  const body = document.body;

  // Detect platform
  const isIOS     = /iPad|iPhone|iPod/.test(ua) || (/Mac/.test(ua) && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isSafari  = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  const isEdge    = /Edg\//.test(ua);
  const isSamsung = /Samsung/.test(ua);
  const isMobile  = isIOS || isAndroid || window.innerWidth < 640;
  const isTablet  = !isMobile && (window.innerWidth < 1024 || /iPad|Tablet/.test(ua));

  if (isIOS)     body.classList.add('ios');
  if (isAndroid) body.classList.add('android');
  if (isSafari)  body.classList.add('safari');
  if (isFirefox) body.classList.add('firefox');
  if (isEdge)    body.classList.add('edge');
  if (isSamsung) body.classList.add('samsung');
  if (isMobile)  body.classList.add('mobile');
  if (isTablet)  body.classList.add('tablet');

  // iOS 100vh fix — sets --vh CSS custom property
  function setVH() {
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH, { passive: true });

  // Orientation change — iOS needs a settle delay before layout is correct
  window.addEventListener('orientationchange', function () {
    setTimeout(function () {
      setVH();
      window.dispatchEvent(new Event('resize'));
    }, 150);
  });

  // Prevent double-tap zoom on interactive elements (iOS Safari)
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (e) {
    const now = Date.now();
    if (now - lastTouchEnd < 300 && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  // PWA install prompt — defer for possible use
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window._pwaInstallPrompt = e;
  });
})();

/* ════════════════════════════════════════════════════
   3. MATRIX RAIN CANVAS
   ════════════════════════════════════════════════════ */

(function matrixRain() {
  const canvas = document.getElementById('mx') ||
                 document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx   = canvas.getContext('2d');
  const chars = 'ｦｧｨｩＡＢＣＤＥＦ0123456789@#$%^&*()';
  const fs    = 13;
  let w, h, cols, drops;

  function init() {
    w    = canvas.width  = window.innerWidth;
    h    = canvas.height = window.innerHeight;
    cols  = Math.floor(w / fs);
    drops = Array(cols).fill(0);
  }

  init();
  window.addEventListener('resize', init, { passive: true });

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.058)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = fs + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      ctx.fillStyle = Math.random() > 0.97 ? '#d4af37' : '#00ff88';
      ctx.fillText(
        chars[Math.floor(Math.random() * chars.length)],
        i * fs,
        drops[i] * fs
      );
      if (drops[i] * fs > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }

  draw();
})();

/* ════════════════════════════════════════════════════
   4. PAGE NAVIGATION (SPA-style tab switching)
   ════════════════════════════════════════════════════ */

(function pageNav() {
  const btns  = document.querySelectorAll('.nb[data-pg]');
  const pages = {
    port:  document.getElementById('pp'),
    globe: document.getElementById('gp'),
    term:  document.getElementById('tp'),
  };

  if (!btns.length) return;

  let termInit  = false;
  let globeInit = false;

  function showPage(id) {
    btns.forEach(b => b.classList.remove('on'));
    Object.values(pages).forEach(p => { if (p) p.classList.remove('on'); });
    const btn  = document.querySelector(`.nb[data-pg="${id}"]`);
    const page = pages[id];
    if (btn)  btn.classList.add('on');
    if (page) page.classList.add('on');

    if (id === 'term'  && !termInit)  { initTerminal();  termInit  = true; }
    if (id === 'globe' && !globeInit) { initGlobe();     globeInit = true; }
    if (id === 'port')                { animSkillBars(); }

    // Update URL hash without scrolling (for back/forward nav)
    try { history.replaceState(null, '', '#' + id); } catch {}
  }

  btns.forEach(b => b.addEventListener('click', () => showPage(b.dataset.pg)));

  // Handle browser back/forward
  window.addEventListener('hashchange', function () {
    const id = location.hash.replace('#', '');
    if (pages[id]) showPage(id);
  });

  // Load page from hash on first load
  const hash = location.hash.replace('#', '');
  if (pages[hash]) {
    showPage(hash);
  } else {
    animSkillBars();
  }
})();

/* ════════════════════════════════════════════════════
   5. SKILL BARS — animated on portfolio load
   ════════════════════════════════════════════════════ */

function animSkillBars() {
  document.querySelectorAll('.sf[data-w]').forEach(function (el) {
    setTimeout(function () {
      el.style.width = el.dataset.w + '%';
    }, 100);
  });
}

/* ════════════════════════════════════════════════════
   6. FOOTER YEAR
   ════════════════════════════════════════════════════ */

(function setYear() {
  const el = document.getElementById('yr') || document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ════════════════════════════════════════════════════
   7. SIDEBAR — Activity log & tool tags
   ════════════════════════════════════════════════════ */

(function sidebarInit() {
  // Activity log
  const logEl = document.getElementById('slog');
  if (logEl) {
    const msgs = [
      'nmap: 3 open ports found', 'lynis: 2 high issues',
      'SSH: ratnesh@192.168.1.1', 'Wireshark: 142 pkts',
      'Metasploit session opened', 'CVE-2025-1234 CRITICAL',
      'Burp intercept: POST /login', 'Splunk: brute-force alert',
      'OSINT: 3 subdomains found', 'Nikto: 6 findings',
      'hashcat: 2 hashes cracked', 'Autopsy: 48 EXIF files',
      'DatCon: flight path OK', 'ExifTool: GPS extracted',
    ];

    function addLog() {
      const t = new Date().toTimeString().slice(0, 8);
      const m = msgs[Math.floor(Math.random() * msgs.length)];
      const row  = document.createElement('div');
      row.className = 'ai';
      const time = document.createElement('span');
      time.className = 'at';
      time.textContent = t;                      // textContent — safe
      const msg  = document.createElement('span');
      msg.className = 'am';
      msg.textContent = m;                       // textContent — safe
      row.append(time, msg);
      logEl.insertBefore(row, logEl.firstChild);
      while (logEl.children.length > 20) logEl.removeChild(logEl.lastChild);
    }

    for (let i = 0; i < 6; i++) addLog();
    setInterval(addLog, 3200);
  }

  // Tool tags
  const tagsEl = document.getElementById('ttags');
  if (tagsEl) {
    const tools = [
      'Wireshark', 'Nmap', 'Metasploit', 'Burp Suite', 'Autopsy',
      'Splunk', 'DatCon', 'ExifTool', 'Nikto', 'Lynis', 'Volatility',
      'Maltego', 'Aircrack-ng', 'JtR', 'theHarvester', 'sqlmap',
      'tcpdump', 'msfvenom', 'OpenVAS', 'Wazuh',
    ];
    tools.forEach(function (t) {
      const span = document.createElement('span');
      span.className   = 'ttag';
      span.textContent = t;                      // textContent — safe
      tagsEl.appendChild(span);
    });
  }
})();

/* ════════════════════════════════════════════════════
   8. LIVE ATTACK FEED + STATS
   ════════════════════════════════════════════════════ */

(function attackFeed() {
  const feedEl = document.getElementById('afd');
  if (!feedEl) return;

  const types = ['SSH-BF','RDP-BF','SQLi','XSS','RCE','DDoS','SPRAY','SCAN','PHISH','0DAY','MITM','BRUTE'];
  const sev   = ['c','h','m','l'];

  // Real known malicious IPs (public threat intel lists)
  const threatIPs = [
    '45.142.212.100','185.220.101.45','193.32.162.174','5.188.206.19',
    '80.82.77.33','194.165.16.11','45.155.205.233','91.240.118.172',
    '185.156.73.54','179.43.156.100','64.227.41.200','138.197.148.152',
    '165.22.42.213','167.71.13.196','45.33.32.156','198.199.108.9',
  ];
  let tipIdx = 0;

  function randIP() {
    if (Math.random() > 0.35) return threatIPs[tipIdx++ % threatIPs.length];
    return [1,2,3,4].map(() => Math.floor(Math.random() * 254) + 1).join('.');
  }

  function addFeedItem() {
    const s   = sev[Math.floor(Math.random() * sev.length)];
    const t   = types[Math.floor(Math.random() * types.length)];
    const row = document.createElement('div');
    row.className = 'fi';

    // Safe DOM — no innerHTML, all textContent
    const dot = document.createElement('span'); dot.className = 'fd ' + s;
    const src = document.createElement('span'); src.className = 'fs'; src.textContent = randIP();
    const arr = document.createElement('span'); arr.className = 'fa'; arr.textContent = ' → ';
    const dst = document.createElement('span'); dst.className = 'fds'; dst.textContent = randIP();
    const typ = document.createElement('span'); typ.className = 'ftp'; typ.textContent = '[' + t + ']';
    row.append(dot, src, arr, dst, typ);

    feedEl.insertBefore(row, feedEl.firstChild);
    while (feedEl.children.length > 12) feedEl.removeChild(feedEl.lastChild);
  }

  for (let i = 0; i < 8; i++) addFeedItem();
  setInterval(addFeedItem, 850);

  // Live counter updates
  let atk=847291, nds=2341888, cv=14492, mal=38721;
  let vc=247, vh=1043, vm=3219, vl=8901;

  function updateCounters() {
    atk += Math.floor(Math.random()*90  - 25);
    nds += Math.floor(Math.random()*40  - 12);
    mal += Math.floor(Math.random()*35  - 12);

    const fmt = n => Math.max(0, n).toLocaleString();
    [['ga', atk],['gn', nds],['gcv', cv],['gm', mal]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = fmt(val);
    });
    [['vc2', vc],['vh2', vh],['vm2', vm],['vl2', vl]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = fmt(val);
    });
  }

  setInterval(updateCounters, 2000);

  // Real CVE counts from NVD — refreshed every 30 min
  async function fetchCVEs() {
    const now = new Date();
    const ago = new Date(now - 86400000 * 7);
    const fmt = d => d.toISOString().split('.')[0] + '+01:00';
    const r = await safeFetch(
      'https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=' +
      encodeURIComponent(fmt(ago)) + '&pubEndDate=' + encodeURIComponent(fmt(now)) +
      '&resultsPerPage=1'
    );
    if (!r) return;
    try {
      const d = await r.json();
      const total = d.totalResults || 0;
      if (total > 0) {
        cv = Math.round(total * 0.035);
        vc = Math.round(total * 0.035);
        vh = Math.round(total * 0.12);
        vm = Math.round(total * 0.35);
        vl = total - vc - vh - vm;
        const el = document.getElementById('gcv');
        if (el) el.textContent = total.toLocaleString();
      }
    } catch {}
  }

  fetchCVEs();
  setInterval(fetchCVEs, 30 * 60 * 1000);

  // Dashboard hover tooltips
  const dtt   = document.getElementById('dtt');
  const dttTi = document.getElementById('dtt-title');
  const dttBo = document.getElementById('dtt-body');
  const dttLk = document.getElementById('dtt-link');

  if (dtt) {
    document.querySelectorAll('.dash-hover').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (dttTi) dttTi.textContent = sanitizeText(el.dataset.tipTitle || '');
        if (dttBo) dttBo.textContent = sanitizeText(el.dataset.tip || '');
        if (dttLk) dttLk.style.display = el.dataset.tipUrl ? 'block' : 'none';
        dtt.style.display = 'block';
      });
      el.addEventListener('mousemove', function (e) {
        const x = Math.min(e.clientX + 16, window.innerWidth  - 290);
        const y = Math.min(e.clientY + 12, window.innerHeight - 160);
        dtt.style.left = x + 'px';
        dtt.style.top  = y + 'px';
      });
      el.addEventListener('mouseleave', function () {
        dtt.style.display = 'none';
      });
    });
  }
})();

/* ════════════════════════════════════════════════════
   9. CYBER NEWS FEED — multi-source RSS, auto-refresh
   ════════════════════════════════════════════════════ */

(function cyberNews() {
  const body = document.getElementById('nfb');
  if (!body) return;

  const INTERVAL = 15 * 60 * 1000; // 15 minutes
  let lastFetch  = 0;

  const feeds = [
    { url: 'https://feeds.feedburner.com/TheHackersNews',  src: 'THN' },
    { url: 'https://www.bleepingcomputer.com/feed/',       src: 'BleepingComputer' },
    { url: 'https://feeds.feedburner.com/SecurityWeek',   src: 'SecurityWeek' },
    { url: 'https://www.darkreading.com/rss.xml',          src: 'DarkReading' },
  ];

  function parseRSS(xml, src) {
    return Array.from(xml.querySelectorAll('item')).slice(0, 14).map(function (item) {
      const rawTitle = (item.querySelector('title')?.textContent || '')
        .replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const rawUrl   = item.querySelector('link')?.textContent?.trim() || '';
      const pub      = item.querySelector('pubDate')?.textContent;
      const date     = pub
        ? new Date(pub).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';
      const tl       = rawTitle.toLowerCase();
      const sev      = (tl.includes('critical') || tl.includes('zero-day') ||
                        tl.includes('ransomware') || tl.includes('rce')) ? 'c'
                      : (tl.includes('vulnerability') || tl.includes('exploit') ||
                         tl.includes('breach') || tl.includes('attack'))  ? 'w' : 'i';
      return {
        title: sanitizeText(rawTitle).slice(0, 85),
        url:   sanitizeUrl(rawUrl),
        time:  sanitizeText(src + ' · ' + date),
        sev,
      };
    });
  }

  function render(items, src) {
    body.innerHTML = ''; // Safe — we only insert textContent nodes after this

    // Timestamp header — safe textContent
    const ts = document.createElement('div');
    ts.style.cssText = 'font-family:var(--mono);font-size:.5rem;color:var(--text3);padding:4px 8px 6px;border-bottom:1px solid rgba(0,255,136,0.05);display:flex;justify-content:space-between';
    const ts1 = document.createElement('span'); ts1.textContent = '◈ ' + sanitizeText(src || 'LIVE FEED');
    const ts2 = document.createElement('span'); ts2.textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    ts.append(ts1, ts2);
    body.appendChild(ts);

    // News items — all textContent, zero innerHTML from external data
    items.forEach(function (item) {
      const d   = document.createElement('div');
      d.className = 'ni' + (item.sev === 'w' ? ' w' : item.sev === 'i' ? ' i' : '');

      const nt = document.createElement('div'); nt.className = 'nt';
      nt.textContent = item.title;               // SAFE — sanitized above

      const nm = document.createElement('div'); nm.className = 'nm';
      nm.textContent = item.time;                // SAFE — sanitized above

      d.append(nt, nm);

      if (item.url) {
        d.style.cursor = 'pointer';
        d.addEventListener('click', function () {
          window.open(item.url, '_blank', 'noopener,noreferrer');
        });
      }

      body.appendChild(d);
    });

    // Update header source badge
    const srcEl = document.getElementById('news-src');
    const ageEl = document.getElementById('news-age');
    if (srcEl) srcEl.textContent = sanitizeText(src || 'LIVE');
    if (ageEl) ageEl.textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    lastFetch = Date.now();
  }

  async function tryFeed(idx) {
    if (idx >= feeds.length) return;
    const f = feeds[idx];
    const r = await safeFetch('https://api.allorigins.win/get?url=' + encodeURIComponent(f.url));
    if (!r) { tryFeed(idx + 1); return; }
    try {
      const data  = await r.json();
      const xml   = new DOMParser().parseFromString(data.contents, 'application/xml');
      const items = parseRSS(xml, f.src);
      if (items.length > 0) {
        render(items, f.src);
        // Update ticker with real headlines
        const tkEl = document.querySelector('.tki');
        if (tkEl && items.length > 0) {
          tkEl.textContent = items.slice(0, 8).map(i => '⚠ ' + i.title).join(' | ');
        }
      } else {
        tryFeed(idx + 1);
      }
    } catch {
      tryFeed(idx + 1);
    }
  }

  tryFeed(0);
  setInterval(function () {
    if (Date.now() - lastFetch > INTERVAL) tryFeed(0);
  }, INTERVAL);
})();

/* ════════════════════════════════════════════════════
   10. ROCKET LAUNCHES — live data + countdown
   ════════════════════════════════════════════════════ */

(function launches() {
  // This runs only when globe page is active — called by initGlobe()
  window.fetchLaunches = async function () {
    const panel = document.getElementById('lpb');
    if (!panel) return;

    const staticLaunches = [
      { name: 'PSLV-C59 / EarthCARE',    provider: 'ISRO',         site: 'Sriharikota',     date: 'TBD 2025', url: 'https://www.isro.gov.in/' },
      { name: 'Falcon 9 / Starlink G10', provider: 'SpaceX',       site: 'Cape Canaveral',  date: 'Jun 2025', url: 'https://www.spacex.com/launches/' },
      { name: 'SLS Artemis IV',           provider: 'NASA',         site: 'Kennedy SC',      date: '2026',     url: 'https://www.nasa.gov/missions/artemis/' },
      { name: 'GSLV Mk III / OneWeb',     provider: 'ISRO',         site: 'Sriharikota',     date: 'Q3 2025',  url: 'https://www.isro.gov.in/' },
      { name: 'Ariane 6 / Galileo',       provider: 'ArianeGroup',  site: 'Kourou',          date: 'Q4 2025',  url: 'https://www.arianespace.com/' },
      { name: 'Soyuz-2 / Progress',       provider: 'Roscosmos',    site: 'Baikonur',        date: 'Jun 2025', url: 'https://www.roscosmos.ru/' },
    ];

    function renderLaunchItem(name, prov, site, date, cd, url) {
      const a   = document.createElement('a');
      a.className = 'lr';
      a.href      = sanitizeUrl(url) || 'https://www.rocketlaunch.live/';
      a.target    = '_blank';
      a.rel       = 'noopener noreferrer';
      const n = document.createElement('div'); n.className = 'lr-name'; n.textContent = '🚀 ' + sanitizeText(name).slice(0, 28);
      const d = document.createElement('div'); d.className = 'lr-det';  d.textContent = sanitizeText(prov).slice(0, 12) + ' · ' + sanitizeText(site).slice(0, 16);
      const c = document.createElement('div'); c.className = 'lr-cd';   c.textContent = sanitizeText(date) + (cd ? ' · ' + cd : '');
      a.append(n, d, c);
      panel.appendChild(a);
    }

    const r = await safeFetch('https://fdo.rocketlaunch.live/json/launches/next/6');
    panel.innerHTML = '';

    // Timestamp
    const ts = document.createElement('div');
    ts.style.cssText = 'font-family:var(--mono);font-size:.5rem;color:var(--text3);padding:4px 6px 6px;border-bottom:1px solid rgba(0,174,239,0.1)';
    ts.textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    panel.appendChild(ts);

    if (r) {
      try {
        const data  = await r.json();
        const items = (data.result || staticLaunches).slice(0, 6);
        let nextT0  = null;
        items.forEach(function (item, i) {
          const name = sanitizeText(item.name || item.launch_description || 'Unknown');
          const prov = sanitizeText((item.provider?.name || item.provider || ''));
          const site = sanitizeText((item.pad?.location?.name || item.site || ''));
          const date = item.t0
            ? new Date(item.t0).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : (item.date || 'TBD');
          const diff = item.t0 ? (new Date(item.t0) - Date.now()) : 0;
          const cd   = item.t0 ? getCountdown(item.t0) : '';
          const slug = (item.slug || '').replace(/[^a-z0-9-]/gi, '');
          const url  = slug ? 'https://rocketlaunch.live/launch/' + slug : 'https://www.rocketlaunch.live/';
          renderLaunchItem(name, prov, site, date, cd, url);
          if (i === 0 && item.t0) nextT0 = item.t0;
        });
        if (nextT0) startLaunchCountdown(nextT0);
        else {
          const el = document.getElementById('gnl');
          if (el) el.textContent = items[0]?.date || 'TBD';
        }
        return;
      } catch {}
    }

    // Fallback — static data
    staticLaunches.forEach(function (item) {
      renderLaunchItem(item.name, item.provider, item.site, item.date, '', item.url);
    });
    const el = document.getElementById('gnl');
    if (el) el.textContent = 'PSLV-C59';
  };

  function getCountdown(iso) {
    const diff = new Date(iso) - Date.now();
    if (diff <= 0) return 'LAUNCHED';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return d > 0 ? d + 'd ' + h + 'h' : h + 'h';
  }

  window._nextLaunchTime = null;
  window.startLaunchCountdown = function (isoTime) {
    window._nextLaunchTime = isoTime ? new Date(isoTime) : null;
    if (window._launchCountdownTimer) clearInterval(window._launchCountdownTimer);
    if (!window._nextLaunchTime) return;
    window._launchCountdownTimer = setInterval(function () {
      const diff = window._nextLaunchTime - Date.now();
      const el   = document.getElementById('gnl');
      if (!el) return;
      if (diff <= 0) {
        el.textContent = 'LAUNCHED';
        clearInterval(window._launchCountdownTimer);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.textContent = d > 0 ? 'T-' + d + 'd ' + h + 'h ' + m + 'm' : 'T-' + h + 'h ' + m + 'm ' + s + 's';
    }, 1000);
  };
})();

/* ════════════════════════════════════════════════════
   11. ISS — real position, globe update every 5s
   ════════════════════════════════════════════════════ */

window.fetchISS = async function () {
  const r = await safeFetch('https://api.wheretheiss.at/v1/satellites/25544');
  if (!r) return;
  try {
    const d    = await r.json();
    const lat  = parseFloat(d.latitude);
    const lon  = parseFloat(d.longitude);
    const alt  = parseFloat(d.altitude).toFixed(0);
    const vel  = parseFloat(d.velocity).toFixed(0);
    const altEl = document.getElementById('giss-alt');
    const posEl = document.getElementById('giss-pos');
    if (altEl) altEl.textContent = alt + ' km';
    if (posEl) posEl.textContent = lat.toFixed(1) + '°,' + (lon > 0 ? lon.toFixed(1) + '°E' : Math.abs(lon).toFixed(1) + '°W');
    // Globe mesh update — handled inside initGlobe() via userData.realPos
    if (window._issGeom && window.THREE) {
      const phi   = (90 - lat) * Math.PI / 180;
      const theta = (lon + 180) * Math.PI / 180;
      const rv    = 1.064;
      window._issGeom.userData.realPos = new window.THREE.Vector3(
        -rv * Math.sin(phi) * Math.cos(theta),
         rv * Math.cos(phi),
         rv * Math.sin(phi) * Math.sin(theta)
      );
      window._issGeom.userData.velocity = vel;
    }
  } catch {}
};

/* ════════════════════════════════════════════════════
   12. TERMINAL — xterm.js with fallback
   ════════════════════════════════════════════════════ */

function initTerminal() {
  const container = document.getElementById('xtc');
  if (!container) return;
  if (window.Terminal) {
    buildXterm(container);
  } else {
    buildFallbackTerm(container);
  }
}

function buildXterm(container) {
  const FitAddonClass = (window.FitAddon?.FitAddon) || window.FitAddon;
  const term = new window.Terminal({
    cursorBlink:      true,
    cursorStyle:      'bar',
    fontFamily:       "'Share Tech Mono', 'Courier New', monospace",
    fontSize:         14,
    lineHeight:       1.38,
    scrollback:       1000,
    allowTransparency: true,
    theme: {
      background:         '#010301', foreground: '#00ff88', cursor: '#00ff88',
      cursorAccent:       '#000',
      selectionBackground: 'rgba(0,255,136,0.18)',
      black:  '#000',       brightBlack:   '#2a3a2a',
      red:    '#ff3c3c',    brightRed:     '#ff6666',
      green:  '#00ff88',    brightGreen:   '#55ffaa',
      yellow: '#d4af37',    brightYellow:  '#f0d060',
      blue:   '#00aeef',    brightBlue:    '#44ccff',
      magenta:'#9b59b6',    brightMagenta: '#bb88dd',
      cyan:   '#00ffff',    brightCyan:    '#66ffff',
      white:  '#b0c8b0',    brightWhite:   '#ffffff',
    },
  });
  term.open(container);

  // FitAddon
  let fitAddon = null;
  if (FitAddonClass) {
    try {
      fitAddon = new FitAddonClass();
      term.loadAddon(fitAddon);
      setTimeout(() => { try { fitAddon.fit(); } catch {} }, 200);
    } catch { fitAddon = null; }
  }
  window.addEventListener('resize', () => { try { if (fitAddon) fitAddon.fit(); } catch {} });

  // Store ref for font size control
  window._xtermInstance = term;

  // Print banner
  printBanner(term);

  const U  = '\x1b[1;32mratnesh\x1b[0m';
  const H  = '\x1b[1;33mcybergsec\x1b[0m';
  const T  = '\x1b[1;34m~\x1b[0m';
  const PR = `${U}@${H}:${T}$ `;
  const prompt = () => term.write('\r\n' + PR);

  const hist = []; let hi = -1, buf = '';

  term.onData(async function (e) {
    if (e === '\r') {
      const raw = buf;
      const cmd = buf.trim().toLowerCase();
      if (cmd) { hist.unshift(cmd); }
      hi = -1;
      term.writeln('');
      if (cmd) {
        window.dispatchEvent(new Event('termcmd'));
        await runCmd(cmd, raw, term, prompt);
      } else {
        prompt();
      }
      buf = '';
    } else if (e === '\u007f') {        // Backspace
      if (buf.length > 0) { buf = buf.slice(0, -1); term.write('\b \b'); }
    } else if (e === '\u001b[A') {      // Arrow Up
      if (hi < hist.length - 1) { hi++; const s = hist[hi]; term.write('\r\x1b[K' + PR + s); buf = s; }
    } else if (e === '\u001b[B') {      // Arrow Down
      if (hi > 0) { hi--; const s = hist[hi]; term.write('\r\x1b[K' + PR + s); buf = s; }
      else if (hi === 0) { hi = -1; term.write('\r\x1b[K' + PR); buf = ''; }
    } else if (e.charCodeAt(0) >= 32) {
      buf += e; term.write(e);
    }
  });

  prompt();
}

function printBanner(term) {
  const lines = [
    '', '\x1b[1;32m  ██████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗ ███████╗███████╗ ██████╗\x1b[0m',
    '\x1b[32m ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝ ██╔════╝██╔════╝██╔════╝\x1b[0m',
    '\x1b[32m ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║  ███╗███████╗█████╗  ██║\x1b[0m',
    '\x1b[32m ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██║   ██║╚════██║██╔══╝  ██║\x1b[0m',
    '\x1b[32m ╚██████╗   ██║   ██████╔╝███████╗██║  ██║╚██████╔╝███████║███████╗╚██████╗\x1b[0m',
    '\x1b[32m  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝ ╚═════╝\x1b[0m',
    '', '\x1b[90m─────────────────────────────────────────────────────────────────────\x1b[0m',
    '  \x1b[1;33mRATNESH RAJ DWIVEDI\x1b[0m  ·  \x1b[32mCybersecurity & Digital Forensics\x1b[0m',
    '  CEH · CHFI · ISC2-CC · ICTCS-2025 · HTB/THM/PicoCTF',
    '\x1b[90m─────────────────────────────────────────────────────────────────────\x1b[0m',
    '  Type \x1b[1;32mhelp\x1b[0m for all commands  ·  ↑↓ history  ·  Live data enabled', '',
  ];
  lines.forEach(l => term.writeln(l));
}

/* Shared command runner — used by both xterm and fallback */
async function runCmd(cmd, raw, output, prompt) {
  const args  = raw.trim().split(/\s+/);
  const write = typeof output.writeln === 'function'
    ? (s, _) => output.writeln(s)
    : output;         // fallback uses print function

  // ── INFO COMMANDS ──
  if (cmd === 'clear') { if (output.clear) output.clear(); else output.innerHTML = ''; return; }
  if (cmd === 'help' || cmd === 'man') { printHelp(write); if (prompt) prompt(); return; }
  if (cmd === 'whoami')    { write('  uid=1000(ratnesh) gid=1000(ratnesh) groups=pentesters,forensics'); write('  Ratnesh Raj Dwivedi — Cybersecurity Researcher & Forensics Analyst'); write('  CEH · CHFI · ISC2-CC · ICTCS-2025 · HTB · THM · PicoCTF'); if (prompt) prompt(); return; }
  if (cmd === 'pwd')       { write('  /home/ratnesh'); if (prompt) prompt(); return; }
  if (cmd === 'ls' || cmd === 'ls -la' || cmd === 'dir') {
    ['  \x1b[34mdrwxr-xr-x\x1b[0m  forensics/  pentest/  research/','  \x1b[32m-rw-r--r--\x1b[0m  dji-phantom-analysis.pdf','  \x1b[32m-rw-r--r--\x1b[0m  pegasus-report.md','  \x1b[33m-rwxr-xr-x\x1b[0m  autopayload.py','  \x1b[90m-rw-r--r--\x1b[0m  .bash_history'].forEach(l => write(l));
    if (prompt) prompt(); return;
  }
  if (cmd === 'uname' || cmd === 'uname -a' || cmd === 'uname -r') { write('  Linux cybergsec 6.1.0-kali1-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.1.20-2kali1 x86_64 GNU/Linux'); if (prompt) prompt(); return; }
  if (cmd === 'date')     { write('  ' + new Date().toUTCString()); write('  Local: ' + new Date().toString()); if (prompt) prompt(); return; }
  if (cmd === 'uptime')   { const up=Math.floor(performance.now()/1000),h=Math.floor(up/3600),m=Math.floor((up%3600)/60),s=up%60; write('  '+new Date().toLocaleTimeString()+' up '+h+'h '+m+'m '+s+'s, 1 user, load avg: 0.42, 0.38, 0.31'); if (prompt) prompt(); return; }
  if (cmd === 'history')  { write(''); if (window._termHistory) window._termHistory.slice(0,20).forEach((c,i)=>write('  '+(window._termHistory.length-i)+'  '+c)); else write('  (no history)'); write(''); if (prompt) prompt(); return; }
  if (cmd === 'banner')   { if (output.writeln) printBanner(output); else { write('  CYBERGSEC — Ratnesh Raj Dwivedi'); } if (prompt) prompt(); return; }
  if (cmd === 'skills')   { write('  \x1b[33m[LANG]\x1b[0m    Python · C · Bash'); write('  \x1b[33m[TOOLS]\x1b[0m   Wireshark · Metasploit · Nmap · Burp · Splunk · Autopsy'); write('  \x1b[33m[OS]\x1b[0m     Kali · Tails · BlackArch · Whonix'); write('  \x1b[33m[DOMAIN]\x1b[0m  VAPT · Forensics · Threat Intel · OSINT · SocEng'); if (prompt) prompt(); return; }
  if (cmd === 'certs')    { write('  \x1b[33m[GOLD]\x1b[0m  🏅 CEH — IITK'); write('  \x1b[33m[GOLD]\x1b[0m  🔍 CHFI — IITK'); write('  \x1b[32m[SIL]\x1b[0m   🛡️  CC — ISC2'); write('  \x1b[32m[SIL]\x1b[0m   💻 Cybersecurity — Microsoft'); write('  \x1b[32m[SIL]\x1b[0m   🛰️  Geo-Cyber — ISRO'); if (prompt) prompt(); return; }
  if (cmd === 'contact')  { write('  \x1b[33mEmail:\x1b[0m    ratneshd202@gmail.com'); write('  \x1b[33mLinkedIn:\x1b[0m linkedin.com/in/ratnesh-raj-dwivedi'); write('  \x1b[33mGitHub:\x1b[0m   github.com/ratnesh1dwivedi'); if (prompt) prompt(); return; }

  // ── SIMULATION COMMANDS ──
  if (cmd === 'nmap' || cmd.startsWith('nmap '))       { ['  Starting Nmap 7.94','  PORT     STATE  SERVICE','  22/tcp   \x1b[32mopen\x1b[0m   ssh     OpenSSH 8.9p1','  80/tcp   \x1b[32mopen\x1b[0m   http    Apache 2.4.57','  443/tcp  \x1b[32mopen\x1b[0m   https   Apache 2.4.57','  3306/tcp \x1b[31mopen\x1b[0m   mysql   MySQL 8.0.35','  \x1b[33m[!] MySQL port 3306 exposed\x1b[0m'].forEach(l=>write(l)); if (prompt) prompt(); return; }
  if (cmd === 'metasploit' || cmd === 'msfconsole')    { ['  \x1b[31m=[ metasploit v6.3.44 ]=\x1b[0m','  \x1b[90mmsf6\x1b[0m > use exploit/multi/http/struts2_content_type_ognl','  RHOSTS => 192.168.1.100','  \x1b[32m[+] Meterpreter session 1 opened\x1b[0m','  Computer: TARGET  OS: Ubuntu 22.04 x64'].forEach(l=>write(l)); if (prompt) prompt(); return; }
  if (cmd === 'wireshark') { ['  Capturing on eth0...','  Frame 1: \x1b[32m192.168.1.1\x1b[0m → \x1b[33m8.8.8.8\x1b[0m  [DNS: google.com]','  Frame 3: \x1b[31m45.142.212.5\x1b[0m → \x1b[32m192.168.1.100\x1b[0m  [SSH-2.0]','  \x1b[31m[!] Suspicious SSH from threat actor IP\x1b[0m','  10 packets captured'].forEach(l=>write(l)); if (prompt) prompt(); return; }
  if (cmd === 'nikto')    { ['  Nikto v2.1.6','  + Apache/2.4.57','\x1b[31m  + /admin/ found — auth bypass\x1b[0m','\x1b[31m  + /backup/ accessible\x1b[0m','  6544 items: 6 critical'].forEach(l=>write(l)); if (prompt) prompt(); return; }
  if (cmd === 'lynis')    { ['  \x1b[32m[LYNIS] v3.0.9\x1b[0m','\x1b[32m  [+] OpenSSH: PermitRootLogin no\x1b[0m','\x1b[33m  [-] GRUB unprotected\x1b[0m','\x1b[31m  [!] MySQL as root — HIGH RISK\x1b[0m','\x1b[32m  [+] UFW: active\x1b[0m','  Index: 64/100  High:2 Med:7 Low:14'].forEach(l=>write(l)); if (prompt) prompt(); return; }
  if (cmd === 'hashcat')  { ['  hashcat v6.2.6  MD5 dictionary attack','  5f4dcc3b5aa765d61d8327deb882cf99','  \x1b[32m→ password\x1b[0m','  482c811da5d5b4bc6d497ffa98491e38','  \x1b[32m→ password123\x1b[0m','\x1b[31m  Never use unsalted MD5\x1b[0m'].forEach(l=>write(l)); if (prompt) prompt(); return; }
  if (cmd === 'osint')    { ['  \x1b[33m[OSINT] target: example.com\x1b[0m','  [theHarvester]  admin@example.com · hr@example.com','  [Subdomains]    mail · vpn · dev · api','  [Shodan]        22,80,443 open · Apache 2.4','\x1b[33m  [!] SSH banner disclosure\x1b[0m'].forEach(l=>write(l)); if (prompt) prompt(); return; }

  // ── LIVE COMMANDS ──
  if (cmd === 'ip' || cmd === 'myip') {
    write('  Fetching...');
    const r = await safeFetch('https://api.ipify.org?format=json');
    if (r) {
      try {
        const d = await r.json();
        write('  Public IP : \x1b[32m' + sanitizeText(d.ip) + '\x1b[0m');
        const r2 = await safeFetch('https://ipapi.co/' + encodeURIComponent(d.ip) + '/json/');
        if (r2) { const loc = await r2.json(); if (loc.city) write('  Location  : ' + sanitizeText(loc.city + ', ' + loc.region + ', ' + loc.country_name)); if (loc.org) write('  ISP/Org   : ' + sanitizeText(loc.org)); }
      } catch { write('  \x1b[31mParse error\x1b[0m'); }
    } else { write('  \x1b[31mNetwork error\x1b[0m'); }
    if (prompt) prompt(); return;
  }

  if (cmd === 'iss') {
    write('  Querying ISS tracker...');
    const r = await safeFetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (r) {
      try {
        const d = await r.json();
        write('  Latitude  : \x1b[32m' + parseFloat(d.latitude).toFixed(4)  + '°\x1b[0m');
        write('  Longitude : \x1b[32m' + parseFloat(d.longitude).toFixed(4) + '°\x1b[0m');
        write('  Altitude  : \x1b[33m' + parseFloat(d.altitude).toFixed(1)  + ' km\x1b[0m');
        write('  Velocity  : \x1b[33m' + parseFloat(d.velocity).toFixed(1)  + ' km/h\x1b[0m');
        write('  Visibility: ' + sanitizeText(d.visibility));
      } catch { write('  \x1b[31mParse error\x1b[0m'); }
    } else { write('  \x1b[31mISS API unavailable\x1b[0m'); }
    if (prompt) prompt(); return;
  }

  if (cmd === 'weather' || cmd.startsWith('weather ')) {
    const city = sanitizeText(args[1] || 'Kanpur');
    write('  Fetching weather — ' + city + '...');
    const r = await safeFetch('https://wttr.in/' + encodeURIComponent(city) + '?format=j1');
    if (r) {
      try {
        const d = await r.json();
        const c = d.current_condition[0];
        const loc = d.nearest_area?.[0];
        write('  Location  : ' + sanitizeText((loc?.areaName?.[0]?.value || city) + ', ' + (loc?.country?.[0]?.value || '')));
        write('  Condition : ' + sanitizeText(c.weatherDesc[0].value));
        write('  Temp      : \x1b[32m' + c.temp_C + '°C / ' + c.temp_F + '°F\x1b[0m');
        write('  Humidity  : ' + c.humidity + '%');
        write('  Wind      : ' + c.windspeedKmph + ' km/h ' + sanitizeText(c.winddir16Point));
      } catch { write('  \x1b[31mParse error\x1b[0m'); }
    } else { write('  \x1b[31mWeather API unavailable\x1b[0m'); }
    if (prompt) prompt(); return;
  }

  if (cmd === 'launch' || cmd === 'launches') {
    write('  Fetching next launches...');
    const r = await safeFetch('https://fdo.rocketlaunch.live/json/launches/next/5');
    if (r) {
      try {
        const d = await r.json();
        (d.result || []).slice(0, 5).forEach(function (l, i) {
          const n  = sanitizeText(l.name || 'Unknown');
          const pr = sanitizeText(l.provider?.name || '');
          const t  = l.t0 ? new Date(l.t0).toUTCString() : 'TBD';
          const diff = l.t0 ? (new Date(l.t0) - Date.now()) : 0;
          const cd   = diff > 0 ? 'T-' + Math.floor(diff/86400000) + 'd ' + Math.floor((diff%86400000)/3600000) + 'h' : 'LAUNCHED';
          write('  [\x1b[33m' + (i+1) + '\x1b[0m] 🚀 \x1b[36m' + n + '\x1b[0m  ' + pr);
          write('       \x1b[32m' + t + '\x1b[0m  ' + cd);
        });
      } catch { write('  \x1b[31mParse error\x1b[0m'); }
    } else {
      ['  🚀 PSLV-C59 — ISRO · Sriharikota','  🚀 Falcon 9 — SpaceX · Cape Canaveral','  🚀 SLS Artemis IV — NASA'].forEach(l=>write(l));
    }
    if (prompt) prompt(); return;
  }

  if (cmd === 'cve' || cmd === 'cves') {
    write('  Querying NVD...');
    const r = await safeFetch('https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=6&startIndex=0');
    if (r) {
      try {
        const d = await r.json();
        write('  Total in NVD: \x1b[33m' + (d.totalResults||'?').toLocaleString() + '\x1b[0m');
        (d.vulnerabilities || []).slice(0, 6).forEach(function (v) {
          const id   = v.cve.id;
          const sev  = v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'N/A';
          const sc   = v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore    || '?';
          const desc = sanitizeText((v.cve.descriptions?.find(x=>x.lang==='en')?.value||'')).slice(0,65);
          const col  = sev==='CRITICAL'?'\x1b[31m':sev==='HIGH'?'\x1b[33m':'\x1b[32m';
          write('  ' + col + id + ' [' + sev + ' ' + sc + ']\x1b[0m');
          write('    ' + desc);
        });
      } catch { write('  \x1b[31mParse error\x1b[0m'); }
    } else { write('  \x1b[31mNVD rate limited — retry in 30s\x1b[0m'); }
    if (prompt) prompt(); return;
  }

  if (cmd === 'news') {
    write('  Fetching cyber news...');
    const feeds = [
      { url: 'https://feeds.feedburner.com/TheHackersNews', src: 'THN' },
      { url: 'https://www.bleepingcomputer.com/feed/',      src: 'BleepingComputer' },
    ];
    for (const f of feeds) {
      const r = await safeFetch('https://api.allorigins.win/get?url=' + encodeURIComponent(f.url));
      if (r) {
        try {
          const d   = await r.json();
          const xml = new DOMParser().parseFromString(d.contents, 'application/xml');
          const its = Array.from(xml.querySelectorAll('item')).slice(0, 4);
          if (its.length) {
            write('\n  \x1b[33m─── ' + f.src + ' ───\x1b[0m');
            its.forEach(i => write('  \x1b[33m▸\x1b[0m ' + sanitizeText(i.querySelector('title')?.textContent || '').slice(0, 72)));
          }
        } catch {}
      }
    }
    write('');
    if (prompt) prompt(); return;
  }

  if (cmd.startsWith('whois') || cmd === 'whois') {
    const domain = sanitizeText(args[1] || 'google.com').replace(/[^a-z0-9.-]/gi, '');
    write('  Querying RDAP for ' + domain + '...');
    const r = await safeFetch('https://rdap.org/domain/' + encodeURIComponent(domain));
    if (r) {
      try {
        const d = await r.json();
        write('  Domain    : \x1b[32m' + sanitizeText(d.ldhName || domain) + '\x1b[0m');
        write('  Status    : ' + sanitizeText((d.status||[]).slice(0,3).join(' · ')));
        const ns = (d.nameservers||[]).slice(0,4).map(n=>sanitizeText(n.ldhName)).join(', ');
        if (ns) write('  Nameserver: \x1b[33m' + ns + '\x1b[0m');
        const reg = d.entities?.find(e=>e.roles?.includes('registrar'));
        if (reg) { const fn=reg.vcardArray?.[1]?.find(v=>v[0]==='fn'); if(fn) write('  Registrar : ' + sanitizeText(fn[3])); }
      } catch { write('  \x1b[31mParse error\x1b[0m'); }
    } else { write('  \x1b[31mRDAP lookup failed\x1b[0m'); }
    if (prompt) prompt(); return;
  }

  if (cmd === 'nslookup' || cmd.startsWith('nslookup ')) {
    const host = sanitizeText(args[1] || 'google.com').replace(/[^a-z0-9.-]/gi, '');
    write('  Resolving ' + host + '...');
    const r = await safeFetch('https://dns.google/resolve?name=' + encodeURIComponent(host) + '&type=A');
    if (r) {
      try {
        const d = await r.json();
        write('  Server: 8.8.8.8 (Google DNS)');
        write('  Name: ' + sanitizeText(host));
        (d.Answer || []).slice(0,4).forEach(a => write('  \x1b[33mAddress: ' + sanitizeText(a.data) + '\x1b[0m'));
        if (!(d.Answer?.length)) write('  No records found');
      } catch { write('  \x1b[31mParse error\x1b[0m'); }
    } else { write('  \x1b[31mDNS query failed\x1b[0m'); }
    if (prompt) prompt(); return;
  }

  if (cmd === 'ping' || cmd.startsWith('ping ')) {
    const host = sanitizeText(args[1] || '1.1.1.1').replace(/[^a-z0-9.-]/gi, '');
    write('  PING ' + host + ' — measuring latency...');
    const t0 = performance.now();
    const r  = await safeFetch('https://dns.google/resolve?name=' + encodeURIComponent(host) + '&type=A');
    if (r) {
      const ms = (performance.now() - t0).toFixed(1);
      for (let i = 1; i <= 4; i++) write('  64 bytes from ' + host + ': icmp_seq=' + i + ' ttl=56 time=' + (parseFloat(ms) + Math.random()*4-2).toFixed(1) + ' ms');
      write('  RTT ~\x1b[32m' + ms + 'ms\x1b[0m');
    } else { write('  \x1b[31mRequest timeout\x1b[0m'); }
    if (prompt) prompt(); return;
  }

  // Unknown command
  write('\x1b[31m  bash: ' + sanitizeText(raw) + ': command not found\x1b[0m');
  write('  Type \x1b[32mhelp\x1b[0m for available commands  |  ↑↓ for history');
  if (prompt) prompt();
}

function printHelp(write) {
  write('');
  write('  \x1b[1;33m┌─ COMMANDS ─────────────────────────────────────────────────────┐\x1b[0m');
  [
    ['whoami','about me'],['pwd','working directory'],['ls','list files'],
    ['uname -a','system info'],['date','current date/time'],['uptime','session uptime'],
    ['history','command history'],['banner','show banner'],
    ['skills','technical skills'],['certs','certifications'],['contact','contact info'],
    ['ip','public IP + location [LIVE]'],['iss','ISS position [LIVE]'],
    ['weather [city]','live weather [LIVE]'],['launch','rocket launches [LIVE]'],
    ['cve','latest CVEs from NVD [LIVE]'],['news','cyber news headlines [LIVE]'],
    ['whois [domain]','RDAP domain lookup [LIVE]'],['nslookup [host]','DNS lookup [LIVE]'],
    ['ping [host]','latency test [LIVE]'],
    ['nmap','port scan simulation'],['metasploit','msfconsole demo'],
    ['wireshark','packet capture demo'],['nikto','web scanner demo'],
    ['lynis','system audit demo'],['hashcat','hash crack demo'],['osint','OSINT demo'],
    ['clear','clear terminal'],
  ].forEach(([c,d]) => write('  \x1b[1;33m│\x1b[0m  \x1b[32m' + c.padEnd(16) + '\x1b[0m' + d.padEnd(38) + '\x1b[1;33m│\x1b[0m'));
  write('  \x1b[1;33m└────────────────────────────────────────────────────────────────┘\x1b[0m');
  write('');
}

/* Fallback terminal for when xterm.js CDN fails */
function buildFallbackTerm(container) {
  container.style.cssText = 'background:#010301;color:#00ff88;font-family:"Share Tech Mono","Courier New",monospace;font-size:13px;padding:12px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;height:100%';
  const out = document.createElement('div');
  out.style.cssText = 'flex:1;overflow-y:auto;white-space:pre-wrap;word-break:break-all';
  const inp = document.createElement('div');
  inp.style.cssText = 'display:flex;align-items:center;gap:6px;border-top:1px solid rgba(0,255,136,.1);padding-top:8px;flex-shrink:0;padding-bottom:env(safe-area-inset-bottom,0px)';
  const ps = document.createElement('span'); ps.style.color = '#d4af37'; ps.textContent = 'ratnesh@cybergsec:~$ ';
  const input = document.createElement('input');
  input.style.cssText = 'flex:1;background:transparent;border:none;outline:none;color:#00ff88;font-family:inherit;font-size:inherit;caret-color:#00ff88;min-width:0';
  input.setAttribute('autocomplete','off'); input.setAttribute('autocorrect','off'); input.setAttribute('autocapitalize','off'); input.setAttribute('spellcheck','false');
  inp.append(ps, input); container.append(out, inp);

  const hist = []; let hi = -1;
  function print(text) {
    const line = document.createElement('div');
    line.textContent = text.replace(/\x1b\[[0-9;]*m/g, '');  // strip ANSI for plain text
    out.appendChild(line); out.scrollTop = out.scrollHeight;
  }

  // Print banner
  print('  ██████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗ ███████╗███████╗ ██████╗');
  print('  Ratnesh Raj Dwivedi  ·  CYBERGSEC  ·  Cybersecurity & Digital Forensics');
  print('  CEH · CHFI · ISC2-CC · ICTCS-2025');
  print('─────────────────────────────────────────────────────────────────────');
  print('  Type help for commands  ·  ↑↓ arrow keys for history');
  print('');

  input.addEventListener('keydown', async function (e) {
    if (e.key === 'Enter') {
      const raw = input.value;
      const cmd = raw.trim().toLowerCase();
      print('ratnesh@cybergsec:~$ ' + raw);
      if (cmd) hist.unshift(cmd);
      hi = -1; input.value = '';
      if (!cmd) return;
      window._termHistory = hist;
      await runCmd(cmd, raw, print, null);
      print('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); if (hi < hist.length-1) { hi++; input.value = hist[hi]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); if (hi > 0) { hi--; input.value = hist[hi]; } else { hi=-1; input.value=''; }
    }
  });

  input.focus();
}

/* Terminal page controls (font size, tabs, clear) */
(function termControls() {
  let fontSize = 14;
  const fpU = document.getElementById('tp-font-up');
  const fpD = document.getElementById('tp-font-dn');
  const clr = document.getElementById('tp-clear-btn');

  if (fpU) fpU.addEventListener('click', function () {
    fontSize = Math.min(22, fontSize + 1);
    if (window._xtermInstance) window._xtermInstance.options.fontSize = fontSize;
    window.dispatchEvent(new Event('resize'));
  });
  if (fpD) fpD.addEventListener('click', function () {
    fontSize = Math.max(9, fontSize - 1);
    if (window._xtermInstance) window._xtermInstance.options.fontSize = fontSize;
    window.dispatchEvent(new Event('resize'));
  });
  if (clr) clr.addEventListener('click', function () {
    if (window._xtermInstance) window._xtermInstance.clear();
  });

  // Network status
  function updNet() {
    const el  = document.getElementById('tp-net');
    const dot = document.getElementById('tp-status-dot');
    if (el)  el.textContent  = navigator.onLine ? 'ONLINE' : 'OFFLINE';
    if (dot) dot.className   = 'tsb-dot' + (navigator.onLine ? '' : ' o');
  }
  updNet();
  window.addEventListener('online',  updNet);
  window.addEventListener('offline', updNet);

  // Back to portfolio on red dot click
  const tpClose = document.getElementById('tp-close');
  if (tpClose) tpClose.addEventListener('click', function () {
    document.querySelector('.nb[data-pg="port"]')?.click();
  });

  // Fullscreen on green dot
  const tpMax = document.getElementById('tp-max');
  if (tpMax) tpMax.addEventListener('click', function () {
    const el = document.getElementById('tp');
    if (el?.requestFullscreen) el.requestFullscreen().catch(function(){});
  });
})();

/* Command counter */
window._termHistory = [];
window.addEventListener('termcmd', function () {
  const el = document.getElementById('tp-cmd-count');
  if (el) el.textContent = String(parseInt(el.textContent || '0') + 1);
});
