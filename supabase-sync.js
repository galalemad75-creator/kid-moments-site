// ============================================
// SUPABASE SYNC — Frontend Data Layer
// ============================================
// Syncs chapters & songs from Supabase to the UI

const SYNC = {
  // ===== LOAD CHAPTERS FOR MAIN PAGE =====
  async loadChapters() {
    try {
      if (typeof db !== 'undefined' && db.isLoggedIn()) {
        const chapters = await db.getChapters();
        return chapters.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon || '🎵',
          songs: (c.songs || []).map(s => ({
            id: s.id,
            title: s.title,
            audio: s.audio_url
          }))
        }));
      }
    } catch (e) {
      console.warn('Supabase not configured, using local data:', e.message);
    }

    // Fallback to localStorage
    const local = localStorage.getItem('km_chapters');
    if (local) return JSON.parse(local);

    // Fallback to defaults
    return typeof CHAPTERS !== 'undefined'
      ? CHAPTERS.map(c => ({ ...c, songs: [] }))
      : [];
  },

  // ===== SAVE CHAPTER TO LOCAL =====
  saveLocal(chapters) {
    localStorage.setItem('km_chapters', JSON.stringify(chapters));
  },

  // ===== ADMIN: Add Chapter =====
  async addChapter(name, icon) {
    try {
      const result = await db.createChapter({ name, icon });
      return result[0];
    } catch (e) {
      // Local fallback
      const chapters = await this.loadChapters();
      const newId = Math.max(0, ...chapters.map(c => c.id)) + 1;
      const chapter = { id: newId, name, icon, songs: [] };
      chapters.push(chapter);
      this.saveLocal(chapters);
      return chapter;
    }
  },

  // ===== ADMIN: Update Chapter =====
  async updateChapter(id, data) {
    try {
      await db.updateChapter(id, data);
    } catch (e) {
      const chapters = await this.loadChapters();
      const idx = chapters.findIndex(c => c.id === id);
      if (idx !== -1) {
        Object.assign(chapters[idx], data);
        this.saveLocal(chapters);
      }
    }
  },

  // ===== ADMIN: Delete Chapter =====
  async removeChapter(id) {
    try {
      await db.deleteChapter(id);
    } catch (e) {
      const chapters = await this.loadChapters();
      this.saveLocal(chapters.filter(c => c.id !== id));
    }
  },

  // ===== ADMIN: Add Song =====
  async addSong(chapterId, title, audioUrl) {
    try {
      const result = await db.createSong({
        chapter_id: chapterId,
        title,
        audio_url: audioUrl
      });
      return result[0];
    } catch (e) {
      const chapters = await this.loadChapters();
      const ch = chapters.find(c => c.id === chapterId);
      if (ch) {
        if (!ch.songs) ch.songs = [];
        ch.songs.push({ id: Date.now(), title, audio: audioUrl });
        this.saveLocal(chapters);
      }
      return { id: Date.now(), title, audio_url: audioUrl };
    }
  },

  // ===== ADMIN: Delete Song =====
  async removeSong(songId) {
    try {
      await db.deleteSong(songId);
    } catch (e) {
      console.warn('Delete song failed:', e.message);
    }
  },

  // ===== ADMIN: Upload Audio =====
  async uploadAudio(file) {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    try {
      return await db.uploadAudio(file, filename);
    } catch (e) {
      console.warn('Upload failed:', e.message);
      throw e;
    }
  }
};
