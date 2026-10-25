import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/source-serif-4/wght-italic.css";
import "@fontsource/caveat/600.css";
import "./gaya.css";
import {
  beranda,
  halamanHilang,
  kosakata,
  latihanDaftar,
  latihanStructure,
  listeningDaftar,
  listeningSesi,
  materiDaftar,
  materiTopik,
  progres,
  readingDaftar,
  readingSesi,
  simulasi,
} from "./ui/halaman";

const utama = document.querySelector<HTMLElement>("main")!;
let bersihkan: () => void = () => {};

const JUDUL = "Tembus";
const RUTE: [RegExp, (m: HTMLElement, ...x: string[]) => () => void, string][] = [
  [/^$/, beranda, ""],
  [/^materi$/, materiDaftar, "Materi"],
  [/^materi\/([\w-]+)$/, materiTopik, "Materi"],
  [/^latihan$/, latihanDaftar, "Structure"],
  [/^latihan\/(campur|structure|written|salah|topik\/[\w-]+)$/, latihanStructure, "Structure"],
  [/^reading$/, readingDaftar, "Reading"],
  [/^reading\/([\w-]+)$/, readingSesi, "Reading"],
  [/^listening$/, listeningDaftar, "Listening"],
  [/^listening\/([\w-]+)$/, listeningSesi, "Listening"],
  [/^kosakata$/, kosakata, "Kosakata"],
  [/^simulasi$/, simulasi, "Simulasi"],
  [/^progres$/, progres, "Progres"],
];

function arahkan() {
  const jalur = location.hash.replace(/^#\/?/, "").split("?")[0].replace(/\/$/, "");
  bersihkan();
  for (const [re, f, bagian] of RUTE) {
    const c = jalur.match(re);
    if (!c) continue;
    bersihkan = f(utama, ...c.slice(1));
    document.title = bagian ? `${bagian} — ${JUDUL}` : `${JUDUL} — latihan TOEFL ITP`;
    tandaiNav(bagian);
    return;
  }
  bersihkan = halamanHilang(utama);
  tandaiNav("");
}

function tandaiNav(bagian: string) {
  document.querySelectorAll<HTMLAnchorElement>(".nav a").forEach((a) => {
    if (a.textContent === bagian) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

window.addEventListener("hashchange", () => {
  arahkan();
  window.scrollTo({ top: 0 });
});
arahkan();
