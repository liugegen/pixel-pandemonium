// src/CanvasModel.js

// Kita akan mengambil class Model dari objek global Multisynq
const { Model } = window.Multisynq;

const GRID_SIZE = 32;
const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;

// Model ini bertanggung jawab atas semua data dan logika kanvas
export class CanvasModel extends Model {
  // Fungsi ini berjalan saat sesi pertama kali dibuat
  init() {
    // Inisialisasi data pixels kita
    this.pixels = Array(PIXEL_COUNT).fill('#FFFFFF');
    
    // Mendengarkan (subscribe) pesan 'set-pixel' yang akan dikirim dari tampilan (View)
    this.subscribe("canvasScope", "setPixel", this.onSetPixel);
  }

  // Fungsi ini dipanggil saat ada pesan 'setPixel'
  onSetPixel(data) {
    // Ubah data di dalam model
    this.pixels[data.index] = data.color;
    
    // Kirim (publish) pembaruan ke semua klien/tampilan yang terhubung
    this.publish("canvasScope", "pixelsUpdated", this.pixels);
  }
}