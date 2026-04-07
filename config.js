// ============================================
// GITHUB STORAGE — بيانات ثابتة على الريبو
// ============================================

const GH = {
  owner: 'galalemad75-creator',
  repo: 'kid-moments-site',
  branch: 'main',
  dataFile: 'data.json',
  token: localStorage.getItem('km_gh_token') || '',

  setToken(t) {
    this.token = t;
    localStorage.setItem('km_gh_token', t);
  },

  _headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  },

  // ===== READ data.json from GitHub =====
  async read() {
    try {
      const url = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${this.dataFile}`;
      const res = await fetch(url + '?t=' + Date.now());
      if (!res.ok) throw new Error('Failed to read data');
      return await res.json();
    } catch (e) {
      console.warn('Read failed, using defaults:', e.message);
      return null;
    }
  },

  // ===== WRITE data.json to GitHub =====
  async write(data) {
    if (!this.token) throw new Error('No GitHub token set');

    // Get current file SHA (required for update)
    let sha = null;
    try {
      const apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`;
      const check = await fetch(apiUrl, { headers: this._headers() });
      if (check.ok) {
        const info = await check.json();
        sha = info.sha;
      }
    } catch (e) {}

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

    const body = {
      message: '🎵 Update chapters & songs data',
      content,
      branch: this.branch
    };
    if (sha) body.sha = sha;

    const res = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`,
      {
        method: 'PUT',
        headers: this._headers(),
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to save data');
    }

    return true;
  }
};

// ============================================
// CLOUDINARY UPLOAD
// ============================================
const CLOUDINARY_CLOUD_NAME = 'dse1s0loh';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');
  formData.append('resource_type', 'auto');
  formData.append('folder', 'kid-moments/audio');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({ url: res.secure_url, publicId: res.public_id });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || 'Upload failed'));
        } catch { reject(new Error('Upload failed: ' + xhr.status)); }
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

// ============================================
// DATABASE — GitHub + Local Cache
// ============================================
const DEFAULT_DATA = {
  chapters: [
    { id: 1, name: 'Voice (Speaking Up)', icon: '🗣️', songs: [] },
    { id: 2, name: 'Saying No to Strangers', icon: '🚫', songs: [] },
    { id: 3, name: 'Using Indoor Voices', icon: '🤫', songs: [] },
    { id: 4, name: 'My Dry Bed', icon: '🛏️', songs: [] },
    { id: 5, name: 'Thumb Sucking', icon: '👍', songs: [] },
    { id: 6, name: 'Managing Whining', icon: '😤', songs: [] },
    { id: 7, name: 'Sharing with Others', icon: '🤝', songs: [] },
    { id: 8, name: 'Listening to Adults', icon: '👂', songs: [] },
    { id: 9, name: 'Following Rules', icon: '📋', songs: [] },
    { id: 10, name: 'Handling Anger', icon: '😠', songs: [] },
    { id: 11, name: 'Asking for Help', icon: '🙋', songs: [] },
    { id: 12, name: 'Waiting My Turn', icon: '⏳', songs: [] },
    { id: 13, name: 'Playing Nicely', icon: '🎮', songs: [] },
    { id: 14, name: 'Saying Please and Thank You', icon: '🙏', songs: [] },
    { id: 15, name: 'Using Kind Words', icon: '💬', songs: [] },
    { id: 16, name: 'Keeping Hands to Myself', icon: '✋', songs: [] },
    { id: 17, name: 'Tidying Up', icon: '🧹', songs: [] },
    { id: 18, name: 'Brushing My Teeth', icon: '🦷', songs: [] },
    { id: 19, name: 'Getting Dressed', icon: '👕', songs: [] },
    { id: 20, name: 'Eating Healthy', icon: '🥗', songs: [] },
    { id: 21, name: 'Going to Bed on Time', icon: '🌙', songs: [] },
    { id: 22, name: 'Washing My Hands', icon: '🧼', songs: [] },
    { id: 23, name: 'Sitting Still', icon: '🧘', songs: [] },
    { id: 24, name: 'Walking Safely', icon: '🚶', songs: [] },
    { id: 25, name: 'Being Honest', icon: '💎', songs: [] },
    { id: 26, name: 'Saying Sorry', icon: '😔', songs: [] },
    { id: 27, name: 'Trying New Foods', icon: '🍽️', songs: [] },
    { id: 28, name: 'Managing Frustration', icon: '💪', songs: [] },
    { id: 29, name: 'Bedtime Routine', icon: '🌜', songs: [] },
    { id: 30, name: 'Morning Routine', icon: '☀️', songs: [] },
    { id: 31, name: 'Tying Shoes', icon: '👟', songs: [] },
    { id: 32, name: 'Table Manners', icon: '🍴', songs: [] },
    { id: 33, name: 'Voice (Speaking Up) 2', icon: '🗣️', songs: [] },
    { id: 34, name: 'Saying No to Strangers 2', icon: '🚫', songs: [] },
    { id: 35, name: 'Using Indoor Voices 2', icon: '🤫', songs: [] },
    { id: 36, name: 'Handling Anger 2', icon: '😠', songs: [] },
    { id: 37, name: 'Managing Frustration 2', icon: '💪', songs: [] },
    { id: 38, name: 'Managing Whining 2', icon: '😤', songs: [] },
    { id: 39, name: 'Brushing Teeth 2', icon: '🦷', songs: [] },
    { id: 40, name: 'Getting Dressed 2', icon: '👕', songs: [] },
    { id: 41, name: 'Washing Hands 2', icon: '🧼', songs: [] }
  ],
  nextId: { chapter: 42, song: 1 },
  admin: {
    email: 'emadh5156@gmail.com',
    password: 'KidMoments2026!'
  }
};

const DB = {
  _cache: null,

  async init() {
    // Try load from GitHub first
    const remote = await GH.read();
    if (remote && remote.chapters) {
      this._cache = remote;
      localStorage.setItem('km_cache', JSON.stringify(remote));
      return remote;
    }
    // Fallback to local cache
    const local = localStorage.getItem('km_cache');
    if (local) {
      this._cache = JSON.parse(local);
      return this._cache;
    }
    // Use defaults
    this._cache = DEFAULT_DATA;
    return this._cache;
  },

  getData() {
    return this._cache || DEFAULT_DATA;
  },

  async save(message) {
    const data = this._cache;
    localStorage.setItem('km_cache', JSON.stringify(data));
    try {
      await GH.write(data);
    } catch (e) {
      console.warn('GitHub save failed, data saved locally:', e.message);
      // Still saved to localStorage, will sync later
    }
  },

  // ===== CHAPTERS =====
  getChapters() { return this.getData().chapters; },

  addChapter(name, icon) {
    const data = this._cache;
    const ch = { id: data.nextId.chapter++, name, icon, songs: [] };
    data.chapters.push(ch);
    this.save();
    return ch;
  },

  updateChapter(id, updates) {
    const ch = this._cache.chapters.find(c => c.id === id);
    if (ch) { Object.assign(ch, updates); this.save(); }
    return ch;
  },

  deleteChapter(id) {
    this._cache.chapters = this._cache.chapters.filter(c => c.id !== id);
    this.save();
  },

  // ===== SONGS =====
  addSong(chapterId, title, audioUrl, publicId, imageUrl) {
    const ch = this._cache.chapters.find(c => c.id === chapterId);
    if (!ch) return null;
    const song = {
      id: this._cache.nextId.song++,
      title, audio: audioUrl,
      image: imageUrl || '',
      cloudinary_id: publicId,
      created: new Date().toISOString()
    };
    if (!ch.songs) ch.songs = [];
    ch.songs.push(song);
    this.save();
    return song;
  },

  deleteSong(chapterId, songId) {
    const ch = this._cache.chapters.find(c => c.id === chapterId);
    if (ch) {
      ch.songs = (ch.songs || []).filter(s => s.id !== songId);
      this.save();
    }
  },

  // ===== AUTH =====
  login(email, password) {
    // Hardcoded fallback — always works
    const HARDCODED_EMAIL = 'emadh5156@gmail.com';
    const HARDCODED_PASS = 'KidMoments2026';
    
    const e = String(email || '').trim();
    const p = String(password || '').trim();
    
    // Check hardcoded first
    if (e === HARDCODED_EMAIL && p === HARDCODED_PASS) return true;
    
    // Then check cached data
    const admin = this._cache?.admin;
    if (admin && e === String(admin.email || '').trim() && p === String(admin.password || '').trim()) return true;
    
    return false;
  },

  isLoggedIn() { return !!localStorage.getItem('km_admin'); },
  getUser() { return JSON.parse(localStorage.getItem('km_admin') || '{}'); },
  setSession(email) { localStorage.setItem('km_admin', JSON.stringify({ email, ts: Date.now() })); },
  logout() { localStorage.removeItem('km_admin'); }
};
