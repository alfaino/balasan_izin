import React, { useState, useEffect } from "react";
import {
  Clipboard,
  Check,
  Send,
  Sparkles,
  RefreshCw,
  Clock,
  Database,
  Smartphone,
  Mail,
  User,
  Hash,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Settings,
  Flame,
  Info
} from "lucide-react";
import PolicyManager from "./components/PolicyManager";
import HistoryList from "./components/HistoryList";
import { DEFAULT_RULES, DEFAULT_SYSTEM_PROMPT, SAMPLE_MESSAGES } from "./data";
import { PermissionResult, HistoryItem, SampleMessage } from "./types";

const getSentimentBadgeStyle = (sentiment: string) => {
  const normalized = (sentiment || "Formal").toLowerCase().trim();
  if (normalized.includes("sopan")) {
    return {
      text: "Sopan",
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-mono",
      dot: "bg-emerald-400",
    };
  } else if (normalized.includes("mendesak")) {
    return {
      text: "Mendesak",
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-400 font-mono",
      dot: "bg-amber-400",
    };
  } else if (normalized.includes("panik")) {
    return {
      text: "Panik",
      bg: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400 font-mono",
      dot: "bg-fuchsia-400",
    };
  } else if (normalized.includes("kurang sopan") || normalized.includes("tidak sopan")) {
    return {
      text: "Kurang Sopan",
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-400 font-mono",
      dot: "bg-rose-400",
    };
  } else {
    return {
      text: "Formal",
      bg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-mono",
      dot: "bg-indigo-400",
    };
  }
};

const getSentimentExplanations = (sentiment: string) => {
  const normalized = (sentiment || "Formal").toLowerCase().trim();
  if (normalized.includes("sopan")) {
    return "Mahasiswa bersikap sangat hormat. Balaslah dengan nada apresiatif dan penuh pengertian.";
  } else if (normalized.includes("mendesak")) {
    return "Pesan menunjukkan urgensi tinggi. Respon draf ini dirancang langsung dan to-the-point.";
  } else if (normalized.includes("panik")) {
    return "Mahasiswa merasa cemas atau takut. Gunakan kata-kata yang menenangkan & jelas demi meredam gejolak cemas.";
  } else if (normalized.includes("kurang sopan") || normalized.includes("tidak sopan")) {
    return "Gaya bicara kurang beretika atau terlalu santai. Draf menegur halus namun tetap profesional.";
  } else {
    return "Pesan formal & prosedural standar. Balaslah memakai aturan akademis normatif yang ringkas.";
  }
};

