import { BACAAN } from "../data/bacaan";
import { DIALOG, REKAMAN } from "../data/dengar";
import type { JenisSoalBaca, TopikId } from "../data/jenis";
import { KELOMPOK_SINONIM, KOSAKATA } from "../data/kosakata";
import { SOAL_A } from "../data/soal-a";
import { SOAL_B } from "../data/soal-b";
import { TOPIK, topikDari } from "../data/topik";
import { HURUF, esc, kocok, nilaiKartu, perluDiulang, pilihPengecoh, pilihSoal, skorBagian, skorTotal, tandai } from "../inti";
import { catatKartu, data, hapusSemua, runtutan, simpan } from "../simpan";
import { type Butir, dariBacaan, dariDialog, dariRekaman, dariStructure } from "./butir";
import { mulaiSesi } from "./sesi";

export const SOAL = [...SOAL_A, ...SOAL_B];
type Bersih = () => void;
const tanpa: Bersih = () => {};

/* ---------- hitungan progres ---------- */
const riwayat = () => data.jawaban;

function akurasi(ids: string[]) {
  const dijawab = ids.filter((id) => riwayat()[id]);
  const benar = dijawab.filter((id) => riwayat()[id].tadiBenar).length;
  return { dijawab: dijawab.length, total: ids.length, benar, persen: dijawab.length ? Math.round((benar / dijawab.length) * 100) : null };
}

const idStructure = () => SOAL.filter((s) => s.jenis === "structure").map((s) => s.id);
const idWritten = () => SOAL.filter((s) => s.jenis === "written").map((s) => s.id);
const idReading = () => BACAAN.flatMap((b) => b.soal.map((s) => s.id));
const idListening = () => [...DIALOG.map((d) => d.id), ...REKAMAN.flatMap((r) => r.soal.map((s) => s.id))];

/** Perkiraan skor: simulasi terakhir, atau dari ketepatan latihan kalau tiap bagian sudah ≥ 5 soal. */
export function perkiraanSkor(): { skor: number; dari: string } | null {
  const akhir = data.simulasi.at(-1);
  if (akhir) return { skor: akhir.total, dari: `dari simulasi ${new Date(akhir.waktu).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}` };
  const L = akurasi(idListening());
  const S = akurasi([...idStructure(), ...idWritten()]);
  const R = akurasi(idReading());
  if (L.dijawab < 5 || S.dijawab < 5 || R.dijawab < 5) return null;
  return {
    skor: skorTotal(skorBagian("listening", L.benar, L.dijawab), skorBagian("structure", S.benar, S.dijawab), skorBagian("reading", R.benar, R.dijawab)),
    dari: "dari ketepatan latihanmu",
  };
}

const batang = (persen: number | null) =>
  `<div class="batang" role="img" aria-label="${persen === null ? "belum ada" : `${persen}% benar`}"><i style="width:${persen ?? 0}%"></i></div>`;

