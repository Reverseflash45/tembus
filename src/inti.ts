/* Logika murni (tanpa DOM) supaya bisa diuji. */
import type { Huruf } from "./data/jenis";

export const HURUF = ["A", "B", "C", "D"] as const;

/* ---------- Written Expression: "[a] b [c]" → potongan teks ---------- */
export type Potongan = { teks: string; garis: number | null };

export function uraiWritten(kalimat: string): Potongan[] {
  const hasil: Potongan[] = [];
  const re = /\[([^\]]+)\]/g;
  let akhir = 0;
  let n = 0;
  for (let m = re.exec(kalimat); m; m = re.exec(kalimat)) {
    if (m.index > akhir) hasil.push({ teks: kalimat.slice(akhir, m.index), garis: null });
    hasil.push({ teks: m[1], garis: n++ });
    akhir = m.index + m[0].length;
  }
  if (akhir < kalimat.length) hasil.push({ teks: kalimat.slice(akhir), garis: null });
  return hasil;
}

/* ---------- perkiraan skor TOEFL ITP ----------
   Skor tiap bagian adalah skor terkonversi (Listening 31–68, Structure 31–68,
   Reading 31–67), total = jumlah × 10 ÷ 3, rentang 310–677. Tabel konversi
   resmi berbeda tiap paket soal, jadi di sini memakai kurva perkiraan yang
   halus di antara titik-titik jangkar. Hasilnya PERKIRAAN, bukan skor resmi. */
type Jangkar = [number, number][]; // [proporsi benar, skor bagian]

const KURVA: Record<"listening" | "structure" | "reading", Jangkar> = {
  listening: [[0, 31], [0.2, 38], [0.4, 45], [0.6, 51], [0.8, 57], [0.9, 61], [1, 68]],
  structure: [[0, 31], [0.2, 36], [0.4, 43], [0.6, 50], [0.8, 57], [0.9, 61], [1, 68]],
  reading: [[0, 31], [0.2, 36], [0.4, 43], [0.6, 50], [0.8, 56], [0.9, 60], [1, 67]],
};

export type Bagian = keyof typeof KURVA;

export function skorBagian(bagian: Bagian, benar: number, jumlah: number) {
  if (jumlah <= 0) return KURVA[bagian][0][1];
  const p = Math.min(1, Math.max(0, benar / jumlah));
  const k = KURVA[bagian];
  for (let i = 1; i < k.length; i++) {
    const [p0, s0] = k[i - 1];
    const [p1, s1] = k[i];
    if (p <= p1) return Math.round(s0 + ((p - p0) / (p1 - p0)) * (s1 - s0));
  }
  return k[k.length - 1][1];
}

export function skorTotal(l: number, s: number, r: number) {
  return Math.round(((l + s + r) * 10) / 3);
}

/* ---------- kosakata: kotak Leitner ----------
   Kotak 1–5. Benar → naik satu kotak, salah → kembali ke kotak 1.
   Jarak ulang per kotak dalam hari. */
export const JARAK_HARI = [0, 1, 3, 7, 16] as const;
export type Kartu = { kotak: number; jatuhTempo: number };

const HARI = 86_400_000;
export const awalHari = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function nilaiKartu(k: Kartu | undefined, benar: boolean, kini: number): Kartu {
  const kotak = benar ? Math.min(5, (k?.kotak ?? 0) + 1) : 1;
  return { kotak, jatuhTempo: awalHari(kini) + JARAK_HARI[kotak - 1] * HARI };
}

export const perluDiulang = (k: Kartu | undefined, kini: number) => !k || k.jatuhTempo <= kini;

/* ---------- acak yang bisa diulang (untuk uji) ---------- */
export function acak(benih: number) {
  let a = benih >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function kocok<T>(xs: readonly T[], rnd: () => number = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Ambil n soal, utamakan yang belum pernah dijawab atau sering salah. */
export function pilihSoal<T extends { id: string }>(
  semua: readonly T[],
  n: number,
  riwayat: Record<string, { benar: number; kali: number }>,
  rnd: () => number = Math.random,
): T[] {
  const bobot = (s: T) => {
    const r = riwayat[s.id];
    if (!r) return 3; // belum pernah
    const salah = r.kali - r.benar;
    return 1 + Math.min(3, salah * 1.5) - Math.min(0.8, r.benar * 0.2);
  };
  return semua
    .map((s) => ({ s, k: rnd() ** (1 / Math.max(0.05, bobot(s))) }))
    .sort((a, b) => b.k - a.k)
    .slice(0, n)
    .map((x) => x.s);
}

export const hurufKe = (i: Huruf | number) => HURUF[i];

/** "**tebal**", "==stabilo==", dan "*miring*" → HTML; teks lain di-escape. */
export function tandai(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/==(.+?)==/g, '<mark class="stabilo">$1</mark>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/* ---------- kuis kosakata: pilih 3 pengecoh ---------- */
export function pilihPengecoh(
  benar: { sinonim: string; kelas: string },
  semua: readonly { sinonim: string; kelas: string }[],
  kelompok: readonly string[][],
  rnd: () => number = Math.random,
): string[] {
  const grup = (s: string) => kelompok.find((g) => g.includes(s));
  const g = grup(benar.sinonim);
  const boleh = (s: string) => s !== benar.sinonim && !(g && g.includes(s));
  const unik = (xs: string[]) => [...new Set(xs)];
  const sekelas = unik(semua.filter((k) => k.kelas === benar.kelas).map((k) => k.sinonim).filter(boleh));
  const lain = unik(semua.map((k) => k.sinonim).filter(boleh));
  const hasil: string[] = [];
  const dipakaiGrup = new Set<string[]>();
  for (const s of [...kocok(sekelas, rnd), ...kocok(lain, rnd)]) {
    if (hasil.length === 3) break;
    if (hasil.includes(s)) continue;
    // dua pengecoh dari kelompok yang sama juga dihindari (terlalu mudah dicoret)
    const gs = grup(s);
    if (gs && dipakaiGrup.has(gs)) continue;
    if (gs) dipakaiGrup.add(gs);
    hasil.push(s);
  }
  return hasil;
}
