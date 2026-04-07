/* ============================================
   KID MOMENTS — Main App JS
   ============================================ */

// ===== CHAPTERS DATA =====
const CHAPTERS = [
  { id: 1, name: 'Voice (Speaking Up)', icon: '🗣️' },
  { id: 2, name: 'Saying No to Strangers', icon: '🚫' },
  { id: 3, name: 'Using Indoor Voices', icon: '🤫' },
  { id: 4, name: 'My Dry Bed', icon: '🛏️' },
  { id: 5, name: 'Thumb Sucking', icon: '👍' },
  { id: 6, name: 'Managing Whining', icon: '😤' },
  { id: 7, name: 'Sharing with Others', icon: '🤝' },
  { id: 8, name: 'Listening to Adults', icon: '👂' },
  { id: 9, name: 'Following Rules', icon: '📋' },
  { id: 10, name: 'Handling Anger', icon: '😠' },
  { id: 11, name: 'Asking for Help', icon: '🙋' },
  { id: 12, name: 'Waiting My Turn', icon: '⏳' },
  { id: 13, name: 'Playing Nicely', icon: '🎮' },
  { id: 14, name: 'Saying Please and Thank You', icon: '🙏' },
  { id: 15, name: 'Using Kind Words', icon: '💬' },
  { id: 16, name: 'Keeping Hands to Myself', icon: '✋' },
  { id: 17, name: 'Tidying Up', icon: '🧹' },
  { id: 18, name: 'Brushing My Teeth', icon: '🦷' },
  { id: 19, name: 'Getting Dressed', icon: '👕' },
  { id: 20, name: 'Eating Healthy', icon: '🥗' },
  { id: 21, name: 'Going to Bed on Time', icon: '🌙' },
  { id: 22, name: 'Washing My Hands', icon: '🧼' },
  { id: 23, name: 'Sitting Still', icon: '🧘' },
  { id: 24, name: 'Walking Safely', icon: '🚶' },
  { id: 25, name: 'Being Honest', icon: '💎' },
  { id: 26, name: 'Saying Sorry', icon: '😔' },
  { id: 27, name: 'Trying New Foods', icon: '🍽️' },
  { id: 28, name: 'Managing Frustration', icon: '💪' },
  { id: 29, name: 'Bedtime Routine', icon: '🌜' },
  { id: 30, name: 'Morning Routine', icon: '☀️' },
  { id: 31, name: 'Tying Shoes', icon: '👟' },
  { id: 32, name: 'Table Manners', icon: '🍴' },
  { id: 33, name: 'Voice (Speaking Up) 2', icon: '🗣️' },
  { id: 34, name: 'Saying No to Strangers 2', icon: '🚫' },
  { id: 35, name: 'Using Indoor Voices 2', icon: '🤫' },
  { id: 36, name: 'Handling Anger 2', icon: '😠' },
  { id: 37, name: 'Managing Frustration 2', icon: '💪' },
  { id: 38, name: 'Managing Whining 2', icon: '😤' },
  { id: 39, name: 'Brushing Teeth 2', icon: '🦷' },
  { id: 40, name: 'Getting Dressed 2', icon: '👕' },
  { id: 41, name: 'Washing Hands 2', icon: '🧼' }
];

// ===== DOM REFS =====
const player = document.getElementById('player');
let currentChapter = null;
let currentSong = -1;
let chapters = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initScrollAnimations();
  initCounterAnimations();
  initChapters();
  initLucide();
});

// ===== LUCIDE ICONS =====
function initLucide() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// ===== THEME (Dark/Light) =====
function initTheme() {
  const saved = localStorage.getItem('km_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('km_theme', next);
    });
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('km_theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

// ===== NAVIGATION =====
function initNav() {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  // Active nav highlight
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add staggered delay for cards in a grid
        const el = entry.target;
        const parent = el.parentElement;
        if (parent && parent.classList.contains('grid')) {
          const siblings = Array.from(parent.children);
          const i = siblings.indexOf(el);
          el.style.transitionDelay = `${i * 0.06}s`;
        }
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.animate-on-scroll, .grid .card').forEach(el => {
    observer.observe(el);
  });
}

// ===== COUNTER ANIMATIONS =====
function initCounterAnimations() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'));
  if (isNaN(target)) return;
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ===== CHAPTERS LOADING =====
async function initChapters() {
  await DB.init();
  chapters = DB.getChapters();
  renderChapters();
}

function renderChapters() {
  const grid = document.getElementById('chaptersGrid');
  if (!grid) return;

  grid.innerHTML = chapters.map(c => `
    <div class="card" onclick="openChapter(${c.id})">
      <div class="num">${c.id}</div>
      <div class="name">${c.icon} ${c.name}</div>
      <div class="count">${(c.songs || []).length} song${(c.songs || []).length !== 1 ? 's' : ''}</div>
    </div>
  `).join('');

  // Re-observe new cards for scroll animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const parent = el.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children);
          const i = siblings.indexOf(el);
          el.style.transitionDelay = `${i * 0.06}s`;
        }
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  grid.querySelectorAll('.card').forEach(c => observer.observe(c));
}

