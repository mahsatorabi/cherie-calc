import React from 'react';
import { THEMES } from '../utils/themes';
import { ThemeId, ThemeConfig } from '../types/calculator';

interface ThemeSelectorProps {
  currentThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  activeTheme: ThemeConfig;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentThemeId,
  onSelectTheme,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto tape-scroll py-1 max-w-full">
      {Object.values(THEMES).map((thm) => {
        const isSelected = thm.id === currentThemeId;
        return (
          <button
            key={thm.id}
            type="button"
            onClick={() => onSelectTheme(thm.id)}
            title={thm.tagline}
            className={`
              shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-semibold
              flex items-center gap-1.5 transition-all duration-150 border
              ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-pink-400 shadow-xs scale-105'
                  : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-pink-100/60 dark:border-white/5 hover:bg-white/80'
              }
            `}
          >
            <span>{thm.emoji}</span>
            <span className="whitespace-nowrap">{thm.name}</span>
          </button>
        );
      })}
    </div>
  );
};
