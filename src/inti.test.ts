import { describe, expect, it } from "vitest";
import { KELOMPOK_SINONIM, KOSAKATA } from "./data/kosakata";
import { JARAK_HARI, acak, awalHari, kocok, nilaiKartu, perluDiulang, pilihPengecoh, pilihSoal, skorBagian, skorTotal, tandai, uraiWritten } from "./inti";
import { runtutan, tanggalLokal } from "./simpan";

describe("skor", () => {
  it("rentang resmi 310–677", () => {
    expect(skorTotal(skorBagian("listening", 0, 50), skorBagian("structure", 0, 40), skorBagian("reading", 0, 50))).toBe(310);
    expect(skorTotal(skorBagian("listening", 50, 50), skorBagian("structure", 40, 40), skorBagian("reading", 50, 50))).toBe(677);
  });
  it("tidak pernah turun saat jawaban benar bertambah", () => {
    let lalu = 0;
    for (let b = 0; b <= 40; b++) {
      const s = skorBagian("structure", b, 40);
      expect(s).toBeGreaterThanOrEqual(lalu);
      lalu = s;
    }
  });
  it("separuh benar ada di kisaran 440–500", () => {
    const t = skorTotal(skorBagian("listening", 25, 50), skorBagian("structure", 20, 40), skorBagian("reading", 25, 50));
    expect(t).toBeGreaterThan(440);
    expect(t).toBeLessThan(500);
  });
});

describe("kotak Leitner", () => {
  const kini = new Date(2026, 9, 25, 15).getTime();
  it("benar naik kotak, salah kembali ke 1", () => {
    let k = nilaiKartu(undefined, true, kini);
    expect(k.kotak).toBe(1);
    k = nilaiKartu(k, true, kini);
    expect(k.kotak).toBe(2);
    expect(k.jatuhTempo).toBe(awalHari(kini) + JARAK_HARI[1] * 86_400_000);
    expect(nilaiKartu(k, false, kini).kotak).toBe(1);
  });
  it("kartu baru dan kartu jatuh tempo perlu diulang", () => {
    expect(perluDiulang(undefined, kini)).toBe(true);
    expect(perluDiulang({ kotak: 3, jatuhTempo: kini + 1 }, kini)).toBe(false);
  });
});

describe("written expression", () => {
  it("memecah bagian bergaris", () => {
    const p = uraiWritten("The [cat] sat [on] the [mat] [today].");
    expect(p.map((x) => x.teks)).toEqual(["The ", "cat", " sat ", "on", " the ", "mat", " ", "today", "."]);
    expect(p.filter((x) => x.garis !== null).map((x) => x.garis)).toEqual([0, 1, 2, 3]);
  });
});

describe("pemilihan soal", () => {
  it("mengutamakan yang belum pernah dijawab", () => {
    const semua = Array.from({ length: 20 }, (_, i) => ({ id: `s${i}` }));
    const riwayat: Record<string, { benar: number; kali: number }> = {};
    for (let i = 0; i < 10; i++) riwayat[`s${i}`] = { benar: 5, kali: 5 };
    let baru = 0;
    for (let b = 1; b <= 50; b++) baru += pilihSoal(semua, 5, riwayat, acak(b)).filter((s) => !riwayat[s.id]).length;
    expect(baru / 250).toBeGreaterThan(0.7);
  });
  it("kocok tidak mengubah isi", () => {
    expect(kocok([1, 2, 3, 4, 5], acak(9)).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("pengecoh kosakata", () => {
  it("tidak pernah memilih sinonim sekelompok atau duplikat", () => {
    for (const [i, k] of KOSAKATA.entries()) {
      const p = pilihPengecoh(k, KOSAKATA, KELOMPOK_SINONIM, acak(i + 1));
      expect(p).toHaveLength(3);
      expect(new Set(p).size).toBe(3);
      expect(p).not.toContain(k.sinonim);
      const g = KELOMPOK_SINONIM.find((x) => x.includes(k.sinonim));
      if (g) for (const s of p) expect(g, `${k.kata}: ${s}`).not.toContain(s);
    }
  });
});

describe("teks & tanggal", () => {
  it("tandai meng-escape HTML dan memberi tebal/stabilo/miring", () => {
    expect(tandai("<b> **x** ==y== *z*")).toBe('&lt;b&gt; <strong>x</strong> <mark class="stabilo">y</mark> <em>z</em>');
  });
  it("runtutan hari", () => {
    const kini = new Date(2026, 9, 25);
    const h = (d: number) => tanggalLokal(new Date(2026, 9, d));
    expect(runtutan([h(23), h(24), h(25)], kini)).toBe(3);
    expect(runtutan([h(23), h(24)], kini)).toBe(2);
    expect(runtutan([h(20), h(25)], kini)).toBe(1);
    expect(runtutan([], kini)).toBe(0);
  });
});
