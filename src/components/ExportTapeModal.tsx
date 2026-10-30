import React, { useState, useMemo } from 'react';
import { CalculationHistoryItem, ThemeConfig } from '../types/calculator';
import { X, FileText, FileSpreadsheet, Copy, Download, Check, Sparkles } from 'lucide-react';

interface ExportTapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  theme: ThemeConfig;
}

export const ExportTapeModal: React.FC<ExportTapeModalProps> = ({
  isOpen,
  onClose,
  history,
  theme,
}) => {
  const [format, setFormat] = useState<'txt' | 'csv'>('txt');
  const [title, setTitle] = useState('My Calculation Diary');
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [copied, setCopied] = useState(false);

  // Generate Formatted Text Summary
  const textSummary = useMemo(() => {
    if (history.length === 0) return 'No calculations to export.';

    const nowStr = new Date().toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    let sum = 0;
    history.forEach((h) => {
      const val = parseFloat(h.result);
      if (!isNaN(val) && isFinite(val)) {
        sum += val;
      }
    });

    const lines: string[] = [];
    lines.push('====================================================');
    lines.push(`🎀 CHÉRIE CALC · ${title.toUpperCase()} 🎀`);
    lines.push(`Exported on: ${nowStr}`);
    lines.push(`Total Entries: ${history.length}`);
    lines.push('====================================================\n');

    history.forEach((item, idx) => {
      const dateObj = new Date(item.timestamp);
      const timeStr = includeTimestamps
        ? `[${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `
        : '';
      const numPrefix = `${String(idx + 1).padStart(2, '0')}. `;

      lines.push(`${numPrefix}${timeStr}${item.expression} = ${item.result}`);
      if (includeNotes && item.note) {
        lines.push(`    📝 Note: ${item.note}`);
      }
      lines.push(''); // blank line separator
    });

    lines.push('----------------------------------------------------');
    lines.push(`Tape Balance / Sum of Results: ${sum.toFixed(2)}`);
    lines.push('====================================================');
    lines.push('Designed with love by Chérie Calc 💕');

    return lines.join('\n');
  }, [history, title, includeNotes, includeTimestamps]);

  // Generate CSV Content
  const csvContent = useMemo(() => {
    if (history.length === 0) return '';

    const headers = ['Index'];
    if (includeTimestamps) {
      headers.push('Date', 'Time');
    }
    headers.push('Expression', 'Result');
    if (includeNotes) {
      headers.push('Note');
    }

    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

    const rows = history.map((item, index) => {
      const row: string[] = [String(index + 1)];
      const d = new Date(item.timestamp);

      if (includeTimestamps) {
        row.push(escapeCsv(d.toLocaleDateString()));
        row.push(escapeCsv(d.toLocaleTimeString()));
      }

      row.push(escapeCsv(item.expression));
      row.push(escapeCsv(item.result));

      if (includeNotes) {
        row.push(escapeCsv(item.note || ''));
      }

      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }, [history, includeNotes, includeTimestamps]);

  if (!isOpen) return null;

  const currentOutput = format === 'txt' ? textSummary : csvContent;

  const handleDownload = () => {
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.${format}`;
    const mimeType = format === 'txt' ? 'text/plain;charset=utf-8' : 'text/csv;charset=utf-8';
    const blob = new Blob([currentOutput], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`
          relative w-full max-w-lg rounded-3xl p-5 md:p-6 shadow-2xl border
          ${theme.calcCardBg} ${theme.calcCardBorder} ${theme.calcCardShadow}
          flex flex-col max-h-[90vh]
        `}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎀</span>
            <div>
              <h3 className="font-rounded font-bold text-base text-slate-800 dark:text-slate-100">
                Export Calculation Tape
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save your calculations as a formatted summary or spreadsheet CSV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto tape-scroll py-3 space-y-3.5">
          {/* Format Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Choose Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('txt')}
                className={`
                  p-2.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all
                  ${format === 'txt'
                    ? 'bg-pink-50/80 dark:bg-pink-950/40 border-pink-400 text-pink-950 dark:text-pink-100 shadow-xs'
                    : 'bg-white/60 dark:bg-white/5 border-pink-100/60 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-white'
                  }
                `}
              >
                <div className="p-1.5 rounded-xl bg-pink-100 dark:bg-pink-900/60 text-pink-600 dark:text-pink-300 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Text Summary (.txt)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Aesthetic formatted diary journal
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`
                  p-2.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all
                  ${format === 'csv'
                    ? 'bg-pink-50/80 dark:bg-pink-950/40 border-pink-400 text-pink-950 dark:text-pink-100 shadow-xs'
                    : 'bg-white/60 dark:bg-white/5 border-pink-100/60 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-white'
                  }
                `}
              >
                <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Spreadsheet (.csv)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Excel, Sheets & Numbers ready
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Title & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Diary / Tape Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. October Budget..."
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
            </div>

            <div className="flex flex-col justify-end space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="rounded accent-pink-500 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  Include notes & tags 📝
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="rounded accent-pink-500 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  Include date & timestamps ⏰
                </span>
              </label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                File Preview ({format.toUpperCase()} · {history.length} items)
              </span>
              <span className="text-[10px] text-pink-600 dark:text-pink-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" /> Ready to save
              </span>
            </div>
            <pre className="font-tape text-[11px] p-3 rounded-2xl bg-black/5 dark:bg-black/30 border border-pink-100/60 dark:border-white/5 text-slate-700 dark:text-slate-200 max-h-44 overflow-y-auto tape-scroll whitespace-pre-wrap select-all">
              {currentOutput}
            </pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied! 💕</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Content</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-1.5 transition-colors shadow-sm active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
