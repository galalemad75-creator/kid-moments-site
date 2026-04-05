// ============================================
// SUPABASE CONFIGURATION
// ============================================
// ⚠️ Replace these with your actual Supabase credentials
// Get them from: https://supabase.com → Your Project → Settings → API

const SUPABASE_URL = 'YOUR_SUPABASE_URL';       // e.g. https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // e.g. eyJhbGciOi...

// ============================================
// DO NOT EDIT BELOW THIS LINE
// ============================================

class KidMomentsDB {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_ANON_KEY;
    this.token = null;
    this.user = null;
    this._init();
  }

  _headers() {
    const h = {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': `Bearer ${this.token || this.key}`
    };
    return h;
  }

  _init() {
    const saved = localStorage.getItem('km_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        this.token = session.access_token;
        this.user = session.user;
      } catch (e) {
        localStorage.removeItem('km_session');
      }
    }
  }

  // ===== AUTH =====
  async signUp(email, password) {
    const res = await fetch(`${this.url}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': this.key },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error_description || 'Sign up failed');
    return data;
  }

  async signIn(email, password) {
    const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': this.key },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error_description || 'Sign in failed');
    this.token = data.access_token;
    this.user = data.user;
    localStorage.setItem('km_session', JSON.stringify(data));
    return data;
  }

  async signOut() {
    try {
      await fetch(`${this.url}/auth/v1/logout`, {
        method: 'POST',
        headers: this._headers()
      });
    } catch (e) {}
    this.token = null;
    this.user = null;
    localStorage.removeItem('km_session');
  }

  async resetPassword(email) {
    const res = await fetch(`${this.url}/auth/v1/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': this.key },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Password reset failed');
    return data;
  }

  isLoggedIn() {
    return !!(this.token && this.user);
  }

  getUser() {
    return this.user;
  }

  // ===== CHAPTERS =====
  async getChapters() {
    const res = await fetch(`${this.url}/rest/v1/chapters?select=*,songs(*)&order=id.asc`, {
      headers: this._headers()
    });
    if (!res.ok) throw new Error('Failed to fetch chapters');
    return await res.json();
  }

  async createChapter(data) {
    const res = await fetch(`${this.url}/rest/v1/chapters`, {
      method: 'POST',
      headers: { ...this._headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create chapter');
    return await res.json();
  }

  async updateChapter(id, data) {
    const res = await fetch(`${this.url}/rest/v1/chapters?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...this._headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update chapter');
    return await res.json();
  }

  async deleteChapter(id) {
    const res = await fetch(`${this.url}/rest/v1/chapters?id=eq.${id}`, {
      method: 'DELETE',
      headers: this._headers()
    });
    if (!res.ok) throw new Error('Failed to delete chapter');
  }

  // ===== SONGS =====
  async getSongs(chapterId) {
    const res = await fetch(`${this.url}/rest/v1/songs?chapter_id=eq.${chapterId}&order=id.asc`, {
      headers: this._headers()
    });
    if (!res.ok) throw new Error('Failed to fetch songs');
    return await res.json();
  }

  async createSong(data) {
    const res = await fetch(`${this.url}/rest/v1/songs`, {
      method: 'POST',
      headers: { ...this._headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create song');
    return await res.json();
  }

  async updateSong(id, data) {
    const res = await fetch(`${this.url}/rest/v1/songs?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...this._headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update song');
    return await res.json();
  }

  async deleteSong(id) {
    const res = await fetch(`${this.url}/rest/v1/songs?id=eq.${id}`, {
      method: 'DELETE',
      headers: this._headers()
    });
    if (!res.ok) throw new Error('Failed to delete song');
  }

  // ===== STORAGE (Audio Uploads) =====
  async uploadAudio(file, path) {
    const formData = new FormData();
    formData.append('', file);
    const res = await fetch(`${this.url}/storage/v1/object/audio/${path}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token || this.key}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return `${this.url}/storage/v1/object/public/audio/${path}`;
  }

  async deleteAudio(path) {
    const res = await fetch(`${this.url}/storage/v1/object/audio/${path}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.token || this.key}` }
    });
    if (!res.ok) throw new Error('Delete failed');
  }

  getAudioUrl(path) {
    return `${this.url}/storage/v1/object/public/audio/${path}`;
  }
}

// ===== DB INSTANCE =====
const db = new KidMomentsDB();
