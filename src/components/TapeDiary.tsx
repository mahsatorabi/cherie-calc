import React, { useState } from 'react';
import { CalculationHistoryItem, ThemeConfig } from '../types/calculator';
import { Trash2, Copy, ArrowUpLeft, Edit3, Check, Heart, Sparkles, Download, FileSpreadsheet } from 'lucide-react';
import { formatDisplayNumber } from '../utils/calcEngine';
import { ExportTapeModal } from './ExportTapeModal';

interface TapeDiaryProps {
  history: CalculationHistoryItem[];
  onSelectResult: (val: string) => void;
  onClearHistory: () => void;
  onUpdateNote: (id: string, note: string) => void;
  onDeleteItem: (id: string) => void;
  theme: ThemeConfig;
}

export const TapeDiary: React.FC<TapeDiaryProps> = ({
  history,
  onSelectResult,
  onClearHistory,
  onUpdateNote,
  onDeleteItem,
  theme,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleStartEdit = (item: CalculationHistoryItem) => {
    setEditingId(item.id);
    setTempNote(item.note || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateNote(id, tempNote.trim());
    setEditingId(null);
  };

  const handleCopyItem = (item: CalculationHistoryItem) => {
    const text = `${item.expression} = ${item.result}${item.note ? ` (${item.note})` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <>
      <ExportTapeModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        history={history}
        theme={theme}
      />

      <div
        className={`
          flex flex-col h-full rounded-2xl md:rounded-3xl p-4 md:p-5
          border transition-all duration-300
          ${theme.calcCardBg} ${theme.calcCardBorder} ${theme.calcCardShadow}
        `}
      >
        {/* Tape Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500/20" />
            <h2 className="font-rounded font-bold text-sm tracking-wide text-slate-800 dark:text-slate-100">
              Calculation Tape & Diary
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-100/70 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
              {history.length}
            </span>
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                title="Export calculation history as text summary or CSV file"
                className="px-2.5 py-1 text-xs font-semibold rounded-lg text-pink-700 dark:text-pink-300 bg-pink-100/80 hover:bg-pink-200/80 dark:bg-pink-950/60 dark:hover:bg-pink-900/60 border border-pink-200/60 dark:border-pink-800/60 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export (TXT/CSV)</span>
              </button>
              <button
                type="button"
                onClick={onClearHistory}
                title="Clear calculation tape"
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      {/* History Items Scroll Area */}
      <div className="flex-1 overflow-y-auto tape-scroll pr-1 space-y-2.5 min-h-[260px] max-h-[460px]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-pink-100/60 dark:bg-pink-900/40 flex items-center justify-center mb-2 text-xl">
              🎀
            </div>
            <p className="font-medium text-xs text-slate-600 dark:text-slate-300">
              Your calculation tape is empty
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
              Tap some numbers or solve equations to keep a cute record with custom shopping & boba notes!
            </p>
          </div>
        ) : (
          history.map((item) => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="group relative p-3 rounded-xl bg-white/70 dark:bg-white/5 border border-pink-100/60 dark:border-white/5 hover:border-pink-300 dark:hover:border-pink-500/40 transition-all shadow-xs"
              >
                {/* Time & Quick Actions */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                  <span>{timeStr}</span>
                  <div className="flex items-center gap-1 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onSelectResult(item.result)}
                      title="Load result into calculator"
                      className="p-1 rounded hover:bg-pink-100 dark:hover:bg-pink-950 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <ArrowUpLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyItem(item)}
                      title="Copy result"
                      className="p-1 rounded hover:bg-pink-100 dark:hover:bg-pink-950 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      title="Add or edit note"
                      className="p-1 rounded hover:bg-pink-100 dark:hover:bg-pink-950 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      title="Delete this entry"
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Equation Expression */}
                <div className="font-tape text-xs text-slate-500 dark:text-slate-400 truncate">
                  {item.expression}
                </div>

                {/* Result */}
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-tape font-bold text-base text-rose-950 dark:text-rose-100">
                    = {formatDisplayNumber(item.result)}
                  </span>
                </div>

                {/* Optional Note or Note Editor */}
                {editingId === item.id ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder="e.g. Sephora blush haul..."
                      maxLength={40}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveNote(item.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-pink-300 dark:border-pink-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(item.id)}
                      className="px-2 py-1 text-xs font-semibold rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : item.note ? (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-pink-600 dark:text-pink-400 bg-pink-50/80 dark:bg-pink-950/40 px-2 py-0.5 rounded-md w-fit">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[200px]">{item.note}</span>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  </>
  );
};
