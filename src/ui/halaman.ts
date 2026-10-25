import { BACAAN } from "../data/bacaan";
import { DIALOG, REKAMAN } from "../data/dengar";
import type { TopikId } from "../data/jenis";
import { KELOMPOK_SINONIM, KOSAKATA } from "../data/kosakata";
import { SOAL_A } from "../data/soal-a";
import { SOAL_B } from "../data/soal-b";
import { TOPIK, topikDari } from "../data/topik";
import { HURUF, esc, kocok, nilaiKartu, perluDiulang, pilihPengecoh, pilihSoal, skorBagian, skorTotal, tandai } from "../inti";
import {
  type Langkah,
  aturTarget,
  catatKartu,
  data,
  hapusSemua,
  langkahSelesai,
  runtutan,
  simpan,
  tandaiLangkah,
  targetSkor,
} from "../simpan";
import { type Butir, dariBacaan, dariDialog, dariRekaman, dariStructure } from "./butir";
import { IKON } from "./ikon";
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
const kartuJatuhTempo = () => KOSAKATA.filter((k) => data.kartu[k.kata] && perluDiulang(data.kartu[k.kata], Date.now())).length;

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
    dari: "dari hasil latihanmu",
  };
}

/* ---------- potongan tampilan ---------- */
type BarisMenu = { href: string; ikon: string; judul: string; ket: string; angka?: string; persen?: number | null };

const menu = (baris: BarisMenu[]) =>
  `<ul class="menu">${baris
    .map(
      (b) => `<li><a href="${b.href}"><span class="simbol">${b.ikon}</span><span class="teks"><h3>${esc(b.judul)}</h3><small>${b.ket}</small>${
        b.persen !== undefined && b.persen !== null ? `<span class="batang-mini"><i style="width:${b.persen}%"></i></span>` : ""
      }</span>${b.angka ? `<span class="angka">${b.angka}</span>` : ""}<span class="panah">${IKON.panah}</span></a></li>`,
    )
    .join("")}</ul>`;

const keterangan = (a: ReturnType<typeof akurasi>, satuan = "soal") =>
  a.dijawab ? `${a.persen}% benar, ${a.dijawab} dari ${a.total} ${satuan} pernah dicoba` : `${a.total} ${satuan}, belum dicoba`;

/* ---------- rencana harian ---------- */
type Rencana = { l: Langkah; judul: string; ket: string; menit: number; href: string };

function rencanaHariIni(): Rencana[] {
  const belumBaca = BACAAN.find((b) => b.soal.some((s) => !riwayat()[s.id])) ?? BACAAN[Math.floor(Date.now() / 86_400_000) % BACAAN.length];
  const jatuh = kartuJatuhTempo();
  return [
    { l: "grammar", judul: "10 soal grammar", ket: "Structure & Written Expression, yang dulu salah lebih sering muncul", menit: 8, href: "#/latihan/campur?rencana" },
    { l: "reading", judul: "1 bacaan Reading", ket: `${belumBaca.judul}, 8 soal`, menit: 10, href: `#/reading/${belumBaca.id}?rencana` },
    { l: "listening", judul: "8 dialog Listening", ket: "Siapkan earphone", menit: 5, href: "#/listening/a?rencana" },
    { l: "kosakata", judul: "12 kartu kosakata", ket: jatuh ? `${jatuh} kartu perlu diulang hari ini` : "Sinonim untuk soal Reading", menit: 4, href: "#/kosakata?mulai&rencana" },
  ];
}

const dariRencana = () => location.hash.includes("rencana");