/* ---------- beranda ---------- */
export function beranda(m: HTMLElement): Bersih {
  const target = data.target;
  const t = () => Number(data.target.join(""));
  const kolom = (d: number) =>
    `<fieldset><legend class="tersembunyi">Digit ${d + 1} target skor</legend><div class="kotak-digit" aria-hidden="true">${target[d]}</div>${Array.from(
      { length: 10 },
      (_, v) => `<label><input type="radio" name="digit${d}" value="${v}"${target[d] === v ? " checked" : ""} /><span class="bulat${target[d] === v ? " arsir" : ""}">${v}</span></label>`,
    ).join("")}</fieldset>`;

  function sapaan() {
    const p = perkiraanSkor();
    const nama = data.nama.trim() || "kamu";
    const sel = p ? t() - p.skor : null;
    return p
      ? sel! > 0
        ? `Hai <b>${esc(nama)}</b>. Targetmu <b>${t()}</b>, perkiraan sekarang <b>${p.skor}</b>. Kurang <b>${sel}</b> poin lagi, gas pelan-pelan.`
        : `Hai <b>${esc(nama)}</b>. Perkiraanmu <b>${p.skor}</b> sudah melewati target <b>${t()}</b>. Naikkan targetnya?`
      : `Hai <b>${esc(nama)}</b>. Targetmu <b>${t()}</b>. Kerjakan beberapa soal di tiap bagian (atau satu simulasi mini) dan perkiraan skormu muncul di sini.`;
  }

  const p = perkiraanSkor();
  const hari = runtutan();
  const kartuJatuh = KOSAKATA.filter((k) => data.kartu[k.kata] && perluDiulang(data.kartu[k.kata], Date.now())).length;
  const S = akurasi([...idStructure(), ...idWritten()]);
  const R = akurasi(idReading());
  const L = akurasi(idListening());

  m.innerHTML = `
    <section class="ljk" aria-labelledby="judul-ljk">
      <div class="ljk-judul"><h1 id="judul-ljk" style="font-size:inherit;margin:0;font-weight:inherit">Lembar latihan TOEFL ITP</h1><span class="kode">Tembus</span></div>
      <div class="ljk-badan">
        <div>
          <label class="ljk-label" for="nama">Nama</label>
          <input id="nama" class="isian-nama" maxlength="30" autocomplete="given-name" placeholder="tulis namamu" value="${esc(data.nama)}" />
          <p class="sapaan" id="sapaan">${sapaan()}</p>
        </div>
        <div>
          <span class="ljk-label" id="label-target">Target skor</span>
          <div class="kolom-digit" role="group" aria-labelledby="label-target">${[0, 1, 2].map(kolom).join("")}</div>
        </div>
        <div>
          <span class="ljk-label">Perkiraan skor</span>
          <div class="angka-besar">${p ? p.skor : "—"}<small> / 677</small></div>
          <p style="margin:6px 0 0;color:var(--redup);font-size:14px">${p ? p.dari : "belum cukup data"}</p>
          ${hari > 0 ? `<p class="catatan-pena">${hari} hari berturut-turut!</p>` : ""}
        </div>
      </div>
    </section>

    <h2>Tiga bagian tes</h2>
    <ol class="bagian-tes">
      <li><a href="#/listening"><span class="no">1</span><span><h3>Listening Comprehension</h3><p>Dialog pendek dan rekaman panjang, dibacakan suara bahasa Inggris dari browser.</p></span><span class="meta"><b>${L.persen ?? "—"}${L.persen !== null ? "%" : ""}</b>${L.dijawab}/${L.total} dicoba</span></a></li>
      <li><a href="#/latihan/campur"><span class="no">2</span><span><h3>Structure & Written Expression</h3><p>Lengkapi kalimat dan cari bagian yang salah. Paling cepat dinaikkan dengan hafal pola.</p></span><span class="meta"><b>${S.persen ?? "—"}${S.persen !== null ? "%" : ""}</b>${S.dijawab}/${S.total} dicoba</span></a></li>
      <li><a href="#/reading"><span class="no">3</span><span><h3>Reading Comprehension</h3><p>Bacaan akademik dengan soal ide pokok, detail, kosakata, rujukan, dan inferensi.</p></span><span class="meta"><b>${R.persen ?? "—"}${R.persen !== null ? "%" : ""}</b>${R.dijawab}/${R.total} dicoba</span></a></li>
    </ol>

    <h2>Biar makin siap</h2>
    <ul class="bagian-tes">
      <li><a href="#/materi"><span class="no"><span class="bulat" aria-hidden="true"></span></span><span><h3>Materi grammar</h3><p>${TOPIK.length} pola yang paling sering keluar di Structure, dijelaskan pakai bahasa santai.</p></span><span class="meta"><b>${TOPIK.length}</b>topik</span></a></li>
      <li><a href="#/kosakata"><span class="no"><span class="bulat" aria-hidden="true"></span></span><span><h3>Kosakata sinonim</h3><p>Kartu hafalan untuk soal "closest in meaning to". Yang sering salah muncul lebih sering.</p></span><span class="meta"><b>${kartuJatuh}</b>perlu diulang</span></a></li>
      <li><a href="#/simulasi"><span class="no"><span class="bulat arsir" aria-hidden="true"></span></span><span><h3>Simulasi mini</h3><p>44 soal dari tiga bagian, 35 menit, rekaman cuma bisa diputar sekali. Hasilnya perkiraan skor.</p></span><span class="meta"><b>${data.simulasi.length}</b>kali dicoba</span></a></li>
    </ul>

    <h2>Pemanasan: satu soal dulu</h2>
    <div id="pemanasan"></div>`;

  const nama = m.querySelector<HTMLInputElement>("#nama")!;
  nama.addEventListener("input", () => {
    data.nama = nama.value;
    simpan();
    m.querySelector("#sapaan")!.innerHTML = sapaan();
  });
  m.querySelector(".kolom-digit")!.addEventListener("change", (e) => {
    const el = e.target as HTMLInputElement;
    const d = Number(el.name.slice(-1));
    data.target[d] = Number(el.value);
    simpan();
    const fs = el.closest("fieldset")!;
    fs.querySelector(".kotak-digit")!.textContent = el.value;
    fs.querySelectorAll(".bulat").forEach((b, v) => {
      b.classList.toggle("arsir", v === Number(el.value));
      b.classList.toggle("baru", v === Number(el.value));
    });
    m.querySelector("#sapaan")!.innerHTML = sapaan();
  });

  const satu = pilihSoal(SOAL.filter((s) => s.jenis === "structure"), 1, riwayat())[0];
  return mulaiSesi(m.querySelector<HTMLElement>("#pemanasan")!, {
    judul: "Pemanasan",
    mode: "latihan",
    butir: [dariStructure(satu, Math.random)],
    kembali: "#/latihan/campur",
    labelKembali: "Latihan",
    mini: true,
  });
}

