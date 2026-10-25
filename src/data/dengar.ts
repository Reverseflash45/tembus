import type { DialogPendek, Rekaman } from "./jenis";

/* Dibacakan oleh suara bahasa Inggris di peramban (speechSynthesis).
   M = laki-laki, W = perempuan, N = narator. */

export const DIALOG: DialogPendek[] = [
  { id: "l-a-1", baris: [["W", "Are you coming to the study group tonight?"], ["M", "I wouldn't miss it for the world."]], tanya: "What does the man mean?", pilihan: ["He will definitely attend.", "He has to travel tonight.", "He forgot about the study group.", "He prefers to study alone."], jawab: 0, bahas: "*I wouldn't miss it for the world* = ==pasti datang==, apa pun yang terjadi." },
  { id: "l-a-2", baris: [["M", "This printer is out of paper again."], ["W", "There's a new pack in the bottom drawer."]], tanya: "What does the woman mean?", pilihan: ["The man can find paper in the drawer.", "She will buy more paper later.", "The printer is broken.", "The man should use another printer."], jawab: 0, bahas: "Dia memberi tahu ==ada kertas baru di laci bawah==, jadi pria itu bisa mengambilnya sendiri." },
  { id: "l-a-3", baris: [["W", "How did your presentation go?"], ["M", "It couldn't have gone better."]], tanya: "What does the man mean?", pilihan: ["His presentation went very well.", "He wants another chance to present.", "He did not give the presentation.", "His presentation went badly."], jawab: 0, bahas: "*couldn't have gone better* = tidak mungkin lebih baik lagi = ==sangat lancar==. Jebakan: ada kata negatif tapi maknanya positif." },
  { id: "l-a-4", baris: [["M", "Do you know what time the library closes today?"], ["W", "Your guess is as good as mine."]], tanya: "What does the woman mean?", pilihan: ["She does not know either.", "The library is closed today.", "The man should guess.", "She closes the library."], jawab: 0, bahas: "*Your guess is as good as mine* = ==aku juga nggak tahu==." },
  { id: "l-a-5", baris: [["W", "I can't decide whether to take statistics this semester or next."], ["M", "If I were you, I'd get it over with."]], tanya: "What does the man suggest?", pilihan: ["Taking statistics this semester", "Waiting until next semester", "Dropping statistics completely", "Asking the professor for advice"], jawab: 0, bahas: "*get it over with* = selesaikan saja (yang tidak enak) secepatnya, jadi ==ambil semester ini==." },
  { id: "l-a-6", baris: [["M", "Did you finish the reading for tomorrow?"], ["W", "I've barely started."]], tanya: "What does the woman mean?", pilihan: ["She has read very little.", "She finished it early.", "She does not have the book.", "The reading is easy."], jawab: 0, bahas: "*barely started* = ==baru mulai sedikit sekali==." },
  { id: "l-a-7", baris: [["W", "The cafeteria food has really improved this year."], ["M", "You can say that again."]], tanya: "What does the man mean?", pilihan: ["He agrees with the woman.", "He did not hear her.", "He wants her to repeat it.", "He thinks the food is worse."], jawab: 0, bahas: "*You can say that again* = ==setuju banget==, bukan minta diulang." },
  { id: "l-a-8", baris: [["M", "Should I call Professor Hartono about the deadline?"], ["W", "Why not send her an email instead?"]], tanya: "What does the woman suggest?", pilihan: ["Writing to the professor by email", "Calling the professor now", "Asking for a later deadline in class", "Forgetting about the deadline"], jawab: 0, bahas: "*Why not … instead?* = saran: ==kirim email saja== daripada menelepon." },
  { id: "l-a-9", baris: [["W", "Is Dimas coming to the party on Saturday?"], ["M", "He said he'd come if he finished his lab report."]], tanya: "What does the man imply about Dimas?", pilihan: ["He might not come to the party.", "He has already finished his report.", "He does not like parties.", "He will help with the party."], jawab: 0, bahas: "Kedatangannya ==bersyarat==: kalau laporannya belum selesai, mungkin tidak datang." },
  { id: "l-a-10", baris: [["M", "I'm thinking of buying that laptop in the window."], ["W", "I'd wait until the end of the month. It's going on sale."]], tanya: "What does the woman imply?", pilihan: ["The laptop will be cheaper later.", "The laptop is already sold out.", "The man should buy it today.", "The store will close at the end of the month."], jawab: 0, bahas: "*going on sale* = akan diskon. Jadi ==tunggu, harganya bakal turun==." },
  { id: "l-a-11", baris: [["W", "Excuse me, is this seat taken?"], ["M", "My friend just stepped out for a minute."]], tanya: "What does the man mean?", pilihan: ["Someone is using the seat.", "The woman can sit there.", "His friend left for the day.", "He is about to leave."], jawab: 0, bahas: "Temannya cuma keluar sebentar, jadi ==kursinya ada yang pakai==." },
  { id: "l-a-12", baris: [["M", "I heard the concert tonight was canceled."], ["W", "Not according to the poster I saw this morning."]], tanya: "What does the woman imply?", pilihan: ["The concert is probably still happening.", "She did not see the poster.", "The concert was moved to the morning.", "She agrees that it was canceled."], jawab: 0, bahas: "Poster yang dia lihat ==tidak menyebut batal==, jadi menurutnya konser tetap jalan." },
  { id: "l-a-13", baris: [["W", "You look exhausted."], ["M", "I was up all night finishing my essay."]], tanya: "What does the man mean?", pilihan: ["He did not sleep last night.", "He woke up very early.", "He has not started his essay.", "He went out with friends."], jawab: 0, bahas: "*up all night* = ==begadang semalaman==." },
  { id: "l-a-14", baris: [["M", "Could you lend me your notes from Monday's lecture?"], ["W", "Sorry, Nadia borrowed them and hasn't given them back yet."]], tanya: "What does the woman mean?", pilihan: ["She does not have the notes right now.", "She did not attend the lecture.", "Nadia lost the notes.", "The man should ask the lecturer."], jawab: 0, bahas: "Catatannya ==masih dipinjam Nadia==, jadi sekarang tidak ada padanya." },
  { id: "l-a-15", baris: [["W", "The bus is late again."], ["M", "It's always like this when it rains."]], tanya: "What does the man imply?", pilihan: ["Rain often delays the bus.", "The bus never comes on rainy days.", "They should walk instead.", "It is not raining today."], jawab: 0, bahas: "*always like this when it rains* = kalau hujan, ==bus biasanya telat==." },
  { id: "l-a-16", baris: [["M", "How about lunch at the new noodle place?"], ["W", "I'd rather not. It gets so crowded at noon."]], tanya: "What does the woman mean?", pilihan: ["She does not want to go there at lunchtime.", "She has already eaten.", "She does not like noodles.", "The restaurant is closed."], jawab: 0, bahas: "Alasannya ==terlalu ramai saat jam makan siang==, bukan karena tidak suka mi." },
  { id: "l-a-17", baris: [["W", "Did you get the job at the bookstore?"], ["M", "They said they'd let me know next week."]], tanya: "What does the man mean?", pilihan: ["He has not heard the result yet.", "He got the job.", "He did not apply for the job.", "He starts working next week."], jawab: 0, bahas: "Kabarnya baru minggu depan, jadi ==belum tahu hasilnya==." },
  { id: "l-a-18", baris: [["M", "I don't think I'll pass the chemistry exam."], ["W", "Neither will I, unless we start studying together."]], tanya: "What does the woman suggest?", pilihan: ["They should study together.", "The man should drop chemistry.", "The exam will be easy.", "She has already passed."], jawab: 0, bahas: "Dia sama-sama khawatir, lalu memberi jalan keluar: ==belajar bareng==." },
  { id: "l-a-19", baris: [["W", "Have you seen my umbrella anywhere?"], ["M", "Isn't that it by the door?"]], tanya: "What does the man imply?", pilihan: ["The umbrella may be by the door.", "He borrowed the umbrella.", "He has never seen her umbrella.", "It is not raining."], jawab: 0, bahas: "Pertanyaan balik *Isn't that it …?* = ==bukannya itu payungmu di dekat pintu?==" },
  { id: "l-a-20", baris: [["M", "Today's lecture was so long."], ["W", "And it didn't even cover anything on the exam."]], tanya: "What does the woman imply?", pilihan: ["The lecture was not useful for the exam.", "The exam has been canceled.", "She enjoyed the lecture.", "The lecture was shorter than usual."], jawab: 0, bahas: "Sudah panjang, ==tidak ada hubungannya dengan ujian== pula. Dia mengeluh juga." },
];

