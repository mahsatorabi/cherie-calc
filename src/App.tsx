/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { safeStorage } from './utils/storage';
import { THEMES } from './utils/themes';
import { ThemeId, CalculationHistoryItem, ActiveTab } from './types/calculator';
import { cleanNumber, evaluateExpression } from './utils/calcEngine';
import { sound } from './utils/audio';
import { KeyButton } from './components/KeyButton';
import { Display } from './components/Display';
import { TapeDiary } from './components/TapeDiary';
import { BoutiqueTools } from './components/BoutiqueTools';
import { SparkleOverlay, useSparkles } from './components/SparkleOverlay';
import { ThemeSelector } from './components/ThemeSelector';
import { InstallPrompt, InstallButton } from './components/InstallPrompt';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Calculator as CalcIcon,
  BookOpen,
  ShoppingBag,
  Delete,
  Moon,
  Sun,
} from 'lucide-react';

export default function App() {
  // 1. Theme State & Dark Mode
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = safeStorage.getItem('cherie_theme') as ThemeId;
    if (saved && THEMES[saved]) return saved;
    return 'strawberry';
  });

  const currentTheme = THEMES[themeId] || THEMES.strawberry;

  useEffect(() => {
    safeStorage.setItem('cherie_theme', themeId);
    if (currentTheme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeId, currentTheme.isDark]);

  // 2. Sound & Sparkles
  const [isSoundOn, setIsSoundOn] = useState(() => sound.isEnabled());
  const { particles, spawnSparkle } = useSparkles();

  const toggleSound = () => {
    const next = sound.toggle();
    setIsSoundOn(next);
  };

  // 3. Calculator Core State
  const [currentVal, setCurrentVal] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [isNewNumber, setIsNewNumber] = useState<boolean>(true);
  const [memoryVal, setMemoryVal] = useState<number>(0);
  const [isSciMode, setIsSciMode] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // 4. Navigation Tab (Mobile / Section focus)
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');

  // 5. History Tape State
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = safeStorage.getItem('cherie_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore parse error
    }
    return [
      {
        id: 'initial-1',
        expression: '45 + 18 + 12',
        result: '75',
        timestamp: Date.now() - 3600000 * 2,
        note: '🛍️ Boba tea + bakery run',
      },
      {
        id: 'initial-2',
        expression: '120 * 0.7',
        result: '84',
        timestamp: Date.now() - 3600000 * 5,
        note: '🎀 Zara sweater 30% off',
      },
    ];
  });

  useEffect(() => {
    try {
      safeStorage.setItem('cherie_history', JSON.stringify(history));
    } catch {
      // storage quota
    }
  }, [history]);

  // Handle Digit Entry
  const handleDigit = useCallback((digit: string, e?: React.MouseEvent) => {
    if (e) spawnSparkle(e.clientX, e.clientY, 2);
    setErrorMsg(null);

    setCurrentVal((prev) => {
      if (isNewNumber || prev === '0' || prev === 'Error') {
        setIsNewNumber(false);
        return digit;
      }
      if (prev.length >= 16) return prev; // Limit max digits
      return prev + digit;
    });
  }, [isNewNumber, spawnSparkle]);

  // Handle Decimal Point
  const handleDecimal = useCallback((e?: React.MouseEvent) => {
    if (e) spawnSparkle(e.clientX, e.clientY, 2);
    setErrorMsg(null);

    setCurrentVal((prev) => {
      if (isNewNumber || prev === 'Error') {
        setIsNewNumber(false);
        return '0.';
      }
      if (prev.includes('.')) return prev;
      return prev + '.';
    });
  }, [isNewNumber, spawnSparkle]);

  // Handle Operators (+, -, *, /)
  const handleOperator = useCallback((op: string, e?: React.MouseEvent) => {
    if (e) spawnSparkle(e.clientX, e.clientY, 3);
    setErrorMsg(null);

    const visualOp = op === '*' ? '×' : op === '/' ? '÷' : op;

    setExpression((prevExpr) => {
      if (isNewNumber && prevExpr !== '') {
        // If user just pressed an operator, replace trailing operator
        const replaced = prevExpr.trim().replace(/[+\-×÷]$/, visualOp);
        return replaced + ' ';
      }
      return `${prevExpr} ${currentVal} ${visualOp} `;
    });

    setIsNewNumber(true);
  }, [currentVal, isNewNumber, spawnSparkle]);

  // Handle Equals (=)
  const handleEquals = useCallback((e?: React.MouseEvent) => {
    if (e) spawnSparkle(e.clientX, e.clientY, 6);

    const fullExpr = `${expression} ${currentVal}`.trim();
    if (!fullExpr) return;

    try {
      const res = evaluateExpression(fullExpr);
      const cleaned = cleanNumber(res);

      if (cleaned === 'Error' || cleaned === 'Infinity' || cleaned === '-Infinity') {
        setErrorMsg('Oopsie! ✨');
        sound.playError();
        return;
      }

      // Add to history tape
      const newItem: CalculationHistoryItem = {
        id: String(Date.now()),
        expression: fullExpr,
        result: cleaned,
        timestamp: Date.now(),
      };

      setHistory((prev) => [newItem, ...prev.slice(0, 49)]); // keep up to 50 entries
      setCurrentVal(cleaned);
      setExpression('');
      setIsNewNumber(true);
      setErrorMsg(null);
    } catch {
      setErrorMsg('Oopsie! 🌸');
      sound.playError();
    }
  }, [expression, currentVal, spawnSparkle]);

  // Handle Clear / All Clear
  const handleClear = useCallback(() => {
    setCurrentVal('0');
    setExpression('');
    setIsNewNumber(true);
    setErrorMsg(null);
    sound.playClear();
  }, []);

  // Handle Backspace (⌫)
  const handleBackspace = useCallback(() => {
    setErrorMsg(null);
    setCurrentVal((prev) => {
      if (prev.length <= 1 || prev === '0' || prev === 'Error') {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, []);

  // Handle Sign Invert (±)
  const handlePlusMinus = useCallback(() => {
    setErrorMsg(null);
    setCurrentVal((prev) => {
      if (prev === '0' || prev === 'Error') return prev;
      return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
    });
  }, []);

  // Handle Percentage (%)
  const handlePercentage = useCallback(() => {
    setErrorMsg(null);
    try {
      const num = parseFloat(currentVal);
      if (isNaN(num)) return;

      // If an expression exists like "200 + ", calculate 200 * (num / 100)
      if (expression.includes('+') || expression.includes('−') || expression.includes('-')) {
        const parts = expression.trim().split(' ');
        const base = parseFloat(parts[0]);
        if (!isNaN(base)) {
          const percentVal = (base * num) / 100;
          setCurrentVal(cleanNumber(percentVal));
          return;
        }
      }

      const res = num / 100;
      setCurrentVal(cleanNumber(res));
    } catch {
      setErrorMsg('Oopsie! 🌸');
    }
  }, [currentVal, expression]);

  // Memory Functions
  const handleMemoryClear = () => {
    setMemoryVal(0);
    sound.playBubble();
  };

  const handleMemoryRecall = () => {
    setCurrentVal(cleanNumber(memoryVal));
    setIsNewNumber(true);
    sound.playBubble();
  };

  const handleMemoryAdd = () => {
    const num = parseFloat(currentVal) || 0;
    setMemoryVal((m) => m + num);
    setIsNewNumber(true);
    sound.playBubble();
  };

  const handleMemorySubtract = () => {
    const num = parseFloat(currentVal) || 0;
    setMemoryVal((m) => m - num);
    setIsNewNumber(true);
    sound.playBubble();
  };

  // Scientific Single-Op Functions
  const handleSciFunction = (fn: string) => {
    setErrorMsg(null);
    const num = parseFloat(currentVal) || 0;
    let res = 0;

    switch (fn) {
      case 'sqrt':
        if (num < 0) {
          setErrorMsg('Oopsie! ✨');
          sound.playError();
          return;
        }
        res = Math.sqrt(num);
        break;
      case 'sqr':
        res = num * num;
        break;
      case 'inv':
        if (num === 0) {
          setErrorMsg('Divide by zero');
          sound.playError();
          return;
        }
        res = 1 / num;
        break;
      case 'sin':
        res = Math.sin((num * Math.PI) / 180);
        break;
      case 'cos':
        res = Math.cos((num * Math.PI) / 180);
        break;
      case 'tan':
        res = Math.tan((num * Math.PI) / 180);
        break;
      case 'pi':
        res = Math.PI;
        break;
      case 'e':
        res = Math.E;
        break;
      default:
        return;
    }

    const cleaned = cleanNumber(res);
    setCurrentVal(cleaned);
    setIsNewNumber(true);
    sound.playBubble();
  };

  // Keyboard Event Listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input field (e.g. note or boutique tools)
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      setPressedKey(e.key);
      setTimeout(() => setPressedKey(null), 150);

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        handleOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleClear();
      } else if (e.key === '%') {
        handlePercentage();
      } else if (e.key === '(' || e.key === ')') {
        setExpression((prev) => prev + e.key + ' ');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDigit, handleDecimal, handleOperator, handleEquals, handleBackspace, handleClear, handlePercentage]);

  // Load from tape / helper into calculator
  const loadValueIntoCalc = (val: string) => {
    setCurrentVal(val);
    setIsNewNumber(true);
    setErrorMsg(null);
    sound.playBubble();
    setActiveTab('calculator');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-500 font-rounded`}>
      {/* Floating Sparkle / Heart Particle Overlay */}
      <SparkleOverlay particles={particles} />

      {/* Top Bar Contract (1 line Brand wordmark — Nav tabs — Action controls) */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8 border-b border-pink-200/50 dark:border-white/10 shrink-0">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <span className="text-2xl select-none" role="img" aria-label="ribbon">
            🎀
          </span>
          <span className="text-xl md:text-2xl font-bold tracking-tight text-rose-950 dark:text-rose-100 font-rounded">
            Chérie Calc
          </span>
          <span className="hidden sm:inline-block text-[11px] font-semibold text-rose-600 dark:text-rose-300 bg-pink-100/70 dark:bg-pink-950/60 px-2 py-0.5 rounded-full">
            Aesthetic Edition
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop view toggle) */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalcIcon className="w-4 h-4" />
            <span>Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tape')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'tape'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tape Diary</span>
            {history.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-bold">
                {history.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('boutique')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'boutique'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Boutique Helpers</span>
          </button>
        </nav>

        {/* Zone 3: Single Primary Action & Sensory Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <InstallButton />

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={isSoundOn ? 'Mute bubble & chime sounds' : 'Enable cute tactile audio'}
            className="p-2 rounded-xl border border-pink-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4 text-pink-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Quick Dark Mode / Theme Toggle */}
          <button
            type="button"
            onClick={() => setThemeId(currentTheme.isDark ? 'strawberry' : 'cybercherry')}
            title="Toggle Day / Night Princess mode"
            className="p-2 rounded-xl border border-pink-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
          >
            {currentTheme.isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-rose-400" />}
          </button>
        </div>
      </header>

      {/* Aesthetic Theme Carousel Strip */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-2 shrink-0 flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
          Aesthetic Theme:
        </span>
        <ThemeSelector
          currentThemeId={themeId}
          onSelectTheme={setThemeId}
          activeTheme={currentTheme}
        />
      </section>

      {/* Main Responsive Grid Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-6 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left/Center Column: Girlish Calculator Hardware Device (7 cols on Desktop) */}
          <div
            className={`
              lg:col-span-7 flex flex-col items-center justify-center
              ${activeTab !== 'calculator' ? 'hidden lg:flex' : 'flex'}
            `}
          >
            {/* The Physical Cute Calculator Chassis */}
            <div
              className={`
                w-full max-w-[420px] rounded-[32px] p-5 md:p-6
                backdrop-blur-md border transition-all duration-300 relative
                ${currentTheme.calcCardBg} ${currentTheme.calcCardBorder} ${currentTheme.calcCardShadow}
              `}
            >
              {/* Cute Hardware Bevel & Bow Top Accent */}
              <div className="flex items-center justify-between pb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎀</span>
                  <span className="text-xs font-bold tracking-wider uppercase text-rose-900/70 dark:text-rose-200/70">
                    {currentTheme.name}
                  </span>
                </div>
                
                {/* Solar Cell / Charm Strip */}
                <div className="flex items-center gap-1 p-1 rounded-md bg-amber-950/20 dark:bg-black/40 border border-amber-900/20">
                  <div className="w-3.5 h-3 bg-amber-800/40 rounded-xs"></div>
                  <div className="w-3.5 h-3 bg-amber-800/40 rounded-xs"></div>
                  <div className="w-3.5 h-3 bg-amber-800/40 rounded-xs"></div>
                  <div className="w-3.5 h-3 bg-amber-800/40 rounded-xs"></div>
                </div>
              </div>

              {/* Main Display Screen */}
              <Display
                expression={expression}
                currentValue={currentVal}
                memoryValue={memoryVal}
                theme={currentTheme}
                error={errorMsg}
              />

              {/* Memory & FX Function Bar */}
              <div className="grid grid-cols-5 gap-2 my-3">
                <button
                  type="button"
                  onClick={handleMemoryClear}
                  className="py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  MC
                </button>
                <button
                  type="button"
                  onClick={handleMemoryRecall}
                  className="py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  MR
                </button>
                <button
                  type="button"
                  onClick={handleMemoryAdd}
                  className="py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  M+
                </button>
                <button
                  type="button"
                  onClick={handleMemorySubtract}
                  className="py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  M-
                </button>
                <button
                  type="button"
                  onClick={() => setIsSciMode(!isSciMode)}
                  title="Toggle Scientific Math Functions"
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSciMode
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  fx 🌸
                </button>
              </div>

              {/* Scientific Mode Collapsible Sub-Keypad */}
              {isSciMode && (
                <div className="grid grid-cols-5 gap-2 p-2 mb-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-pink-200/50 dark:border-white/5 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => handleSciFunction('sqrt')}
                    className="py-1 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50"
                  >
                    √x
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSciFunction('sqr')}
                    className="py-1 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50"
                  >
                    x²
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSciFunction('inv')}
                    className="py-1 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50"
                  >
                    1/x
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSciFunction('pi')}
                    className="py-1 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50"
                  >
                    π
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSciFunction('e')}
                    className="py-1 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50"
                  >
                    e
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSciFunction('sin')}
                    className="py-1 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50"
                  >
                    sin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSciFunction('cos')}
                    className="py-1 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50"
                  >
                    cos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSciFunction('tan')}
                    className="py-1 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50"
                  >
                    tan
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpression((p) => p + '(')}
                    className="py-1 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50"
                  >
                    (
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpression((p) => p + ')')}
                    className="py-1 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-50"
                  >
                    )
                  </button>
                </div>
              )}

              {/* Main Keypad Grid (4 columns × 5 rows) */}
              <div className="grid grid-cols-4 gap-2.5 md:gap-3">
                {/* Row 1: Actions & Division */}
                <KeyButton
                  label={currentVal !== '0' && isNewNumber ? 'AC' : 'C'}
                  variant="action"
                  onClick={handleClear}
                  theme={currentTheme}
                  ariaLabel="Clear all"
                  isPressed={pressedKey === 'Escape' || pressedKey === 'c'}
                />
                <KeyButton
                  label="±"
                  variant="action"
                  onClick={handlePlusMinus}
                  theme={currentTheme}
                  ariaLabel="Negate value"
                />
                <KeyButton
                  label="%"
                  variant="action"
                  onClick={handlePercentage}
                  theme={currentTheme}
                  ariaLabel="Percent"
                  isPressed={pressedKey === '%'}
                />
                <KeyButton
                  label="÷"
                  variant="operator"
                  onClick={(e) => handleOperator('/', e)}
                  theme={currentTheme}
                  ariaLabel="Divide"
                  isPressed={pressedKey === '/'}
                />

                {/* Row 2: 7, 8, 9, × */}
                <KeyButton
                  label="7"
                  onClick={(e) => handleDigit('7', e)}
                  theme={currentTheme}
                  isPressed={pressedKey === '7'}
                />
                <KeyButton
                  label="8"
                  onClick={(e) => handleDigit('8', e)}
                  theme={currentTheme}
                  isPressed={pressedKey === '8'}
                />
                <KeyButton
                  label="9"
                  onClick={(e) => handleDigit('9', e)}
                  theme={currentTheme}
                  isPressed={pressedKey === '9'}
                />
                <KeyButton
                  label="×"
                  variant="operator"
                  onClick={(e) => handleOperator('*', e)}
                  theme={currentTheme}
                  ariaLabel="Multiply"
                  isPressed={pressedKey === '*'}
                />

                {/* Row 3: 4, 5, 6, − */}
                <KeyButton
                  label="4"
                  onClick={(e) => handleDigit('4', e)}
                  theme={currentTheme}
                  isPressed={pressedKey === '4'}
                />
                <KeyButton
                  label="5"
                  onClick={(e) => handleDigit('5', e)}
                  theme={currentTheme}
                  isPressed={pressedKey === '5'}
                />
                <KeyButton
                  label="6"
                  onClick={(e) => handleDigit('6', e)}
                  theme={currentTheme}
                  isPressed={pressedKey === '6'}
                />
                <KeyButton
                  label="−"
                  variant="operator"
                  onClick={(e) => handleOperator('-', e)}
                  theme={currentTheme}
                  ariaLabel="Minus"
                  isPressed={pressedKey === '-'}
                />

                {/* Row 4: 1, 2, 3, + */}
                <KeyButton
                  label="1"
                  onClick={(e) => handleDigit('1', e)}
                  theme={currentTheme}
                  isPressed={pressedKey === '1'}
                />
                <KeyButton
                  label="2"
                  onClick={(e) => handleDigit('2', e)}
                  theme={currentTheme}
                  isPressed={pressedKey === '2'}
                />
                <KeyButton
                  label="3"
                  onClick={(e) => handleDigit('3', e)}
                  theme={currentTheme}
                  isPressed={pressedKey === '3'}
                />
                <KeyButton
                  label="+"
                  variant="operator"
                  onClick={(e) => handleOperator('+', e)}
                  theme={currentTheme}
                  ariaLabel="Plus"
                  isPressed={pressedKey === '+'}
                />

                {/* Row 5: 0, ., ⌫, = */}
                <KeyButton
                  label="0"
                  onClick={(e) => handleDigit('0', e)}
                  theme={currentTheme}
                  isPressed={pressedKey === '0'}
                />
                <KeyButton
                  label="."
                  onClick={handleDecimal}
                  theme={currentTheme}
                  ariaLabel="Decimal"
                  isPressed={pressedKey === '.'}
                />
                <KeyButton
                  label={<Delete className="w-5 h-5 pointer-events-none" />}
                  variant="action"
                  onClick={handleBackspace}
                  theme={currentTheme}
                  ariaLabel="Backspace"
                  isPressed={pressedKey === 'Backspace'}
                />
                <KeyButton
                  label="="
                  variant="equals"
                  onClick={handleEquals}
                  theme={currentTheme}
                  ariaLabel="Calculate equals"
                  isPressed={pressedKey === '=' || pressedKey === 'Enter'}
                />
              </div>

              {/* Bottom Subtle Chic Branding Footnote */}
              <div className="flex items-center justify-center gap-1.5 pt-4 text-[11px] text-slate-400 dark:text-slate-500">
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>Designed with love for cute & accurate math</span>
              </div>
            </div>
          </div>

          {/* Right Column: Calculation Tape Diary & Boutique Tools (5 cols on Desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* On mobile, only display the active tab's card; on desktop, display both side-by-side gracefully */}
            <div className={`${activeTab === 'tape' ? 'block' : 'hidden lg:block'}`}>
              <TapeDiary
                history={history}
                onSelectResult={loadValueIntoCalc}
                onClearHistory={() => setHistory([])}
                onUpdateNote={(id, note) => {
                  setHistory((prev) =>
                    prev.map((item) => (item.id === id ? { ...item, note } : item))
                  );
                }}
                onDeleteItem={(id) => {
                  setHistory((prev) => prev.filter((item) => item.id !== id));
                }}
                theme={currentTheme}
              />
            </div>

            <div className={`${activeTab === 'boutique' ? 'block' : 'hidden lg:block'}`}>
              <BoutiqueTools
                theme={currentTheme}
                onSendToCalc={loadValueIntoCalc}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar (Fixed thumb zone) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-pink-200/60 dark:border-white/10 px-4 py-2">
        <div className="grid grid-cols-3 items-center">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'calculator'
                ? 'text-pink-600 dark:text-pink-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CalcIcon className="w-5 h-5" />
            <span className="text-[11px] mt-0.5">Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tape')}
            className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
              activeTab === 'tape'
                ? 'text-pink-600 dark:text-pink-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className="relative">
              <BookOpen className="w-5 h-5" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {history.length}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5">Tape Diary</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('boutique')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'boutique'
                ? 'text-pink-600 dark:text-pink-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[11px] mt-0.5">Boutique</span>
          </button>
        </div>
      </footer>

      <InstallPrompt accentClass={currentTheme.accentText} />
    </div>
  );
}