/* ---------- materi ---------- */
export function materiDaftar(m: HTMLElement): Bersih {
  m.innerHTML = `<h1>Materi Structure & Written Expression</h1>
    <p class="lead">Tiga belas pola yang paling sering muncul. Baca penjelasannya sebentar, lalu langsung latihan 9 soal per topik.</p>
    <ul class="kisi-topik">${TOPIK.map((t) => {
      const a = akurasi(SOAL.filter((s) => s.topik === t.id).map((s) => s.id));
      return `<li><a href="#/materi/${t.id}"><h3>${esc(t.judul)}</h3><p>${esc(t.ringkas)}</p>${batang(a.persen)}<div class="batang-label">${a.persen === null ? "belum dicoba" : `${a.persen}% benar dari ${a.dijawab} soal`}</div></a></li>`;
    }).join("")}</ul>`;
  return tanpa;
}

export function materiTopik(m: HTMLElement, id: string): Bersih {
  const t = topikDari(id);
  if (!t) return halamanHilang(m);
  const kini = TOPIK.indexOf(t);
  const lanjut = TOPIK[kini + 1];
  m.innerHTML = `<article class="materi">
    <p><a href="#/materi">← Semua topik</a></p>
    <h1>${esc(t.judul)}</h1>
    <p class="lead">${esc(t.ringkas)}</p>
    ${t.isi.map((p) => `<p>${tandai(p)}</p>`).join("")}
    <h2>Polanya</h2><ul class="pola">${t.pola.map((p) => `<li>${tandai(p)}</li>`).join("")}</ul>
    <h2>Contoh</h2><ul class="contoh">${t.contoh
      .map((c) => `<li>${c.salah ? `<span class="salah">${esc(c.salah)}</span><br />` : ""}<span>${esc(c.benar)}</span><span class="catat">${tandai(c.catatan)}</span></li>`)
      .join("")}</ul>
    <h2>Jebakan yang sering muncul</h2><ul>${t.jebakan.map((j) => `<li>${tandai(j)}</li>`).join("")}</ul>
    <div class="aksi-soal"><a class="tombol" href="#/latihan/topik/${t.id}">Latihan 9 soal topik ini</a>${lanjut ? `<a class="tombol kedua" href="#/materi/${lanjut.id}">Topik berikutnya: ${esc(lanjut.judul)}</a>` : ""}</div>
  </article>`;
  return tanpa;
}

/* ---------- latihan structure ---------- */
export function latihanStructure(m: HTMLElement, jenis: string): Bersih {
  let bersih: Bersih = tanpa;
  const topik = jenis.startsWith("topik/") ? (jenis.slice(6) as TopikId) : null;
  const t = topik ? topikDari(topik) : null;
  if (topik && !t) return halamanHilang(m);

  const kolam = () =>
    t
      ? SOAL.filter((s) => s.topik === t.id)
      : jenis === "structure"
        ? SOAL.filter((s) => s.jenis === "structure")
        : jenis === "written"
          ? SOAL.filter((s) => s.jenis === "written")
          : jenis === "salah"
            ? SOAL.filter((s) => riwayat()[s.id] && !riwayat()[s.id].tadiBenar)
            : SOAL;
  const judul = t ? t.judul : jenis === "structure" ? "Latihan Structure" : jenis === "written" ? "Latihan Written Expression" : jenis === "salah" ? "Ulangi yang salah" : "Structure & Written Expression";

  const mulai = (butir: Butir[]) => {
    bersih();
    if (!butir.length) {
      m.innerHTML = `<h1>${esc(judul)}</h1><p class="lead">Belum ada soal yang salah. Mantap, atau memang belum mulai latihan?</p><a class="tombol" href="#/latihan/campur">Mulai latihan</a>`;
      bersih = tanpa;
      return;
    }
    bersih = mulaiSesi(m, {
      judul,
      mode: "latihan",
      butir,
      kembali: t ? `#/materi/${t.id}` : "#/latihan",
      labelKembali: t ? "Kembali ke materi" : "Pilih latihan lain",
      lagi: () => mulai(pilihSoal(kolam(), 10, riwayat()).map((s) => dariStructure(s, Math.random))),
      ulangiSalah: (salah) => mulai(salah),
    });
    window.scrollTo({ top: 0 });
  };
  const awal = kolam();
  mulai((t ? kocok(awal) : pilihSoal(awal, 10, riwayat())).map((s) => dariStructure(s, Math.random)));
  return () => bersih();
}