export const REKAMAN: Rekaman[] = [
  {
    id: "l-b-perpus",
    judul: "Di meja perpustakaan",
    jenis: "percakapan",
    baris: [
      ["N", "Listen to a conversation between a student and a librarian."],
      ["M", "Hi, I'd like to borrow these three books, but the system says I can't."],
      ["W", "Let me check. Ah, it looks like you have a book that's two weeks overdue."],
      ["M", "Really? I thought I returned everything before the break."],
      ["W", "The record shows a statistics textbook, borrowed in March."],
      ["M", "Oh no, I think it's still in my dorm room. Can I borrow these now and bring it back tomorrow?"],
      ["W", "I'm afraid not. Accounts with overdue items are blocked until the item is returned and the fine is paid."],
      ["M", "How much is the fine?"],
      ["W", "It's one thousand rupiah per day, so fourteen thousand altogether. You can pay it online through the student portal."],
      ["M", "Okay. Could you hold these three books for me until tomorrow?"],
      ["W", "Sure. I'll keep them behind the desk until five o'clock tomorrow afternoon."],
    ],
    soal: [
      { id: "l-b-perpus-1", tanya: "Why can't the student borrow the books?", pilihan: ["He has an overdue book.", "He forgot his student card.", "The books are reserved for another student.", "The library is about to close."], jawab: 0, bahas: "Petugas: *you have a book that's ==two weeks overdue==*, dan akun dengan pinjaman telat diblokir." },
      { id: "l-b-perpus-2", tanya: "Where does the student think the missing book is?", pilihan: ["In his dorm room", "In the classroom", "At his parents' house", "In the library"], jawab: 0, bahas: "*I think it's still ==in my dorm room==.*" },
      { id: "l-b-perpus-3", tanya: "How much is the student's fine?", pilihan: ["Fourteen thousand rupiah", "One thousand rupiah", "Four thousand rupiah", "Forty thousand rupiah"], jawab: 0, bahas: "Seribu per hari × 14 hari = ==empat belas ribu==." },
      { id: "l-b-perpus-4", tanya: "What will the librarian do?", pilihan: ["Hold the books until the next afternoon", "Cancel the fine", "Lend him the books today", "Send the books to his dorm"], jawab: 0, bahas: "*I'll keep them behind the desk ==until five o'clock tomorrow afternoon==.*" },
    ],
  },
  {
    id: "l-c-subak",
    judul: "Kuliah: subak di Bali",
    jenis: "kuliah",
    baris: [
      ["N", "Listen to part of a talk in an agriculture class."],
      ["M", "Today I want to look at an irrigation system that has worked for about a thousand years: the subak system of Bali."],
      ["M", "A subak is a group of farmers who share water from the same source, usually a spring or a river. Water flows through a network of canals and tunnels to terraced rice fields on the hillsides."],
      ["M", "What makes subak unusual is how decisions are made. There is no central government office telling farmers when to plant. Instead, farmers meet regularly and agree on a schedule. Water temples play an important role in these meetings, linking farming to religious ceremonies."],
      ["M", "Because neighboring fields are flooded and drained at the same time, pests lose their habitat all at once. This helps control insects without large amounts of chemicals."],
      ["M", "In 2012, the cultural landscape of subak was added to the UNESCO World Heritage List. Today, its biggest challenges are tourism, land being sold for development, and young people leaving farming for other jobs."],
    ],
    soal: [
      { id: "l-c-subak-1", tanya: "What is the talk mainly about?", pilihan: ["A traditional system for sharing irrigation water", "The history of tourism in Bali", "How rice was first brought to Indonesia", "Modern chemicals used against pests"], jawab: 0, bahas: "Dosen membahas ==subak==: sistem irigasi bersama di Bali, dari cara kerjanya sampai tantangannya." },
      { id: "l-c-subak-2", tanya: "According to the speaker, how are planting schedules decided?", pilihan: ["Farmers meet and agree on them together.", "A government office sets them.", "Each farmer decides alone.", "Temple priests decide without the farmers."], jawab: 0, bahas: "*farmers meet regularly and ==agree on a schedule==*. Tidak ada kantor pusat yang mengatur." },
      { id: "l-c-subak-3", tanya: "Why does flooding neighboring fields at the same time help farmers?", pilihan: ["Pests lose their habitat all at once.", "It saves money on seeds.", "Tourists prefer to see flooded fields.", "It makes the soil warmer."], jawab: 0, bahas: "*pests ==lose their habitat all at once==*, jadi hama terkendali tanpa banyak bahan kimia." },
      { id: "l-c-subak-4", tanya: "Which of the following is NOT mentioned as a challenge for subak today?", pilihan: ["A shortage of rain", "Tourism", "Land being sold for development", "Young people leaving farming"], jawab: 0, bahas: "Yang disebut: pariwisata, alih fungsi lahan, anak muda meninggalkan pertanian. ==Kekurangan hujan tidak disebut==." },
    ],
  },
];
