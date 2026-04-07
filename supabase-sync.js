// ============================================
// SUPABASE SYNC — No base64 in localStorage
// Files go to GitHub API, data to Supabase
// ============================================

const SUPA = {
  url: localStorage.getItem('km_supa_url') || '',
  key: localStorage.getItem('km_supa_key') || '',

  setCredentials(url, key) {
    this.url = url;
    this.key = key;
    localStorage.setItem('km_supa_url', url);
    localStorage.setItem('km_supa_key', key);
  },

  hasCredentials() {
    return !!(this.url && this.key);
  },

  _headers() {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  },

  // ===== CHAPTERS =====
  async getChapters() {
    if (!this.hasCredentials()) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/chapters?select=*&order=id.asc`, {
        headers: this._headers()
      });
      if (!res.ok) throw new Error('Supabase read failed');
      const data = await res.json();
      // Convert Supabase format to our format
      return data.map(row => ({
        id: row.id,
        name: row.name,
        icon: row.icon || '📚',
        songs: Array.isArray(row.songs) ? row.songs : (typeof row.songs === 'string' ? JSON.parse(row.songs) : [])
      }));
    } catch (e) {
      console.warn('Supabase getChapters:', e.message);
      return null;
    }
  },

  async upsertChapters(chapters) {
    if (!this.hasCredentials()) return false;
    try {
      const rows = chapters.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon || '📚',
        songs: JSON.stringify(c.songs || []),
        updated_at: new Date().toISOString()
      }));

      const res = await fetch(`${this.url}/rest/v1/chapters`, {
        method: 'POST',
        headers: { ...this._headers(), 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(rows)
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase upsertChapters:', e.message);
      return false;
    }
  },

  async deleteChapter(id) {
    if (!this.hasCredentials()) return false;
    try {
      const res = await fetch(`${this.url}/rest/v1/chapters?id=eq.${id}`, {
        method: 'DELETE',
        headers: this._headers()
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // ===== SETTINGS (nextId, admin, etc.) =====
  async getSettings() {
    if (!this.hasCredentials()) return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/settings?select=*`, {
        headers: this._headers()
      });
      if (!res.ok) return null;
      const rows = await res.json();
      const settings = {};
      rows.forEach(r => { settings[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value; });
      return settings;
    } catch (e) {
      return null;
    }
  },

  async upsertSetting(key, value) {
    if (!this.hasCredentials()) return false;
    try {
      const res = await fetch(`${this.url}/rest/v1/settings`, {
        method: 'POST',
        headers: { ...this._headers(), 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
};

// ============================================
// DATABASE — Supabase primary, localStorage cache
// ============================================

const DB = {
  _cache: null,

  async init() {
    // 1. Try Supabase first
    if (SUPA.hasCredentials()) {
      try {
        const chapters = await SUPA.getChapters();
        const settings = await SUPA.getSettings();
        if (chapters && chapters.length > 0) {
          this._cache = {
            chapters,
            nextId: settings?.nextId || DEFAULT_DATA.nextId,
            admin: settings?.admin || DEFAULT_DATA.admin
          };
          // Save lightweight cache (chapters only, no base64)
          this._saveLocalCache();
          return this._cache;
        }
        // Supabase empty → load defaults → sync up
        this._cache = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this._saveLocalCache();
        this._syncToSupabase(); // background sync
        return this._cache;
      } catch (e) {
        console.warn('Supabase init failed, falling back:', e.message);
      }
    }

    // 2. Try GitHub
    try {
      const remote = await GH.read();
      if (remote && remote.chapters) {
        this._cache = remote;
        this._saveLocalCache();
        this._syncToSupabase(); // background sync
        return this._cache;
      }
    } catch (e) {}

    // 3. Local cache
    const local = localStorage.getItem('km_cache');
    if (local) {
      try {
        this._cache = JSON.parse(local);
        return this._cache;
      } catch (e) {}
    }

    // 4. Defaults
    this._cache = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this._saveLocalCache();
    return this._cache;
  },

  // Sync-only: save to localStorage (NO base64)
  _saveLocalCache() {
    if (!this._cache) return;
    // Only store lightweight data — never base64
    const safe = JSON.parse(JSON.stringify(this._cache));
    // Strip any base64 that might have snuck in
    if (safe.chapters) {
      safe.chapters.forEach(ch => {
        if (ch.songs) {
          ch.songs.forEach(s => {
            if (s.audio && s.audio.startsWith('data:')) s.audio = '';
            if (s.image && s.image.startsWith('data:')) s.image = '';
          });
        }
      });
    }
    try {
      localStorage.setItem('km_cache', JSON.stringify(safe));
    } catch (e) {
      // Quota exceeded — clear old data
      console.warn('localStorage quota, clearing cache');
      localStorage.removeItem('km_cache');
    }
  },

  // Background sync to Supabase
  async _syncToSupabase() {
    if (!SUPA.hasCredentials() || !this._cache) return;
    try {
      await SUPA.upsertChapters(this._cache.chapters);
      await SUPA.upsertSetting('nextId', this._cache.nextId);
      await SUPA.upsertSetting('admin', this._cache.admin);
    } catch (e) {
      console.warn('Background Supabase sync failed:', e.message);
    }
  },

  getData() {
    return this._cache || DEFAULT_DATA;
  },

  getChapters() { return this.getData().chapters; },

  async save() {
    // 1. Save to localStorage cache (sync, lightweight)
    this._saveLocalCache();

    // 2. Save to GitHub (for file URLs)
    try {
      await GH.write(this._cache);
    } catch (e) {
      console.warn('GitHub save failed:', e.message);
    }

    // 3. Save to Supabase (background, for data)
    this._syncToSupabase();
  },

  // ===== CHAPTERS =====
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
    // Background delete from Supabase
    if (SUPA.hasCredentials()) SUPA.deleteChapter(id);
    this.save();
  },

  // ===== SONGS =====
  addSong(chapterId, title, audioUrl, publicId, imageUrl) {
    const ch = this._cache.chapters.find(c => c.id === chapterId);
    if (!ch) return null;
    const song = {
      id: this._cache.nextId.song++,
      title,
      audio: audioUrl,          // Cloudinary/GitHub URL — NOT base64
      image: imageUrl || '',     // Cloudinary/GitHub URL — NOT base64
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
    const HARDCODED_EMAIL = 'emadh5156@gmail.com';
    const HARDCODED_PASS = 'KidMoments2026';

    const e = String(email || '').trim();
    const p = String(password || '').trim();

    if (e === HARDCODED_EMAIL && p === HARDCODED_PASS) return true;

    const admin = this._cache?.admin;
    if (admin && e === String(admin.email || '').trim() && p === String(admin.password || '').trim()) return true;

    return false;
  },

  isLoggedIn() { return !!localStorage.getItem('km_admin'); },
  getUser() { return JSON.parse(localStorage.getItem('km_admin') || '{}'); },
  setSession(email) { localStorage.setItem('km_admin', JSON.stringify({ email, ts: Date.now() })); },
  logout() { localStorage.removeItem('km_admin'); }
};

// ============================================
// UPLOAD — Cloudinary (files go here, URLs stored)
// ============================================

delete window.uploadFile; // clear any old declaration

const CLOUDINARY_CLOUD_NAME = 'dse1s0loh';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

window.uploadFile = async function(file, onProgress) {
  // Always read fresh token from localStorage
  const freshToken = localStorage.getItem('km_gh_token') || '';
  if (GH.token !== freshToken) GH.token = freshToken;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'kidmom');
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
};

// Keep backward compat
const uploadToCloudinary = window.uploadFile;

// ============================================
// SYNC WRAPPER (used by admin.html)
// ============================================

const SYNC = {
  async loadChapters() {
    await DB.init();
    return DB.getChapters();
  },

  async addChapter(name, icon) {
    return DB.addChapter(name, icon);
  },

  async updateChapter(id, data) {
    return DB.updateChapter(id, data);
  },

  async removeChapter(id) {
    DB.deleteChapter(id);
  },

  async addSong(chapterId, title, audioUrl, publicId, imageUrl) {
    return DB.addSong(chapterId, title, audioUrl, publicId, imageUrl);
  },

  async removeSong(chapterId, songId) {
    DB.deleteSong(chapterId, songId);
  },

  async uploadAudio(file, onProgress) {
    return await window.uploadFile(file, onProgress);
  }
};
