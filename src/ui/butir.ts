/* Satu "butir" = satu soal yang siap ditampilkan, dari jenis apa pun. */
import type { Bacaan, DialogPendek, Empat, Huruf, Rekaman, SoalBaca, SoalStructure, SoalWritten } from "../data/jenis";
import { type Bagian, kocok, uraiWritten } from "../inti";

export type Butir =
  | { jenis: "structure"; soal: SoalStructure; urut: number[] }
  | { jenis: "written"; soal: SoalWritten }
  | { jenis: "baca"; bacaan: Bacaan; soal: SoalBaca; urut: number[] }
  | { jenis: "dialog"; dialog: DialogPendek; urut: number[] }
  | { jenis: "rekaman"; rekaman: Rekaman; soal: Rekaman["soal"][number]; urut: number[] };

const urutAcak = (rnd: () => number) => kocok([0, 1, 2, 3], rnd);

export const dariStructure = (soal: SoalStructure | SoalWritten, rnd: () => number): Butir =>
  soal.jenis === "structure" ? { jenis: "structure", soal, urut: urutAcak(rnd) } : { jenis: "written", soal };

export const dariBacaan = (bacaan: Bacaan, rnd: () => number): Butir[] =>
  bacaan.soal.map((soal) => ({ jenis: "baca", bacaan, soal, urut: urutAcak(rnd) }));

export const dariDialog = (dialog: DialogPendek, rnd: () => number): Butir => ({ jenis: "dialog", dialog, urut: urutAcak(rnd) });

export const dariRekaman = (rekaman: Rekaman, rnd: () => number): Butir[] =>
  rekaman.soal.map((soal) => ({ jenis: "rekaman", rekaman, soal, urut: urutAcak(rnd) }));

export function idButir(b: Butir) {
  switch (b.jenis) {
    case "structure":
    case "written":
    case "baca":
    case "rekaman":
      return b.soal.id;
    case "dialog":
      return b.dialog.id;
  }
}

export function bagianDari(b: Butir): Bagian {
  return b.jenis === "dialog" || b.jenis === "rekaman" ? "listening" : b.jenis === "baca" ? "reading" : "structure";
}

export const LABEL_JENIS: Record<Butir["jenis"], string> = {
  structure: "Structure",
  written: "Written Expression",
  baca: "Reading",
  dialog: "Listening, dialog pendek",
  rekaman: "Listening, rekaman panjang",
};

function dasar(b: Butir): { pilihan: Empat; jawab: Huruf } {
  switch (b.jenis) {
    case "structure":
    case "baca":
    case "rekaman":
      return b.soal;
    case "dialog":
      return b.dialog;
    case "written": {
      const garis = uraiWritten(b.soal.kalimat).filter((p) => p.garis !== null).map((p) => p.teks) as Empat;
      return { pilihan: garis, jawab: b.soal.jawab };
    }
  }
}

/** Pilihan sesuai urutan tampil (sudah diacak untuk selain written). */
export function pilihanTampil(b: Butir): string[] {
  const d = dasar(b);
  return "urut" in b ? b.urut.map((i) => d.pilihan[i]) : [...d.pilihan];
}

/** Indeks tampil dari jawaban yang benar. */
export function kunciTampil(b: Butir): number {
  const d = dasar(b);
  return "urut" in b ? b.urut.indexOf(d.jawab) : d.jawab;
}

export function bahasDari(b: Butir) {
  switch (b.jenis) {
    case "structure":
    case "written":
    case "baca":
    case "rekaman":
      return b.soal.bahas;
    case "dialog":
      return b.dialog.bahas;
  }
}

/** Kunci grup audio: satu rekaman panjang dipakai beberapa soal. */
export const grupAudio = (b: Butir) => (b.jenis === "dialog" ? b.dialog.id : b.jenis === "rekaman" ? b.rekaman.id : null);