export default function App() {
  // Input fields
  const [studentMessage, setStudentMessage] = useState("");
  const [rules, setRules] = useState<string[]>(() => {
    const saved = localStorage.getItem("dosen_rules");
    return saved ? JSON.parse(saved) : DEFAULT_RULES;
  });
  const [systemPrompt, setSystemPrompt] = useState<string>(() => {
    const saved = localStorage.getItem("dosen_prompt");
    return saved || DEFAULT_SYSTEM_PROMPT;
  });

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("dosen_history");
    return saved ? JSON.parse(saved) : [];
  });

  // App UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<PermissionResult | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"input" | "policies" | "history">("input");
  
  // Custom lecturer profile configuration
  const [lecturerName, setLecturerName] = useState(() => {
    return localStorage.getItem("dosen_name") || "DR. IR. HERMAWAN, M.T.";
  });
  const [isEditingDosen, setIsEditingDosen] = useState(false);

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem("dosen_rules", JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem("dosen_prompt", systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem("dosen_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("dosen_name", lecturerName);
  }, [lecturerName]);

  // Handle message analysis using our Server API route
  const handleAnalyze = async (messageTextToUse?: string) => {
    const textToAnalyze = messageTextToUse || studentMessage;
    if (!textToAnalyze.trim()) {
      setErrorMsg("Masukkan atau pilih pesan mahasiswa terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setCopiedText(false);

    try {
      const response = await fetch("/api/analyze-permission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentMessage: textToAnalyze,
          policyRules: rules,
          systemPrompt: systemPrompt,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Gagal menghubungi asisten AI.");
      }

      const rawResult = await response.json();
      const newResult: PermissionResult = {
        status: rawResult.status || "Perlu Dokumen Tambahan",
        sentiment: rawResult.sentiment || "Formal",
        draftReply: rawResult.draftReply || "",
        reason: rawResult.reason || "Dicocokkan berdasarkan kebijakan dosen.",
        extractedInfo: {
          name: rawResult.extractedInfo?.name || "Tidak ditemukan",
          nim: rawResult.extractedInfo?.nim || "Tidak ditemukan",
          reason: rawResult.extractedInfo?.reason || "Tidak ditemukan",
          duration: rawResult.extractedInfo?.duration || "Tidak ditemukan",
        },
      };

      setCurrentResult(newResult);
      setSelectedHistoryId(undefined);

      // Save to history
      const newHistoryItem: HistoryItem = {
        id: "hist_" + Date.now(),
        timestamp: new Date().toISOString(),
        originalMessage: textToAnalyze,
        result: newResult,
      };
      setHistory((prev) => [newHistoryItem, ...prev]);
      setSuccessMsg("Pesan mahasiswa berhasil dianalisis dengan kecerdasan buatan!");
      
      // Auto dismiss success notification
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message || "Koneksi terputus. Silakan periksa kunci API Gemini Anda atau coba beberapa saat lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample template to process
  const handleLoadSample = (sample: SampleMessage) => {
    setStudentMessage(sample.text);
    setErrorMsg(null);
    setCopiedText(false);
  };

  // Delete/Clear History Handlers
  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (selectedHistoryId === id) {
      setSelectedHistoryId(undefined);
      setCurrentResult(null);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat analisis?")) {
      setHistory([]);
      setSelectedHistoryId(undefined);
      setCurrentResult(null);
    }
  };

  // Select item from history to view details
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentResult(item.result);
    setStudentMessage(item.originalMessage);
    setSelectedHistoryId(item.id);
    setCopiedText(false);
    // Switch to input tab on mobile view when selecting from history list
    setActiveTab("input");
  };

  // Copy draft to clipboard
  const handleCopyDraft = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult.draftReply);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Launch external action triggers with security parameters fallback
  const handleShareWhatsApp = () => {
    if (!currentResult) return;
    const text = encodeURIComponent(currentResult.draftReply);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareEmail = () => {
    if (!currentResult) return;
    const subject = encodeURIComponent("Balasan Pengajuan Izin Kuliah");
    const body = encodeURIComponent(currentResult.draftReply);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  // Helper colors for statuses matching strict "Immersive UI" accents
  const getStatusBannerColors = (status: "Disetujui" | "Perlu Dokumen Tambahan" | "Ditolak") => {
    switch (status) {
      case "Disetujui":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          outlineDot: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]",
        };
      case "Perlu Dokumen Tambahan":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          outlineDot: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]",
        };
      case "Ditolak":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
          outlineDot: "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:py-4 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <Sparkles className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                  Sistem Balasan Izin <span className="text-indigo-400 font-mono text-sm px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded">v2.4</span>
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest mt-1">
                Lecturer Assistant Protocol • Active
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 rounded-full px-3.5 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
              <span className="text-xs font-semibold text-slate-200">
                AI Engine: Gemini-3.5-Flash
              </span>
            </div>

            {/* Editable Lecturer name badge */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-full px-3 py-1.5 flex items-center gap-1.5">
              {isEditingDosen ? (
                <input
                  type="text"
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value.toUpperCase())}
                  onBlur={() => setIsEditingDosen(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setIsEditingDosen(false);
                  }}
                  autoFocus
                  className="bg-slate-950 text-white text-xs px-2 py-0.5 rounded border border-indigo-500 focus:outline-none w-36 uppercase font-semibold"
                />
              ) : (
                <span
                  title="Klik untuk mengubah nama dosen"
                  onClick={() => setIsEditingDosen(true)}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 font-bold tracking-wider cursor-pointer transition-colors"
                >
                  👤 {lecturerName}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CORE ALERTS CONTAINER */}
      {(errorMsg || successMsg) && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-4">
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 flex items-start gap-3 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Gagal Memproses:</span> {errorMsg}
                <div className="mt-1 text-xs text-rose-400/80 font-mono">
                  Solusi: Pastikan rahasia "GEMINI_API_KEY" sudah dikonfigurasi melalui panel Secrets atau coba lagi.
                </div>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl p-4 flex items-center gap-3 text-sm animate-fadeIn">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>{successMsg}</div>
            </div>
          )}
        </div>
      )}

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT COLUMN (col-span-12 on mobile, col-span-5 on desktop) */}
        <section className="lg:col-span-5 flex flex-col gap-6">

          {/* Quick Tabs for Mobile view friendliness */}
          <div className="flex lg:hidden bg-slate-900/60 p-1 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab("input")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "input" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Input & Contoh
            </button>
            <button
              onClick={() => setActiveTab("policies")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "policies" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Kebijakan AI ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "history" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Riwayat ({history.length})
            </button>
          </div>

          {/* INPUT CONTAINER */}
          <div className={`bg-slate-900/20 border border-slate-800/80 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-xl transition-all ${
            activeTab !== "input" && "hidden lg:flex"
          }`}>
            <div className="flex items-center justify-between">
              <label htmlFor="student-message-input" className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Input Pesan Mahasiswa
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {studentMessage.length} Karakter
              </span>
            </div>

            <textarea
              id="student-message-input"
              value={studentMessage}
              onChange={(e) => setStudentMessage(e.target.value)}
              placeholder="Tempel pesan izin dari WhatsApp atau Email mahasiswa di sini...

Contoh: 
'Pak/Bu, saya tidak bisa masuk kelas hari ini karena mau menemani ibu ke rumah sakit.'"
              className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 text-sm h-48 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/35 outline-none transition-all resize-none text-slate-100 placeholder:text-slate-700 leading-relaxed font-sans"
            />

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="text-[11px] text-slate-500">
                {selectedHistoryId ? (
                  <span className="text-indigo-400 font-mono">*Sedang meninjau item riwayat*</span>
                ) : (
                  <span>Tekan tombol di kanan untuk memicu evaluasi berbasis aturan.</span>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => handleAnalyze()}
                disabled={isLoading || !studentMessage.trim()}
                className={`py-2 px-5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isLoading
                    ? "bg-slate-850 text-slate-500 cursor-not-allowed"
                    : !studentMessage.trim()
                    ? "bg-slate-800 text-slate-400 hover:bg-slate-755"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:scale-[1.01]"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Analisis Pesan
                  </>
                )}
              </button>
            </div>

            {/* INTERACTIVE SAMPLE SELECTOR */}
            <div className="mt-2 pt-4 border-t border-slate-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Contoh Pengujian Cepat:
                </span>
                <span className="text-[10px] text-slate-600 italic">Klik untuk memuat</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_MESSAGES.map((sample) => {
                  let badgeColor = "bg-slate-900 border-slate-850 hover:bg-slate-850 hover:border-slate-800 text-slate-400";
                  if (sample.category === "sakit") {
                    badgeColor = "bg-teal-950/20 border-teal-900/50 hover:bg-teal-950/40 text-teal-400";
                  } else if (sample.category === "keluarga") {
                    badgeColor = "bg-sky-950/20 border-sky-900/50 hover:bg-sky-950/40 text-sky-400";
                  } else if (sample.category === "organisasi") {
                    badgeColor = "bg-purple-950/20 border-purple-900/50 hover:bg-purple-950/40 text-purple-400";
                  } else if (sample.category === "tidak-jelas") {
                    badgeColor = "bg-rose-950/20 border-rose-900/50 hover:bg-rose-950/40 text-rose-400";
                  }

                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-md border transition-all cursor-pointer ${badgeColor}`}
                    >
                      {sample.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* POLICY WRAPPER FOR BOTH VIEWPORT TYPES */}
          <div className={`bg-slate-900/20 border border-slate-800/80 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-xl ${
            activeTab !== "policies" && "hidden lg:flex"
          }`}>
            <div className="border-b border-slate-800/60 pb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                Variabel & Aturan Kebijakan Izin
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Ubah preset kebijakan di bawah ini untuk menilai persetujuan izin secara otomatis secara adil dan objektif.
              </p>
            </div>

            <PolicyManager
              rules={rules}
              setRules={setRules}
              systemPrompt={systemPrompt}
              setSystemPrompt={setSystemPrompt}
            />
          </div>

          {/* HISTORY CONTAINER INTEGRATOR */}
          <div className={`bg-slate-900/20 border border-slate-800/80 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-xl ${
            activeTab !== "history" && "hidden lg:flex"
          }`}>
            <HistoryList
              items={history}
              onSelectItem={handleSelectHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
              selectedId={selectedHistoryId}
            />
          </div>

        </section>

        {/* RIGHT GENERATOR OUTPUT COLUMN (col-span-12 on mobile, col-span-7 on desktop) */}
        <section className="lg:col-span-7 flex flex-col">
          <div id="immersive-canvas-container" className="flex-1 bg-indigo-950/5 border border-indigo-500/10 rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)] min-h-[550px] transition-all">
            
            {/* Decoration glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* If no result is created yet and no input is processing */}
            {!currentResult && !isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-slate-950/80 rounded-full border border-slate-800 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-serif italic text-white">Belum Ada Analisis Draf</h3>
                  <p className="text-xs text-slate-400">
                    Masukkan pesan mahasiswa di kolom kiri atau klik salah satu <strong>Contoh Pengujian Cepat</strong> untuk memulai otomatisasi balasan.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl max-w-md text-[11px] text-slate-500 leading-relaxed text-left flex gap-3">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    Sistem bertenaga **Gemini AI** akan secara instan membaca NIM, nama mahasiswa, mengevaluasi alasan terhadap toleransi asuransi absensi dosen Anda, dan merangkai balasan akademis formal.
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              /* PROGRESS VIEWPORT LOADING SPLASH */
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-indigo-400 font-bold">
                    AI
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-semibold text-white tracking-wide">Mengevaluasi Absensi & Kebijakan Dosen</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Menganalisis pesan mahasiswa berdasarkan aturan aktif dan merangkai struktur bahasa Indonesia formal...
                  </p>
                </div>
              </div>
            ) : (
              /* DYNAMIC IMMERSIVE AI OUTPUT PREVIEW */
              <div className="flex-1 flex flex-col justify-between space-y-6 animate-fadeIn">
                
                {/* Header Output info */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif italic text-white mb-1">
                      Draf Balasan Otomatis
                    </h2>
                    
                    {/* Status badge metadata row */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 ${
                        getStatusBannerColors(currentResult!.status).bg
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${getStatusBannerColors(currentResult!.status).outlineDot}`} />
                        Status: {currentResult!.status}
                      </span>
                      
                      <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        Subjek Absensi: {currentResult!.extractedInfo.reason}
                      </span>
                    </div>
                  </div>

                  {/* Top quick copy & reset actions */}
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleCopyDraft}
                      className="p-2 sm:p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                      title="Salin ke papan klip"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-4 h-4" />
                          <span>Salin Draf</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* EXTRACTED INFORMATION METADATA BLOCK */}
                <div className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      Mahasiswa
                    </span>
                    <p className="font-semibold text-slate-200 truncate" title={currentResult!.extractedInfo.name}>
                      {currentResult!.extractedInfo.name}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-indigo-400" />
                      NIM
                    </span>
                    <p className="font-mono text-slate-200 truncate">
                      {currentResult!.extractedInfo.nim}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-indigo-400" />
                      Alasan Masuk
                    </span>
                    <p className="font-semibold text-slate-200 truncate" title={currentResult!.extractedInfo.reason}>
                      {currentResult!.extractedInfo.reason}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Durasi / Tanggal
                    </span>
                    <p className="font-semibold text-slate-200 truncate" title={currentResult!.extractedInfo.duration}>
                      {currentResult!.extractedInfo.duration}
                    </p>
                  </div>
                </div>

                {/* DECISION REASON EXPLANATION BANNER */}
                <div className="bg-slate-900/50 p-4 border-l-4 border-indigo-500 rounded-r-xl text-xs text-slate-300 leading-relaxed space-y-1">
                  <span className="font-bold text-white uppercase text-[9px] tracking-widest text-indigo-400 block mb-1">
                    Analisis Kebijakan Dosen:
                  </span>
                  <p>{currentResult!.reason}</p>
                </div>

                {/* SENTIMENT ANALYSIS INDICATOR */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                      {(() => {
                        const style = getSentimentBadgeStyle(currentResult!.sentiment || "Formal");
                        if (style.text === "Sopan") {
                          return <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />;
                        } else if (style.text === "Mendesak") {
                          return <Flame className="w-4.5 h-4.5 text-amber-400 font-extrabold animate-pulse" />;
                        } else if (style.text === "Panik") {
                          return <HelpCircle className="w-4.5 h-4.5 text-fuchsia-400 animate-bounce" />;
                        } else if (style.text === "Kurang Sopan") {
                          return <AlertCircle className="w-4.5 h-4.5 text-rose-400 animate-pulse" />;
                        } else {
                          return <Sparkles className="w-4.5 h-4.5 text-indigo-400" />;
                        }
                      })()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                          Indikator Emosi Mahasiswa
                        </span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getSentimentBadgeStyle(currentResult!.sentiment || "Formal").bg}`}>
                          {getSentimentBadgeStyle(currentResult!.sentiment || "Formal").text}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic mt-0.5 max-w-lg leading-relaxed">
                        {getSentimentExplanations(currentResult!.sentiment || "Formal")}
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 bg-slate-900/50 px-2.5 py-1 rounded border border-slate-800/85 shrink-0 self-start md:self-center">
                    Gaya Pesan: <span className="text-slate-200 font-bold">{getSentimentBadgeStyle(currentResult!.sentiment || "Formal").text}</span>
                  </div>
                </div>

                {/* THE DRAFT WRITING DISPLAY BOX */}
                <div className="relative">
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur rounded border border-slate-800 text-[9px] font-mono uppercase tracking-widest text-slate-500">
                    Draft Preview
                  </div>
                  <div className="bg-slate-950/80 backdrop-blur border border-slate-800/85 rounded-2xl p-5 sm:p-7 font-serif text-slate-100 shadow-inner whitespace-pre-wrap leading-relaxed text-sm sm:text-base border-t-2 border-t-indigo-500/50">
                    {currentResult!.draftReply}
                  </div>
                </div>

                {/* ACTION TRIGGER BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Smartphone className="w-5 h-5 shrink-0" />
                    <span>Kirim ke WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={handleShareEmail}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-xl border border-slate-700/60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Mail className="w-5 h-5 shrink-0" />
                    <span>Gunakan di Email</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </section>

      </main>

      {/* FOOTER METADATA IN FULL CAPITALIZATION CAP WITH LOG AND SYNC SIGNATURES */}
      <footer className="bg-slate-950 border-t border-slate-900 px-4 py-4 sm:py-5 transition-all text-[10px] text-slate-500 uppercase tracking-[0.2em] z-10 block">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="font-mono text-center md:text-left">
            LECTURER PROTOCOL: <span className="text-slate-300 font-bold">{lecturerName}</span> • STATUS: <span className="text-indigo-400 font-bold font-mono">STANDAR AKADEMIS 2026/2027</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 font-mono">
            <span>Uptime: Active</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
              Cloud Sync: Active
            </span>
            <span>Version: 2.4.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