/* ---------- beranda ---------- */
export function beranda(m: HTMLElement): Bersih {
  const p = perkiraanSkor();
  const target = targetSkor();
  const rencana = rencanaHariIni();
  const beres = langkahSelesai();
  const berikut = rencana.find((r) => !beres.includes(r.l));
  const hari = runtutan();
  const pos = (s: number) => ((Math.min(677, Math.max(310, s)) - 310) / (677 - 310)) * 100;
  const sisaMenit = rencana.filter((r) => !beres.includes(r.l)).reduce((a, r) => a + r.menit, 0);
  const S = akurasi([...idStructure(), ...idWritten()]);
  const R = akurasi(idReading());
  const L = akurasi(idListening());
  const jatuh = kartuJatuhTempo();

  m.innerHTML = `<div class="beranda">
    <header>
      <h1>${data.nama.trim() ? `Halo, ${esc(data.nama.trim())}` : "Halo!"}${hari > 1 ? ` <span style="font-size:15px;font-weight:650;color:var(--redup);letter-spacing:0">${hari} hari berturut-turut</span>` : ""}</h1>
      ${
        p
          ? `<div class="skor-ringkas"><span>Perkiraan skor <b>${p.skor}</b></span><span>Target <b>${target}</b></span><span>${p.skor >= target ? "Target sudah lewat. Naikkan di Progres?" : `kurang ${target - p.skor} poin`}</span></div>
             <div class="jalur-skor" aria-hidden="true"><span class="isi" style="width:${pos(p.skor)}%"></span><span class="target" style="left:${pos(target)}%"></span></div>
             <div class="jalur-label" aria-hidden="true"><span>310</span><span>677</span></div>`
          : `<p class="lead" style="margin:4px 0 0">Target skormu <b style="color:var(--tinta)">${target}</b>. Perkiraan skor muncul setelah kamu latihan di tiap bagian atau ikut simulasi.</p>`
      }
    </header>

    <section class="kartu rencana" aria-labelledby="judul-rencana">
      <h2 id="judul-rencana">Rencana hari ini</h2>
      <p class="sub">${berikut ? `${4 - beres.length} langkah lagi, sekitar ${sisaMenit} menit.` : "Semua langkah hari ini sudah beres. Besok rencananya diulang."}</p>
      <ol class="langkah">${rencana
        .map((r) => {
          const ok = beres.includes(r.l);
          const cls = ok ? "selesai" : r === berikut ? "berikut" : "";
          return `<li class="${cls}"><a href="${r.href}"><span class="bulat-langkah" aria-hidden="true">${ok ? IKON.centang : ""}</span><span><span class="judul-langkah">${esc(r.judul)}</span><span class="ket">${esc(r.ket)}</span></span><span class="durasi">${ok ? "selesai" : `${r.menit} mnt`}</span></a></li>`;
        })
        .join("")}</ol>
      ${
        berikut
          ? `<a class="tombol lebar" href="${berikut.href}">${beres.length ? "Lanjut" : "Mulai"}: ${esc(berikut.judul)}</a>`
          : `<a class="tombol lebar" href="#/simulasi">Coba simulasi mini</a>`
      }
    </section>

    <section aria-labelledby="judul-bebas">
      <h2 id="judul-bebas" style="margin-top:0">Latihan bebas</h2>
      ${menu([
        { href: "#/latihan/campur", ikon: IKON.kalimat, judul: "Structure & Written Expression", ket: keterangan(S), persen: S.persen },
        { href: "#/latihan#reading", ikon: IKON.buku, judul: "Reading", ket: keterangan(R), persen: R.persen },
        { href: "#/latihan#listening", ikon: IKON.dengar, judul: "Listening", ket: keterangan(L), persen: L.persen },
        { href: "#/kosakata", ikon: IKON.kartu, judul: "Kosakata", ket: jatuh ? `${jatuh} kartu perlu diulang` : `${KOSAKATA.length} kata akademik`, angka: "" },
        { href: "#/materi", ikon: IKON.pensil, judul: "Materi grammar", ket: `${TOPIK.length} pola yang paling sering keluar` },
      ])}
    </section>
  </div>`;
  return tanpa;
}

