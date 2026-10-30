export type ThemeId =
  | 'strawberry'
  | 'coquette'
  | 'lavender'
  | 'matcha'
  | 'buttercream'
  | 'cybercherry';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  emoji: string;
  tagline: string;
  bgGradient: string;
  calcCardBg: string;
  calcCardBorder: string;
  calcCardShadow: string;
  screenBg: string;
  screenBorder: string;
  screenText: string;
  screenSubtext: string;
  keyNumBg: string;
  keyNumText: string;
  keyNumShadow: string;
  keyOpBg: string;
  keyOpText: string;
  keyOpShadow: string;
  keyActionBg: string;
  keyActionText: string;
  keyActionShadow: string;
  keyEqualsBg: string;
  keyEqualsText: string;
  keyEqualsShadow: string;
  accentColor: string;
  accentText: string;
  isDark: boolean;
}

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  note?: string;
}

export type CalcMode = 'standard' | 'scientific';

export type ActiveTab = 'calculator' | 'tape' | 'boutique';

export type BoutiqueSubTab = 'discount' | 'bill' | 'recipe' | 'units';
