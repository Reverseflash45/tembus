/* Membacakan dialog dengan suara bahasa Inggris bawaan peramban. */
import type { Baris, Penutur } from "./data/jenis";

const sintesis = typeof window !== "undefined" ? window.speechSynthesis : undefined;

export const adaSuara = () => Boolean(sintesis) && suaraInggris().length > 0;

function suaraInggris() {
  return (sintesis?.getVoices() ?? []).filter((v) => v.lang.toLowerCase().startsWith("en"));
}

const PRIA = /\b(male|david|guy|mark|daniel|alex|fred|george|ryan|christopher|eric|james|tom|aaron|arthur|oliver)\b/i;
const WANITA = /\b(female|zira|aria|jenny|samantha|karen|susan|hazel|libby|sonia|michelle|victoria|natasha|emma|ava|allison|serena|moira|tessa)\b/i;

/** Pilih suara per penutur; kalau cuma ada satu suara, bedakan lewat nada. */
function pemeran(): Record<Penutur, { suara?: SpeechSynthesisVoice; nada: number }> {
  const semua = suaraInggris();
  const us = semua.filter((v) => /en-us/i.test(v.lang));
  const kolam = us.length ? us : semua;
  const pria = kolam.find((v) => PRIA.test(v.name) && !/female/i.test(v.name)) ?? semua.find((v) => PRIA.test(v.name) && !/female/i.test(v.name));
  const wanita = kolam.find((v) => WANITA.test(v.name)) ?? semua.find((v) => WANITA.test(v.name));
  const cadangan = kolam[0];
  return {
    M: { suara: pria ?? cadangan, nada: pria ? 1 : 0.75 },
    W: { suara: wanita ?? cadangan, nada: wanita ? 1 : 1.3 },
    N: { suara: (us.find((v) => v !== pria && v !== wanita) ?? wanita ?? cadangan), nada: 1 },
  };
}

let giliran = 0;

/** Bacakan baris-baris berurutan. Selesai (resolve) saat baris terakhir habis
    atau saat dihentikan. */
export function bacakan(baris: Baris[], laju = 0.92): Promise<void> {
  if (!sintesis) return Promise.resolve();
  hentikan();
  const id = ++giliran;
  const p = pemeran();
  return new Promise((selesai) => {
    let i = 0;
    const lanjut = () => {
      if (id !== giliran || i >= baris.length) return selesai();
      const [siapa, teks] = baris[i++];
      const u = new SpeechSynthesisUtterance(teks);
      const r = p[siapa];
      if (r.suara) u.voice = r.suara;
      u.lang = r.suara?.lang ?? "en-US";
      u.pitch = r.nada;
      u.rate = laju;
      u.onend = () => setTimeout(lanjut, siapa === "N" ? 500 : 280);
      u.onerror = () => setTimeout(lanjut, 50);
      sintesis.speak(u);
    };
    lanjut();
  });
}

export function hentikan() {
  giliran++;
  sintesis?.cancel();
}

/** Daftar suara sering baru tersedia sesaat setelah halaman dimuat (event
    voiceschanged). Mengembalikan fungsi untuk berhenti mendengarkan. */
export function saatSuaraBerubah(f: () => void): () => void {
  if (!sintesis?.addEventListener) return () => {};
  sintesis.addEventListener("voiceschanged", f);
  return () => sintesis.removeEventListener("voiceschanged", f);
}
