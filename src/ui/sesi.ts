/* Mesin sesi soal: mode latihan (langsung dikoreksi) dan simulasi (dinilai di akhir). */
import type { Baris } from "../data/jenis";
import { HURUF, esc, skorBagian, skorTotal, tandai, uraiWritten } from "../inti";
import { catatJawaban, catatSimulasi } from "../simpan";
import { adaSuara, bacakan, hentikan, saatSuaraBerubah } from "../suara";
import { type Butir, LABEL_JENIS, bagianDari, bahasDari, grupAudio, idButir, kunciTampil, pilihanTampil } from "./butir";

export type OpsiSesi = {
  judul: string;
  mode: "latihan" | "simulasi";
  butir: Butir[];
  /** batas waktu simulasi dalam detik */
  batasDetik?: number;
  /** tautan kembali, mis. "#/materi" */
  kembali: string;
  labelKembali: string;
  /** sesi baru dengan soal lain */
  lagi?: () => void;
  /** sesi baru berisi butir yang salah */
  ulangiSalah?: (salah: Butir[]) => void;
  /** satu soal tanpa lembar jawaban, untuk beranda */
  mini?: boolean;
};

const ORANG: Record<string, string> = { M: "Pria", W: "Wanita", N: "Narator" };

export function mulaiSesi(wadah: HTMLElement, o: OpsiSesi): () => void {
  const n = o.butir.length;
  const jawaban: (number | null)[] = Array(n).fill(null);
  const terkunci = new Set<number>();
  const diputar = new Set<string>();
  const transkripTerbuka = new Set<string>();
  let memutar: string | null = null;
  let i = 0;
  let selesai = false;
  /** soal yang barusan diarsir: hanya bulatannya yang dianimasikan */
  let baru = -1;
  let bacaanTutup = false;
  const layarSempit = () => matchMedia("(max-width: 980px)").matches;
  let sisa = o.batasDetik ?? 0;
  let detak = 0;
  const simulasi = o.mode === "simulasi";

  if (simulasi && o.batasDetik) {
    detak = window.setInterval(() => {
      sisa--;
      const el = wadah.querySelector<HTMLElement>(".waktu");
      if (el) {
        el.textContent = jam(sisa);
        el.classList.toggle("mepet", sisa <= 300);
      }
      if (sisa <= 0) kumpulkan();
    }, 1000);
  }

  const jam = (d: number) => `${String(Math.max(0, Math.floor(d / 60))).padStart(2, "0")}:${String(Math.max(0, d % 60)).padStart(2, "0")}`;
  const benarDi = (k: number) => jawaban[k] === kunciTampil(o.butir[k]);

  /* ---------- tampilan soal ---------- */
  function teksSoal(b: Butir, dibuka: boolean) {
    switch (b.jenis) {
      case "structure": {
        const [a, z] = b.soal.kalimat.split("___");
        return `<p class="teks-soal">${esc(a)}<span class="kosong" aria-label="bagian kosong"></span>${esc(z)}</p>`;
      }
      case "written": {
        const isi = uraiWritten(b.soal.kalimat)
          .map((p) =>
            p.garis === null
              ? esc(p.teks)
              : `<span class="garis${dibuka && p.garis === b.soal.jawab ? " salah-di-sini" : ""}" data-h="${HURUF[p.garis]}">${esc(p.teks)}</span>`,
          )
          .join("");
        return `<p class="teks-soal">${isi}</p><p class="tersembunyi">Pilih bagian bergaris yang salah.</p>`;
      }
      case "baca":
        return `<p class="teks-soal">${esc(b.soal.tanya)}</p>`;
      case "dialog":
      case "rekaman": {
        const g = grupAudio(b)!;
        const tanya = b.jenis === "dialog" ? b.dialog.tanya : b.soal.tanya;
        const tampil = diputar.has(g) || transkripTerbuka.has(g) || dibuka;
        return pemutar(b) + (tampil ? `<p class="teks-soal">${esc(tanya)}</p>` : `<p class="teks-soal" style="color:var(--redup)">Pertanyaannya muncul setelah rekaman diputar.</p>`);
      }
    }
  }

  function pemutar(b: Butir) {
    const g = grupAudio(b)!;
    const sudah = diputar.has(g);
    const kunci = simulasi && sudah;
    const bisa = adaSuara();
    const sedang = memutar === g;
    const label = sedang ? "Berhenti" : kunci ? "Sudah diputar" : sudah ? "Putar lagi" : b.jenis === "rekaman" ? "Putar rekaman" : "Putar dialog";
    const ket = !bisa
      ? "Browser ini tidak punya suara bahasa Inggris. Baca transkripnya dulu, lalu jawab."
      : simulasi
        ? "Seperti tes aslinya, rekaman hanya bisa diputar sekali."
        : b.jenis === "rekaman"
          ? "Rekaman ini dipakai untuk beberapa soal berikutnya juga."
          : "Dengarkan dialognya. Pertanyaan dibacakan di akhir.";
    return `<div class="pemutar${sedang ? " memutar" : ""}">
      ${bisa ? `<button type="button" class="tombol" data-putar ${kunci && !sedang ? "disabled" : ""}><span class="gelombang" aria-hidden="true"><i></i><i></i><i></i><i></i></span>${label}</button>` : `<button type="button" class="tombol kedua" data-transkrip>Tampilkan transkrip</button>`}
      <p>${ket}</p>
    </div>${!bisa && transkripTerbuka.has(g) ? transkrip(b) : ""}`;
  }

  function transkrip(b: Butir) {
    const baris = b.jenis === "dialog" ? [...b.dialog.baris, ["N", b.dialog.tanya] as const] : b.jenis === "rekaman" ? b.rekaman.baris : [];
    return `<ul class="transkrip">${baris.map(([s, t]) => `<li><b>${ORANG[s]}</b><span>${esc(t)}</span></li>`).join("")}</ul>`;
  }

  function daftarPilihan(b: Butir, k: number, dibuka: boolean) {
    const pil = pilihanTampil(b);
    const kunci = kunciTampil(b);
    const dipilih = jawaban[k];
    const nonaktif = dibuka || selesai;
    return `<ol class="pilihan" aria-label="Pilihan jawaban">${pil
      .map((t, p) => {
        const cls = dibuka ? (p === kunci ? "kunci" : p === dipilih ? "keliru" : "") : "";
        return `<li><button type="button" data-pilih="${p}" class="${cls}" ${nonaktif ? "disabled" : ""} aria-pressed="${dipilih === p}">
          <span class="bulat${dipilih === p ? ` arsir${baru === k ? " baru" : ""}` : ""}" aria-hidden="true">${HURUF[p]}</span><span class="isi">${esc(t)}</span></button></li>`;
      })
      .join("")}</ol>`;
  }

  function pembahasan(b: Butir, k: number) {
    const benar = benarDi(k);
    let tambahan = "";
    if (b.jenis === "written") tambahan = `<p class="betul">Seharusnya: ${esc(b.soal.betul)}</p>`;
    if (b.jenis === "dialog" || b.jenis === "rekaman") tambahan = `<details><summary>Transkrip</summary>${transkrip(b)}</details>`;
    const judul = jawaban[k] === null ? "nggak dijawab" : benar ? "betul!" : `kurang tepat, jawabannya ${HURUF[kunciTampil(b)]}`;
    return `<div class="bahas" role="status"><p class="judul-bahas">${judul}</p>${tambahan}<p>${tandai(bahasDari(b))}</p></div>`;
  }

  function lembarJawab() {
    if (o.mini) return "";
    const isi = o.butir
      .map((_, k) => {
        const tanda = !simulasi && terkunci.has(k) ? (benarDi(k) ? "✓" : "✗") : "";
        return `<li><button type="button" data-ke="${k}" aria-current="${k === i}" aria-label="Soal ${k + 1}${jawaban[k] !== null ? `, dijawab ${HURUF[jawaban[k]!]}` : ""}">
          <span class="no">${k + 1}</span>${HURUF.map((h, p) => `<span class="bulat${jawaban[k] === p ? ` arsir${baru === k ? " baru" : ""}` : ""}" aria-hidden="true">${h}</span>`).join("")}<span class="tanda" aria-hidden="true">${tanda}</span></button></li>`;
      })
      .join("");
    const terjawab = jawaban.filter((x) => x !== null).length;
    return `<aside class="lembar-jawab" aria-label="Lembar jawaban">
      <span class="ljk-label">Lembar jawaban</span><ol>${isi}</ol>
      <p class="ringkas">${terjawab} dari ${n} terjawab</p>
      ${simulasi ? `<p style="text-align:center;margin:8px 0 0"><button type="button" class="tombol" data-kumpul>Kumpulkan</button></p>` : ""}
    </aside>`;
  }

  function bacaan(b: Butir) {
    if (b.jenis !== "baca") return "";
    const sorot = (!simulasi && terkunci.has(i)) || selesai ? b.soal.paragraf : undefined;
    return `<article class="bacaan${bacaanTutup ? " tertutup" : ""}" aria-label="Bacaan"><h2>${esc(b.bacaan.judul)}</h2>
      <button type="button" class="tautan-tombol lipat-bacaan" data-lipat aria-expanded="${!bacaanTutup}">${bacaanTutup ? "Buka bacaan" : "Tutup bacaan"}</button>${b.bacaan.paragraf
      .map((p, k) => `<p data-p="${k + 1}"${sorot === k + 1 ? ' class="sorot"' : ""}>${esc(p)}</p>`)
      .join("")}</article>`;
  }

  function gambar(fokus = false, keyboard = false) {
    const b = o.butir[i];
    const dibuka = !simulasi && terkunci.has(i);
    const terakhir = i === n - 1;
    const aksi = simulasi
      ? `${i > 0 ? `<button type="button" class="tombol kedua" data-mundur>← Sebelumnya</button>` : ""}${!terakhir ? `<button type="button" class="tombol" data-maju>Berikutnya →</button>` : `<button type="button" class="tombol" data-kumpul>Kumpulkan</button>`}`
      : dibuka
        ? `<button type="button" class="tombol" data-maju>${terakhir ? (o.mini ? "Latihan soal lainnya" : "Lihat hasil") : "Soal berikutnya →"}</button>`
        : `<span class="petunjuk-keyboard">Pilih jawaban, atau tekan A, B, C, D di keyboard.</span>`;
    const tanda = dibuka ? `<span class="coretan${fokus ? " muncul" : ""}" aria-hidden="true">${benarDi(i) ? "✓" : "✗"}</span>` : "";
    wadah.innerHTML = `
      ${o.mini ? "" : `<div class="sesi-kepala"><h1>${esc(o.judul)}</h1><span class="posisi">Soal ${i + 1} dari ${n}</span>${simulasi && o.batasDetik ? `<span class="waktu${sisa <= 300 ? " mepet" : ""}" aria-label="Sisa waktu">${jam(sisa)}</span>` : `<a href="${o.kembali}">${esc(o.labelKembali)}</a>`}</div>`}
      <div class="sesi${b.jenis === "baca" ? " ada-bacaan" : ""}"${o.mini ? ' style="grid-template-columns:minmax(0,1fr)"' : ""}>
        ${bacaan(b)}
        <section class="lembar-soal" aria-label="Soal ${i + 1}">
          <div class="nomor-soal"><span class="no">${o.mini ? "" : i + 1}</span><span class="jenis">${LABEL_JENIS[b.jenis]}</span>${tanda}</div>
          ${teksSoal(b, dibuka)}
          ${daftarPilihan(b, i, dibuka)}
          ${dibuka ? pembahasan(b, i) : ""}
          <div class="aksi-soal">${aksi}</div>
        </section>
        ${lembarJawab()}
      </div>`;
    // fokus dipindah hanya kalau menjawab lewat keyboard, supaya cincin fokus tidak muncul saat pakai mouse
    if (fokus && keyboard) wadah.querySelector<HTMLElement>("[data-maju]")?.focus({ preventScroll: true });
  }

  /* ---------- aksi ---------- */
  function pilih(p: number, keyboard = false) {
    if (selesai || (!simulasi && terkunci.has(i))) return;
    jawaban[i] = p;
    baru = i;
    if (!simulasi) {
      terkunci.add(i);
      catatJawaban(idButir(o.butir[i]), benarDi(i));
    }
    gambar(true, keyboard);
  }

  function pindah(k: number) {
    if (k < 0 || k >= n) return;
    if (memutar) {
      hentikan();
      memutar = null;
    }
    i = k;
    baru = -1;
    gambar();
    if (o.mini) return;
    // di layar sempit bacaan ada di atas soal: langsung loncat ke soalnya
    const sasaran = o.butir[i].jenis === "baca" && layarSempit() ? ".lembar-soal" : ".sesi-kepala";
    wadah.querySelector(sasaran)?.scrollIntoView({ block: "start" });
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

  function kumpulkan() {
    if (selesai) return;
    const kosong = jawaban.filter((x) => x === null).length;
    if (simulasi && sisa > 0 && kosong > 0 && !confirm(`Masih ada ${kosong} soal kosong. Tetap kumpulkan?`)) return;
    selesai = true;
    clearInterval(detak);
    hentikan();
    if (simulasi) o.butir.forEach((b, k) => catatJawaban(idButir(b), benarDi(k)));
    hasil();
  }

  function hasil() {
    const benar = o.butir.filter((_, k) => benarDi(k)).length;
    const salah = o.butir.filter((_, k) => !benarDi(k));
    let skor = "";
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
      skor = `<div class="hasil-kepala"><div class="nilai-lingkar">${total}<small>perkiraan</small></div><div>
        <h1 style="margin:0">${total >= 500 ? "Tembus 500!" : total >= 450 ? "Sudah lewat 450." : "Masih ada ruang buat naik."}</h1>
        <ul class="rincian-skor"><li>Listening<b>${l}</b>${L.b}/${L.n} benar</li><li>Structure<b>${s}</b>${S.b}/${S.n} benar</li><li>Reading<b>${r}</b>${R.b}/${R.n} benar</li></ul>
        <p class="peringatan">Ini perkiraan kasar dari ${n} soal latihan, bukan skor resmi. Tes aslinya 140 soal dan tabel konversinya beda-beda tiap paket.</p></div></div>`;
    } else {
      const persen = Math.round((benar / n) * 100);
      skor = `<div class="hasil-kepala"><div class="nilai-lingkar">${benar}/${n}<small>${persen}%</small></div><div>
        <h1 style="margin:0">${persen === 100 ? "Sempurna." : persen >= 80 ? "Mantap, tinggal dipoles." : persen >= 50 ? "Lumayan. Cek yang salah di bawah." : "Pelan-pelan aja. Baca pembahasannya dulu."}</h1>
        <p class="peringatan">Jawabanmu tersimpan di browser ini dan dipakai buat milih soal berikutnya: yang salah bakal lebih sering muncul.</p></div></div>`;
    }
    const tombol = [
      o.lagi ? `<button type="button" class="tombol" data-lagi>${simulasi ? "Simulasi lagi" : "Latihan lagi"}</button>` : "",
      salah.length && o.ulangiSalah ? `<button type="button" class="tombol kedua" data-ulang-salah>Ulangi yang salah (${salah.length})</button>` : "",
      `<a class="tombol kedua" href="${o.kembali}">${esc(o.labelKembali)}</a>`,
    ].join("");
    const ulas = o.butir
      .map((b, k) => ({ b, k }))
      .filter(({ k }) => !benarDi(k))
      .map(({ b, k }) => {
        const pil = pilihanTampil(b);
        const kunci = kunciTampil(b);
        const tanya =
          b.jenis === "structure"
            ? esc(b.soal.kalimat)
            : b.jenis === "written"
              ? uraiWritten(b.soal.kalimat).map((p) => (p.garis === null ? esc(p.teks) : `<u>${esc(p.teks)}</u><sub>${HURUF[p.garis]}</sub>`)).join("")
              : b.jenis === "baca"
                ? `<i>${esc(b.bacaan.judul)}</i>: ${esc(b.soal.tanya)}`
                : b.jenis === "dialog"
                  ? b.dialog.baris.map(([s, t]) => `${ORANG[s]}: “${esc(t)}”`).join(" ") + ` <b>${esc(b.dialog.tanya)}</b>`
                  : `<i>${esc(b.rekaman.judul)}</i>: ${esc(b.soal.tanya)}`;
        const dijawab = jawaban[k] === null ? "kosong" : `${HURUF[jawaban[k]!]}. ${esc(pil[jawaban[k]!])}`;
        return `<li><p class="tanya"><b>${k + 1}.</b> ${tanya}</p>
          <p class="jawab">Jawabanmu: <s style="text-decoration-color:var(--pena)">${dijawab}</s><br />Kunci: <b>${HURUF[kunci]}. ${esc(pil[kunci])}</b>${b.jenis === "written" ? ` → ${esc(b.soal.betul)}` : ""}</p>
          <p class="jawab" style="color:var(--redup)">${tandai(bahasDari(b))}</p></li>`;
      })
      .join("");
    wadah.innerHTML = `${skor}<div class="aksi-soal" style="margin-bottom:28px">${tombol}</div>
      ${ulas ? `<h2>Yang perlu dicek lagi</h2><ol class="daftar-ulas">${ulas}</ol>` : `<p class="catatan-pena">semua benar, nggak ada yang perlu diulas ✓</p>`}`;
    wadah.querySelector<HTMLElement>(".hasil-kepala")?.scrollIntoView({ block: "start" });
  }

  /* ---------- event ---------- */
  function klik(e: MouseEvent) {
    const t = (e.target as HTMLElement).closest<HTMLElement>("button");
    if (!t || t.hasAttribute("disabled")) return;
    if (t.dataset.pilih !== undefined) pilih(Number(t.dataset.pilih));
    else if (t.dataset.ke !== undefined) pindah(Number(t.dataset.ke));
    else if (t.hasAttribute("data-maju")) {
      if (o.mini && i === n - 1) location.hash = o.kembali;
      else if (i === n - 1 && !simulasi) {
        selesai = true;
        hasil();
      } else pindah(i + 1);
    } else if (t.hasAttribute("data-mundur")) pindah(i - 1);
    else if (t.hasAttribute("data-putar")) void putar();
    else if (t.hasAttribute("data-lipat")) {
      bacaanTutup = !bacaanTutup;
      gambar();
    } else if (t.hasAttribute("data-transkrip")) {
      transkripTerbuka.add(grupAudio(o.butir[i])!);
      gambar();
    } else if (t.hasAttribute("data-kumpul")) kumpulkan();
    else if (t.hasAttribute("data-lagi")) o.lagi?.();
    else if (t.hasAttribute("data-ulang-salah")) o.ulangiSalah?.(o.butir.filter((_, k) => !benarDi(k)));
  }

  function tombolKeyboard(e: KeyboardEvent) {
    if (selesai || e.ctrlKey || e.metaKey || e.altKey) return;
    if ((e.target as HTMLElement).closest("input, textarea")) return;
    const p = "abcd".indexOf(e.key.toLowerCase());
    if (p >= 0) {
      e.preventDefault();
      pilih(p, true);
    } else if (e.key === "ArrowRight" && (simulasi || terkunci.has(i)) && i < n - 1) pindah(i + 1);
    else if (e.key === "ArrowLeft" && simulasi) pindah(i - 1);
  }

  wadah.addEventListener("click", klik);
  if (!o.mini) document.addEventListener("keydown", tombolKeyboard);
  // suara baru siap setelah halaman tampil: gambar ulang soal listening yang sedang dibuka
  const lepasSuara = saatSuaraBerubah(() => {
    if (!selesai && grupAudio(o.butir[i]) && !memutar) gambar();
  });
  gambar();

  return () => {
    lepasSuara();
    clearInterval(detak);
    hentikan();
    wadah.removeEventListener("click", klik);
    document.removeEventListener("keydown", tombolKeyboard);
  };
}
