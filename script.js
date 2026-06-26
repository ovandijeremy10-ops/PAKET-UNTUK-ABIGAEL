/**
 * script.js – Love Express
 * Orchestrates all screen transitions, animations, and effects.
 */

'use strict';

/* ═══════════════════════════════════════════════
   DOM Shortcuts
   ═══════════════════════════════════════════════ */
const $  = (id) => document.getElementById(id);
const screens = [...document.querySelectorAll('.screen')];

/* ═══════════════════════════════════════════════
   1. BACKGROUND — Particles & Floating Hearts
   ═══════════════════════════════════════════════ */
function initBackgroundParticles() {
  const container = $('bgParticles');
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div');
    el.className = 'bg-particle';
    const size = 20 + Math.random() * 80; // px
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${10 + Math.random() * 14}s;
      animation-delay: ${-Math.random() * 12}s;
    `;
    container.appendChild(el);
  }
}

function initFloatingHearts(count = 14) {
  const container = $('floatingHeartsBg');
  container.innerHTML = ''; // allow re-init
  const emojis = ['❤️', '💕', '💖', '💗', '💓'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'bg-heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const size = 0.9 + Math.random() * 1.1;
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${size}rem;
      animation-duration: ${8 + Math.random() * 10}s;
      animation-delay: ${-Math.random() * 10}s;
    `;
    container.appendChild(el);
  }
}

/* ═══════════════════════════════════════════════
   2. SCREEN TRANSITIONS
   ═══════════════════════════════════════════════ */
function goTo(index) {
  screens.forEach((s, i) => {
    if (i === index) {
      s.classList.add('active');
      // Scroll to top inside screen
      s.scrollTop = 0;
    } else {
      s.classList.remove('active');
    }
  });
}

/* ═══════════════════════════════════════════════
   3. SCREEN 1 → SCREEN 2  (Track button)
   ═══════════════════════════════════════════════ */
$('trackBtn').addEventListener('click', () => {
  goTo(1);
  startLoading();
});

/* ═══════════════════════════════════════════════
   4. SCREEN 2 — Loading Progress
   ═══════════════════════════════════════════════ */
const PROGRESS_STEPS = [
  { pct: 20,  label: 'Locating package...' },
  { pct: 45,  label: 'Verifying contents...' },
  { pct: 68,  label: 'Preparing delivery...' },
  { pct: 90,  label: 'Assigning courier...' },
  { pct: 100, label: 'Package is ready! 💖' },
];

function startLoading() {
  const fill   = $('progressFill');
  const pct    = $('progressPct');
  const label  = $('loadingLabel');

  let stepIndex = 0;

  // Animate through each step
  const interval = setInterval(() => {
    if (stepIndex >= PROGRESS_STEPS.length) {
      clearInterval(interval);
      // Brief pause then switch to truck scene
      setTimeout(showTruckScene, 600);
      return;
    }
    const { pct: p, label: l } = PROGRESS_STEPS[stepIndex];
    fill.style.width  = p + '%';
    pct.textContent   = p + '%';
    label.textContent = l;
    stepIndex++;
  }, 900);
}

function showTruckScene() {
  $('loadingCard').style.display = 'none';
  const scene = $('truckScene');
  scene.style.display = 'flex';

  // After truck animation finishes (~3.8s), show Delivered card
  setTimeout(() => {
    const card = $('deliveredCard');
    card.style.display = 'block';
    // Trigger reflow for animation
    void card.offsetWidth;
  }, 3900);
}

/* ═══════════════════════════════════════════════
   5. SCREEN 2 → SCREEN 3  (Open Package button)
   ═══════════════════════════════════════════════ */
$('openPkgBtn').addEventListener('click', () => {
  goTo(2);
});

/* ═══════════════════════════════════════════════
   6. SCREEN 3 — Package tap / open
   ═══════════════════════════════════════════════ */
const packageWrap = $('packageWrap');

packageWrap.addEventListener('click', openPackage);
packageWrap.addEventListener('touchend', (e) => {
  e.preventDefault();
  openPackage();
});

let packageOpened = false;

function openPackage() {
  if (packageOpened) return;
  packageOpened = true;

  // Remove shake, add open class
  packageWrap.classList.add('opening');
  packageWrap.classList.add('opened');

  $('tapHint').style.opacity = '0';

  // Spawn sparkles + confetti
  spawnSparkles();
  launchConfetti(60);

  // After box animation settles, go to screen 4
  setTimeout(() => goTo(3), 1600);
}

