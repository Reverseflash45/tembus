/* Mesin sesi soal, satu soal per layar.
   latihan: langsung dikoreksi, panel hasil muncul di bawah layar.
   simulasi: dinilai setelah dikumpulkan, ada waktu dan daftar soal. */
import type { Baris } from "../data/jenis";
import { HURUF, esc, skorBagian, skorTotal, tandai, uraiWritten } from "../inti";
import { catatJawaban, catatSimulasi } from "../simpan";
import { adaSuara, bacakan, hentikan, saatSuaraBerubah } from "../suara";
import { type Butir, bagianDari, bahasDari, grupAudio, idButir, kunciTampil, pilihanTampil } from "./butir";
import { IKON } from "./ikon";

export type OpsiSesi = {
  judul: string;
  mode: "latihan" | "simulasi";
  butir: Butir[];
  /** batas waktu simulasi dalam detik */
  batasDetik?: number;
  /** tujuan tombol keluar & "kembali" di hasil */
  kembali: string;
  labelKembali: string;
  lagi?: () => void;
  ulangiSalah?: (salah: Butir[]) => void;
  /** dipanggil sekali saat sesi selesai */
  selesai?: (benar: number, jumlah: number) => void;
};

const ORANG: Record<string, string> = { M: "Pria", W: "Wanita", N: "Narator" };

const PERINTAH: Record<Butir["jenis"], string> = {
  structure: "Structure: pilih yang paling tepat untuk mengisi bagian kosong",
  written: "Written Expression: bagian bergaris mana yang salah?",
  baca: "Reading",
  dialog: "Listening: dengarkan dialognya",
  rekaman: "Listening: dengarkan rekamannya",
};

