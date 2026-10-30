import React from 'react';
import { ThemeConfig } from '../types/calculator';
import { sound } from '../utils/audio';

export type KeyVariant = 'number' | 'operator' | 'action' | 'equals';

interface KeyButtonProps {
  label: React.ReactNode;
  sublabel?: string;
  variant?: KeyVariant;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  theme: ThemeConfig;
  className?: string;
  isPressed?: boolean;
  ariaLabel?: string;
  wide?: boolean;
}

export const KeyButton: React.FC<KeyButtonProps> = ({
  label,
  sublabel,
  variant = 'number',
  onClick,
  theme,
  className = '',
  isPressed = false,
  ariaLabel,
  wide = false,
}) => {
  // Determine styles from theme
  let bgClass = theme.keyNumBg;
  let textClass = theme.keyNumText;
  let shadowClass = theme.keyNumShadow;

  if (variant === 'operator') {
    bgClass = theme.keyOpBg;
    textClass = theme.keyOpText;
    shadowClass = theme.keyOpShadow;
  } else if (variant === 'action') {
    bgClass = theme.keyActionBg;
    textClass = theme.keyActionText;
    shadowClass = theme.keyActionShadow;
  } else if (variant === 'equals') {
    bgClass = theme.keyEqualsBg;
    textClass = theme.keyEqualsText;
    shadowClass = theme.keyEqualsShadow;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Audio trigger based on variant
    if (variant === 'equals') {
      sound.playChime();
    } else if (variant === 'operator') {
      sound.playOperator();
    } else if (variant === 'action') {
      sound.playClear();
    } else {
      sound.playBubble();
    }

    onClick(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
      className={`
        relative group select-none font-rounded font-semibold
        min-h-[50px] md:min-h-[54px]
        rounded-2xl flex flex-col items-center justify-center
        transition-all duration-100 ease-out
        border border-black/5 dark:border-white/5
        ${bgClass} ${textClass} ${shadowClass}
        ${wide ? 'col-span-2' : 'col-span-1'}
        ${isPressed ? 'translate-y-[3px] shadow-none scale-[0.98]' : 'active:translate-y-[3px] active:shadow-none active:scale-[0.98]'}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-1
        ${className}
      `}
    >
      <span className="text-lg md:text-xl font-bold tracking-tight leading-none pointer-events-none">
        {label}
      </span>
      {sublabel && (
        <span className="text-[9px] uppercase tracking-wider opacity-60 mt-0.5 pointer-events-none">
          {sublabel}
        </span>
      )}
    </button>
  );
};