export function latihanDaftar(m: HTMLElement): Bersih {
  const S = akurasi(idStructure());
  const W = akurasi(idWritten());
  const salah = SOAL.filter((s) => riwayat()[s.id] && !riwayat()[s.id].tadiBenar).length;
  m.innerHTML = `<h1>Latihan Structure & Written Expression</h1>
    <p class="lead">Sepuluh soal per sesi. Soal yang belum pernah kamu jawab dan yang dulu salah lebih sering dipilih.</p>
    <ul class="bagian-tes">
      <li><a href="#/latihan/campur"><span class="no"><span class="bulat arsir" aria-hidden="true"></span></span><span><h3>Campuran</h3><p>Structure dan Written Expression diacak, seperti di tes.</p></span><span class="meta"><b>10</b>soal</span></a></li>
      <li><a href="#/latihan/structure"><span class="no"><span class="bulat" aria-hidden="true"></span></span><span><h3>Structure saja</h3><p>Lengkapi kalimat yang rumpang.</p></span><span class="meta"><b>${S.persen ?? "—"}${S.persen !== null ? "%" : ""}</b>${S.dijawab}/${S.total} dicoba</span></a></li>
      <li><a href="#/latihan/written"><span class="no"><span class="bulat" aria-hidden="true"></span></span><span><h3>Written Expression saja</h3><p>Cari satu bagian bergaris yang salah.</p></span><span class="meta"><b>${W.persen ?? "—"}${W.persen !== null ? "%" : ""}</b>${W.dijawab}/${W.total} dicoba</span></a></li>
      <li><a href="#/latihan/salah"><span class="no"><span class="bulat" aria-hidden="true"></span></span><span><h3>Ulangi yang salah</h3><p>Semua soal yang terakhir kali kamu jawab salah.</p></span><span class="meta"><b>${salah}</b>soal</span></a></li>
    </ul>
    <p style="margin-top:20px">Mau per topik? Buka <a href="#/materi">materi grammar</a>, tiap topik punya 9 soal latihan.</p>`;
  return tanpa;
}

/* ---------- reading ---------- */
const NAMA_TIPE: Record<JenisSoalBaca, string> = { "ide-pokok": "Ide pokok", detail: "Detail", kosakata: "Kosakata", rujukan: "Rujukan", inferensi: "Inferensi", tujuan: "Tujuan penulis" };

export function readingDaftar(m: HTMLElement): Bersih {
  m.innerHTML = `<h1>Reading Comprehension</h1>
    <p class="lead">Empat bacaan akademik dengan 8 soal masing-masing. Bacaan tetap terlihat di samping soal, dan paragraf buktinya disorot setelah kamu menjawab.</p>
    <ul class="bagian-tes">${BACAAN.map((b, k) => {
      const a = akurasi(b.soal.map((s) => s.id));
      return `<li><a href="#/reading/${b.id}"><span class="no">${k + 1}</span><span><h3>${esc(b.judul)}</h3><p>${esc(b.bidang)}, ${b.paragraf.join(" ").split(/\s+/).length} kata</p></span><span class="meta"><b>${a.persen ?? "—"}${a.persen !== null ? "%" : ""}</b>${a.dijawab}/8 dicoba</span></a></li>`;
    }).join("")}</ul>
    <h2>Tipe soal yang perlu dikenali</h2>
    <table class="tabel"><thead><tr><th>Tipe</th><th>Biasanya ditanya</th><th>Ketepatanmu</th></tr></thead><tbody>${(Object.keys(NAMA_TIPE) as JenisSoalBaca[])
      .map((tp) => {
        const a = akurasi(BACAAN.flatMap((b) => b.soal.filter((s) => s.tipe === tp).map((s) => s.id)));
        const contoh = BACAAN.flatMap((b) => b.soal).find((s) => s.tipe === tp)!.tanya;
        return `<tr><td><b>${NAMA_TIPE[tp]}</b></td><td style="font-family:var(--huruf-buku)">${esc(contoh)}</td><td>${batang(a.persen)}<div class="batang-label">${a.persen === null ? "belum" : `${a.persen}%`}</div></td></tr>`;
      })
      .join("")}</tbody></table>`;
  return tanpa;
}