// ===== CHAPTER / SONG VIEW =====
function openChapter(id) {
  currentChapter = chapters.find(c => c.id === id);
  if (!currentChapter) return;

  const hero = document.getElementById('hero');
  const features = document.getElementById('features');
  const chaptersSection = document.getElementById('chapters');
  const ctaSection = document.querySelector('.cta-section');

  // Hide main sections
  if (hero) hero.style.display = 'none';
  if (features) features.style.display = 'none';
  if (chaptersSection) chaptersSection.style.display = 'none';
  if (ctaSection) ctaSection.style.display = 'none';

  // Show songs view
  const sv = document.getElementById('songsView');
  if (!sv) {
    createSongsView();
  }
  const songsView = document.getElementById('songsView');
  songsView.style.display = 'block';

  document.getElementById('chapterTitle').textContent = currentChapter.icon + ' ' + currentChapter.name;

  const sl = document.getElementById('songsList');
  if (!currentChapter.songs || !currentChapter.songs.length) {
    sl.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🎵</div>
        <h3 style="margin-bottom:8px;">No songs yet</h3>
        <p>Episodes coming soon — stay tuned!</p>
      </div>`;
  } else {
    sl.innerHTML = currentChapter.songs.map((s, i) => `
      <div class="song-card" id="sc-${i}">
        <button class="song-play" onclick="event.stopPropagation(); playSong(${i})">
          <i data-lucide="play"></i>
        </button>
        <span class="song-title">${s.title}</span>
      </div>
    `).join('');
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createSongsView() {
  const sv = document.createElement('div');
  sv.id = 'songsView';
  sv.className = 'songs-view';
  sv.innerHTML = `
    <button class="back-btn" onclick="showHome()">
      <i data-lucide="arrow-left"></i> Back to Episodes
    </button>
    <h2 id="chapterTitle" style="margin-bottom:24px;"></h2>
    <div id="songsList"></div>
  `;
  document.querySelector('main')?.appendChild(sv) || document.body.insertBefore(sv, document.querySelector('.np-bar'));
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showHome() {
  const hero = document.getElementById('hero');
  const features = document.getElementById('features');
  const chaptersSection = document.getElementById('chapters');
  const ctaSection = document.querySelector('.cta-section');
  const songsView = document.getElementById('songsView');

  if (hero) hero.style.display = '';
  if (features) features.style.display = '';
  if (chaptersSection) chaptersSection.style.display = '';
  if (ctaSection) ctaSection.style.display = '';
  if (songsView) songsView.style.display = 'none';
}

// ===== PLAYER =====
function playSong(i) {
  if (!currentChapter || !currentChapter.songs || !currentChapter.songs[i]) return;
  currentSong = i;
  const s = currentChapter.songs[i];
  player.src = s.audio;
  player.play().catch(e => console.warn('Playback blocked:', e));

  document.getElementById('npTitle').textContent = s.title;
  document.getElementById('npChapter').textContent = currentChapter.name;

  // Show cover image if available
  const npImg = document.getElementById('npImg');
  if (s.image) { npImg.src = s.image; npImg.style.display = 'block'; }
  else { npImg.style.display = 'none'; }

  document.getElementById('playBtn').textContent = '⏸';
  document.getElementById('npBar').style.display = 'block';

  document.querySelectorAll('.song-card').forEach(c => c.classList.remove('playing'));
  const sc = document.getElementById('sc-' + i);
  if (sc) sc.classList.add('playing');
}

function togglePlay() {
  if (player.paused) {
    player.play();
    document.getElementById('playBtn').textContent = '⏸';
  } else {
    player.pause();
    document.getElementById('playBtn').textContent = '▶';
  }
}

function stopAudio() {
  player.pause();
  player.currentTime = 0;
  document.getElementById('playBtn').textContent = '▶';
  document.getElementById('npFill').style.width = '0%';
  document.getElementById('npCur').textContent = '0:00';
}

function prevTrack() {
  if (currentChapter && currentSong > 0) playSong(currentSong - 1);
}

function nextTrack() {
  if (currentChapter && currentSong + 1 < currentChapter.songs.length) playSong(currentSong + 1);
}

function seekAudio(e) {
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  player.currentTime = pct * player.duration;
}

function formatTime(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  return m + ':' + Math.floor(s % 60).toString().padStart(2, '0');
}

function closePlayer() {
  player.pause();
  player.src = '';
  document.getElementById('npBar').style.display = 'none';
  document.getElementById('npFill').style.width = '0%';
  document.querySelectorAll('.song-card').forEach(c => c.classList.remove('playing'));
  currentSong = -1;
}

// Progress & time update
if (player) {
  player.addEventListener('timeupdate', () => {
    if (player.duration) {
      document.getElementById('npFill').style.width = (player.currentTime / player.duration * 100) + '%';
      document.getElementById('npCur').textContent = formatTime(player.currentTime);
      document.getElementById('npDur').textContent = formatTime(player.duration);
    }
  });
  player.addEventListener('ended', () => {
    if (currentChapter && currentSong + 1 < currentChapter.songs.length) {
      playSong(currentSong + 1);
    } else {
      document.getElementById('playBtn').textContent = '▶';
    }
  });
}
