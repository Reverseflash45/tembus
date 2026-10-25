import type { Topik } from "./jenis";

export const TOPIK: Topik[] = [
  {
    id: "subjek-kerja",
    judul: "Subjek & kata kerja",
    ringkas: "Tiap klausa wajib punya satu subjek dan satu kata kerja utama. Soal paling sering muncul di Structure.",
    isi: [
      "Soal Structure paling sering mengosongkan ==subjek atau kata kerja utama==. Jadi langkah pertama: cari subjeknya, lalu cari kata kerjanya. Kalau salah satunya belum ada, jawabanmu harus mengisi yang kurang itu.",
      "Hati-hati dengan kata yang **kelihatan** seperti kata kerja tapi bukan: bentuk -ing tanpa *be* (*studying*), bentuk *to* + verb (*to study*), dan V3 tanpa *have/be* (*studied by many*). Ketiganya tidak bisa jadi kata kerja utama.",
      "Ada juga **appositive**: frasa benda yang menjelaskan subjek, diapit koma. Appositive bukan subjek, jadi kalimat tetap butuh subjek dan kata kerja sendiri.",
    ],
    pola: ["Subjek + Kata kerja utama + …", "Subjek, appositive, + Kata kerja utama", "Preposisi + benda → BUKAN subjek"],
    contoh: [
      { benar: "The museum opens at nine.", catatan: "Subjek *the museum*, kata kerja *opens*. Lengkap." },
      { benar: "In the morning, the museum is crowded.", salah: "In the morning the museum crowded.", catatan: "*crowded* sendirian bukan kata kerja di sini; butuh *is*." },
      { benar: "Jakarta, the largest city in Indonesia, has a dense population.", catatan: "*the largest city in Indonesia* = appositive; kata kerjanya *has*." },
    ],
    jebakan: [
      "Benda setelah preposisi (*in the box*, *of the students*) tidak pernah jadi subjek.",
      "Pilihan yang menambah subjek kedua (*it*, *they*) padahal subjek sudah ada: salah.",
      "Pilihan yang menambah kata kerja kedua tanpa penghubung: salah.",
    ],
  },
  {
    id: "kesesuaian",
    judul: "Kesesuaian subjek–kata kerja",
    ringkas: "Subjek tunggal pakai kata kerja tunggal, jamak pakai jamak. Jebakannya ada di kata-kata di antara keduanya.",
    isi: [
      "Kata kerja harus cocok dengan ==subjek yang sebenarnya==, bukan dengan kata benda terdekat. Di soal, subjek sering dipisah jauh dari kata kerjanya oleh frasa preposisi atau klausa.",
      "Beberapa kata selalu tunggal: *each, every, either, neither, everyone, somebody, the number of*. Sebaliknya *a number of* artinya \"banyak\" dan memakai kata kerja jamak.",
      "Untuk *either … or* dan *neither … nor*, kata kerja mengikuti subjek yang **paling dekat** dengannya.",
    ],
    pola: ["The list of names **is** …", "Each of the students **has** …", "A number of students **have** … / The number of students **has** …"],
    contoh: [
      { benar: "The results of the survey were surprising.", salah: "The results of the survey was surprising.", catatan: "Subjeknya *results* (jamak), bukan *survey*." },
      { benar: "Every student in the two classes needs a laptop.", catatan: "*every* selalu tunggal." },
      { benar: "Neither the lecturer nor the students were late.", catatan: "Terdekat ke kata kerja: *students* → *were*." },
    ],
    jebakan: [
      "Frasa *along with, together with, as well as* tidak menambah subjek: *The teacher, along with her students, **is** here.*",
      "Kata benda yang tampak jamak tapi tunggal: *news, mathematics, physics*.",
      "Klausa *who/which/that* mengikuti kata benda yang dijelaskannya: *the books that **are** on the shelf*.",
    ],
  },
  {
    id: "klausa-sifat",
    judul: "Klausa sifat (who, which, that)",
    ringkas: "Klausa yang menjelaskan kata benda. Sering dipakai untuk menjebak dengan kata ganti ganda atau bentuk ringkas.",
    isi: [
      "Klausa sifat diawali *who* (orang), *which* (benda), *that* (keduanya), *whose* (kepemilikan), *where/when* (tempat/waktu). Kata penghubung ini ==menggantikan== sebuah kata benda, jadi jangan ditambah kata ganti lagi.",
      "Klausa sifat bisa **diringkas**: buang *who/which* + *be*. *The man who is standing there* → *the man standing there*. *The book which was written in 1990* → *the book written in 1990*.",
      "Kalau klausa sifat memotong subjek dan kata kerja, kalimat tetap butuh kata kerja utama di luar klausa itu.",
    ],
    pola: ["benda + who/which/that + kata kerja …", "benda + V-ing … (aktif, ringkas)", "benda + V3 … (pasif, ringkas)"],
    contoh: [
      { benar: "The student who won the prize is my cousin.", salah: "The student who he won the prize is my cousin.", catatan: "*who* sudah jadi subjek klausa; *he* berlebih." },
      { benar: "The bridge built in 1930 is still used today.", catatan: "Bentuk ringkas dari *which was built*." },
      { benar: "The village where my father grew up has no hospital.", catatan: "*where* untuk tempat." },
    ],
    jebakan: [
      "*which* untuk orang atau *who* untuk benda: salah.",
      "Bentuk ringkas aktif pakai V-ing, pasif pakai V3. Perhatikan apakah bendanya melakukan atau dikenai.",
      "*whose* diikuti kata benda: *a writer whose novels …*",
    ],
  },
  {
    id: "klausa-benda",
    judul: "Klausa benda (what, that, whether)",
    ringkas: "Satu klausa utuh yang berfungsi sebagai benda: bisa jadi subjek atau objek kalimat lain.",
    isi: [
      "Klausa benda diawali *that, what, whether/if, why, how, who, when, where*. Klausa ini menempati posisi ==subjek atau objek==. Kalau jadi subjek, ia dihitung tunggal.",
      "Urutan kata di dalam klausa benda adalah urutan **pernyataan**, bukan pertanyaan: *I don't know where she lives* (bukan *where does she live*).",
      "*what* = \"hal yang\", jadi ia sudah berfungsi sebagai subjek/objek di dalam klausanya. *that* hanya penghubung dan tidak punya fungsi itu.",
    ],
    pola: ["What + S + V … + V utama (tunggal)", "That + S + V … + V utama", "S + V + whether/how/why + S + V"],
    contoh: [
      { benar: "What the committee decided surprised everyone.", catatan: "Klausa *what …* jadi subjek; kata kerja utama *surprised*." },
      { benar: "Nobody knows why the river changed its course.", salah: "Nobody knows why did the river change its course.", catatan: "Urutan pernyataan di dalam klausa benda." },
      { benar: "That the earth orbits the sun was once a controversial idea.", catatan: "Klausa *that …* jadi subjek, kata kerja tunggal *was*." },
    ],
    jebakan: [
      "*what* vs *that*: kalau klausanya kurang objek/subjek, pakai *what*.",
      "Urutan tanya (*does she*, *is it*) di dalam klausa benda: salah.",
      "Klausa benda sebagai subjek tetap butuh kata kerja utama sesudahnya.",
    ],
  },
  {
    id: "penghubung",
    judul: "Penghubung & klausa keterangan",
    ringkas: "Bedakan penghubung yang diikuti klausa (S + V) dan yang diikuti frasa benda.",
    isi: [
      "Kalimat dengan dua klausa butuh ==satu penghubung==. *Although, because, when, while, since, if, unless, once, after, before* diikuti **klausa** (subjek + kata kerja).",
      "Pasangan maknanya mirip tapi diikuti **frasa benda**: *despite / in spite of* (bukan *although*), *because of / due to* (bukan *because*), *during* (bukan *while*).",
      "Penghubung berpasangan harus lengkap dan tepat: *both … and, either … or, neither … nor, not only … but also*.",
    ],
    pola: ["Although + S + V, S + V", "Despite + benda/V-ing, S + V", "Because + S + V / Because of + benda"],
    contoh: [
      { benar: "Although it rained, the match continued.", salah: "Despite it rained, the match continued.", catatan: "*it rained* = klausa → *although*." },
      { benar: "Despite the rain, the match continued.", catatan: "*the rain* = frasa benda → *despite*." },
      { benar: "The flight was delayed because of the storm.", catatan: "*the storm* = benda → *because of*." },
    ],
    jebakan: [
      "Dua penghubung untuk satu hubungan: *Although …, but …* salah.",
      "*both … or*, *either … nor*: pasangan tertukar.",
      "Dua klausa tanpa penghubung sama sekali (hanya koma): salah.",
    ],
  },
  {
    id: "paralel",
    judul: "Struktur paralel",
    ringkas: "Hal-hal yang dideretkan dengan and, but, or harus berbentuk sama.",
    isi: [
      "Kalau beberapa unsur dihubungkan dengan *and, but, or* atau pasangan *both … and, not only … but also*, bentuknya harus ==sejajar==: benda dengan benda, kata kerja dengan kata kerja (bentuk sama), sifat dengan sifat.",
      "Di Written Expression, cari daftar tiga hal. Biasanya dua sudah sejajar dan satu berbeda, dan yang berbeda itulah jawabannya.",
      "Perbandingan juga harus paralel: yang dibandingkan harus setara. *The climate of Bogor is cooler than **that of** Jakarta*, bukan *than Jakarta*.",
    ],
    pola: ["V-ing, V-ing, and V-ing", "adj, adj, and adj", "not only + X but also + X (bentuk sama)"],
    contoh: [
      { benar: "She likes reading, swimming, and cooking.", salah: "She likes reading, swimming, and to cook.", catatan: "Tiga-tiganya V-ing." },
      { benar: "The job requires patience, accuracy, and creativity.", salah: "The job requires patience, accurate, and creativity.", catatan: "Benda, benda, benda." },
      { benar: "He not only wrote the song but also performed it.", catatan: "*wrote* dan *performed* sejajar." },
    ],
    jebakan: [
      "Kata sifat di tengah deretan kata benda (atau sebaliknya).",
      "Campuran *to* + V dengan V-ing.",
      "Bentuk waktu berbeda dalam satu deretan: *walked, talks, and laughed*.",
    ],
  },
  {
    id: "perbandingan",
    judul: "Perbandingan",
    ringkas: "Comparative, superlative, dan as … as, termasuk bentuk yang tidak beraturan.",
    isi: [
      "**Comparative** membandingkan dua hal: *-er than* atau *more … than*. **Superlative** untuk tiga ke atas: *the -est* atau *the most …*. Jangan dobel: *more bigger* dan *the most cleverest* salah.",
      "Kesetaraan pakai *as + sifat/keterangan + as*. Bentuk tidak beraturan wajib hafal: *good → better → best*, *bad → worse → worst*, *far → farther/further*, *little → less → least*.",
      "Pola khusus TOEFL: ==*the + comparative …, the + comparative …*== artinya \"makin …, makin …\". *The more you practice, the better you get.*",
    ],
    pola: ["X is -er / more … than Y", "X is the -est / the most … (of/in …)", "as … as", "The -er …, the -er …"],
    contoh: [
      { benar: "This route is shorter than the old one.", salah: "This route is more shorter than the old one.", catatan: "Jangan pakai *more* + *-er* sekaligus." },
      { benar: "Mount Semeru is the highest mountain in Java.", catatan: "Superlative + *the*." },
      { benar: "The sooner we leave, the earlier we will arrive.", catatan: "Pola *the … the …*." },
    ],
    jebakan: [
      "*than* dipasangkan dengan superlative, atau *the* dipakai dengan comparative biasa.",
      "*as … than* (campuran pola).",
      "Lupa *the* di pola *the more …, the more …*.",
    ],
  },
  {
    id: "pasif",
    judul: "Pasif & partisip",
    ringkas: "Bedakan pelaku dan yang dikenai: be + V3 untuk pasif, -ing (aktif) vs -ed (pasif) untuk partisip.",
    isi: [
      "Kalimat pasif: ==*be* + V3==. Pakai pasif kalau subjeknya **dikenai** tindakan: *The bridge was built in 1930.* Kalau subjeknya pelaku, pakai aktif.",
      "Partisip sebagai kata sifat: *-ing* untuk yang **menyebabkan** perasaan/aksi, *-ed* untuk yang **merasakan**/dikenai. *The lecture was boring* (kuliahnya membosankan), *The students were bored* (mahasiswanya bosan).",
      "Setelah *be* dalam pasif, selalu V3, bukan V2 atau bentuk dasar: *was written*, bukan *was wrote*.",
    ],
    pola: ["S (dikenai) + be + V3 (+ by pelaku)", "benda + -ing = aktif, benda + -ed = pasif", "modal + be + V3: *must be submitted*"],
    contoh: [
      { benar: "The results were published last year.", salah: "The results published last year.", catatan: "Hasil tidak menerbitkan; mereka diterbitkan." },
      { benar: "The documentary was fascinating.", salah: "The documentary was fascinated.", catatan: "Film dokumenternya yang membuat terpesona." },
      { benar: "All forms must be submitted by Friday.", catatan: "Modal + be + V3." },
    ],
    jebakan: [
      "Kata kerja intransitif (*happen, occur, arrive, rise*) tidak punya bentuk pasif: *was happened* salah.",
      "V2 dipakai sesudah *be* atau *have*: *has wrote*, *was took*.",
      "*interested* vs *interesting*, *surprised* vs *surprising*.",
    ],
  },
  {
    id: "gerund",
    judul: "Gerund & to-infinitive",
    ringkas: "Kata kerja tertentu diikuti V-ing, yang lain to + V. Setelah preposisi selalu V-ing.",
    isi: [
      "Setelah ==preposisi==, kata kerja harus berbentuk **V-ing**: *interested in learning, before leaving, without saying, capable of solving*. Ini yang paling sering diuji.",
      "Diikuti V-ing: *enjoy, avoid, finish, consider, suggest, mind, deny, risk, keep*. Diikuti to + V: *want, decide, plan, hope, agree, refuse, manage, fail, afford*.",
      "Hati-hati dengan *to* yang merupakan **preposisi**: *look forward to, be used to, object to, be committed to* → diikuti V-ing. *I look forward to meeting you.*",
    ],
    pola: ["preposisi + V-ing", "enjoy/avoid/finish + V-ing", "want/decide/plan + to V", "look forward to / be used to + V-ing"],
    contoh: [
      { benar: "She is good at solving puzzles.", salah: "She is good at solve puzzles.", catatan: "*at* = preposisi → V-ing." },
      { benar: "They decided to postpone the trip.", catatan: "*decide* + to V." },
      { benar: "We are used to working late.", salah: "We are used to work late.", catatan: "*be used to* = terbiasa; *to* di sini preposisi." },
    ],
    jebakan: [
      "*used to* + V (dulu biasa) vs *be used to* + V-ing (terbiasa).",
      "*stop to smoke* (berhenti untuk merokok) vs *stop smoking* (berhenti merokok).",
      "Bentuk dasar setelah preposisi: *for improve*, *by use*.",
    ],
  },
  {
    id: "inversi",
    judul: "Inversi",
    ringkas: "Urutan kata dibalik (kata kerja bantu sebelum subjek) setelah kata negatif atau pola tertentu.",
    isi: [
      "Kalau kalimat **diawali** kata bermakna negatif atau terbatas, urutannya dibalik seperti pertanyaan: ==*never, rarely, seldom, hardly, not only, only after, only when, no sooner, not until*==. *Never **have I** seen such a crowd.*",
      "Pengandaian tanpa *if* juga memakai inversi: *Had I known* = *If I had known*. *Were she here* = *If she were here*. *Should you need help* = *If you should need help*.",
      "Inversi juga muncul setelah keterangan tempat di awal kalimat: *On the hill stands an old temple.*",
    ],
    pola: ["Never/Rarely/Seldom + aux + S + V", "Only after/when … + aux + S + V", "Had + S + V3, … (= If S had V3)", "Not only + aux + S + V, but … also …"],
    contoh: [
      { benar: "Rarely does the volcano erupt twice in one year.", salah: "Rarely the volcano erupts twice in one year.", catatan: "*Rarely* di awal → *does the volcano erupt*." },
      { benar: "Had the team trained harder, they would have won.", catatan: "= *If the team had trained harder*." },
      { benar: "Only after the test did she realize her mistake.", catatan: "Inversi terjadi di klausa utama." },
    ],
    jebakan: [
      "Kata negatif di tengah kalimat **tidak** memicu inversi: *I have never seen …*.",
      "Inversi dobel: *Never I have seen* atau *Never have seen I*.",
      "*Only* + benda biasa (*Only students may enter*) tidak memicu inversi.",
    ],
  },
  {
    id: "bentuk-kata",
    judul: "Bentuk kata",
    ringkas: "Benda, sifat, atau keterangan? Posisi kata dalam kalimat menentukan bentuknya.",
    isi: [
      "Kata **sifat** menjelaskan benda (*a careful driver*) atau setelah *be/seem/become*. Kata **keterangan** (biasanya *-ly*) menjelaskan kata kerja, kata sifat, atau keterangan lain (*drives carefully*, *extremely careful*).",
      "Posisi **benda**: setelah *the/a/an*, setelah kata sifat, setelah preposisi, sebagai subjek/objek. Akhiran benda yang umum: ==*-tion, -ment, -ness, -ity, -ance, -ence*==.",
      "Di Written Expression, bentuk kata yang salah sering terselip di kalimat panjang. Baca tiap bagian bergaris dan tanyakan: posisi ini butuh benda, sifat, atau keterangan?",
    ],
    pola: ["the/a + (adj) + **noun**", "**adv** + adj / V + **adv**", "be/seem/become + **adj**"],
    contoh: [
      { benar: "The experiment was carefully designed.", salah: "The experiment was careful designed.", catatan: "Menjelaskan *designed* (kata kerja) → keterangan." },
      { benar: "Her explanation was clear.", catatan: "Setelah *was* → kata sifat." },
      { benar: "The rapid growth of the city caused problems.", salah: "The rapidly growth of the city caused problems.", catatan: "Menjelaskan *growth* (benda) → kata sifat." },
    ],
    jebakan: [
      "*-ly* pada kata sifat yang menjelaskan benda.",
      "Kata kerja di posisi benda: *the develop of*. Seharusnya *the development of*.",
      "*friendly, lovely, costly* adalah kata sifat meski berakhiran *-ly*.",
    ],
  },
  {
    id: "ganti-artikel",
    judul: "Kata ganti & artikel",
    ringkas: "Pronomina harus cocok jumlah dan fungsinya; a/an/the dipakai sesuai jenis benda.",
    isi: [
      "Kata ganti harus cocok dengan kata benda yang digantikannya dalam **jumlah** (*it* vs *they*) dan **fungsi** (*they/them/their*). Contohnya, *The students submitted ==their== reports*, bukan *its*.",
      "*its* = milik benda (tanpa apostrof). *it's* = *it is*. Di TOEFL, kekeliruan *its/it's* dan *their/them* sering muncul.",
      "Artikel: *a* sebelum bunyi konsonan, *an* sebelum bunyi vokal (*an hour, a university*). Benda tak terhitung (*information, research, equipment, advice*) tidak memakai *a/an* dan tidak dijamakkan.",
    ],
    pola: ["benda jamak → they/them/their", "benda tunggal → it/its", "a + bunyi konsonan / an + bunyi vokal"],
    contoh: [
      { benar: "Each country has its own flag.", salah: "Each country has their own flag.", catatan: "*each country* tunggal → *its*." },
      { benar: "The researchers shared their data.", catatan: "Jamak → *their*." },
      { benar: "She gave me some useful advice.", salah: "She gave me an useful advice.", catatan: "*advice* tak terhitung; dan *useful* berbunyi /ju/ → *a*, bukan *an*." },
    ],
    jebakan: [
      "*an* sebelum *u* yang berbunyi /ju/: *an university* salah.",
      "Benda tak terhitung yang dijamakkan: *informations, equipments*.",
      "Kata ganti objek di posisi subjek: *Him and I went*.",
    ],
  },
  {
    id: "bentuk-kerja",
    judul: "Bentuk kata kerja & tenses",
    ringkas: "Setelah modal pakai bentuk dasar, setelah have pakai V3, dan waktu kejadian harus konsisten.",
    isi: [
      "Aturan cepat yang paling sering diuji: ==modal (*can, will, must, should, may*) + bentuk dasar==, *have/has/had* + V3, *be* + V-ing (progresif) atau V3 (pasif).",
      "Keterangan waktu menentukan tense: *since/for* + sekarang → present perfect (*has lived since 2010*); *last year, in 1998, ago* → simple past; *by the time* + masa depan → future perfect.",
      "Pengandaian: *If* + simple present → *will*; *If* + simple past → *would*; *If* + past perfect → *would have* + V3.",
    ],
    pola: ["modal + V1", "have/has/had + V3", "since/for → have/has + V3", "If + had + V3, … would have + V3"],
    contoh: [
      { benar: "Students must bring their ID cards.", salah: "Students must to bring their ID cards.", catatan: "Modal langsung + V1." },
      { benar: "She has worked here since 2019.", salah: "She works here since 2019.", catatan: "*since* → present perfect." },
      { benar: "If it had not rained, we would have gone hiking.", catatan: "Pengandaian masa lalu." },
    ],
    jebakan: [
      "*has went, have saw*: V2 setelah *have*.",
      "*can to swim, should goes*: bentuk salah setelah modal.",
      "Tense masa lalu dengan *since* + titik waktu: *I live here since 2015* salah.",
    ],
  },
];

export const topikDari = (id: string) => TOPIK.find((t) => t.id === id);
