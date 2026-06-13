import { useState } from "react";
import { Search, Trash, Calendar, User, FileText, ArrowRight, X } from "lucide-react";
import { HistoryItem } from "../types";

interface HistoryListProps {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  selectedId?: string;
}

export default function HistoryList({
  items,
  onSelectItem,
  onDeleteItem,
  onClearAll,
  selectedId,
}: HistoryListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");

  const filteredItems = items.filter((item) => {
    const textMatch =
      item.originalMessage.toLowerCase().includes(search.toLowerCase()) ||
      item.result.extractedInfo.name.toLowerCase().includes(search.toLowerCase()) ||
      item.result.extractedInfo.nim.toLowerCase().includes(search.toLowerCase()) ||
      item.result.extractedInfo.reason.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "Semua" || item.result.status === statusFilter;

    return textMatch && statusMatch;
  });

  return (
    <div id="history-list-component" className="space-y-4">
      {/* Header and Quick Clear */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          Riwayat Penggunaan ({filteredItems.length})
        </h3>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[10px] text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-colors"
          >
            Hapus Semua Riwayat
          </button>
        )}
      </div>

      {/* Search and Category Filter Tabs */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIM, alasan, pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-800 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filtering pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {["Semua", "Disetujui", "Perlu Dokumen Tambahan", "Ditolak"].map((status) => {
            const isActive = statusFilter === status;
            let themeClass = "";
            switch (status) {
              case "Disetujui":
                themeClass = isActive ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
                break;
              case "Perlu Dokumen Tambahan":
                themeClass = isActive ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100";
                break;
              case "Ditolak":
                themeClass = isActive ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100";
                break;
              default:
                themeClass = isActive ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200";
            }

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer ${themeClass}`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredItems.map((item) => {
          let statusColor = "";
          let dotColor = "";
          switch (item.result.status) {
            case "Disetujui":
              statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
              dotColor = "bg-emerald-500";
              break;
            case "Perlu Dokumen Tambahan":
              statusColor = "text-amber-700 bg-amber-50 border-amber-200";
              dotColor = "bg-amber-500";
              break;
            case "Ditolak":
              statusColor = "text-rose-700 bg-rose-50 border-rose-200";
              dotColor = "bg-rose-500";
              break;
          }

          const isSelected = selectedId === item.id;

          const formattedTime = new Date(item.timestamp).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative group ${
                isSelected
                  ? "bg-slate-950 border-slate-950 text-white"
                  : "bg-white hover:bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
                    <span className="text-[11px] font-mono tracking-tight opacity-70">
                      NIM {item.result.extractedInfo.nim || "Unknown"}
                    </span>
                  </div>
                  <h4 className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-800"}`}>
                    {item.result.extractedInfo.name && item.result.extractedInfo.name !== "Tidak ditemukan"
                      ? item.result.extractedInfo.name
                      : "Mahasiswa"}
                  </h4>
                </div>

                <span className={`text-[9px] px-1.5 py-0.5 rounded border leading-none font-semibold ${isSelected ? "bg-white/10 text-white border-white/20" : statusColor}`}>
                  {item.result.status}
                </span>
              </div>

              {/* Snippet message description */}
              <p className={`text-[11px] line-clamp-1 mt-1.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                Absen: {item.result.extractedInfo.reason} ({item.result.extractedInfo.duration})
              </p>

              {/* Time footer and actions */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-slate-200/50">
                <span className={`text-[9px] flex items-center gap-1 ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                  <Calendar className="w-3 h-3" />
                  {formattedTime}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className={`p-1 rounded text-red-400 hover:text-red-600 transition-colors ${isSelected ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
                    title="Hapus item ini"
                    aria-label="Hapus dari riwayat"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                  <ArrowRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? "text-slate-300" : "text-slate-500"}`} />
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
            Tidak ada riwayat yang cocok dengan pencarian Anda.
          </div>
        )}
      </div>
    </div>
  );
}