export function readingSesi(m: HTMLElement, id: string): Bersih {
  const b = BACAAN.find((x) => x.id === id);
  if (!b) return halamanHilang(m);
  let bersih: Bersih = tanpa;
  const mulai = (butir: Butir[]) => {
    bersih();
    bersih = mulaiSesi(m, {
      judul: "Reading Comprehension",
      mode: "latihan",
      butir,
      kembali: "#/reading",
      labelKembali: "Bacaan lain",
      lagi: () => mulai(dariBacaan(b, Math.random)),
      ulangiSalah: (salah) => mulai(salah),
    });
    window.scrollTo({ top: 0 });
  };
  mulai(dariBacaan(b, Math.random));
  return () => bersih();
}

/* ---------- listening ---------- */
export function listeningDaftar(m: HTMLElement): Bersih {
  const A = akurasi(DIALOG.map((d) => d.id));
  m.innerHTML = `<h1>Listening Comprehension</h1>
    <p class="lead">Dialog dibacakan oleh suara bahasa Inggris bawaan browser-mu. Suaranya tidak sebagus rekaman asli, tapi cukup untuk melatih telinga menangkap maksud, bukan cuma kata.</p>
    <ul class="bagian-tes">
      <li><a href="#/listening/a"><span class="no">A</span><span><h3>Dialog pendek</h3><p>Dua orang bicara, lalu narator bertanya "What does the man mean?". Banyak ungkapan sehari-hari.</p></span><span class="meta"><b>${A.persen ?? "—"}${A.persen !== null ? "%" : ""}</b>${A.dijawab}/${A.total} dicoba</span></a></li>
      ${REKAMAN.map((r) => {
        const a = akurasi(r.soal.map((s) => s.id));
        return `<li><a href="#/listening/${r.id}"><span class="no">${r.jenis === "percakapan" ? "B" : "C"}</span><span><h3>${esc(r.judul)}</h3><p>${r.jenis === "percakapan" ? "Percakapan panjang" : "Kuliah singkat"}, ${r.soal.length} soal dari satu rekaman.</p></span><span class="meta"><b>${a.persen ?? "—"}${a.persen !== null ? "%" : ""}</b>${a.dijawab}/${a.total} dicoba</span></a></li>`;
      }).join("")}
    </ul>
    <p class="peringatan" style="margin-top:16px">Kalau tidak ada suara: pastikan HP tidak dalam mode senyap. Di beberapa browser suara bahasa Inggris perlu diunduh dulu dari pengaturan bahasa sistem. Kalau tetap tidak ada, transkripnya bisa dibaca.</p>`;
  return tanpa;
}

export function listeningSesi(m: HTMLElement, id: string): Bersih {
  const r = REKAMAN.find((x) => x.id === id);
  if (id !== "a" && !r) return halamanHilang(m);
  let bersih: Bersih = tanpa;
  const buat = () => (r ? dariRekaman(r, Math.random) : pilihSoal(DIALOG, 8, riwayat()).map((d) => dariDialog(d, Math.random)));
  const mulai = (butir: Butir[]) => {
    bersih();
    bersih = mulaiSesi(m, {
      judul: r ? r.judul : "Dialog pendek",
      mode: "latihan",
      butir,
      kembali: "#/listening",
      labelKembali: "Pilih rekaman lain",
      lagi: () => mulai(buat()),
      ulangiSalah: (salah) => mulai(salah),
    });
    window.scrollTo({ top: 0 });
  };
  mulai(buat());
  return () => bersih();
}

