// ---- WhatsApp number (edit this to the number that should receive chats) ----
const WHATSAPP_NUMBER = '919928930407'; // country code + number, no + or spaces

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.textContent = '☰';
    }));
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  injectWhatsAppButton();
  pingVisit();
});

function injectWhatsAppButton() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="wa-tooltip" id="waTooltip">Chat with us</div>
    <a class="wa-float" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I have a fabrication query for Navin Iron Industries.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 32 32" fill="#fff" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.34.663 4.523 1.813 6.383L4 29l7.828-1.762A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3Zm0 21.818a9.77 9.77 0 0 1-4.98-1.363l-.357-.212-4.646 1.046 1.02-4.53-.234-.372A9.78 9.78 0 0 1 5.182 15c0-5.964 4.854-10.818 10.819-10.818S26.818 9.036 26.818 15 21.965 24.818 16.001 24.818Zm5.61-7.324c-.307-.154-1.816-.897-2.098-1-.281-.103-.486-.154-.69.154-.205.307-.792 1-.972 1.205-.179.205-.358.23-.665.077-.307-.154-1.296-.478-2.469-1.524-.912-.813-1.528-1.817-1.707-2.124-.179-.307-.019-.473.135-.626.139-.138.307-.358.46-.538.154-.179.205-.307.307-.512.103-.205.051-.384-.026-.538-.077-.154-.69-1.665-.946-2.28-.249-.598-.502-.517-.69-.527l-.588-.01a1.13 1.13 0 0 0-.818.384c-.281.307-1.073 1.05-1.073 2.562s1.099 2.972 1.252 3.177c.154.205 2.163 3.303 5.24 4.632.732.316 1.303.505 1.748.646.734.234 1.403.2 1.932.121.589-.088 1.816-.742 2.072-1.46.256-.717.256-1.332.179-1.46-.077-.128-.281-.205-.588-.36Z"/>
      </svg>
    </a>
  `;
  wrap.style.display = 'contents';
  document.body.appendChild(wrap);

  const btn = document.querySelector('.wa-float');
  const tip = document.getElementById('waTooltip');
  if (btn && tip) {
    btn.addEventListener('mouseenter', () => tip.style.opacity = '1');
    btn.addEventListener('mouseleave', () => tip.style.opacity = '0');
  }
}

// Sends a lightweight "someone visited" ping to the backend, which emails
// navinironindustries@gmail.com (with a cooldown so it doesn't spam per pageview).
function pingVisit() {
  let visitorId = localStorage.getItem('nii_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('nii_visitor_id', visitorId);
  }
  fetch('/api/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId, page: window.location.pathname })
  }).catch(() => { /* fail silently — never block the page for this */ });
}