export function mulaiSesi(wadah: HTMLElement, o: OpsiSesi): () => void {
  const n = o.butir.length;
  const simulasi = o.mode === "simulasi";
  const jawaban: (number | null)[] = Array(n).fill(null);
  const terkunci = new Set<number>();
  const diputar = new Set<string>();
  const transkripTerbuka = new Set<string>();
  let memutar: string | null = null;
  let i = 0;
  let selesai = false;
  let sisa = o.batasDetik ?? 0;
  let detak = 0;
  let tabBacaan: "bacaan" | "soal" = "bacaan";
  let bacaanTerakhir = "";
  let lembarTerbuka = false;

  document.body.classList.add("fokus");

  if (simulasi && o.batasDetik) {
    detak = window.setInterval(() => {
      sisa--;
      const el = wadah.querySelector<HTMLElement>(".waktu");
      if (el) {
        el.textContent = jam(sisa);
        el.classList.toggle("mepet", sisa <= 300);
      }
      if (sisa <= 0) kumpulkan(true);
    }, 1000);
  }

  const jam = (d: number) => `${String(Math.max(0, Math.floor(d / 60))).padStart(2, "0")}:${String(Math.max(0, d % 60)).padStart(2, "0")}`;
  const benarDi = (k: number) => jawaban[k] === kunciTampil(o.butir[k]);
  const dibuka = () => !simulasi && terkunci.has(i);

  /* ---------- bagian-bagian layar ---------- */
  function barAtas() {
    const maju = simulasi ? jawaban.filter((x) => x !== null).length : terkunci.size;
    return `<header class="bar-sesi"><div class="bar-sesi-isi">
      <button type="button" class="keluar" data-keluar aria-label="Keluar dari ${esc(o.judul)}">${IKON.silang}</button>
      <div class="kemajuan" role="progressbar" aria-label="Kemajuan" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${maju}"><i style="width:${(maju / n) * 100}%"></i></div>
      <span class="hitungan">${i + 1}/${n}</span>
      ${simulasi ? `<span class="waktu${sisa <= 300 ? " mepet" : ""}" aria-label="Sisa waktu">${jam(sisa)}</span><button type="button" class="keluar" data-lembar aria-label="Daftar soal">${IKON.daftar}</button>` : ""}
    </div></header>`;
  }

  function teksSoal(b: Butir) {
    const buka = dibuka();
    switch (b.jenis) {
      case "structure": {
        const [a, z] = b.soal.kalimat.split("___");
        let isi = `<span class="kosong" aria-label="bagian kosong"></span>`;
        if (buka) isi = `<span class="isi-kosong benar">${esc(pilihanTampil(b)[kunciTampil(b)])}</span>`;
        return `<p class="teks-soal">${esc(a)}${isi}${esc(z)}</p>`;
      }
      case "written": {
        const kunci = kunciTampil(b);
        const isi = uraiWritten(b.soal.kalimat)
          .map((p) => {
            if (p.garis === null) return esc(p.teks);
            const cls = buka ? (p.garis === kunci ? " kunci" : p.garis === jawaban[i] ? " keliru" : "") : jawaban[i] === p.garis ? " dipilih" : "";
            return `<button type="button" class="garis${cls}" data-pilih="${p.garis}" data-h="${HURUF[p.garis]}" ${buka || selesai ? "disabled" : ""} aria-label="Bagian ${HURUF[p.garis]}: ${esc(p.teks)}">${esc(p.teks)}</button>`;
          })
          .join("");
        return `<p class="teks-soal">${isi}</p>`;
      }
      case "baca":
        return `<p class="teks-soal">${esc(b.soal.tanya)}</p>`;
      case "dialog":
      case "rekaman": {
        const g = grupAudio(b)!;
        const tanya = b.jenis === "dialog" ? b.dialog.tanya : b.soal.tanya;
        const tampil = diputar.has(g) || transkripTerbuka.has(g) || buka || simulasi;
        return pemutar(b) + (tampil ? `<p class="teks-soal">${esc(tanya)}</p>` : `<p class="tunggu-audio">Pertanyaannya muncul setelah rekaman selesai diputar.</p>`);
      }
    }
  }

  function pemutar(b: Butir) {
    const g = grupAudio(b)!;
    const sudah = diputar.has(g);
    const sedang = memutar === g;
    const terkunciPutar = simulasi && sudah && !sedang;
    if (!adaSuara()) {
      return `<div class="pemutar"><div><p><b>Suara bahasa Inggris tidak tersedia di browser ini</b>Baca transkripnya, lalu jawab.</p>
        ${transkripTerbuka.has(g) ? transkrip(b) : `<button type="button" class="teks-tombol" data-transkrip>Tampilkan transkrip</button>`}</div></div>`;
    }
    const judul = sedang ? "Sedang diputar…" : terkunciPutar ? "Sudah diputar" : sudah ? "Putar lagi" : b.jenis === "rekaman" ? "Putar rekaman" : "Putar dialog";
    const ket = sedang
      ? "Tekan lagi untuk berhenti."
      : simulasi
        ? "Seperti tes aslinya, hanya bisa diputar sekali."
        : b.jenis === "rekaman"
          ? "Satu rekaman ini dipakai untuk beberapa soal."
          : "Pertanyaannya dibacakan di akhir.";
    return `<div class="pemutar${sedang ? " memutar" : ""}">
      <button type="button" class="tombol-putar" data-putar ${terkunciPutar ? "disabled" : ""} aria-label="${judul}">${sedang ? IKON.henti : IKON.putar}</button>
      <p><b>${judul}</b>${ket}</p></div>`;
  }

  function transkrip(b: Butir) {
    const baris = b.jenis === "dialog" ? [...b.dialog.baris, ["N", b.dialog.tanya] as const] : b.jenis === "rekaman" ? b.rekaman.baris : [];
    return `<ul class="transkrip">${baris.map(([s, t]) => `<li><b>${ORANG[s]}</b><span>${esc(t)}</span></li>`).join("")}</ul>`;
  }

  function opsi(b: Butir) {
    const pil = pilihanTampil(b);
    const kunci = kunciTampil(b);
    const dipilih = jawaban[i];
    const buka = dibuka();
    return `<ol class="opsi" aria-label="Pilihan jawaban">${pil
      .map((t, p) => {
        let cls = "";
        let tanda = "";
        if (buka) {
          if (p === kunci) {
            cls = "kunci";
            tanda = p === dipilih ? "Jawabanmu, benar" : "Jawaban benar";
          } else if (p === dipilih) {
            cls = "keliru";
            tanda = "Jawabanmu";
          } else cls = "redup";
        } else if (p === dipilih) cls = "dipilih";
        return `<li><button type="button" data-pilih="${p}" class="${cls}" ${buka || selesai ? "disabled" : ""} aria-pressed="${dipilih === p}">
          <span class="huruf" aria-hidden="true">${HURUF[p]}</span><span>${esc(t)}</span>${tanda ? `<span class="tanda">${tanda}</span>` : ""}</button></li>`;
      })
      .join("")}</ol>${!buka && !simulasi ? `<p class="petunjuk">Bisa juga pakai keyboard: A, B, C, D.</p>` : ""}`;
  }

  function bacaan(b: Butir) {
    if (b.jenis !== "baca") return "";
    const bukti = dibuka() || selesai ? b.soal.paragraf : undefined;
    return `<article class="bacaan" aria-label="Bacaan"><h2>${esc(b.bacaan.judul)}</h2>${b.bacaan.paragraf
      .map((p, k) => `<p id="par-${k + 1}"${bukti === k + 1 ? ' class="bukti"' : ""}><span class="no-par">${k + 1}</span>${esc(p)}</p>`)
      .join("")}<button type="button" class="tombol lebar ke-soal" data-tab="soal">Ke soal ${i + 1}</button></article>`;
  }

  function laci(b: Butir) {
    const terakhir = i === n - 1;
    if (simulasi) {
      return `<footer class="laci"><div class="laci-isi"><div class="baris-tombol">
        ${i > 0 ? `<button type="button" class="tombol kedua" data-mundur>Sebelumnya</button>` : ""}
        ${terakhir ? `<button type="button" class="tombol" data-kumpul>Kumpulkan</button>` : `<button type="button" class="tombol" data-maju>Berikutnya</button>`}
      </div></div></footer>`;
    }
    if (!dibuka()) return "";
    const benar = benarDi(i);
    let tambahan = "";
    if (b.jenis === "written") tambahan = `<p class="betul">Seharusnya: ${esc(b.soal.betul)}</p>`;
    if (b.jenis === "dialog" || b.jenis === "rekaman") tambahan = `<details><summary>Transkrip</summary>${transkrip(b)}</details>`;
    const bukti = b.jenis === "baca" && b.soal.paragraf ? `<button type="button" class="teks-tombol" data-bukti="${b.soal.paragraf}">Lihat buktinya di paragraf ${b.soal.paragraf}</button>` : "";
    return `<footer class="laci ${benar ? "benar" : "salah"}" role="status"><div class="laci-isi">
      <p class="vonis">${benar ? IKON.centang : IKON.silang}${benar ? "Betul!" : `Kurang tepat. Jawabannya ${HURUF[kunciTampil(b)]}.`}</p>
      <div class="bahas">${tambahan}<p>${tandai(bahasDari(b))}</p>${bukti}</div>
      <button type="button" class="tombol lebar" data-maju>${terakhir ? "Lihat hasil" : "Lanjut"}</button>
    </div></footer>`;
  }

  function lembar() {
    let bagianLalu = "";
    const isi = o.butir
      .map((b, k) => {
        const bg = bagianDari(b);
        const judul = bg !== bagianLalu ? `<li class="bagian">${bg === "listening" ? "Listening" : bg === "structure" ? "Structure & Written Expression" : "Reading"}</li>` : "";
        bagianLalu = bg;
        return `${judul}<li><button type="button" data-ke="${k}" class="${jawaban[k] !== null ? "terisi" : ""}" aria-current="${k === i}" aria-label="Soal ${k + 1}${jawaban[k] !== null ? ", sudah dijawab" : ", belum dijawab"}">${k + 1}</button></li>`;
      })
      .join("");
    const kosong = jawaban.filter((x) => x === null).length;
    return `<div class="lapisan" ${lembarTerbuka ? "" : "hidden"}><section class="lembar" role="dialog" aria-label="Daftar soal">
      <header><h2 style="margin:0">Daftar soal</h2><button type="button" class="keluar" data-tutup-lembar aria-label="Tutup">${IKON.silang}</button></header>
      <p class="catatan" style="margin:0 0 12px">${kosong ? `${kosong} soal belum dijawab. Kotak gelap berarti sudah dijawab.` : "Semua soal sudah dijawab."}</p>
      <ol class="kisi-nomor">${isi}</ol>
      <p style="margin:18px 0 0"><button type="button" class="tombol lebar" data-kumpul>Kumpulkan sekarang</button></p>
    </section></div>`;
  }

  function gambar(dariKeyboard = false) {
    const b = o.butir[i];
    const adaBacaan = b.jenis === "baca";
    if (adaBacaan && b.bacaan.id !== bacaanTerakhir) {
      // bacaan baru: di layar sempit tampilkan teksnya dulu
      tabBacaan = "bacaan";
      bacaanTerakhir = b.bacaan.id;
    }
    wadah.innerHTML = `<div class="sesi${adaBacaan ? " ada-bacaan" : ""}" data-tab="${tabBacaan}">
      ${barAtas()}
      <div class="isi-sesi">
        ${adaBacaan ? `<div class="tab-bacaan" role="group" aria-label="Tampilan"><button type="button" data-tab="bacaan" aria-pressed="${tabBacaan === "bacaan"}">Bacaan</button><button type="button" data-tab="soal" aria-pressed="${tabBacaan === "soal"}">Soal ${i + 1}</button></div>` : ""}
        ${bacaan(b)}
        <section class="soal" tabindex="-1" aria-label="Soal ${i + 1} dari ${n}">
          <p class="jenis-soal">${PERINTAH[b.jenis]}</p>
          ${teksSoal(b)}
          ${opsi(b)}
        </section>
      </div>
      ${laci(b)}
      ${simulasi ? lembar() : ""}
    </div>`;
    if (dariKeyboard && dibuka()) wadah.querySelector<HTMLElement>("[data-maju]")?.focus({ preventScroll: true });
  }

  /* ---------- aksi ---------- */
  function pilih(p: number, dariKeyboard = false) {
    if (selesai || dibuka()) return;
    jawaban[i] = p;
    if (!simulasi) {
      terkunci.add(i);
      catatJawaban(idButir(o.butir[i]), benarDi(i));
    }
    gambar(dariKeyboard);
  }

  function pindah(k: number, dariKeyboard = false) {
    if (k < 0 || k >= n) return;
    if (memutar) {
      hentikan();
      memutar = null;
    }
    i = k;
    // pindah antarsoal dalam bacaan yang sama: langsung ke soalnya
    const b = o.butir[i];
    if (b.jenis === "baca" && b.bacaan.id === bacaanTerakhir) tabBacaan = "soal";
    lembarTerbuka = false;
    gambar();
    window.scrollTo({ top: 0 });
    if (dariKeyboard) wadah.querySelector<HTMLElement>(".soal")?.focus({ preventScroll: true });
  }

  function maju(dariKeyboard = false) {
    if (i === n - 1) {
      if (!simulasi) akhiri();
      return;
    }
    pindah(i + 1, dariKeyboard);
  }

  async function putar() {
    const b = o.butir[i];
    const g = grupAudio(b);
    if (!g) return;
    if (memutar === g) {
      hentikan();
      memutar = null;
      diputar.add(g);
      gambar();
      return;
    }
    if (simulasi && diputar.has(g)) return;
    const baris: Baris[] = b.jenis === "dialog" ? [...b.dialog.baris, ["N", b.dialog.tanya]] : b.jenis === "rekaman" ? b.rekaman.baris : [];
    memutar = g;
    gambar();
    await bacakan(baris);
    if (memutar === g) {
      memutar = null;
      diputar.add(g);
      gambar();
    }
  }

  function kumpulkan(waktuHabis = false) {
    if (selesai) return;
    const kosong = jawaban.filter((x) => x === null).length;
    if (!waktuHabis && kosong > 0 && !confirm(`Masih ada ${kosong} soal kosong. Tetap kumpulkan?`)) return;
    o.butir.forEach((b, k) => catatJawaban(idButir(b), benarDi(k)));
    akhiri();
  }

  function akhiri() {
    selesai = true;
    clearInterval(detak);
    hentikan();
    document.body.classList.remove("fokus");
    o.selesai?.(o.butir.filter((_, k) => benarDi(k)).length, n);
    hasil();
  }

  function hasil() {
    const benar = o.butir.filter((_, k) => benarDi(k)).length;
    const salah = o.butir.map((b, k) => ({ b, k })).filter(({ k }) => !benarDi(k));
    let kepala: string;
    if (simulasi) {
      const per = (bg: "listening" | "structure" | "reading") => {
        const ks = o.butir.map((b, k) => [b, k] as const).filter(([b]) => bagianDari(b) === bg);
        return { b: ks.filter(([, k]) => benarDi(k)).length, n: ks.length };
      };
      const L = per("listening");
      const S = per("structure");
      const R = per("reading");
      const l = skorBagian("listening", L.b, L.n);
      const s = skorBagian("structure", S.b, S.n);
      const r = skorBagian("reading", R.b, R.n);
      const total = skorTotal(l, s, r);
      catatSimulasi({ waktu: Date.now(), l, s, r, total, benar, jumlah: n });
      kepala = `<p class="jenis-soal">Perkiraan skor TOEFL ITP</p><p class="angka-hasil">${total}<small> / 677</small></p>
        <h1>${total >= 550 ? "Keren, sudah di atas 550." : total >= 500 ? "Tembus 500!" : total >= 450 ? "Sudah lewat 450." : "Masih ada ruang buat naik."}</h1>
        <div class="rincian"><div>Listening<b>${l}</b>${L.b} dari ${L.n} benar</div><div>Structure<b>${s}</b>${S.b} dari ${S.n} benar</div><div>Reading<b>${r}</b>${R.b} dari ${R.n} benar</div></div>
        <p class="catatan">Perkiraan kasar dari ${n} soal, bukan skor resmi. Tes aslinya 140 soal dan tabel konversinya berbeda tiap paket.</p>`;
    } else {
      const persen = Math.round((benar / n) * 100);
      kepala = `<p class="jenis-soal">${esc(o.judul)}</p><p class="angka-hasil">${benar}<small> dari ${n} benar</small></p>
        <h1>${persen === 100 ? "Sempurna, semua benar." : persen >= 80 ? "Mantap, tinggal dipoles." : persen >= 50 ? "Lumayan. Cek yang salah di bawah." : "Pelan-pelan aja, baca pembahasannya dulu."}</h1>
        <p class="catatan">Soal yang salah bakal lebih sering muncul di latihan berikutnya.</p>`;
    }
    const adaUlang = salah.length > 0 && Boolean(o.ulangiSalah);
    const tombol = [
      adaUlang ? `<button type="button" class="tombol" data-ulang-salah>Ulangi ${salah.length} yang salah</button>` : "",
      o.lagi ? `<button type="button" class="tombol${adaUlang ? " kedua" : ""}" data-lagi>${simulasi ? "Simulasi lagi" : "Latihan lagi"}</button>` : "",
      `<a class="tombol kedua" href="${o.kembali}">${esc(o.labelKembali)}</a>`,
    ].join("");
    const ulas = salah
      .map(({ b, k }) => {
        const pil = pilihanTampil(b);
        const kunci = kunciTampil(b);
        const ringkas =
          b.jenis === "structure"
            ? esc(b.soal.kalimat)
            : b.jenis === "written"
              ? uraiWritten(b.soal.kalimat).map((p) => (p.garis === null ? esc(p.teks) : `<u>${esc(p.teks)}</u>`)).join("")
              : b.jenis === "baca"
                ? esc(b.soal.tanya)
                : b.jenis === "dialog"
                  ? `“${esc(b.dialog.baris.map(([, t]) => t).join(" "))}” ${esc(b.dialog.tanya)}`
                  : esc(b.soal.tanya);
        const dijawab = jawaban[k] === null ? "tidak dijawab" : `${HURUF[jawaban[k]!]}. ${esc(pil[jawaban[k]!])}`;
        return `<li><details><summary><span class="no">${k + 1}</span><span class="q">${ringkas}</span></summary><div class="dalam">
          <p>Jawabanmu: <s>${dijawab}</s></p><p>Jawaban benar: <b>${HURUF[kunci]}. ${esc(pil[kunci])}</b>${b.jenis === "written" ? `, seharusnya <b>${esc(b.soal.betul)}</b>` : ""}</p>
          <p style="color:var(--redup)">${tandai(bahasDari(b))}</p></div></details></li>`;
      })
      .join("");
    wadah.innerHTML = `<section class="hasil">${kepala}<div class="baris-tombol" style="flex-wrap:wrap;margin:22px 0 8px">${tombol}</div>
      ${ulas ? `<h2>Yang salah (${salah.length})</h2><p class="catatan" style="margin-top:-6px">Ketuk untuk melihat pembahasannya.</p><ol class="ulas">${ulas}</ol>` : ""}</section>`;
    window.scrollTo({ top: 0 });
  }

  /* ---------- event ---------- */
  function klik(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (el.classList.contains("lapisan")) {
      lembarTerbuka = false;
      gambar();
      return;
    }
    const t = el.closest<HTMLElement>("button");
    if (!t || t.hasAttribute("disabled")) return;
    const d = t.dataset;
    if (d.pilih !== undefined) pilih(Number(d.pilih));
    else if (d.ke !== undefined) pindah(Number(d.ke));
    else if (d.tab) {
      tabBacaan = d.tab as "bacaan" | "soal";
      gambar();
      window.scrollTo({ top: 0 });
    } else if (d.bukti) {
      tabBacaan = "bacaan";
      gambar();
      document.getElementById(`par-${d.bukti}`)?.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    } else if (t.hasAttribute("data-maju")) maju();
    else if (t.hasAttribute("data-mundur")) pindah(i - 1);
    else if (t.hasAttribute("data-putar")) void putar();
    else if (t.hasAttribute("data-transkrip")) {
      transkripTerbuka.add(grupAudio(o.butir[i])!);
      gambar();
    } else if (t.hasAttribute("data-kumpul")) kumpulkan();
    else if (t.hasAttribute("data-lembar")) {
      lembarTerbuka = true;
      gambar();
      wadah.querySelector<HTMLElement>(".kisi-nomor [aria-current='true']")?.focus();
    } else if (t.hasAttribute("data-tutup-lembar")) {
      lembarTerbuka = false;
      gambar();
    } else if (t.hasAttribute("data-keluar")) {
      if (simulasi && !selesai && !confirm("Keluar dari simulasi? Jawabanmu tidak akan dinilai.")) return;
      location.hash = o.kembali;
    } else if (t.hasAttribute("data-lagi")) o.lagi?.();
    else if (t.hasAttribute("data-ulang-salah")) o.ulangiSalah?.(o.butir.filter((_, k) => !benarDi(k)));
  }

  function tombolKeyboard(e: KeyboardEvent) {
    if (selesai || e.ctrlKey || e.metaKey || e.altKey) return;
    if ((e.target as HTMLElement).closest("input, textarea")) return;
    if (e.key === "Escape" && lembarTerbuka) {
      lembarTerbuka = false;
      gambar();
      return;
    }
    const p = "abcd".indexOf(e.key.toLowerCase());
    const angka = "1234".indexOf(e.key);
    if (p >= 0 || angka >= 0) {
      e.preventDefault();
      pilih(p >= 0 ? p : angka, true);
    } else if ((e.key === "Enter" || e.key === "ArrowRight") && (simulasi || dibuka()) && !(e.target as HTMLElement).closest("button, a")) {
      e.preventDefault();
      maju(true);
    } else if (e.key === "ArrowLeft" && simulasi) pindah(i - 1, true);
  }

  wadah.addEventListener("click", klik);
  document.addEventListener("keydown", tombolKeyboard);
  const lepasSuara = saatSuaraBerubah(() => {
    if (!selesai && grupAudio(o.butir[i]) && !memutar) gambar();
  });
  gambar();
  window.scrollTo({ top: 0 });

  return () => {
    lepasSuara();
    clearInterval(detak);
    hentikan();
    document.body.classList.remove("fokus");
    wadah.removeEventListener("click", klik);
    document.removeEventListener("keydown", tombolKeyboard);
  };
}
