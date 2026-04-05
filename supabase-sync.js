// ============================================
// DATA SYNC — Cloudinary + LocalStorage
// ============================================

const SYNC = {
  // ===== LOAD CHAPTERS =====
  async loadChapters() {
    return DB.getChapters();
  },

  // ===== ADMIN: Add Chapter =====
  async addChapter(name, icon) {
    return DB.addChapter(name, icon);
  },

  // ===== ADMIN: Update Chapter =====
  async updateChapter(id, data) {
    return DB.updateChapter(id, data);
  },

  // ===== ADMIN: Delete Chapter =====
  async removeChapter(id) {
    DB.deleteChapter(id);
  },

  // ===== ADMIN: Add Song =====
  async addSong(chapterId, title, audioUrl, publicId) {
    return DB.addSong(chapterId, title, audioUrl, publicId);
  },

  // ===== ADMIN: Delete Song =====
  async removeSong(chapterId, songId) {
    DB.deleteSong(chapterId, songId);
  },

  // ===== ADMIN: Upload Audio to Cloudinary =====
  async uploadAudio(file, onProgress) {
    return await uploadToCloudinary(file, onProgress);
  },

  // ===== SAVE LOCAL =====
  saveLocal(chapters) {
    const data = DB.getData();
    data.chapters = chapters;
    DB.saveData(data);
  }
};