/* ---------- kosakata ---------- */
export function kosakata(m: HTMLElement): Bersih {
  const kini = Date.now();
  const kotak = [1, 2, 3, 4, 5].map((n) => KOSAKATA.filter((k) => data.kartu[k.kata]?.kotak === n).length);
  const baru = KOSAKATA.filter((k) => !data.kartu[k.kata]);
  const jatuh = KOSAKATA.filter((k) => data.kartu[k.kata] && perluDiulang(data.kartu[k.kata], kini)).sort(
    (a, b) => data.kartu[a.kata].kotak - data.kartu[b.kata].kotak,
  );
  const antrean = [...jatuh, ...kocok(baru)].slice(0, 12);

  m.innerHTML = `<h1>Kosakata sinonim</h1>
    <p class="lead">Di Reading selalu ada soal "The word … is closest in meaning to". Kartu yang kamu jawab benar naik kotak dan muncul makin jarang; yang salah kembali ke kotak 1.</p>
    <ul class="kotak-leitner" aria-label="Isi tiap kotak">
      <li>Belum dipelajari<b>${baru.length}</b></li>
      ${kotak.map((n, k) => `<li>Kotak ${k + 1}<b>${n}</b>${["tiap hari", "1 hari", "3 hari", "7 hari", "16 hari"][k]}</li>`).join("")}
    </ul>
    <div id="kartu"></div>`;
  const wadah = m.querySelector<HTMLElement>("#kartu")!;
  if (!antrean.length) {
    wadah.innerHTML = `<p class="catatan-pena">semua kartu hari ini sudah beres. balik lagi besok ya ✓</p>`;
    return tanpa;
  }

  let i = 0;
  let benar = 0;
  let pilihan: string[] = [];
  let dijawab: number | null = null;
  let kotakAwal: number | undefined;

  function gambar() {
    if (i >= antrean.length) {
      wadah.innerHTML = `<div class="hasil-kepala"><div class="nilai-lingkar">${benar}/${antrean.length}</div><div><h1 style="margin:0">Sesi kartu selesai.</h1><p class="peringatan">Kartu yang salah bakal muncul lagi besok. Yang benar menunggu sesuai kotaknya.</p></div></div>
        <div class="aksi-soal"><a class="tombol" href="#/kosakata?${Date.now()}">Sesi berikutnya</a><a class="tombol kedua" href="#/">Beranda</a></div>`;
      return;
    }
    const k = antrean[i];
    if (dijawab === null && !pilihan.length) pilihan = kocok([k.sinonim, ...pilihPengecoh(k, KOSAKATA, KELOMPOK_SINONIM)]);
    const kunci = pilihan.indexOf(k.sinonim);
    const kalimat = esc(k.contoh).replace(new RegExp(`\\b(${k.kata.slice(0, Math.max(4, k.kata.length - 3))}\\w*)`, "i"), '<mark class="stabilo">$1</mark>');
    if (dijawab === null) kotakAwal = data.kartu[k.kata]?.kotak;
    const kotakKini = kotakAwal;
    wadah.innerHTML = `<div class="kartu-kata">
      <div class="nomor-soal"><span class="jenis">Kartu ${i + 1} dari ${antrean.length}${kotakKini ? `, kotak ${kotakKini}` : ", kata baru"}</span>${dijawab !== null ? `<span class="coretan muncul" aria-hidden="true">${dijawab === kunci ? "✓" : "✗"}</span>` : ""}</div>
      <p class="kata">${esc(k.kata)}</p><span class="kelas">${{ n: "kata benda", v: "kata kerja", adj: "kata sifat", adv: "kata keterangan" }[k.kelas]}</span>
      <p class="kalimat">${kalimat}</p>
      <p style="margin:0 0 8px;font-weight:600">Closest in meaning to:</p>
      <ol class="pilihan">${pilihan
        .map((p, n) => {
          const cls = dijawab !== null ? (n === kunci ? "kunci" : n === dijawab ? "keliru" : "") : "";
          return `<li><button type="button" data-pilih="${n}" class="${cls}" ${dijawab !== null ? "disabled" : ""}><span class="bulat${dijawab === n ? " arsir" : ""}" aria-hidden="true">${HURUF[n]}</span><span class="isi">${esc(p)}</span></button></li>`;
        })
        .join("")}</ol>
      ${dijawab !== null ? `<div class="bahas" role="status"><p class="judul-bahas">${dijawab === kunci ? "betul!" : "belum tepat"}</p><p><b>${esc(k.kata)}</b> = ${esc(k.arti)}. Sinonimnya <b>${esc(k.sinonim)}</b>.</p></div><div class="aksi-soal"><button type="button" class="tombol" data-maju>${i === antrean.length - 1 ? "Selesai" : "Kartu berikutnya →"}</button></div>` : ""}
    </div>`;
  }

  function klik(e: MouseEvent) {
    const t = (e.target as HTMLElement).closest<HTMLElement>("button");
    if (!t || t.hasAttribute("disabled")) return;
    if (t.dataset.pilih !== undefined && dijawab === null) {
      dijawab = Number(t.dataset.pilih);
      const k = antrean[i];
      const ok = pilihan[dijawab] === k.sinonim;
      if (ok) benar++;
      catatKartu(k.kata, nilaiKartu(data.kartu[k.kata], ok, Date.now()));
      gambar();
      wadah.querySelector<HTMLElement>("[data-maju]")?.focus({ preventScroll: true });
    } else if (t.hasAttribute("data-maju")) {
      i++;
      dijawab = null;
      pilihan = [];
      gambar();
    }
  }
  function tombolKeyboard(e: KeyboardEvent) {
    const p = "abcd".indexOf(e.key.toLowerCase());
    if (p >= 0 && dijawab === null && i < antrean.length) wadah.querySelector<HTMLElement>(`[data-pilih="${p}"]`)?.click();
  }
  wadah.addEventListener("click", klik);
  document.addEventListener("keydown", tombolKeyboard);
  gambar();
  return () => {
    wadah.removeEventListener("click", klik);
    document.removeEventListener("keydown", tombolKeyboard);
  };
}

