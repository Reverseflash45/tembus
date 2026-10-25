import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/source-serif-4/wght-italic.css";
import "./gaya.css";
import {
  beranda,
  halamanHilang,
  kosakata,
  latihanDaftar,
  latihanStructure,
  listeningSesi,
  materiDaftar,
  materiTopik,
  progres,
  readingSesi,
  simulasi,
} from "./ui/halaman";
import { IKON } from "./ui/ikon";

const utama = document.querySelector<HTMLElement>("main")!;
let bersihkan: () => void = () => {};

type Tab = "beranda" | "latihan" | "simulasi" | "progres";
const TAB: { id: Tab; label: string; href: string; ikon: string }[] = [
  { id: "beranda", label: "Beranda", href: "#/", ikon: IKON.rumah },
  { id: "latihan", label: "Latihan", href: "#/latihan", ikon: IKON.pensil },
  { id: "simulasi", label: "Simulasi", href: "#/simulasi", ikon: IKON.jam },
  { id: "progres", label: "Progres", href: "#/progres", ikon: IKON.grafik },
];
const tautanTab = TAB.map((t) => `<a href="${t.href}" data-tab="${t.id}">${t.ikon}<span>${t.label}</span></a>`).join("");
document.querySelector(".kepala .tab")!.innerHTML = tautanTab;
document.querySelector(".bar-tab")!.innerHTML = tautanTab;

type Halaman = (m: HTMLElement, ...x: string[]) => () => void;
const RUTE: [RegExp, Halaman, Tab, string][] = [
  [/^$/, beranda, "beranda", ""],
  [/^latihan$/, latihanDaftar, "latihan", "Latihan"],
  [/^(?:reading|listening)$/, (m) => latihanDaftar(m, location.hash.includes("listening") ? "listening" : "reading"), "latihan", "Latihan"],
  [/^latihan\/(campur|structure|written|salah|topik\/[\w-]+)$/, latihanStructure, "latihan", "Structure"],
  [/^reading\/([\w-]+)$/, readingSesi, "latihan", "Reading"],
  [/^listening\/([\w-]+)$/, listeningSesi, "latihan", "Listening"],
  [/^materi$/, materiDaftar, "latihan", "Materi"],
  [/^materi\/([\w-]+)$/, materiTopik, "latihan", "Materi"],
  [/^kosakata$/, kosakata, "latihan", "Kosakata"],
  [/^simulasi$/, simulasi, "simulasi", "Simulasi"],
  [/^progres$/, progres, "progres", "Progres"],
];

function arahkan() {
  // "#/latihan#reading?x" → jalur "latihan", bagian "reading"
  const [jalur, bagian] = location.hash.replace(/^#\/?/, "").split("?")[0].replace(/\/$/, "").split("#");
  bersihkan();
  document.body.classList.remove("fokus");
  for (const [re, f, tab, judul] of RUTE) {
    const c = jalur.match(re);
    if (!c) continue;
    bersihkan = jalur === "latihan" ? latihanDaftar(utama, bagian) : f(utama, ...c.slice(1));
    document.title = judul ? `${judul} — Tembus` : "Tembus — latihan TOEFL ITP";
    document.querySelectorAll<HTMLAnchorElement>("[data-tab]").forEach((a) => {
      if (a.dataset.tab === tab) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    return;
  }
  bersihkan = halamanHilang(utama);
}

window.addEventListener("hashchange", () => {
  arahkan();
  if (!location.hash.split("#")[2]) window.scrollTo({ top: 0 });
});
arahkan();
