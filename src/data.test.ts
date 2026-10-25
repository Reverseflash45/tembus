import { describe, expect, it } from "vitest";
import { BACAAN } from "./data/bacaan";
import { DIALOG, REKAMAN } from "./data/dengar";
import { KELOMPOK_SINONIM, KOSAKATA } from "./data/kosakata";
import { SOAL_A } from "./data/soal-a";
import { SOAL_B } from "./data/soal-b";
import { TOPIK } from "./data/topik";
import { uraiWritten } from "./inti";

const SOAL = [...SOAL_A, ...SOAL_B];

describe("bank soal Structure & Written Expression", () => {
  it("id unik dan setiap topik punya 5 structure + 4 written", () => {
    expect(new Set(SOAL.map((s) => s.id)).size).toBe(SOAL.length);
    for (const t of TOPIK) {
      expect(SOAL.filter((s) => s.topik === t.id && s.jenis === "structure"), t.id).toHaveLength(5);
      expect(SOAL.filter((s) => s.topik === t.id && s.jenis === "written"), t.id).toHaveLength(4);
    }
  });

  it.each(SOAL.filter((s) => s.jenis === "structure").map((s) => [s.id, s] as const))("%s: satu tempat kosong, 4 pilihan berbeda", (_, s) => {
    if (s.jenis !== "structure") return;
    expect(s.kalimat.split("___")).toHaveLength(2);
    expect(new Set(s.pilihan.map((p) => p.toLowerCase())).size).toBe(4);
    expect([0, 1, 2, 3]).toContain(s.jawab);
    expect(s.bahas.length).toBeGreaterThan(20);
  });

  it.each(SOAL.filter((s) => s.jenis === "written").map((s) => [s.id, s] as const))("%s: tepat 4 bagian bergaris", (_, s) => {
    if (s.jenis !== "written") return;
    const garis = uraiWritten(s.kalimat).filter((p) => p.garis !== null);
    expect(garis.map((g) => g.garis)).toEqual([0, 1, 2, 3]);
    expect(s.betul.length).toBeGreaterThan(0);
    // bentuk yang benar tidak boleh sama dengan bagian yang disalahkan
    expect(s.betul.toLowerCase()).not.toBe(garis[s.jawab].teks.toLowerCase());
  });
});

describe("sebaran kunci written expression", () => {
  it("tiap huruf A–D jadi kunci di setidaknya 18% soal", () => {
    const w = SOAL.filter((s) => s.jenis === "written");
    for (const h of [0, 1, 2, 3]) expect(w.filter((s) => s.jawab === h).length / w.length, `huruf ${h}`).toBeGreaterThanOrEqual(0.18);
  });
});

describe("bacaan & listening", () => {
  it("setiap bacaan 4 paragraf dan 8 soal, rujukan paragraf valid", () => {
    for (const b of BACAAN) {
      expect(b.paragraf).toHaveLength(4);
      expect(b.soal).toHaveLength(8);
      for (const s of b.soal) {
        expect(new Set(s.pilihan).size).toBe(4);
        if (s.paragraf) expect(s.paragraf).toBeLessThanOrEqual(b.paragraf.length);
      }
    }
  });

  it("soal kosakata bacaan menyebut kata yang memang ada di paragrafnya", () => {
    for (const b of BACAAN)
      for (const s of b.soal.filter((x) => x.tipe === "kosakata")) {
        const kata = s.tanya.match(/"([^"]+)"/)![1];
        expect(b.paragraf[s.paragraf! - 1], `${s.id}: ${kata}`).toMatch(new RegExp(`\\b${kata}\\b`));
      }
  });

  it("id listening unik dan pilihan berbeda", () => {
    const id = [...DIALOG.map((d) => d.id), ...REKAMAN.flatMap((r) => r.soal.map((s) => s.id))];
    expect(new Set(id).size).toBe(id.length);
    for (const d of DIALOG) expect(new Set(d.pilihan).size).toBe(4);
    for (const r of REKAMAN) for (const s of r.soal) expect(new Set(s.pilihan).size).toBe(4);
  });
});

describe("kosakata", () => {
  it("kata unik, setiap contoh memakai katanya", () => {
    expect(new Set(KOSAKATA.map((k) => k.kata)).size).toBe(KOSAKATA.length);
    for (const k of KOSAKATA) {
      const akar = k.kata.slice(0, Math.max(4, k.kata.length - 3));
      expect(k.contoh.toLowerCase(), k.kata).toContain(akar.toLowerCase());
    }
  });

  it("tidak ada sinonim yang muncul di dua kelompok", () => {
    const semua = KELOMPOK_SINONIM.flat();
    expect(new Set(semua).size).toBe(semua.length);
  });
});
