/* Ikon garis sederhana (24×24), digambar sendiri. */
const svg = (isi: string, kelas = "ikon") => `<svg class="${kelas}" viewBox="0 0 24 24" aria-hidden="true">${isi}</svg>`;

export const IKON = {
  rumah: svg('<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>'),
  pensil: svg('<path d="M15.5 4.5 19.5 8.5 9 19H5v-4z"/><path d="m13 7 4 4"/>'),
  jam: svg('<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2.5 1.5M10 3h4M12 3v3.5"/>'),
  grafik: svg('<path d="M4 20h16"/><path d="M7 16v-5M12 16V7M17 16v-8"/>'),
  silang: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  centang: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  panah: svg('<path d="M9 5l7 7-7 7"/>'),
  putar: svg('<path d="M8 5.5v13l11-6.5z"/>'),
  henti: svg('<rect x="7" y="7" width="10" height="10" rx="1.5"/>'),
  buku: svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>'),
  dengar: svg('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5"/>'),
  kartu: svg('<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>'),
  kalimat: svg('<path d="M4 7h16M4 12h10M4 17h7"/><path d="M15 17h5"/>'),
  daftar: svg('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>'),
  ulang: svg('<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4.5h4.5"/>'),
};
