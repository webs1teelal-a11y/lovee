/* ══════════════════════════════════════
   APP.JS — Combined Login + Main Logic
══════════════════════════════════════ */

/* ── 1. FLOATING HEARTS BACKGROUND ── */
(function spawnHearts() {
  const bg = document.getElementById('heartsBg');
  const symbols = ['❤️', '💕', '💗', '💖', '🩷', '💓'];
  for (let i = 0; i < 25; i++) {
    const el = document.createElement('span');
    el.classList.add('heart-particle');
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (0.7 + Math.random() * 1.1) + 'rem';
    el.style.animationDuration = (8 + Math.random() * 12) + 's';
    el.style.animationDelay = (Math.random() * 10) + 's';
    bg.appendChild(el);
  }
})();

/* ══════════════════════════════════════
   LOGIN PAGE LOGIC
══════════════════════════════════════ */

const CORRECT_PASSWORD = 'love-you';

function toggleEye() {
  const input = document.getElementById('passwordInput');
  const btn = document.getElementById('eyeBtn');
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.add('show');
  const group = document.querySelector('.input-group');
  group.classList.remove('shake');
  void group.offsetWidth;
  group.classList.add('shake');
  setTimeout(() => group.classList.remove('shake'), 500);
}

function hideError() {
  const el = document.getElementById('errorMsg');
  el.classList.remove('show');
}

function handleEnter() {
  const input = document.getElementById('passwordInput');
  const btn = document.getElementById('enterBtn');
  const wrap = document.getElementById('loadingWrap');
  const bar = document.getElementById('loadingBar');
  const val = input.value.trim();

  hideError();

  if (!val) {
    showError('💕 Please enter the secret password!');
    input.focus();
    return;
  }

  if (val !== CORRECT_PASSWORD) {
    showError('❌ Wrong password, try again habibi!');
    input.value = '';
    input.focus();
    return;
  }

  /* Correct! Start loading then show main page */
  btn.disabled = true;
  input.disabled = true;
  wrap.style.display = 'block';

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 5 + 2;
    bar.style.width = Math.min(progress, 98) + '%';
    if (progress >= 98) {
      clearInterval(interval);
      bar.style.width = '100%';
      setTimeout(() => {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainPage').classList.remove('hidden');
        initMainPage();
      }, 500);
    }
  }, 55);
}

/* ══════════════════════════════════════
   MAIN PAGE LOGIC
══════════════════════════════════════ */

function initMainPage() {
  spawnFooterHearts();
  document.body.style.overflow = 'hidden';
  runIntro();
}

/* ── INTRO ANIMATION ── */
const introWords = ['I', 'Love', 'You', 'So', 'Much ❤️'];
let introIdx = 0;
let introRunning = true;

function runIntro() {
  const container = document.getElementById('introWords');
  container.innerHTML = '';
  introRunning = true;

  function showWord(idx) {
    if (!introRunning) return;
    if (idx >= introWords.length) {
      setTimeout(endIntro, 900);
      return;
    }

    const prev = container.querySelector('.intro-word');
    if (prev) {
      prev.classList.add('hide');
      setTimeout(() => { if (prev.parentNode) prev.remove(); }, 600);
    }

    const word = document.createElement('div');
    word.classList.add('intro-word');
    word.textContent = introWords[idx];
    container.appendChild(word);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => word.classList.add('show'));
    });

    setTimeout(() => showWord(idx + 1), 1100);
  }

  showWord(0);
}

function endIntro() {
  introRunning = false;
  const intro = document.getElementById('introSection');
  intro.classList.add('fade-out');
  setTimeout(() => {
    intro.style.display = 'none';
    document.body.style.overflow = '';
    triggerReveal();
    setTimeout(initGame, 100);
  }, 800);
}

function skipIntro() {
  introRunning = false;
  endIntro();
}

/* ── SCROLL REVEAL ── */
function triggerReveal() {
  const items = document.querySelectorAll('.reveal-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => observer.observe(el));
}

/* ── MUSIC PLAYER ── */
let isPlaying = false;

function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('playBtn');
  const vinyl = document.getElementById('vinyl');
  const bars = document.getElementById('musicBars');

  if (isPlaying) {
    audio.pause();
    btn.textContent = '▶';
    vinyl.classList.remove('spinning');
    bars.classList.remove('active');
    isPlaying = false;
  } else {
    audio.play().catch(() => {
      // Audio file not found — silent fail (placeholder)
    });
    btn.textContent = '⏸';
    vinyl.classList.add('spinning');
    bars.classList.add('active');
    isPlaying = true;
  }
}

/* ── FOOTER HEARTS ── */
function spawnFooterHearts() {
  const container = document.getElementById('footerHearts');
  if (!container) return;
  const symbols = ['❤️', '💕', '💗'];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('span');
    el.classList.add('footer-heart');
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.bottom = (Math.random() * 20) + 'px';
    el.style.animationDuration = (5 + Math.random() * 8) + 's';
    el.style.animationDelay = (Math.random() * 6) + 's';
    container.appendChild(el);
  }
}

/* ── MEMORY MATCHING GAME ── */
const CARD_EMOJIS = ['🌹', '💍', '🌙'];
let gameCards = [];
let flippedCards = [];
let matchedPairs = 0;
let gameBlocked = false;
const TOTAL_PAIRS = CARD_EMOJIS.length;

function initGame() {
  const pairs = [...CARD_EMOJIS, ...CARD_EMOJIS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  const grid = document.getElementById('gameGrid');
  grid.innerHTML = '';
  gameCards = [];
  flippedCards = [];
  matchedPairs = 0;
  gameBlocked = false;

  pairs.forEach((emoji, idx) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.idx = idx;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">💖</div>
        <div class="card-back">${emoji}</div>
      </div>`;
    card.addEventListener('click', onCardClick);
    grid.appendChild(card);
    gameCards.push(card);
  });

  gameCards.forEach(c => c.classList.add('flipped'));
  setTimeout(() => {
    gameCards.forEach(c => c.classList.remove('flipped'));
  }, 2000);
}

function onCardClick(e) {
  const card = e.currentTarget;
  if (gameBlocked) return;
  if (card.classList.contains('flipped')) return;
  if (card.classList.contains('matched')) return;

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    gameBlocked = true;
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = flippedCards;
  if (a.dataset.emoji === b.dataset.emoji) {
    setTimeout(() => {
      a.classList.add('matched');
      b.classList.add('matched');
      matchedPairs++;
      flippedCards = [];
      gameBlocked = false;
      if (matchedPairs === TOTAL_PAIRS) {
        setTimeout(onGameWin, 500);
      }
    }, 400);
  } else {
    a.classList.add('shake');
    b.classList.add('shake');
    setTimeout(() => {
      a.classList.remove('flipped', 'shake');
      b.classList.remove('flipped', 'shake');
      flippedCards = [];
      gameBlocked = false;
    }, 900);
  }
}

function onGameWin() {
  document.getElementById('gameStatus').textContent = 'You won! 🎉 Here is your surprise!';
  spawnConfetti();

  const reward = document.getElementById('rewardSection');
  reward.classList.remove('hidden-reward');
  reward.classList.add('show-reward', 'visible');
  setTimeout(() => {
    reward.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 800);
}

function spawnConfetti() {
  const overlay = document.getElementById('confettiOverlay');
  overlay.classList.remove('hidden');
  const symbols = ['❤️', '🌹', '💖', '✨', '🎉', '💕'];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('span');
    piece.classList.add('confetti-piece');
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    piece.style.animationDelay = (Math.random() * 1.5) + 's';
    overlay.appendChild(piece);
  }

  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  }, 4000);
}
