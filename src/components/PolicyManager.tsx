import React, { useState } from "react";
import { Plus, Trash, RotateCcw, Sliders, HelpCircle, FileText } from "lucide-react";
import { POLICY_PRESETS, DEFAULT_SYSTEM_PROMPT } from "../data";

interface PolicyManagerProps {
  rules: string[];
  setRules: (rules: string[]) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
}

export default function PolicyManager({
  rules,
  setRules,
  systemPrompt,
  setSystemPrompt,
}: PolicyManagerProps) {
  const [newRule, setNewRule] = useState("");
  const [activePreset, setActivePreset] = useState("Kebijakan Standar (Default)");

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };

  const handleRemoveRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    setRules(updated);
  };

  const handleApplyPreset = (presetName: string) => {
    const found = POLICY_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setRules([...found.rules]);
      setActivePreset(presetName);
    }
  };

  const handleResetPrompt = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  return (
    <div id="policy-manager-container" className="space-y-6">
      {/* Policy Presets Picker */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-600" />
            Pilih Preset Kebijakan Dosen
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {POLICY_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset.name)}
              className={`p-3 text-left rounded-lg transition-all border text-xs flex flex-col justify-between ${
                activePreset === preset.name
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <span className="font-bold mb-1 block">{preset.name}</span>
              <span className={`text-[10px] block leading-relaxed ${
                activePreset === preset.name ? "text-slate-300" : "text-slate-500"
              }`}>
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Rules Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Daftar Aturan Kebijakan Absensi ({rules.length})
          </label>
          <span className="text-[11px] text-slate-500 italic bg-white px-2 py-0.5 rounded border border-slate-100">
            AI akan mencocokkan izin ke aturan ini
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors group text-sm text-slate-700 leading-relaxed"
            >
              <div className="flex gap-2">
                <span className="font-mono text-xs text-slate-400 font-semibold bg-slate-100 px-1.5 py-0.5 rounded h-fit">
                  {idx + 1}
                </span>
                <p>{rule}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRule(idx)}
                className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors shrink-0 ml-2 group-hover:opacity-100 md:opacity-0 focus:opacity-100"
                title="Hapus Aturan"
                aria-label={`Hapus aturan ${idx + 1}`}
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}

          {rules.length === 0 && (
            <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-500 text-xs flex flex-col items-center justify-center gap-1">
              <HelpCircle className="w-6 h-6 text-slate-400" />
              <span>Belum ada aturan kebijakan absensi yang dimasukkan.</span>
              <span>AI akan memutuskan keputusan default sepihak.</span>
            </div>
          )}
        </div>

        {/* Add Rule Inline Form */}
        <form onSubmit={handleAddRule} className="flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Tambah aturan kebijakan baru... (contoh: Izin magang wajib SK)"
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </button>
        </form>
      </div>

      {/* System Prompt Instructions Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            Instruction / System Prompt (Pedoman Respon AI)
          </label>
          <button
            type="button"
            onClick={handleResetPrompt}
            className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors hover:underline"
            title="Reset ke default"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Prompt
          </button>
        </div>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={3}
          placeholder="Tuliskan pedoman dasar respon di sini... (misal: Bertindaklah sebagai asisten yang hangat, gunakan panggilan Saudara, dsb.)"
          className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white leading-relaxed text-slate-700"
        />
      </div>
    </div>
  );
}