/* ---------- simulasi ---------- */
export const BATAS_SIMULASI = 35 * 60;

export function susunSimulasi(rnd: () => number = Math.random): Butir[] {
  const dialog = pilihSoal(DIALOG, 8, riwayat(), rnd).map((d) => dariDialog(d, rnd));
  const rekaman = dariRekaman(kocok(REKAMAN, rnd)[0], rnd);
  const s = pilihSoal(SOAL.filter((x) => x.jenis === "structure"), 8, riwayat(), rnd);
  const w = pilihSoal(SOAL.filter((x) => x.jenis === "written"), 8, riwayat(), rnd);
  const baca = kocok(BACAAN, rnd).slice(0, 2).flatMap((b) => dariBacaan(b, rnd));
  return [...dialog, ...rekaman, ...s.map((x) => dariStructure(x, rnd)), ...w.map((x) => dariStructure(x, rnd)), ...baca];
}

export function simulasi(m: HTMLElement): Bersih {
  let bersih: Bersih = tanpa;
  const riwayatSim = data.simulasi.slice(-5).reverse();
  m.innerHTML = `<h1>Simulasi mini</h1>
    <p class="lead">Versi pendek dari TOEFL ITP: urutannya sama, aturannya dibuat mirip. Jawaban baru dinilai setelah kamu kumpulkan.</p>
    <table class="tabel" style="max-width:560px"><thead><tr><th>Bagian</th><th>Isi</th><th class="angka">Soal</th></tr></thead><tbody>
      <tr><td><b>1. Listening</b></td><td>8 dialog pendek + 1 rekaman panjang</td><td class="angka">12</td></tr>
      <tr><td><b>2. Structure</b></td><td>8 Structure + 8 Written Expression</td><td class="angka">16</td></tr>
      <tr><td><b>3. Reading</b></td><td>2 bacaan × 8 soal</td><td class="angka">16</td></tr>
      <tr><td></td><td><b>Waktu: 35 menit</b></td><td class="angka"><b>44</b></td></tr>
    </tbody></table>
    <ul style="font-family:var(--huruf-buku);font-size:17px;max-width:62ch">
      <li>Rekaman hanya bisa diputar <b>sekali</b>, sama seperti tes aslinya. Siapkan earphone.</li>
      <li>Kamu bisa loncat antarsoal lewat lembar jawaban di samping.</li>
      <li>Waktu habis = jawaban otomatis dikumpulkan.</li>
    </ul>
    <div class="aksi-soal"><button type="button" class="tombol" id="mulai-sim">Mulai simulasi</button></div>
    ${riwayatSim.length ? `<h2>Riwayat terakhir</h2><table class="tabel" style="max-width:560px"><thead><tr><th>Tanggal</th><th class="angka">L</th><th class="angka">S</th><th class="angka">R</th><th class="angka">Total</th></tr></thead><tbody>${riwayatSim
      .map((h) => `<tr><td>${new Date(h.waktu).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td><td class="angka">${h.l}</td><td class="angka">${h.s}</td><td class="angka">${h.r}</td><td class="angka"><b>${h.total}</b></td></tr>`)
      .join("")}</tbody></table>` : ""}`;
  const mulai = () => {
    bersih();
    bersih = mulaiSesi(m, {
      judul: "Simulasi mini",
      mode: "simulasi",
      butir: susunSimulasi(),
      batasDetik: BATAS_SIMULASI,
      kembali: "#/progres",
      labelKembali: "Lihat progres",
      lagi: mulai,
    });
    window.scrollTo({ top: 0 });
  };
  m.querySelector("#mulai-sim")!.addEventListener("click", mulai);
  return () => bersih();
}

