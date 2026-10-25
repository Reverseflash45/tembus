/* Bentuk data soal. Semua soal & bacaan di folder ini ditulis sendiri untuk
   latihan, bukan salinan soal resmi. */

export type Huruf = 0 | 1 | 2 | 3;
export type Empat = [string, string, string, string];

export type TopikId =
  | "subjek-kerja"
  | "kesesuaian"
  | "klausa-sifat"
  | "klausa-benda"
  | "penghubung"
  | "paralel"
  | "perbandingan"
  | "pasif"
  | "gerund"
  | "inversi"
  | "bentuk-kata"
  | "ganti-artikel"
  | "bentuk-kerja";

export type Topik = {
  id: TopikId;
  judul: string;
  /** satu kalimat: kenapa topik ini penting */
  ringkas: string;
  /** paragraf penjelasan; **tebal** dan ==stabilo== didukung */
  isi: string[];
  pola: string[];
  contoh: { benar: string; salah?: string; catatan: string }[];
  jebakan: string[];
};

/** Structure: lengkapi kalimat. Tempat kosong ditulis "___". */
export type SoalStructure = {
  id: string;
  jenis: "structure";
  topik: TopikId;
  kalimat: string;
  pilihan: Empat;
  jawab: Huruf;
  bahas: string;
};

/** Written Expression: tepat empat bagian bergaris bawah ditulis [seperti ini],
    urut A–D. Satu bagian salah. */
export type SoalWritten = {
  id: string;
  jenis: "written";
  topik: TopikId;
  kalimat: string;
  jawab: Huruf;
  /** bentuk yang benar untuk bagian yang salah */
  betul: string;
  bahas: string;
};

export type JenisSoalBaca = "ide-pokok" | "detail" | "kosakata" | "rujukan" | "inferensi" | "tujuan";

export type SoalBaca = {
  id: string;
  tipe: JenisSoalBaca;
  tanya: string;
  pilihan: Empat;
  jawab: Huruf;
  bahas: string;
  /** paragraf (mulai 1) yang jadi bukti, untuk disorot saat pembahasan */
  paragraf?: number;
};

export type Bacaan = {
  id: string;
  judul: string;
  bidang: string;
  paragraf: string[];
  soal: SoalBaca[];
};

export type Penutur = "M" | "W" | "N";
export type Baris = [Penutur, string];

/** Listening Part A: dialog pendek, satu pertanyaan dari narator. */
export type DialogPendek = {
  id: string;
  baris: Baris[];
  tanya: string;
  pilihan: Empat;
  jawab: Huruf;
  bahas: string;
};

/** Listening Part B/C: percakapan atau kuliah panjang, beberapa pertanyaan. */
export type Rekaman = {
  id: string;
  judul: string;
  jenis: "percakapan" | "kuliah";
  baris: Baris[];
  soal: { id: string; tanya: string; pilihan: Empat; jawab: Huruf; bahas: string }[];
};

export type Kata = {
  kata: string;
  kelas: "n" | "v" | "adj" | "adv";
  arti: string;
  sinonim: string;
  contoh: string;
};