function spawnSparkles() {
  const container = $('sparkleContainer');
  const glyphs = ['✨', '⭐', '💛', '💫', '🌟', '❤️', '💖'];
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div');
    el.className = 'sparkle';
    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    const angle = Math.random() * 360;
    const dist  = 80 + Math.random() * 130;
    const rad   = (angle * Math.PI) / 180;
    el.style.setProperty('--tx', `${Math.cos(rad) * dist}px`);
    el.style.setProperty('--ty', `${Math.sin(rad) * dist}px`);
    el.style.setProperty('--rot', `${-180 + Math.random() * 360}deg`);
    el.style.animationDelay = Math.random() * 0.4 + 's';
    el.style.fontSize = (1.1 + Math.random() * 1.2) + 'rem';
    container.appendChild(el);
    // Remove after animation
    setTimeout(() => el.remove(), 1800);
  }
}

/* ═══════════════════════════════════════════════
   7. SCREEN 4 — Envelope + Letter
   ═══════════════════════════════════════════════ */
// When screen 4 becomes active, animate
function initScreen4() {
  const envelope   = document.querySelector('.envelope');
  const letterCard = $('letterCard');
  const lines      = document.querySelectorAll('.letter-line');
  const acceptBtn  = $('acceptBtn');

  // Open envelope flap after 1.2s
  setTimeout(() => envelope.classList.add('open'), 1200);

  // Show letter card after 2s
  setTimeout(() => {
    letterCard.style.display = 'block';
    void letterCard.offsetWidth; // reflow
  }, 2000);

  // Animate letter lines one by one
  lines.forEach((line) => {
    const delay = parseInt(line.dataset.delay, 10);
    setTimeout(() => line.classList.add('visible'), 2000 + delay);
  });

  // Show accept button after all lines have appeared
  const lastDelay = Math.max(...[...lines].map(l => parseInt(l.dataset.delay)));
  setTimeout(() => {
    acceptBtn.style.display = 'flex';
    void acceptBtn.offsetWidth;
  }, 2000 + lastDelay + 800);
}

/* ═══════════════════════════════════════════════
   8. SCREEN 4 → SCREEN 5  (Accept button)
   ═══════════════════════════════════════════════ */
$('acceptBtn').addEventListener('click', () => {
  launchConfetti(120);
  burstHearts();
  setTimeout(() => goTo(4), 500);
});

/* ═══════════════════════════════════════════════
   9. CONFETTI  (Canvas-based, pure JS)
   ═══════════════════════════════════════════════ */
const confettiCanvas = $('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];
let confettiRaf    = null;

function resizeCanvas() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const CONFETTI_COLORS = [
  '#FF5E8A', '#FFB3C8', '#ff8fab', '#ffd6e7',
  '#ffcc00', '#ff6b9d', '#c9184a', '#fff',
];

function launchConfetti(count = 80) {
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x:     Math.random() * window.innerWidth,
      y:     -10 - Math.random() * 80,
      w:     7  + Math.random() * 8,
      h:     4  + Math.random() * 5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      speed: 2.5 + Math.random() * 3,
      angle: Math.random() * Math.PI * 2,
      spin:  (Math.random() - 0.5) * 0.18,
      drift: (Math.random() - 0.5) * 1.2,
      life:  1,
    });
  }

  if (!confettiRaf) animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces = confettiPieces.filter(p => p.life > 0);

  confettiPieces.forEach(p => {
    p.y     += p.speed;
    p.x     += p.drift;
    p.angle += p.spin;
    if (p.y > window.innerHeight - 40) p.life -= 0.025;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle   = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  if (confettiPieces.length > 0) {
    confettiRaf = requestAnimationFrame(animateConfetti);
  } else {
    confettiRaf = null;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* ═══════════════════════════════════════════════
   10. HEART BURST (Final screen)
   ═══════════════════════════════════════════════ */
function burstHearts() {
  const container = $('floatingHeartsBg');
  // Add extra hearts for a burst effect
  const emojis = ['❤️', '💖', '💗', '💓', '💕'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'bg-heart';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const size = 1.2 + Math.random() * 2;
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${size}rem;
      animation-duration: ${5 + Math.random() * 5}s;
      animation-delay: ${Math.random() * 1}s;
      opacity: 0;
    `;
    container.appendChild(el);
    // Remove after animation
    setTimeout(() => el.remove(), 10000);
  }
}

/* ═══════════════════════════════════════════════
   11. SCREEN CHANGE OBSERVER
       Run screen-specific setup when it activates
   ═══════════════════════════════════════════════ */
const screenObserver = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    if (m.target.id === 'screen4' && m.target.classList.contains('active')) {
      initScreen4();
    }
  });
});

screens.forEach(s => {
  screenObserver.observe(s, { attributes: true, attributeFilter: ['class'] });
});

/* ═══════════════════════════════════════════════
   12. INIT
   ═══════════════════════════════════════════════ */
(function init() {
  initBackgroundParticles();
  initFloatingHearts(16);
  // Screen 1 is already active via HTML class
})();
