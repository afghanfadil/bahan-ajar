# Ruang Belajar — Portal pribadi (6 mata kuliah)

Dibuat oleh **M. Afghan Fadillah R, M.T**. Ini karya pribadi, bukan situs resmi perguruan tinggi.

## Mata kuliah
- Pengolahan Sinyal — pertemuan 1–10 berisi materi, simulasi, contoh soal dan kuis sesuai sumber terdahulu.
- Fisika — ruang materi; belum ada berkas pelajaran pada proyek ini.
- Komunikasi Data dan Jaringan — ruang materi.
- Bengkel Elektronika — ruang materi.
- Termodinamika — ruang materi; dosen pengampu **Isma Uly Maranggi, S.Tr.T., M.Eng**.
- Kewirausahaan — ruang materi; dosen pengampu **Isma Uly Maranggi, S.Tr.T., M.Eng**.

## Perubahan desain
- Elemen yang diminta telah dihapus pada katalog maupun semua halaman materi 1–10: navigasi 10 kotak angka, tombol cetak/header materi, metadata durasi/Sub-CPMK/RPS di hero, keterangan akademik, lencana MODUL, panel progres pribadi, panel belajar sesuai ritme, lencana akses perangkat, kode mata kuliah, serta blok galeri foto penerapan (halaman 1–8).
- Konten utama, eksperimen, contoh soal dan kuis tetap dipertahankan. Tombol **Batalkan Kuis** dipertahankan, termasuk simulasi UTS dengan timer.
- Toggle **Light/Dark** ada di halaman utama, katalog, dan setiap pertemuan; tema pilihan tersimpan di `localStorage` pada perangkat. Diagram sumbu gelap mempertahankan bidang grafik terang agar tetap terbaca pada dark mode.
- Katalog dan API `/api/courses` / `/api/lessons` berasal dari data terpusat di `data/catalog.json`; berkas `assets/catalog.js` juga dibangkitkan dari data tersebut untuk penggunaan tanpa server.

## Menjalankan
1. Ekstrak ZIP dan **jaga struktur direktori**.
2. Buka `index.html` menggunakan browser. Tidak perlu akun atau instalasi.
3. Untuk server lokal opsional: `python server.py --port 8000`, lalu buka `http://127.0.0.1:8000`.
4. Publikasi dapat melalui GitHub Pages / Netlify sebagai website statis. Semua fitur kuis bekerja sepenuhnya di browser; tidak ada database atau sistem penyimpanan jawaban ke server.

## Kustomisasi
- `assets/refresh.css`: komponen katalog dan lesson.
- `assets/theme.css`, `assets/theme.js`: dark/light global.
- `assets/portal-interactions.js`: kuis batal/lanjut dan pencarian.
- `data/catalog.json`, `assets/catalog.js`: nama mata kuliah, metadata, daftar pertemuan.
- `pengolahan-sinyal/pertemuan-N.html`: materi interaktif pertemuan.

Catatan: tidak dibuat materi baru untuk lima mata kuliah lain karena belum ada berkas konten yang disertakan.


## Revisi final Kewirausahaan dan GitHub Pages
- Kewirausahaan tersedia dalam 8 halaman independen: `kewirausahaan/pertemuan-1.html` hingga `pertemuan-8.html`.
- Katalog di `index.html`, `kewirausahaan/index.html`, `data/catalog.json`, dan `assets/catalog.js` telah disinkronkan. Total 18 pertemuan tersedia dari enam mata kuliah.
- Tema terang/gelap bersama pada `assets/theme.js`, kunci penyimpanan `ruangbelajar:theme`. CSS tambahan `assets/contrast-fixes.css` berlaku bagi seluruh halaman, sedangkan `assets/kewirausahaan-ui.css` mengatur tampilan materi kewirausahaan.
- Kewirausahaan tidak menampilkan identitas institusi, keterangan semester, istilah administratif kurikulum, atau catatan pribadi; materi dan kuis tetap tersedia.
- Visualisasi SVG dan simulasi berjalan tanpa internet. Video YouTube pada pertemuan 3–4 memerlukan internet dan mungkin membatasi pemutaran pada domain tertentu; tersedia tautan langsung sebagai cadangan.
- Publikasi ke GitHub Pages: unggah **isi** folder `Ruang_Belajar_Final_6_Mata_Kuliah` ke akar repositori; di Settings → Pages pilih Deploy from a branch, branch `main`, folder `/ (root)`. Setelah aktif, kunjungi URL `https://username.github.io/repo/`. Semua link internal memakai jalur relatif untuk mendukung Project Pages.
- Untuk menjalankan lokal, buka `index.html`, atau jalankan `python -m http.server 8000` di folder portal lalu akses `http://localhost:8000`. Tidak perlu server.py untuk GitHub Pages (API Python tidak berjalan di hosting statis).
