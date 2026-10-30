import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { ThemeConfig } from '../types/calculator';
import { formatDisplayNumber } from '../utils/calcEngine';

interface DisplayProps {
  expression: string;
  currentValue: string;
  memoryValue: number;
  isRadMode?: boolean;
  theme: ThemeConfig;
  error?: string | null;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  currentValue,
  memoryValue,
  isRadMode = false,
  theme,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  const formattedVal = error ? error : formatDisplayNumber(currentValue);

  // Dynamic font sizing based on length of input
  const getFontSize = (str: string) => {
    const len = str.length;
    if (len > 15) return 'text-2xl md:text-3xl';
    if (len > 10) return 'text-3xl md:text-4xl';
    return 'text-4xl md:text-5xl';
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentValue || '0');
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className={`
        relative w-full rounded-2xl md:rounded-3xl p-4 md:p-5
        border transition-all duration-300
        ${theme.screenBg} ${theme.screenBorder}
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]
      `}
    >
      {/* Top Status & Indicators Bar */}
      <div className="flex items-center justify-between text-xs font-medium pb-2 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-rose-500 dark:text-rose-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tracking-wide">CHÉRIE</span>
          </span>

          {memoryValue !== 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-200/70 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200">
              M ({memoryValue})
            </span>
          )}

          {isRadMode && (
            <span className="text-[10px] tracking-wider font-semibold opacity-70">
              RAD
            </span>
          )}
        </div>

        {/* Copy Button & Feedback */}
        <div className="relative">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy value"
            aria-label="Copy current value"
            className={`
              flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
              transition-colors duration-150
              hover:bg-black/5 dark:hover:bg-white/10
              ${theme.screenSubtext}
            `}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">Copied! 💕</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expression Preview */}
      <div className="h-6 flex items-center justify-end overflow-hidden mt-1">
        <span
          className={`font-tape text-xs md:text-sm tracking-wide truncate ${theme.screenSubtext}`}
          title={expression}
        >
          {expression || ' '}
        </span>
      </div>

      {/* Main Number Display */}
      <div className="flex items-baseline justify-end overflow-x-auto tape-scroll py-1">
        <span
          className={`
            font-rounded font-bold tracking-tight text-right select-all
            ${getFontSize(formattedVal)}
            ${error ? 'text-rose-500 font-semibold text-2xl md:text-3xl' : theme.screenText}
          `}
        >
          {formattedVal || '0'}
        </span>
      </div>
    </div>
  );
};
