# Tembus

Latihan TOEFL ITP dengan pembahasan bahasa Indonesia. Tampilannya meniru LJK: jawaban diarsir pensil, lalu dikoreksi dengan coretan pulpen merah.

**Coba:** https://tembus.raffstw.my.id

## Isinya

- **Materi Structure & Written Expression**: 13 pola grammar yang paling sering keluar, masing-masing dengan pola, contoh, dan jebakan yang sering muncul
- **117 soal Structure & Written Expression** (9 per topik) dengan pembahasan
- **Reading**: 4 bacaan akademik × 8 soal (ide pokok, detail, kosakata, rujukan, inferensi, tujuan penulis); paragraf buktinya disorot setelah menjawab
- **Listening**: 20 dialog pendek + percakapan panjang + kuliah singkat, dibacakan suara bahasa Inggris bawaan browser (Web Speech API), transkrip muncul setelah menjawab
- **Kosakata sinonim**: 119 kata akademik dengan sistem kotak Leitner (yang salah muncul lebih sering)
- **Simulasi mini**: 44 soal, 35 menit, rekaman hanya bisa diputar sekali, hasilnya perkiraan skor 310–677
- **Progres**: ketepatan per bagian dan per topik, topik terlemah, riwayat simulasi

Soal yang belum pernah dijawab dan yang dulu salah lebih sering dipilih. Semua progres disimpan di browser (localStorage), tanpa akun.

## Catatan

- Semua soal dan bacaan **ditulis sendiri** untuk latihan, bukan soal resmi. TOEFL dan TOEFL ITP adalah merek dagang ETS; proyek ini tidak berafiliasi dengan ETS.
- Perkiraan skor memakai kurva halus di antara titik-titik jangkar (lihat [`src/inti.ts`](src/inti.ts)). Tabel konversi resmi berbeda untuk tiap paket soal, jadi angkanya hanya gambaran kasar.
- Tes otomatis memeriksa keutuhan bank soal: tepat empat bagian bergaris di tiap soal Written Expression, kunci jawaban valid, sebaran kunci A–D merata, dan kata yang ditanyakan di soal kosakata Reading memang ada di paragrafnya.

## Jalankan sendiri

```bash
npm install
npm run dev
npm test
npm run build
```

---

Dibikin sama [Rafi](https://www.raffstw.my.id).
