// ============================================
// CLOUDINARY CONFIGURATION
// ============================================

const CLOUDINARY_CLOUD_NAME = 'dse1s0loh';
const CLOUDINARY_API_KEY = '611184425616475';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

// ============================================
// DATABASE — Local Storage (no Supabase needed)
// ============================================

const DB = {
  KEY: 'km_data',

  getData() {
    const raw = localStorage.getItem(this.KEY);
    if (raw) return JSON.parse(raw);
    // Default data
    const defaults = {
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
      nextChapterId: 42,
      nextSongId: 1,
      adminEmail: 'emadh5156@gmail.com',
      adminPassword: 'KidMoments2026!'
    };
    this.saveData(defaults);
    return defaults;
  },

  saveData(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  // ===== CHAPTERS =====
  getChapters() {
    return this.getData().chapters;
  },

  addChapter(name, icon) {
    const data = this.getData();
    const chapter = { id: data.nextChapterId++, name, icon, songs: [] };
    data.chapters.push(chapter);
    this.saveData(data);
    return chapter;
  },

  updateChapter(id, updates) {
    const data = this.getData();
    const ch = data.chapters.find(c => c.id === id);
    if (ch) {
      Object.assign(ch, updates);
      this.saveData(data);
    }
    return ch;
  },

  deleteChapter(id) {
    const data = this.getData();
    data.chapters = data.chapters.filter(c => c.id !== id);
    this.saveData(data);
  },

  // ===== SONGS =====
  addSong(chapterId, title, audioUrl, publicId) {
    const data = this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (!ch) return null;
    const song = {
      id: data.nextSongId++,
      title,
      audio: audioUrl,
      cloudinary_id: publicId,
      created: new Date().toISOString()
    };
    if (!ch.songs) ch.songs = [];
    ch.songs.push(song);
    this.saveData(data);
    return song;
  },

  deleteSong(chapterId, songId) {
    const data = this.getData();
    const ch = data.chapters.find(c => c.id === chapterId);
    if (ch) {
      ch.songs = (ch.songs || []).filter(s => s.id !== songId);
      this.saveData(data);
    }
  },

  // ===== AUTH =====
  login(email, password) {
    const data = this.getData();
    if (email === data.adminEmail && password === data.adminPassword) {
      localStorage.setItem('km_admin', JSON.stringify({ email, ts: Date.now() }));
      return true;
    }
    return false;
  },

  isLoggedIn() {
    return !!localStorage.getItem('km_admin');
  },

  getUser() {
    const raw = localStorage.getItem('km_admin');
    return raw ? JSON.parse(raw) : null;
  },

  logout() {
    localStorage.removeItem('km_admin');
  }
};

// ============================================
// CLOUDINARY UPLOAD
// ============================================

async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default'); // Cloudinary default unsigned preset
  formData.append('resource_type', 'auto');
  formData.append('folder', 'kid-moments/audio');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({
          url: res.secure_url,
          publicId: res.public_id,
          format: res.format,
          duration: res.duration,
          bytes: res.bytes
        });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

async function deleteFromCloudinary(publicId) {
  // Note: Deletion requires server-side API secret
  // For now, we just remove from local data
  console.warn('Cloudinary deletion requires server-side API. File removed from local data.');
}
