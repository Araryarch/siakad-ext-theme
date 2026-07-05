const STATE = {
  enabled: true,
  styleEl: null,
  headerEl: null,
  animStyleEl: null,
  banner: document.querySelector('img[src*="SIAKAD_header"]'),
  customHero: null,
  censorBtn: null,
}

function gradeColors() {
  const gradeColors = {
    'A': '#059669', 'AB': '#0284C7', 'B': '#2563EB',
    'BC': '#7C3AED', 'C': '#D97706', 'CD': '#EA580C',
    'D': '#DC2626', 'DE': '#DC2626', 'E': '#991B1B', '_': '#94A3B8',
  }
  document.querySelectorAll('td[align="center"]').forEach(td => {
    if (td.querySelector('em')) return
    const grade = td.textContent.trim()
    const color = gradeColors[grade]
    if (color) {
      td.style.color = color
      td.style.fontWeight = '700'
      td.style.background = color + '18'
      td.style.borderRadius = '6px'
      td.style.fontSize = '14px'
      td.style.letterSpacing = '1px'
    }
  })
}

function clearGradeColors() {
  document.querySelectorAll('td[align="center"]').forEach(td => {
    if (td.querySelector('em')) return
    const grade = td.textContent.trim()
    if (['A', 'AB', 'B', 'BC', 'C', 'CD', 'D', 'DE', 'E', '_'].includes(grade)) {
      td.style.color = ''
      td.style.fontWeight = ''
      td.style.background = ''
      td.style.borderRadius = ''
      td.style.fontSize = ''
      td.style.letterSpacing = ''
    }
  })
}

function setupCensorTargets() {
  // Find cells that should be censored (Grades and S*N, excluding _ and 0)
  const tds = document.querySelectorAll('tr.NormalBG td, tr.AlternateBG td');
  tds.forEach(td => {
    const text = td.textContent.trim();
    // In SIAKAD, grades are usually right aligned or center aligned numbers/letters
    // 4th and 5th columns in nilaipersem, 3rd column in transkrip
    if (['A', 'AB', 'B', 'BC', 'C', 'CD', 'D', 'DE', 'E'].includes(text) || 
        (parseFloat(text) > 0 && text !== '0')) {
      // Don't blur Mata Kuliah or Kode. Check if it's a short string (like grade or number)
      if (text.length <= 4) {
        td.classList.add('siapad-censor-target');
      }
    }
  });
  
  // Also target IPS / IPK values in the footer
  const strongs = document.querySelectorAll('tr.AlternateBG td strong');
  strongs.forEach(strong => {
    if (strong.textContent.includes('IPS') || strong.textContent.includes('IPK')) {
      const td = strong.closest('td').nextElementSibling;
      if (td && parseFloat(td.textContent) > 0) {
        td.classList.add('siapad-censor-target');
      }
    }
  });
}

function injectCensorButton() {
  if (STATE.censorBtn) return;
  const btn = document.createElement('button');
  btn.id = 'siapad-censor-btn';
  btn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
      <line x1="2" y1="2" x2="22" y2="22"></line>
    </svg>
  `;
  btn.style.cssText = `
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background: #09090b;
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999;
    transition: transform 0.2s, background 0.2s;
  `;
  
  btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';
  
  let isCensored = false;
  btn.onclick = (e) => {
    e.preventDefault();
    isCensored = !isCensored;
    if (isCensored) {
      document.body.classList.add('siapad-censor-active');
      btn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
      btn.style.background = '#2563eb';
    } else {
      document.body.classList.remove('siapad-censor-active');
      btn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
          <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
      `;
      btn.style.background = '#09090b';
    }
  };
  
  document.body.appendChild(btn);
  STATE.censorBtn = btn;
}

function removeCensorButton() {
  if (STATE.censorBtn) {
    STATE.censorBtn.remove();
    STATE.censorBtn = null;
    document.body.classList.remove('siapad-censor-active');
  }
}