/* ---------- daftar latihan ---------- */
export function latihanDaftar(m: HTMLElement, bagian?: string): Bersih {
  const salah = SOAL.filter((s) => riwayat()[s.id] && !riwayat()[s.id].tadiBenar).length;
  const S = akurasi(idStructure());
  const W = akurasi(idWritten());
  m.innerHTML = `<h1>Latihan</h1>
    <p class="lead">Pilih bagian yang mau dilatih. Tiap sesi langsung dikoreksi dan ada pembahasannya.</p>

    <h2 id="structure">Structure & Written Expression</h2>
    ${menu([
      { href: "#/latihan/campur", ikon: IKON.kalimat, judul: "Campuran, 10 soal", ket: "Structure dan Written Expression diacak seperti di tes" },
      { href: "#/latihan/structure", ikon: IKON.kalimat, judul: "Structure saja", ket: keterangan(S), persen: S.persen },
      { href: "#/latihan/written", ikon: IKON.kalimat, judul: "Written Expression saja", ket: keterangan(W), persen: W.persen },
      ...(salah ? [{ href: "#/latihan/salah", ikon: IKON.ulang, judul: "Ulangi yang salah", ket: `${salah} soal yang terakhir kamu jawab salah` }] : []),
    ])}

    <h2 id="topik">Per topik grammar</h2>
    ${menu(
      TOPIK.map((t) => {
        const a = akurasi(SOAL.filter((s) => s.topik === t.id).map((s) => s.id));
        return { href: `#/materi/${t.id}`, ikon: IKON.pensil, judul: t.judul, ket: a.dijawab ? `${a.persen}% benar dari ${a.dijawab} soal` : "Baca materinya, lalu 9 soal", persen: a.persen };
      }),
    )}

    <h2 id="reading">Reading</h2>
    ${menu(
      BACAAN.map((b) => {
        const a = akurasi(b.soal.map((s) => s.id));
        return { href: `#/reading/${b.id}`, ikon: IKON.buku, judul: b.judul, ket: `${b.bidang}, 8 soal${a.dijawab ? `, ${a.persen}% benar` : ""}`, persen: a.persen };
      }),
    )}

    <h2 id="listening">Listening</h2>
    ${menu([
      { href: "#/listening/a", ikon: IKON.dengar, judul: "Dialog pendek, 8 soal", ket: keterangan(akurasi(DIALOG.map((d) => d.id)), "dialog"), persen: akurasi(DIALOG.map((d) => d.id)).persen },
      ...REKAMAN.map((r) => {
        const a = akurasi(r.soal.map((s) => s.id));
        return { href: `#/listening/${r.id}`, ikon: IKON.dengar, judul: r.judul, ket: `${r.jenis === "percakapan" ? "Percakapan panjang" : "Kuliah singkat"}, ${r.soal.length} soal`, persen: a.persen };
      }),
    ])}
    <p class="catatan" style="margin-top:10px">Suara dibacakan oleh browser-mu. Kalau tidak bunyi, cek mode senyap; di beberapa HP suara bahasa Inggris perlu diunduh dari pengaturan bahasa.</p>

    <h2 id="kosakata">Kosakata</h2>
    ${menu([{ href: "#/kosakata", ikon: IKON.kartu, judul: "Kartu sinonim", ket: `${kartuJatuhTempo()} perlu diulang, ${KOSAKATA.filter((k) => !data.kartu[k.kata]).length} belum dipelajari` }])}`;
  if (bagian) document.getElementById(bagian)?.scrollIntoView({ block: "start" });
  return tanpa;
}

/* ---------- sesi latihan ---------- */
function jalankan(m: HTMLElement, buat: () => Butir[], judul: string, kembali: string, labelKembali: string, langkah?: Langkah): Bersih {
  let bersih: Bersih = tanpa;
  const rencana = dariRencana();
  const mulai = (butir: Butir[]) => {
    bersih();
    bersih = mulaiSesi(m, {
      judul,
      mode: "latihan",
      butir,
      kembali: rencana ? "#/" : kembali,
      labelKembali: rencana ? "Kembali ke rencana" : labelKembali,
      lagi: () => mulai(buat()),
      ulangiSalah: (salah) => mulai(salah),
      selesai: () => langkah && tandaiLangkah(langkah),
    });
  };
  mulai(buat());
  return () => bersih();
}

export function latihanStructure(m: HTMLElement, jenis: string): Bersih {
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
  if (!kolam().length) {
    m.innerHTML = `<h1>Belum ada yang salah</h1><p class="lead">Soal yang kamu jawab salah akan terkumpul di sini.</p><a class="tombol" href="#/latihan/campur">Mulai latihan</a>`;
    return tanpa;
  }
  const judul = t ? t.judul : jenis === "structure" ? "Structure" : jenis === "written" ? "Written Expression" : jenis === "salah" ? "Ulangi yang salah" : "Structure & Written Expression";
  const buat = () => (t ? kocok(kolam()) : pilihSoal(kolam(), 10, riwayat())).map((s) => dariStructure(s, Math.random));
  return jalankan(m, buat, judul, t ? `#/materi/${t.id}` : "#/latihan", t ? "Kembali ke materi" : "Pilih latihan lain", "grammar");
}

