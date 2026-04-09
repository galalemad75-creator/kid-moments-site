// ============================================
// DATA SYNC — GitHub + Cloudinary
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
    return await uploadToCloudinary(file, onProgress);
  },

  // ===== ADS =====
  getAds() {
    return DB.getAds();
  },

  async updateAd(id, data) {
    return DB.updateAd(id, data);
  },

  async addAd(name, position, code) {
    return DB.addAd(name, position, code);
  },

  async removeAd(id) {
    DB.deleteAd(id);
  }
};