function addHeader() {
  const banner = STATE.banner
  if (!banner) return
  const header = document.createElement('div')
  header.id = 'siapad-header'
  header.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:12px">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="white" fill-opacity="0.2"/>
          <text x="16" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="Inter">ITS</text>
        </svg>
        <div>
          <div style="font-size:14px;font-weight:600;color:white">SIAKAD-ITS</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.7)">Sistem Informasi Akademik</div>
        </div>
      </div>
    </div>`
  header.style.cssText = 'background:linear-gradient(135deg,#003D7A,#0056A4);padding:12px 24px;box-shadow:0 2px 8px rgba(0,0,0,0.15);position:sticky;top:0;z-index:999'
  banner.parentNode.insertBefore(header, banner.nextSibling)
  STATE.headerEl = header
}

function removeHeader() {
  if (STATE.headerEl) {
    STATE.headerEl.remove()
    STATE.headerEl = null
  }
}

function injectCSS() {
  if (STATE.styleEl) return
  const url = chrome.runtime.getURL('content.css')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  link.id = 'siapad-css'
  document.head.appendChild(link)
  STATE.styleEl = link

  const animStyle = document.createElement('style')
  animStyle.id = 'siapad-anim'
  animStyle.textContent = `
    @keyframes siapadFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    div[align="center"] > table { animation: siapadFadeIn 0.4s ease-out; }
    div[style*="background-color:#efefef"] > p {
      animation: siapadFadeIn 0.4s ease-out; animation-fill-mode: both;
    }
    div[style*="background-color:#efefef"] > p:nth-child(2) { animation-delay: 0.05s; }
    div[style*="background-color:#efefef"] > p:nth-child(3) { animation-delay: 0.1s; }
    div[style*="background-color:#efefef"] > p:nth-child(4) { animation-delay: 0.15s; }
    div[style*="background-color:#efefef"] > p:nth-child(5) { animation-delay: 0.2s; }
    div[style*="background-color:#efefef"] > p:nth-child(6) { animation-delay: 0.25s; }
    div[style*="background-color:#efefef"] > p:nth-child(7) { animation-delay: 0.3s; }
    div[style*="background-color:#efefef"] > p:nth-child(8) { animation-delay: 0.35s; }
  `
  document.head.appendChild(animStyle)
  STATE.animStyleEl = animStyle
}

function removeCSS() {
  if (STATE.styleEl) {
    STATE.styleEl.remove()
    STATE.styleEl = null
  }
  if (STATE.animStyleEl) {
    STATE.animStyleEl.remove()
    STATE.animStyleEl = null
  }
}

function buildHero() {
  if (STATE.customHero) return;
  const img = document.querySelector('img[src*="selamatdatang"]');
  if (!img) return;
  
  let userName = "Mahasiswa";
  const infoBar = document.querySelector('form[name="fMenu"] > table > tbody > tr:nth-child(2)');
  if (infoBar) {
    const text = infoBar.textContent;
    const match = text.match(/User ID:\s*[^,]+,\s*([^\n\r]+)/);
    if (match && match[1]) {
      userName = match[1].replace('Hak Akses:', '').trim();
    }
  }

  const container = img.closest('table');
  
  const hero = document.createElement('div');
  hero.id = 'siapad-modern-hero';
  hero.innerHTML = `
    <div style="min-height: calc(100vh - 100px); display: flex; align-items: center; justify-content: center; width: 100%; padding: 40px 20px; box-sizing: border-box; background: rgba(0, 0, 0, 0.5);">
      <div style="width: 100%; max-width: 1000px; display: flex; flex-direction: column; align-items: center; text-align: center; animation: siapadFadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: rgba(255, 255, 255, 0.7); margin-bottom: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
          Welcome Back
        </div>
        <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 72px; font-weight: 300; margin: 0 0 32px 0; letter-spacing: -1px; line-height: 1.1; color: #ffffff; text-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          Build your <br/><span style="font-weight: 700;">academic future.</span>
        </h1>
        <div style="width: 40px; height: 2px; background: rgba(255, 255, 255, 0.5); margin-bottom: 32px;"></div>
        <p style="font-family: 'Inter', sans-serif; font-size: 20px; color: rgba(255, 255, 255, 0.9); margin: 0; max-width: 600px; line-height: 1.8; font-weight: 300; text-shadow: 0 2px 8px rgba(0,0,0,0.4);">
          <strong style="color: #ffffff; font-weight: 600;">${userName}</strong>, SIAKAD helps you manage your schedule, grades, and campus life with peace of mind.
        </p>
      </div>
    </div>
  `;
  
  const imgRow = img.closest('tr');
  if (imgRow) imgRow.style.display = 'none';
  
  const formMenu = document.querySelector('form[name="fMenu"]');
  if (formMenu) {
    formMenu.parentNode.insertBefore(hero, formMenu.nextSibling);
  } else {
    document.body.insertBefore(hero, document.body.firstChild);
  }
  
  STATE.customHero = hero;
}

function removeHero() {
  if (STATE.customHero) {
    STATE.customHero.remove();
    STATE.customHero = null;
  }
  const img = document.querySelector('img[src*="selamatdatang"]');
  if (img) {
    const imgRow = img.closest('tr');
    if (imgRow) imgRow.style.display = '';
  }
}

function groupSemesterTables() {
  if (!window.location.pathname.includes('data_nilaipersem.php')) return;
  const form = document.querySelector('form[name="sipform"]');
  if (!form) return;
  
  if (form.querySelector('.semester-card')) return; // Already grouped
  
  const children = Array.from(form.childNodes);
  let currentGroup = null;
  
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    
    if (node.tagName === 'TABLE' && node.querySelector('td[colspan="5"] > b')) {
      const headerText = node.querySelector('td[colspan="5"] > b').textContent;
      if (headerText.includes(' - Gasal') || headerText.includes(' - Genap')) {
        currentGroup = document.createElement('div');
        currentGroup.className = 'semester-card';
        form.insertBefore(currentGroup, node);
      }
    }
    
    if (currentGroup) {
      if (node.tagName === 'TABLE' || node.tagName === 'BR' || node.nodeType === Node.TEXT_NODE) {
        currentGroup.appendChild(node);
      }
    }
  }
}

function enable() {
  STATE.enabled = true
  injectCSS()
  gradeColors()
  setupCensorTargets()
  injectCensorButton()
  buildHero()
  groupSemesterTables()
  if (STATE.banner) STATE.banner.style.display = 'none'

  const fs = window.top.document.querySelector('frameset');
  if (fs && fs.rows && fs.rows.includes(',')) {
    if (!fs.dataset.origRows) fs.dataset.origRows = fs.rows;
    fs.rows = "0, *";
  }
}

function disable() {
  STATE.enabled = false
  removeCSS()
  removeHeader()
  clearGradeColors()
  removeCensorButton()
  removeHero()
  if (STATE.banner) STATE.banner.style.display = ''

  const fs = window.top.document.querySelector('frameset');
  if (fs && fs.dataset.origRows) {
    fs.rows = fs.dataset.origRows;
  }
}

chrome.storage.sync.get('siapadEnabled', (data) => {
  if (data.siapadEnabled !== false) {
    enable()
  } else {
    disable()
  }
})

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'toggleSiapad') {
    if (msg.enabled) {
      enable()
    } else {
      disable()
    }
  }
})