export function readingSesi(m: HTMLElement, id: string): Bersih {
  const b = BACAAN.find((x) => x.id === id);
  if (!b) return halamanHilang(m);
  return jalankan(m, () => dariBacaan(b, Math.random), "Reading", "#/latihan#reading", "Bacaan lain", "reading");
}

export function listeningSesi(m: HTMLElement, id: string): Bersih {
  const r = REKAMAN.find((x) => x.id === id);
  if (id !== "a" && !r) return halamanHilang(m);
  const buat = () => (r ? dariRekaman(r, Math.random) : pilihSoal(DIALOG, 8, riwayat()).map((d) => dariDialog(d, Math.random)));
  return jalankan(m, buat, r ? r.judul : "Dialog pendek", "#/latihan#listening", "Pilih rekaman lain", "listening");
}

/* ---------- materi ---------- */
export function materiDaftar(m: HTMLElement): Bersih {
  m.innerHTML = `<h1>Materi grammar</h1>
    <p class="lead">Tiga belas pola yang paling sering keluar di Structure & Written Expression. Baca sebentar, lalu langsung coba 9 soalnya.</p>
    ${menu(
      TOPIK.map((t) => {
        const a = akurasi(SOAL.filter((s) => s.topik === t.id).map((s) => s.id));
        return { href: `#/materi/${t.id}`, ikon: IKON.pensil, judul: t.judul, ket: esc(t.ringkas), persen: a.persen };
      }),
    )}`;
  return tanpa;
}

export function materiTopik(m: HTMLElement, id: string): Bersih {
  const t = topikDari(id);
  if (!t) return halamanHilang(m);
  const lanjut = TOPIK[TOPIK.indexOf(t) + 1];
  const contoh = t.contoh
    .map(
      (c) => `<li>${c.salah ? `<div class="en x">${IKON.silang}<span>${esc(c.salah)}</span></div>` : ""}<div class="en v">${IKON.centang}<span>${esc(c.benar)}</span></div><small>${tandai(c.catatan)}</small></li>`,
    )
    .join("");
  m.innerHTML = `<article class="materi">
    <p style="margin:0 0 12px"><a href="#/materi">Semua materi</a></p>
    <h1>${esc(t.judul)}</h1>
    <p class="lead">${esc(t.ringkas)}</p>
    ${t.isi.map((p) => `<p>${tandai(p)}</p>`).join("")}
    <h2>Polanya</h2><ul class="kotak-pola">${t.pola.map((p) => `<li>${tandai(p)}</li>`).join("")}</ul>
    <h2>Contoh</h2><ul class="contoh-kalimat">${contoh}</ul>
    <h2>Jebakan yang sering muncul</h2><ul>${t.jebakan.map((j) => `<li>${tandai(j)}</li>`).join("")}</ul>
    <div class="baris-tombol" style="flex-wrap:wrap;margin-top:28px"><a class="tombol" href="#/latihan/topik/${t.id}">Latihan 9 soal topik ini</a>${
      lanjut ? `<a class="tombol kedua" href="#/materi/${lanjut.id}">Topik berikutnya</a>` : ""
    }</div>
  </article>`;
  return tanpa;
}

/* ---------- kosakata ---------- */
export function kosakata(m: HTMLElement): Bersih {
  const rencana = dariRencana();
  const kotak = [1, 2, 3, 4, 5].map((n) => KOSAKATA.filter((k) => data.kartu[k.kata]?.kotak === n).length);
  const baru = KOSAKATA.filter((k) => !data.kartu[k.kata]);
  const jatuh = KOSAKATA.filter((k) => data.kartu[k.kata] && perluDiulang(data.kartu[k.kata], Date.now())).sort((a, b) => data.kartu[a.kata].kotak - data.kartu[b.kata].kotak);
  const antrean = [...jatuh, ...kocok(baru)].slice(0, 12);

  if (!location.hash.includes("mulai")) {
    m.innerHTML = `<h1>Kosakata sinonim</h1>
      <p class="lead">Di Reading selalu ada soal "The word … is closest in meaning to". Kartu yang kamu jawab benar naik kotak dan muncul makin jarang. Yang salah kembali ke kotak 1.</p>
      <ul class="kotak-leitner" aria-label="Isi tiap kotak"><li>Baru<b>${baru.length}</b></li>${kotak.map((n, k) => `<li>Kotak ${k + 1}<b>${n}</b>${["tiap hari", "1 hari", "3 hari", "7 hari", "16 hari"][k]}</li>`).join("")}</ul>
      ${antrean.length ? `<a class="tombol" href="#/kosakata?mulai">Mulai ${antrean.length} kartu</a>` : `<p class="lead">Semua kartu hari ini sudah beres. Balik lagi besok ya.</p>`}`;
    return tanpa;
  }
  if (!antrean.length) {
    tandaiLangkah("kosakata");
    location.hash = rencana ? "#/" : "#/kosakata";
    return tanpa;
  }

  document.body.classList.add("fokus");
  let i = 0;
  let benar = 0;
  let pilihan: string[] = [];
  let dijawab: number | null = null;
  let kotakAwal: number | undefined;
  const kembali = rencana ? "#/" : "#/kosakata";
  const KELAS = { n: "kata benda", v: "kata kerja", adj: "kata sifat", adv: "kata keterangan" };

  function gambar(dariKeyboard = false) {
    if (i >= antrean.length) {
      document.body.classList.remove("fokus");
      tandaiLangkah("kosakata");
      m.innerHTML = `<section class="hasil"><p class="jenis-soal">Kosakata</p><p class="angka-hasil">${benar}<small> dari ${antrean.length} benar</small></p>
        <h1>Sesi kartu selesai.</h1><p class="catatan">Kartu yang salah muncul lagi besok, yang benar menunggu sesuai kotaknya.</p>
        <div class="baris-tombol" style="flex-wrap:wrap;margin-top:20px"><a class="tombol" href="${rencana ? "#/" : `#/kosakata?mulai&${Date.now()}`}">${rencana ? "Kembali ke rencana" : "Sesi berikutnya"}</a><a class="tombol kedua" href="#/">Beranda</a></div></section>`;
      window.scrollTo({ top: 0 });
      return;
    }
    const k = antrean[i];
    if (dijawab === null) {
      kotakAwal = data.kartu[k.kata]?.kotak;
      if (!pilihan.length) pilihan = kocok([k.sinonim, ...pilihPengecoh(k, KOSAKATA, KELOMPOK_SINONIM)]);
    }
    const kunci = pilihan.indexOf(k.sinonim);
    const kalimat = esc(k.contoh).replace(new RegExp(`\\b(${k.kata.slice(0, Math.max(4, k.kata.length - 3))}\\w*)`, "i"), '<mark class="stabilo">$1</mark>');
    const ok = dijawab === kunci;
    m.innerHTML = `<div class="sesi">
      <header class="bar-sesi"><div class="bar-sesi-isi"><a class="keluar" href="${kembali}" aria-label="Keluar">${IKON.silang}</a>
        <div class="kemajuan" role="progressbar" aria-label="Kemajuan" aria-valuemin="0" aria-valuemax="${antrean.length}" aria-valuenow="${i + (dijawab !== null ? 1 : 0)}"><i style="width:${((i + (dijawab !== null ? 1 : 0)) / antrean.length) * 100}%"></i></div>
        <span class="hitungan">${i + 1}/${antrean.length}</span></div></header>
      <div class="isi-sesi"><section class="soal kartu-kata" tabindex="-1">
        <p class="jenis-soal">${kotakAwal ? `Kotak ${kotakAwal}` : "Kata baru"}, ${KELAS[k.kelas]}</p>
        <p class="kata">${esc(k.kata)}</p>
        <p class="kalimat">${kalimat}</p>
        <p class="jenis-soal" style="margin:18px 0 10px">Paling dekat artinya dengan:</p>
        <ol class="opsi">${pilihan
          .map((p, n) => {
            const cls = dijawab !== null ? (n === kunci ? "kunci" : n === dijawab ? "keliru" : "redup") : "";
            return `<li><button type="button" data-pilih="${n}" class="${cls}" ${dijawab !== null ? "disabled" : ""}><span class="huruf" aria-hidden="true">${HURUF[n]}</span><span>${esc(p)}</span></button></li>`;
          })
          .join("")}</ol>
      </section></div>
      ${
        dijawab !== null
          ? `<footer class="laci ${ok ? "benar" : "salah"}" role="status"><div class="laci-isi"><p class="vonis">${ok ? IKON.centang : IKON.silang}${ok ? "Betul!" : `Kurang tepat. Jawabannya ${HURUF[kunci]}.`}</p>
          <div class="bahas"><p><b>${esc(k.kata)}</b> artinya ${esc(k.arti)}. Sinonimnya <b>${esc(k.sinonim)}</b>.</p></div>
          <button type="button" class="tombol lebar" data-maju>${i === antrean.length - 1 ? "Lihat hasil" : "Lanjut"}</button></div></footer>`
          : ""
      }
    </div>`;
    if (dariKeyboard && dijawab !== null) m.querySelector<HTMLElement>("[data-maju]")?.focus({ preventScroll: true });
  }

  function jawab(p: number, dariKeyboard = false) {
    if (dijawab !== null || i >= antrean.length) return;
    dijawab = p;
    const k = antrean[i];
    const ok = pilihan[p] === k.sinonim;
    if (ok) benar++;
    catatKartu(k.kata, nilaiKartu(data.kartu[k.kata], ok, Date.now()));
    gambar(dariKeyboard);
  }
  function lanjut() {
    i++;
    dijawab = null;
    pilihan = [];
    gambar();
    window.scrollTo({ top: 0 });
  }
  function klik(e: MouseEvent) {
    const t = (e.target as HTMLElement).closest<HTMLElement>("button");
    if (!t || t.hasAttribute("disabled")) return;
    if (t.dataset.pilih !== undefined) jawab(Number(t.dataset.pilih));
    else if (t.hasAttribute("data-maju")) lanjut();
  }
  function tombolKeyboard(e: KeyboardEvent) {
    const p = "abcd".indexOf(e.key.toLowerCase());
    const n = "1234".indexOf(e.key);
    if (p >= 0 || n >= 0) jawab(p >= 0 ? p : n, true);
    else if (e.key === "Enter" && dijawab !== null && !(e.target as HTMLElement).closest("button, a")) lanjut();
  }
  m.addEventListener("click", klik);
  document.addEventListener("keydown", tombolKeyboard);
  gambar();
  return () => {
    document.body.classList.remove("fokus");
    m.removeEventListener("click", klik);
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
    <p class="lead">Versi pendek TOEFL ITP dengan urutan dan aturan yang mirip. Jawaban baru dinilai setelah kamu kumpulkan, hasilnya perkiraan skor.</p>
    <div class="statistik" style="margin-bottom:20px">
      <div>Listening<b>12 soal</b>8 dialog + 1 rekaman</div>
      <div>Structure<b>16 soal</b>8 + 8 Written Expression</div>
      <div>Reading<b>16 soal</b>2 bacaan</div>
      <div>Waktu<b>35 menit</b>otomatis dikumpulkan</div>
    </div>
    <ul class="materi" style="padding-left:20px;margin:0 0 24px">
      <li>Rekaman hanya bisa diputar <b>sekali</b>. Siapkan earphone.</li>
      <li>Tombol kotak-kotak di pojok kanan atas membuka daftar soal, untuk loncat ke soal mana pun.</li>
    </ul>
    <button type="button" class="tombol" id="mulai-sim">Mulai simulasi</button>
    ${
      riwayatSim.length
        ? `<h2>Riwayat terakhir</h2><table class="tabel"><thead><tr><th>Tanggal</th><th class="angka">Listening</th><th class="angka">Structure</th><th class="angka">Reading</th><th class="angka">Skor</th></tr></thead><tbody>${riwayatSim
            .map(
              (h) =>
                `<tr><td>${new Date(h.waktu).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</td><td class="angka">${h.l}</td><td class="angka">${h.s}</td><td class="angka">${h.r}</td><td class="angka"><b>${h.total}</b></td></tr>`,
            )
            .join("")}</tbody></table>`
        : ""
    }`;
  const mulai = () => {
    bersih();
    bersih = mulaiSesi(m, {
      judul: "Simulasi mini",
      mode: "simulasi",
      butir: susunSimulasi(),
      batasDetik: BATAS_SIMULASI,
      kembali: "#/simulasi",
      labelKembali: "Selesai",
      lagi: mulai,
    });
  };
  m.querySelector("#mulai-sim")!.addEventListener("click", mulai);
  return () => bersih();
}

/* ---------- progres ---------- */
export function progres(m: HTMLElement): Bersih {
  const baris = (label: string, ids: string[], href: string) => {
    const a = akurasi(ids);
    return `<tr><td><a href="${href}">${esc(label)}</a><span class="batang-mini"><i style="width:${a.persen ?? 0}%"></i></span></td><td class="angka">${a.dijawab}/${a.total}</td><td class="angka">${a.persen === null ? "belum" : `${a.persen}%`}</td></tr>`;
  };
  const lemah = TOPIK.map((t) => ({ t, a: akurasi(SOAL.filter((s) => s.topik === t.id).map((s) => s.id)) }))
    .filter((x) => x.a.persen !== null && x.a.persen < 80)
    .sort((x, y) => x.a.persen! - y.a.persen!)
    .slice(0, 3);
  const kotak = [1, 2, 3, 4, 5].map((n) => KOSAKATA.filter((k) => data.kartu[k.kata]?.kotak === n).length);
  const p = perkiraanSkor();
  const dicoba = Object.keys(data.jawaban).length;

  m.innerHTML = `<h1>Progres</h1>
    <p class="lead">Semua data ini hanya tersimpan di browser ini.</p>
    <div class="statistik">
      <div>Perkiraan skor<b>${p ? p.skor : "belum ada"}</b>${p ? p.dari : "latihan dulu di tiap bagian"}</div>
      <div>Soal dicoba<b>${dicoba}</b>dari ${SOAL.length + idReading().length + idListening().length}</div>
      <div>Hari latihan<b>${data.hari.length}</b>${runtutan()} hari berturut-turut</div>
      <div>Kosakata dikuasai<b>${kotak[3] + kotak[4]}</b>kotak 4 dan 5</div>
    </div>

    ${lemah.length ? `<h2>Fokus dulu ke sini</h2>${menu(lemah.map((x) => ({ href: `#/materi/${x.t.id}`, ikon: IKON.pensil, judul: x.t.judul, ket: `${x.a.persen}% benar dari ${x.a.dijawab} soal`, persen: x.a.persen })))}` : ""}

    <h2>Target & nama</h2>
    <div class="kartu" style="display:grid;gap:18px">
      <div><span class="label" id="label-target">Target skor</span><div class="pengatur" role="group" aria-labelledby="label-target"><button type="button" data-target="-10" aria-label="Turunkan 10">−</button><output id="target">${targetSkor()}</output><button type="button" data-target="10" aria-label="Naikkan 10">+</button></div></div>
      <div><label class="label" for="nama">Nama panggilan</label><input id="nama" class="isian" maxlength="30" autocomplete="given-name" placeholder="Muncul di beranda" value="${esc(data.nama)}" /></div>
    </div>

    <h2>Per bagian</h2>
    <table class="tabel"><thead><tr><th>Bagian</th><th class="angka">Dicoba</th><th class="angka">Benar</th></tr></thead><tbody>
      ${baris("Listening", idListening(), "#/latihan#listening")}
      ${baris("Structure", idStructure(), "#/latihan/structure")}
      ${baris("Written Expression", idWritten(), "#/latihan/written")}
      ${baris("Reading", idReading(), "#/latihan#reading")}
    </tbody></table>

    <h2>Per topik grammar</h2>
    <table class="tabel"><thead><tr><th>Topik</th><th class="angka">Dicoba</th><th class="angka">Benar</th></tr></thead><tbody>
      ${TOPIK.map((t) => baris(t.judul, SOAL.filter((s) => s.topik === t.id).map((s) => s.id), `#/materi/${t.id}`)).join("")}
    </tbody></table>

    <h2>Kosakata</h2>
    <ul class="kotak-leitner"><li>Baru<b>${KOSAKATA.filter((k) => !data.kartu[k.kata]).length}</b></li>${kotak.map((n, k) => `<li>Kotak ${k + 1}<b>${n}</b></li>`).join("")}</ul>

    <h2>Riwayat simulasi</h2>
    ${
      data.simulasi.length
        ? `<table class="tabel"><thead><tr><th>Waktu</th><th class="angka">Benar</th><th class="angka">Skor</th></tr></thead><tbody>${[...data.simulasi]
            .reverse()
            .map((h) => `<tr><td>${new Date(h.waktu).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td><td class="angka">${h.benar}/${h.jumlah}</td><td class="angka"><b>${h.total}</b></td></tr>`)
            .join("")}</tbody></table>`
        : `<p>Belum pernah. <a href="#/simulasi">Coba simulasi mini</a>.</p>`
    }

    <h2>Mulai dari nol</h2>
    <p class="catatan">Menghapus nama, target, semua jawaban, kartu kosakata, dan riwayat simulasi di browser ini.</p>
    <button type="button" class="tombol kedua" id="hapus">Hapus semua progres</button>`;

  const nama = m.querySelector<HTMLInputElement>("#nama")!;
  nama.addEventListener("input", () => {
    data.nama = nama.value;
    simpan();
  });
  m.querySelectorAll<HTMLButtonElement>("[data-target]").forEach((b) =>
    b.addEventListener("click", () => {
      aturTarget(targetSkor() + Number(b.dataset.target));
      m.querySelector("#target")!.textContent = String(targetSkor());
    }),
  );
  m.querySelector("#hapus")!.addEventListener("click", () => {
    if (!confirm("Hapus semua progres di browser ini? Tidak bisa dibatalkan.")) return;
    hapusSemua();
    progres(m);
  });
  return tanpa;
}

export function halamanHilang(m: HTMLElement): Bersih {
  m.innerHTML = `<h1>Halamannya tidak ada</h1><p class="lead">Mungkin tautannya salah ketik.</p><a class="tombol" href="#/">Ke beranda</a>`;
  return tanpa;
}

