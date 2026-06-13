export interface ExtractedInfo {
  name: string;
  nim: string;
  reason: string;
  duration: string;
}

export interface PermissionResult {
  status: "Disetujui" | "Perlu Dokumen Tambahan" | "Ditolak";
  draftReply: string;
  reason: string;
  extractedInfo: ExtractedInfo;
  sentiment?: string; // e.g., 'Sopan', 'Mendesak', 'Formal', 'Panik', etc.
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  originalMessage: string;
  result: PermissionResult;
}

export interface SampleMessage {
  id: string;
  title: string;
  category: "sakit" | "keluarga" | "organisasi" | "tidak-jelas";
  text: string;
}

export interface PolicyPreset {
  name: string;
  description: string;
  rules: string[];
}