/* ---------- progres ---------- */
export function progres(m: HTMLElement): Bersih {
  const baris = (label: string, ids: string[], tautan: string) => {
    const a = akurasi(ids);
    return `<tr><td><a href="${tautan}">${esc(label)}</a></td><td class="angka">${a.dijawab}/${a.total}</td><td>${batang(a.persen)}</td><td class="angka">${a.persen === null ? "—" : `${a.persen}%`}</td></tr>`;
  };
  const topikUrut = TOPIK.map((t) => ({ t, a: akurasi(SOAL.filter((s) => s.topik === t.id).map((s) => s.id)) }))
    .filter((x) => x.a.persen !== null)
    .sort((x, y) => x.a.persen! - y.a.persen!);
  const lemah = topikUrut.slice(0, 3).filter((x) => x.a.persen! < 80);
  const kotak = [1, 2, 3, 4, 5].map((n) => KOSAKATA.filter((k) => data.kartu[k.kata]?.kotak === n).length);
  const dijawab = Object.keys(data.jawaban).length;
  m.innerHTML = `<h1>Progres</h1>
    <p class="lead">${dijawab ? `Kamu sudah mencoba <b>${dijawab}</b> soal berbeda dan latihan <b>${data.hari.length}</b> hari. Runtutan sekarang: <b>${runtutan()}</b> hari.` : "Belum ada jawaban tersimpan. Mulai dari latihan mana saja, nanti progresnya muncul di sini."} Semua data ini hanya tersimpan di browser ini.</p>
    ${lemah.length ? `<p class="catatan-pena">fokus dulu: ${lemah.map((x) => `<a href="#/materi/${x.t.id}" style="color:inherit">${esc(x.t.judul.toLowerCase())}</a>`).join(", ")}</p>` : ""}
    <h2>Per bagian</h2>
    <table class="tabel"><thead><tr><th>Bagian</th><th class="angka">Dicoba</th><th>Ketepatan (jawaban terakhir)</th><th class="angka"></th></tr></thead><tbody>
      ${baris("Listening", idListening(), "#/listening")}
      ${baris("Structure", idStructure(), "#/latihan/structure")}
      ${baris("Written Expression", idWritten(), "#/latihan/written")}
      ${baris("Reading", idReading(), "#/reading")}
    </tbody></table>
    <h2>Per topik grammar</h2>
    <table class="tabel"><thead><tr><th>Topik</th><th class="angka">Dicoba</th><th>Ketepatan</th><th class="angka"></th></tr></thead><tbody>
      ${TOPIK.map((t) => baris(t.judul, SOAL.filter((s) => s.topik === t.id).map((s) => s.id), `#/materi/${t.id}`)).join("")}
    </tbody></table>
    <h2>Kosakata</h2>
    <ul class="kotak-leitner"><li>Belum dipelajari<b>${KOSAKATA.filter((k) => !data.kartu[k.kata]).length}</b></li>${kotak.map((n, k) => `<li>Kotak ${k + 1}<b>${n}</b></li>`).join("")}</ul>
    <h2>Riwayat simulasi</h2>
    ${data.simulasi.length ? `<table class="tabel"><thead><tr><th>Tanggal</th><th class="angka">Benar</th><th class="angka">L</th><th class="angka">S</th><th class="angka">R</th><th class="angka">Perkiraan</th></tr></thead><tbody>${[...data.simulasi]
      .reverse()
      .map((h) => `<tr><td>${new Date(h.waktu).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td><td class="angka">${h.benar}/${h.jumlah}</td><td class="angka">${h.l}</td><td class="angka">${h.s}</td><td class="angka">${h.r}</td><td class="angka"><b>${h.total}</b></td></tr>`)
      .join("")}</tbody></table>` : `<p>Belum pernah. <a href="#/simulasi">Coba simulasi mini</a>.</p>`}
    <h2>Mulai dari nol</h2>
    <p>Menghapus nama, target, semua jawaban, kartu kosakata, dan riwayat simulasi di browser ini.</p>
    <button type="button" class="tombol kedua" id="hapus">Hapus semua progres</button>`;
  m.querySelector("#hapus")!.addEventListener("click", () => {
    if (!confirm("Hapus semua progres di browser ini? Tidak bisa dibatalkan.")) return;
    hapusSemua();
    progres(m);
  });
  return tanpa;
}

export function halamanHilang(m: HTMLElement): Bersih {
  m.innerHTML = `<h1>Halamannya nggak ada.</h1><p class="lead">Mungkin tautannya salah ketik.</p><a class="tombol" href="#/">Ke beranda</a>`;
  return tanpa;
}
