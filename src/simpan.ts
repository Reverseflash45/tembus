/* Progres belajar, disimpan di peramban pengunjung (localStorage). */
import type { Kartu } from "./inti";

export type Riwayat = { benar: number; kali: number; terakhir: number; tadiBenar: boolean };
export type HasilSimulasi = { waktu: number; l: number; s: number; r: number; total: number; benar: number; jumlah: number };

export type Data = {
  versi: 1;
  nama: string;
  /** tiga digit target skor, mis. [5, 0, 0] */
  target: [number, number, number];
  jawaban: Record<string, Riwayat>;
  kartu: Record<string, Kartu>;
  simulasi: HasilSimulasi[];
  /** tanggal (YYYY-MM-DD lokal) hari-hari latihan */
  hari: string[];
  /** langkah rencana harian yang sudah selesai hari ini */
  harian: { tanggal: string; selesai: Langkah[] };
};

export type Langkah = "grammar" | "reading" | "listening" | "kosakata";
export const URUTAN_LANGKAH: Langkah[] = ["grammar", "reading", "listening", "kosakata"];

const KUNCI = "tembus:v1";
const kosong = (): Data => ({ versi: 1, nama: "", target: [5, 0, 0], jawaban: {}, kartu: {}, simulasi: [], hari: [], harian: { tanggal: "", selesai: [] } });

function muat(): Data {
  try {
    const d = JSON.parse(localStorage.getItem(KUNCI) ?? "null");
    if (!d || d.versi !== 1) return kosong();
    const k = kosong();
    return {
      ...k,
      ...d,
      target: Array.isArray(d.target) && d.target.length === 3 ? d.target : k.target,
      jawaban: typeof d.jawaban === "object" && d.jawaban ? d.jawaban : {},
      kartu: typeof d.kartu === "object" && d.kartu ? d.kartu : {},
      simulasi: Array.isArray(d.simulasi) ? d.simulasi : [],
      hari: Array.isArray(d.hari) ? d.hari : [],
      harian: d.harian && Array.isArray(d.harian.selesai) ? d.harian : k.harian,
    };
  } catch {
    return kosong();
  }
}

export const data: Data = muat();

export function simpan() {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(data));
  } catch {
    /* mode privat / penyimpanan penuh: progres hanya bertahan di sesi ini */
  }
}

export const tanggalLokal = (t = new Date()) =>
  `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;

function tandaiHari() {
  const h = tanggalLokal();
  if (!data.hari.includes(h)) data.hari = [...data.hari.slice(-400), h];
}

export function catatJawaban(id: string, benar: boolean) {
  const r = data.jawaban[id] ?? { benar: 0, kali: 0, terakhir: 0, tadiBenar: false };
  data.jawaban[id] = { benar: r.benar + (benar ? 1 : 0), kali: r.kali + 1, terakhir: Date.now(), tadiBenar: benar };
  tandaiHari();
  simpan();
}

export function catatKartu(kata: string, k: Kartu) {
  data.kartu[kata] = k;
  tandaiHari();
  simpan();
}

export function catatSimulasi(h: HasilSimulasi) {
  data.simulasi = [...data.simulasi.slice(-49), h];
  tandaiHari();
  simpan();
}

/** Hari berturut-turut sampai hari ini (atau kemarin, kalau hari ini belum latihan). */
export function runtutan(hari = data.hari, kini = new Date()) {
  const set = new Set(hari);
  const d = new Date(kini);
  if (!set.has(tanggalLokal(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(tanggalLokal(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Langkah rencana hari ini yang sudah beres (otomatis kosong lagi besoknya). */
export function langkahSelesai(): Langkah[] {
  return data.harian.tanggal === tanggalLokal() ? data.harian.selesai : [];
}

export function tandaiLangkah(l: Langkah) {
  const kini = langkahSelesai();
  if (kini.includes(l)) return;
  data.harian = { tanggal: tanggalLokal(), selesai: [...kini, l] };
  simpan();
}

export function aturTarget(skor: number) {
  const s = Math.max(310, Math.min(677, Math.round(skor / 10) * 10));
  data.target = String(s).split("").map(Number) as [number, number, number];
  simpan();
}

export const targetSkor = () => Number(data.target.join(""));

export function hapusSemua() {
  const k = kosong();
  Object.assign(data, k);
  simpan();
}
