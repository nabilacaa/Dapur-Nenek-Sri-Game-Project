# 🍲 Dapur Nenek Sri

**Dapur Nenek Sri** adalah game *match-3* bertema masakan Nusantara berbasis web (HTML, CSS, dan JavaScript murni, tanpa framework). Pemain berperan sebagai cucu Nenek Sri yang harus menyelamatkan warung warisan keluarga dari persaingan dengan Resto Megah. Setiap resep yang dimasak adalah satu level *match-3*: cocokkan bahan masakan untuk memenuhi pesanan pelanggan sebelum langkah dan waktu habis.

> Proyek Evaluasi Tengah Semester (ETS) mata kuliah TPG, semester 5
> **Nabila Shafa Rahayu** (5025241150) · Teknik Informatika, Institut Teknologi Sepuluh Nopember

🎮 **Mainkan versi web:** _(tautan Vercel)_

---

## Daftar Isi

1. [Latar Belakang Desain](#latar-belakang-desain)
2. [Fitur](#fitur)
3. [Cara Bermain](#cara-bermain)
4. [Daftar Resep](#daftar-resep)
5. [Power-up](#power-up)
6. [Sistem Skor, Bintang, dan Koin](#sistem-skor-bintang-dan-koin)
7. [Menjalankan Game](#menjalankan-game)
8. [Struktur Proyek](#struktur-proyek)
9. [Kredit](#kredit)

---

## Latar Belakang Desain

Game ini dikembangkan dari prototipe *Candy Crush* sederhana yang hanya memiliki papan 8×8, enam jenis permen, dan skor satu poin per permen. Prototipe tersebut tidak memiliki tujuan jangka panjang, variasi mekanik, maupun alasan naratif untuk terus bermain, sehingga setelah beberapa menit tidak ada lagi yang ingin dicapai pemain. Peningkatan *fun* dirancang berdasarkan **taksonomi tipe pemain Bartle**, dengan match-3 diberi konteks cerita: memasak demi warung, bukan sekadar mengumpulkan skor.

| Tipe pemain | Sumber kesenangan | Ringkasan penerapan |
|---|---|---|
| **Achiever** | Mendapatkan apa yang diinginkan hati dan indera | Bintang, gelar warung, koin, toko, power-up, *high score* |
| **Explorer** | Terobatinya rasa penasaran | Cerita bersambung, resep terkunci, mekanik baru, kombinasi power-up |
| **Killer** | Pelampiasan emosi | Duel melawan bos, ledakan power-up, reaksi berantai |
| **Socializer** | Kedudukan sosial (dikenal, dipuji, diperhatikan) | Pujian kombo, gelar warung, *high score* untuk dipamerkan |
| **Not Fun** | Terlepas dari hal yang tidak menyenangkan | Kocok otomatis, petunjuk, jeda, tutorial, konfirmasi keluar |

Rincian apa yang didapat setiap tipe pemain dari game ini:

### 🏆 Achiever: selalu ada yang ingin dicapai

**Kepuasan indera**
- **Visual:** ikon bahan SVG dengan warna dominan berbeda dan mudah dibedakan, papan berbingkai kayu dengan grid latar, antarmuka bergaya struk pesanan warung, serta animasi tukar, jatuh, mendarat, dan pecah yang mulus.
- **Audio:** musik latar di menu, efek suara untuk setiap aksi (tukar, match, kombo dengan nada yang makin tinggi, ledakan, kardus pecah, koin), serta suara bahan berjatuhan saat level dimulai.
- **Umpan balik instan:** angka "+skor" melayang, partikel sewarna bahan, bilah progres pada setiap target pesanan, dan bintang yang muncul satu per satu di layar hasil.

**Target dan progres**
- **10 level** (resep) dengan tingkat kesulitan bertahap: Easy, Medium, dan Hard.
- **1–3 bintang per resep**, dinilai dari efisiensi langkah dan waktu. Hal ini memberi alasan untuk mengulang resep yang sudah tamat demi bintang sempurna.
- **Gelar warung bertingkat** sesuai total bintang (maksimal 30): Warung Sederhana → Kedai Ramai → Rumah Makan Terkenal → Restoran Bintang → Legenda Kuliner. Ini berfungsi sebagai hadiah *affinity*, yaitu status yang naik ketika pencapaian tertentu tercapai.
- **High score** Endless yang tersimpan dan selalu bisa dipecahkan.

**Item dan ekonomi**
- **Koin** dari setiap permainan, dengan jumlah yang naik sesuai tingkat skor. Pemain terdorong mengejar skor lebih tinggi demi koin lebih banyak.
- **Toko Bumbu** untuk membeli empat power-up berbayar (Ulekan, Kocok Ulang, Tambah Waktu, Garam Ajaib) dengan stok terbatas.
- **Empat power-up gratis** yang didapat dari match besar sebagai hadiah langsung atas permainan yang baik.

### 🧭 Explorer: rasa penasaran yang terus terpancing

**Cerita yang membuat penasaran**
- Prolog berupa **surat dari Nenek Sri** tentang warung yang hampir tutup dan bumbu rahasia yang tersimpan di kardus tua.
- Setiap resep menghadirkan **pelanggan berbeda** dengan dialog dan reaksinya sendiri, dari tetangga, anak kos, ojol, turis, kritikus kuliner, hingga koki saingan.
- Alur cerita bergerak dari warung sepi, menjadi viral, menantang Resto Megah, hingga **final Festival Kuliner Kota** dengan ending di resep terakhir.

**Dunia yang terbuka bertahap**
- **Buku Resep** menampilkan resep berikutnya sebagai "🔒 ???" sampai resep sebelumnya selesai, sehingga pemain penasaran dengan resep dan pelanggan berikutnya.
- **Mekanik baru muncul bertahap**, masing-masing diperkenalkan dengan kartu penjelasan: batas waktu (Resep 3), kardus berisi kertas resep rahasia (Resep 5), dan bahan busuk dari koki saingan (Resep 9).

**Variasi untuk ditemukan**
- **Delapan jenis power-up** dengan cara mendapatkan dan efek yang berbeda-beda.
- **Kombinasi tersembunyi:** match bentuk L/T menghasilkan Wajan, power-up yang terkena ledakan power-up lain ikut meledak berantai, dan Sutil Emas menghancurkan kardus seketika. Pemain menemukan sendiri kombinasi mana yang paling efektif.
- **Papan acak di setiap permainan**, sehingga tidak ada dua sesi yang sama.

### ⚔️ Killer: pelampiasan dan rasa menaklukkan

**Lawan yang menantang**
- **Pak Darmo, kritikus kuliner** (Resep 5, Hard), dengan batas waktu ketat dan kardus yang harus dipecahkan.
- **Chef Bram dari Resto Megah** (Resep 9), bos yang aktif menyabotase dapur dengan menaburkan bahan busuk setiap 4 langkah.
- **Final Festival Kuliner** (Resep 10) sebagai tantangan puncak dengan waktu tersingkat.

**Kehancuran yang memuaskan**
- **Ledakan power-up:** tebasan Pisau dengan garis cahaya, ledakan cincin api Wajan dan Panci Api, dan getaran layar.
- **Sutil Emas Nenek** membersihkan seluruh papan dengan kilatan emas. Ini adalah momen paling memuaskan di game, padanan *fatality* dalam game pertarungan.
- **Reaksi berantai:** toast "Reaksi berantai ×N!" ketika beberapa power-up meledak sekaligus.
- **Ulekan:** pemain bisa memilih sendiri apa yang ingin dihancurkan, termasuk kardus dan bahan busuk yang menghalangi.

**Kesempatan membalas**
- Tombol **Ulangi** dan **Coba Lagi** di layar hasil memungkinkan pemain langsung menantang ulang resep atau bos yang mengalahkannya.
- **Mode Endless** memberi tekanan yang terus meningkat ("Dapur makin sibuk!") untuk ditaklukkan berulang kali.

### 💬 Socializer: diakui dan dipuji

- **Pujian kombo bertingkat** setiap membuat kombo beruntun: *Mantap!*, *Lezat!*, *Juara Rasa!*, hingga *Masakan Dewa!* Padanannya dalam game lain adalah *double kill* atau *triple kill*.
- **Pengakuan dari tokoh cerita:** setiap pelanggan memuji masakan pemain setelah hidangan tersaji, misalnya mengunggahnya ke grup angkatan, menjadikan warung markas ojol, atau memberi bintang kritikus.
- **Gelar warung** yang tampil di Buku Resep sebagai simbol status pemain.
- **High score Endless** dengan layar "High Score Baru!" yang bisa dipamerkan dan dibandingkan dengan teman.

### 🛡️ Not Fun: hal yang tidak menyenangkan dihilangkan

- **Papan buntu dikocok otomatis**, sehingga pemain tidak pernah terjebak tanpa langkah.
- **Petunjuk otomatis** muncul setelah 5 detik tanpa aksi (bisa dimatikan).
- **Tukar tidak valid dikembalikan** dengan animasi, sehingga pemain tahu inputnya diterima tetapi tidak menghasilkan match.
- **Tombol jeda** di level berwaktu dan Endless. Permainan juga dijeda otomatis saat berpindah tab atau membuka Pengaturan.
- **Tutorial interaktif** dan halaman **Cara Bermain**, sehingga pemain tidak bingung dengan aturan.
- **Konfirmasi keluar**, sehingga progres tidak hilang karena salah klik.
- **Jalur alternatif saat level terasa sulit:** mengulang resep lama untuk mengumpulkan koin, lalu membeli power-up.
- **Pengaturan aksesibilitas:** volume, kecepatan animasi, dan getaran layar bisa disesuaikan.

### Pengembangan selanjutnya

Beberapa elemen dari kerangka Bartle belum diterapkan karena memerlukan *backend* atau berada di luar cakupan ETS:

| Tipe | Ide pengembangan |
|---|---|
| Achiever | *Daily quest*, bonus *login* beruntun, *badge* pencapaian |
| Explorer | Cerita bercabang dengan *multi ending*, peta wilayah kuliner Nusantara, kejadian acak (bahan langka, *Sugar Rush*) |
| Killer | Duel *cook-off* melawan pemain lain dengan fitur tantang ulang |
| Socializer | *Leaderboard* daring dengan papan harian yang sama untuk semua pemain, kunjungan ke warung teman, asosiasi koki (*guild*) |

---

## Fitur

**Permainan**
- Papan 8×8 dengan enam bahan berwarna khas: nasi (biru), telur (kuning), cabai (merah), bawang merah (ungu), ayam (oranye), dan sayur (hijau).
- Animasi tukar dan jatuh yang mulus, partikel saat bahan pecah, efek suara yang dibangkitkan dengan Web Audio API, serta musik latar di menu.
- Kombo berantai (*cascade*) dengan pengali skor yang terus naik.
- Deteksi papan buntu yang mengocok ulang otomatis, dan petunjuk setelah 5 detik tanpa aksi.

**Mode**
- **Mode Cerita:** 10 resep bertingkat Easy, Medium, dan Hard, dengan cerita, pelanggan, dan dialog di setiap resep.
- **Mode Endless (Jam Sibuk):** bertahan selama mungkin untuk *high score*. Waktu bertambah setiap bahan dimasak, berkurang saat salah langkah, dan berjalan 10% lebih cepat setiap 2.000 poin (maksimal ×1,5).

**Ekonomi dan progres**
- Koin dari setiap permainan, Toko Bumbu, dan empat power-up berbayar dengan stok terbatas.
- Progres, koin, *high score*, dan pengaturan tersimpan otomatis di `localStorage`, lengkap dengan penanganan data rusak dan fitur **Reset Progres**.

**Bantuan pemain**
- **Tutorial interaktif** di Resep 1 yang dipandu Nenek Sri.
- Halaman **Cara Bermain** berisi 8 slide bergambar.
- **Kartu mekanik baru** yang muncul sebelum level pertama yang memakai mekanik tersebut.
- **Pengaturan:** volume musik dan efek suara, kecepatan animasi, petunjuk otomatis, getaran layar, dan layar penuh (khusus aplikasi desktop).

---

## Cara Bermain

1. **Tukar dua bahan yang bersebelahan** dengan menggeser, atau dengan mengetuk keduanya bergantian.
2. Tiga bahan sama atau lebih yang berjajar akan **dimasak** dan mengurangi target pesanan.
3. Penuhi **semua target bahan** sebelum langkah habis (dan sebelum waktu habis di level Medium/Hard).
4. Bahan baru jatuh dari atas. Jika jatuhannya membentuk match lagi, terjadi **kombo** dengan skor berlipat.

| Kontrol | Fungsi |
|---|---|
| Geser / ketuk dua bahan | Menukar bahan |
| Ketuk 2× power-up gratis | Mengaktifkan power-up tanpa menggeser |
| Tombol ⏸ Jeda | Menghentikan waktu (level berwaktu dan Endless) |
| F11 | Layar penuh (aplikasi desktop) |

---

## Daftar Resep

| # | Resep | Pelanggan | Tier | Target bahan | Langkah | Waktu |
|---|---|---|---|---|---|---|
| 1 | Telur Dadar Bawang | Pak Darto | 🌱 Easy | Telur 12, Bawang 10 | 20 | – |
| 2 | Nasi Goreng Kampung | Mbak Rina | 🌱 Easy | Nasi 15, Telur 8, Cabai 10 | 24 | – |
| 3 | Sayur Asem Segar | Bu Lurah | ⚡ Medium | Sayur 20, Cabai 8, Bawang 10 | 20 | 80 dtk |
| 4 | Ayam Geprek Sambal | Rombongan ojol | 🌱 Easy | Ayam 18, Cabai 16, Bawang 8 | 26 | – |
| 5 | Nasi Campur Spesial | Pak Darmo (kritikus) | 🔥 Hard | Nasi 14, Ayam 12, Sayur 12, Resep Rahasia 3 | 20 | 90 dtk |
| 6 | Soto Ayam Lamongan | Pak Haji Somad | 🌱 Easy | Ayam 18, Sayur 12, Bawang 12 | 26 | – |
| 7 | Gado-Gado Betawi | Mister John | 🌱 Easy | Sayur 22, Telur 14 | 24 | – |
| 8 | Nasi Uduk Komplit | Bu Ratna | ⚡ Medium | Nasi 18, Telur 12, Ayam 12 | 22 | 95 dtk |
| 9 | Sambal Bajak Pedas | Chef Bram (bos) | ⚡ Medium | Cabai 22, Bawang 16 | 22 | 85 dtk |
| 10 | Nasi Tumpeng Syukuran | Panitia Festival | 🔥 Hard | Nasi 18, Ayam 14, Sayur 12, Telur 10, Resep Rahasia 4 | 24 | 60 dtk |

**Ketentuan tier:**
- **Easy:** hanya batas langkah.
- **Medium:** batas langkah dan batas waktu. Setiap bahan yang dimasak menambah sedikit waktu.
- **Hard:** aturan Medium ditambah **kardus**. Kardus tidak bisa digeser dan harus terkena match di sebelahnya atau ledakan power-up sebanyak 2 kali sebelum pecah dan mengeluarkan **kertas resep rahasia**.
- **Resep 9:** Chef Bram menaburkan **bahan busuk** setiap 4 langkah. Bahan busuk hanya bisa dihancurkan dengan match tepat di sebelahnya.

Resep berikutnya terbuka setelah resep sebelumnya selesai dengan minimal satu bintang.

---

## Power-up

### Power-up gratis (dari match besar)

Match dihitung per kelompok, sehingga bentuk L dan T juga dihitung. Power-up yang terkena ledakan power-up lain ikut meledak berantai.

| Match | Power-up | Efek |
|---|---|---|
| 4 | Pisau | Menebas 1 baris dan 1 kolom |
| 5 (termasuk L/T) | Wajan Panas | Ledakan 3×3 |
| 6 | Panci Api | Ledakan 4×4 |
| 7+ | Sutil Emas Nenek | Membersihkan seluruh papan |

### Power-up berbayar (Toko Bumbu)

Dipakai dari bar di bawah papan dan tidak mengurangi langkah. Stok maksimal 9 per item.

| Power-up | Harga | Efek |
|---|---|---|
| Ulekan | 🪙 50 | Menghancurkan 1 bahan, kardus, atau power-up pilihan |
| Kocok Ulang | 🪙 30 | Mengacak ulang semua bahan di papan |
| Tambah Waktu | 🪙 80 | +5 langkah, dan +15 detik di level berwaktu |
| Garam Ajaib | 🪙 150 | Menghapus semua bahan dari satu jenis |

---

## Sistem Skor, Bintang, dan Koin

### Skor

$$\text{poin} = \text{nilai item} \times 10 \times \text{kombo}$$

Nilai item: bahan biasa = 1, bahan busuk/power-up = 2, kardus pecah = 3. Kombo naik 1 untuk setiap putaran *cascade* dalam satu langkah. Saat resep selesai, ada bonus **+60 per sisa langkah** dan **+5 per sisa detik**.

### Bintang (berbasis efisiensi)

Bintang tidak dihitung dari skor, melainkan dari seberapa hemat pemain memakai langkah dan waktunya. Dengan cara ini, pemain yang fokus pada pesanan tidak dirugikan oleh keberuntungan kombo.

$$\text{sisa langkah} = \frac{\text{batas langkah} - \text{langkah terpakai}}{\text{batas langkah}} \qquad \text{sisa waktu} = \frac{\text{batas waktu} - \text{waktu bermain}}{\text{batas waktu}}$$

$$E = \begin{cases} \text{sisa langkah} & \text{level tanpa waktu} \\ \dfrac{\text{sisa langkah} + \text{sisa waktu}}{2} & \text{level berwaktu} \end{cases}$$

| Tier | ★ | ★★ | ★★★ |
|---|---|---|---|
| Easy | Menang | E ≥ 35% | E ≥ 55% |
| Medium | Menang | E ≥ 20% | E ≥ 35% |
| Hard | Menang | E ≥ 10% | E ≥ 25% |

Tambahan langkah dan waktu dari power-up **Tambah Waktu**, maupun isi ulang waktu dari bahan yang dimasak, **tidak** ikut dihitung, sehingga bintang tidak bisa dibeli dengan koin. Total bintang (maksimal 30) menentukan gelar warung: Warung Sederhana → Kedai Ramai → Rumah Makan Terkenal → Restoran Bintang → Legenda Kuliner.

### Koin

Koin diberikan setiap kali resep berhasil dimasak atau permainan Endless berakhir, berdasarkan skor akhir. Pemain baru memulai dengan 100 koin.

| Skor akhir | Koin |
|---|---|
| 0–999 | 10 |
| 1.000–1.999 | 25 |
| 2.000–2.999 | 40 |
| 3.000–3.999 | 60 |
| 4.000–4.999 | 80 |
| 5.000+ | 100 |

---

## Menjalankan Game

### Versi web

Tidak memerlukan instalasi maupun proses build.

```bash
git clone https://github.com/nabilacaa/Dapur-Nenek-Sri-Game-Project.git
cd Dapur-Nenek-Sri-Game-Project
```

Lalu buka `index.html` di browser (Chrome, Edge, atau Firefox versi terbaru). Musik menu baru berbunyi setelah klik pertama, sesuai kebijakan *autoplay* browser.

### Deploy

Karena seluruhnya file statis, repo ini dapat langsung di-*deploy* ke Vercel (Framework Preset: **Other**, tanpa build command), GitHub Pages, Netlify, atau itch.io. Setiap `git push` ke branch `main` akan memperbarui versi Vercel secara otomatis.

### Aplikasi desktop (Windows)

Tersedia versi *portable* berbasis Electron yang membawa font dan musiknya sendiri sehingga dapat dimainkan *offline*:

1. Ekstrak `Dapur-Nenek-Sri-Windows.zip`.
2. Jalankan `Dapur Nenek Sri.exe`.
3. Jika muncul peringatan Windows SmartScreen, pilih **More info → Run anyway**. Peringatan ini muncul karena aplikasi belum bertanda tangan digital.

Berkas zip berukuran sekitar 110 MB, melebihi batas 100 MB per file di GitHub, sehingga tidak disimpan di repo ini.

---

## Struktur Proyek

```
├── index.html     # Struktur semua layar: menu, Buku Resep, Toko, dialog, permainan, overlay
├── style.css      # Tampilan bertema warung (gaya struk), animasi, dan tata letak responsif
├── script.js      # Seluruh logika game: papan, match, power-up, level, skor, penyimpanan, audio
├── audio/
│   └── menu.mp3   # Musik latar menu
└── README.md
```

Gambar bahan, power-up, dan penghalang dibuat sebagai **SVG** di dalam `script.js` lalu dipasang sebagai kelas CSS, sehingga tidak ada berkas gambar terpisah. Efek suara dibangkitkan langsung dengan **Web Audio API**.

---

## Kredit

- **Desain dan pengembangan:** Nabila Shafa Rahayu (5025241150)
- **Prototipe awal:** proyek Candy Crush HTML/CSS/JS oleh [he-is-talha](https://github.com/he-is-talha)
- **Font:** [Fredoka](https://fonts.google.com/specimen/Fredoka) dan [Nunito](https://fonts.google.com/specimen/Nunito), SIL Open Font License
- **Musik menu:** _(sumber lagu)_
