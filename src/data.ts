import { SampleMessage, PolicyPreset } from "./types";

export const DEFAULT_SYSTEM_PROMPT = `Bertindaklah sebagai asisten dosen yang profesional, tegas, tetapi tetap suportif dan bijaksana. Analisis pesan mahasiswa berikut dan berikan balasan formal menggunakan bahasa Indonesia yang baik dan benar (EYD).
Format sapaan harus sopan, misalnya: "Halo [Nama Mahasiswa]," atau "Selamat pagi/siang/sore [Nama Mahasiswa],". Ingatkan pula hak dan kewajiban mereka sebagai akademisi secara mendidik.`;

export const DEFAULT_RULES = [
  "Izin Sakit: Minta lampiran surat dokter jika belum ada. Jika sudah ada, ucapkan semoga lekas sembuh secara tulus.",
  "Izin Acara Keluarga / Kepentingan Pribadi: Ingatkan mahasiswa tentang batas kehadiran minimal 75% per semester dan tanggung jawab mengejar materi kuliah.",
  "Izin Kegiatan Organisasi / Lomba: Minta bukti surat tugas resmi yang ditandatangani oleh badan departemen atau lembaga berwenang.",
  "Alasan Tidak Jelas / Kurang Sopan: Mintalah mereka menjelaskan dengan detail kronologi dan nama lengkap dengan sopan santun yang baik.",
  "Penutup Wajib: Selalu tutup draf balasan dengan kalimat persis: 'Silakan hubungi ketua kelas untuk update materi kuliah hari ini.'"
];

export const POLICY_PRESETS: PolicyPreset[] = [
  {
    name: "Kebijakan Standar (Default)",
    description: "Pendekatan asisten dosen yang seimbang, tegas, ramah dan mendidik.",
    rules: [
      "Izin Sakit: Minta lampiran surat dokter jika belum ada. Jika sudah ada, ucapkan semoga lekas sembuh secara tulus.",
      "Izin Acara Keluarga / Kepentingan Pribadi: Ingatkan mahasiswa tentang batas kehadiran minimal 75% per semester dan tanggung jawab mengejar materi kuliah.",
      "Izin Kegiatan Organisasi / Lomba: Minta bukti surat tugas resmi yang ditandatangani oleh badan departemen atau lembaga berwenang.",
      "Alasan Tidak Jelas / Kurang Sopan: Mintalah mereka menjelaskan dengan detail kronologi dan nama lengkap dengan sopan santun yang baik.",
      "Penutup Wajib: Selalu tutup draf balasan dengan kalimat persis: 'Silakan hubungi ketua kelas untuk update materi kuliah hari ini.'"
    ]
  },
  {
    name: "Kebijakan Sangat Ketat",
    description: "Aturan ketat untuk mendisiplinkan keterlambatan absensi dan menjaga standar perkuliahan.",
    rules: [
      "Izin Sakit: Surat dokter asli dengan cap klinik harus dilampirkan maksimal 2x24 jam, jika tidak maka dianggap alpa.",
      "Izin Acara Keluarga: Hanya disetujui jika ada berita duka atau keperluan mendesak darurat (maksimal 1x per semester). Urusan liburan ditolak langsung.",
      "Izin Organisasi: Hanya untuk kegiatan delegasi universitas tingkat nasional/internasional dengan melampirkan SK Rektor/Dekan.",
      "Bahasa Tidak Sopan: Langsung tolak izin dengan teguran keras mengenai etika berkomunikasi dengan dosen.",
      "Penutup Wajib: Selalu tutup draf balasan dengan kalimat persis: 'Silakan hubungi ketua kelas untuk update materi kuliah hari ini.'"
    ]
  },
  {
    name: "Kebijakan Fleksibel (Relaxed)",
    description: "Aturan lebih santai dan menaruh empati tinggi terhadap keseimbangan mahasiswa.",
    rules: [
      "Izin Sakit: Berikan toleransi tanpa surat dokter jika durasi hanya 1 hari, cukup ingatkan untuk beristirahat.",
      "Izin Acara Keluarga: Berikan kelonggaran asalkan mahasiswa berkomitmen mengerjakan tugas pengganti mandiri.",
      "Izin Organisasi/Lomba: Dukung penuh prestasi mahasiswa, cukup minta surat keterangan biasa setelah kegiatan selesai.",
      "Bahasa Kurang Sopan: Berikan bimbingan cara menghubungi dosen yang benar secara bijaksana dalam balasan draf.",
      "Penutup Wajib: Selalu tutup draf balasan dengan kalimat persis: 'Silakan hubungi ketua kelas untuk update materi kuliah hari ini.'"
    ]
  }
];

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: "sample_1",
    title: "Sakit (Ada Surat Dokter)",
    category: "sakit",
    text: `Selamat pagi Bapak. Saya Adi Prasetyo, NIM 120422019, mahasiswa kelas Struktur Data A.
Saya bermaksud memohon izin tidak dapat mengikuti perkuliahan hari ini, Jumat 12 Juni 2026, karena sejak semalam mengalami demam tinggi dan diare. 
Saya sudah berobat ke Klinik Sehat Utama, berikut saya lampirkan foto surat keterangan istirahat dari dokter selama 2 hari. Terima kasih banyak, Pak.`
  },
  {
    id: "sample_2",
    title: "Sakit (Tanpa Surat)",
    category: "sakit",
    text: `Permisi bu, saya Indah Lestari NIM 21044023. Ibu sy minta ijin g bs ikut kulia struktur data hari ini krn bdn sy menggigil dr subuh td. Krn d ruma sndiri jd blm smpt k dkter bu. Mohon pengertiannya bgt ya Bu`
  },
  {
    id: "sample_3",
    title: "Keluarga (Menemani Ibu)",
    category: "keluarga",
    text: `Pak/Bu, saya tidak bisa masuk kelas hari ini karena mau menemani ibu ke rumah sakit.`
  },
  {
    id: "sample_4",
    title: "Delegasi Lomba/Organisasi",
    category: "organisasi",
    text: `Selamat siang Ibu Dosen pengampu matakuliah Keamanan Jaringan. 
Saya Shandy Pratama (NIM 22093011). Ingin mengonfirmasi bahwa saya terpilih menjadi salah satu delegasi tim Cyber-Security kampus dalam ajang Final Lomba Cyber National di Universitas Indonesia. 
Persiapannya menuntut saya harus hadir di Depok mulai tanggal 14 s.d. 17 Juni 2026. Saya mohon izin tidak dapat mengikuti perkuliahan dan kuis minggu depan Bu. Surat rekomendasi delegasi sedang dicetak oleh BMA, nanti setelah keluar akan saya serahkan Bu.`
  },
  {
    id: "sample_5",
    title: "Alasan Singkat & Kurang Sopan",
    category: "tidak-jelas",
    text: `p pagi pak, hari ini gw ga masuk dulu ya ada urusan pribadi thxx.`
  }
];
