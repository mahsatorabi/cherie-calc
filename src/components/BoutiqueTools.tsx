import React, { useState } from 'react';
import { BoutiqueSubTab, ThemeConfig } from '../types/calculator';
import { ShoppingBag, Users, Cake, Sparkles, Copy, Check, ArrowRight, RotateCcw } from 'lucide-react';
import { formatDisplayNumber } from '../utils/calcEngine';

interface BoutiqueToolsProps {
  theme: ThemeConfig;
  onSendToCalc: (val: string) => void;
}

export const BoutiqueTools: React.FC<BoutiqueToolsProps> = ({ theme, onSendToCalc }) => {
  const [activeTab, setActiveTab] = useState<BoutiqueSubTab>('discount');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyFeedback = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 1800);
  };

  // 1. Discount State
  const [origPrice, setOrigPrice] = useState('120');
  const [discountPercent, setDiscountPercent] = useState('30');
  const [extraCoupon, setExtraCoupon] = useState('10');
  const [taxPercent, setTaxPercent] = useState('8.5');

  const pPrice = parseFloat(origPrice) || 0;
  const pDisc = parseFloat(discountPercent) || 0;
  const pExtra = parseFloat(extraCoupon) || 0;
  const pTax = parseFloat(taxPercent) || 0;

  // Calculation
  const afterFirstDiscount = pPrice * (1 - pDisc / 100);
  const afterExtraCoupon = afterFirstDiscount * (1 - pExtra / 100);
  const taxAmount = afterExtraCoupon * (pTax / 100);
  const finalDiscountedPrice = afterExtraCoupon + taxAmount;
  const totalSaved = Math.max(0, pPrice - afterExtraCoupon);

  // 2. Bill Splitter State
  const [billSubtotal, setBillSubtotal] = useState('85.00');
  const [tipRate, setTipRate] = useState('18');
  const [customTip, setCustomTip] = useState('');
  const [numPeople, setNumPeople] = useState(4);
  const [roundUp, setRoundUp] = useState(true);

  const pBill = parseFloat(billSubtotal) || 0;
  const effectiveTipRate = customTip !== '' ? parseFloat(customTip) || 0 : parseFloat(tipRate) || 0;
  const totalTip = pBill * (effectiveTipRate / 100);
  const rawGrandTotal = pBill + totalTip;
  const rawPerPerson = numPeople > 0 ? rawGrandTotal / numPeople : rawGrandTotal;
  const effectivePerPerson = roundUp ? Math.ceil(rawPerPerson) : Math.round(rawPerPerson * 100) / 100;
  const adjustedGrandTotal = effectivePerPerson * numPeople;

  // 3. Baking Scaler State
  const [recipeOrigServings, setRecipeOrigServings] = useState('4');
  const [recipeTargetServings, setRecipeTargetServings] = useState('6');
  const [ingredientQty, setIngredientQty] = useState('2.5');
  const [ingredientUnit, setIngredientUnit] = useState('cups');

  const origS = parseFloat(recipeOrigServings) || 1;
  const targS = parseFloat(recipeTargetServings) || 1;
  const scaleMultiplier = targS / origS;
  const scaledQty = (parseFloat(ingredientQty) || 0) * scaleMultiplier;

  // 4. Beauty Unit Converter
  const [converterType, setConverterType] = useState<'ml_floz' | 'g_oz' | 'c_f'>('ml_floz');
  const [convertInput, setConvertInput] = useState('100');

  const numVal = parseFloat(convertInput) || 0;
  let convertResult = '';
  let unitLabel = '';

  if (converterType === 'ml_floz') {
    // 1 ml = 0.033814 fl oz
    const flOz = numVal * 0.033814;
    convertResult = `${flOz.toFixed(2)} fl oz`;
    unitLabel = `${numVal} ml = ${flOz.toFixed(2)} fl oz ${flOz <= 3.4 ? '✈️ TSA Travel Approved!' : '⚠️ Exceeds TSA 3.4 oz limit'}`;
  } else if (converterType === 'g_oz') {
    // 1 g = 0.035274 oz
    const oz = numVal * 0.035274;
    convertResult = `${oz.toFixed(2)} oz`;
    unitLabel = `${numVal} g = ${oz.toFixed(2)} oz`;
  } else {
    // Celsius to Fahrenheit
    const f = (numVal * 9) / 5 + 32;
    convertResult = `${f.toFixed(1)} °F`;
    unitLabel = `${numVal} °C = ${f.toFixed(1)} °F`;
  }

  return (
    <div
      className={`
        flex flex-col h-full rounded-2xl md:rounded-3xl p-4 md:p-5
        border transition-all duration-300
        ${theme.calcCardBg} ${theme.calcCardBorder} ${theme.calcCardShadow}
      `}
    >
      {/* Boutique Sub-tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('discount')}
          className={`
            py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all
            ${activeTab === 'discount' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}
          `}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sale</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bill')}
          className={`
            py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all
            ${activeTab === 'bill' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}
          `}
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Split</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recipe')}
          className={`
            py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all
            ${activeTab === 'recipe' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}
          `}
        >
          <Cake className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Bake</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('units')}
          className={`
            py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all
            ${activeTab === 'units' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}
          `}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Beauty</span>
        </button>
      </div>

      {/* 1. DISCOUNT TAB */}
      {activeTab === 'discount' && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                🛍️ Sale & Splurge Calculator
              </span>
              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-medium">
                Stackable Promo Codes
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Original Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={origPrice}
                  onChange={(e) => setOrigPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Primary Discount %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>
            </div>

            {/* Quick Discount Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[15, 20, 30, 40, 50, 70].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiscountPercent(String(d))}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                    discountPercent === String(d)
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white/80 dark:bg-white/5 border-pink-100 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-pink-50'
                  }`}
                >
                  {d}%
                </button>
              ))}
            </div>

            {/* Stackable Coupon & Tax */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Extra VIP Coupon %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={extraCoupon}
                  onChange={(e) => setExtraCoupon(e.target.value)}
                  placeholder="e.g. 15% off"
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Sales Tax %
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-purple-950/30 border border-pink-200/80 dark:border-pink-900/40 space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">You Pay:</span>
              <span className="font-tape font-bold text-xl text-rose-600 dark:text-rose-400">
                ${finalDiscountedPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-pink-200/60 dark:border-white/5">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Total Saved:
              </span>
              <span className="font-tape font-bold text-emerald-700 dark:text-emerald-400">
                ${totalSaved.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => onSendToCalc(finalDiscountedPrice.toFixed(2))}
                className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-xl bg-pink-500 hover:bg-pink-600 text-white transition-colors flex items-center justify-center gap-1"
              >
                Send ${finalDiscountedPrice.toFixed(2)} to Calc
              </button>
              <button
                type="button"
                onClick={() =>
                  copyFeedback(
                    `Original: $${pPrice.toFixed(2)} -> You Pay: $${finalDiscountedPrice.toFixed(2)} (Saved $${totalSaved.toFixed(2)}) 💕`,
                    'discount'
                  )
                }
                className="py-1.5 px-2.5 text-xs font-medium rounded-xl border border-pink-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                title="Copy discount summary"
              >
                {copiedText === 'discount' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BILL & BOBA SPLITTER TAB */}
      {activeTab === 'bill' && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                🍰 Boba & Brunch Splitter
              </span>
              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-medium">
                No Awkward Pennies
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Subtotal Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={billSubtotal}
                onChange={(e) => setBillSubtotal(e.target.value)}
                className="w-full px-3 py-1.5 text-sm font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {/* Tip Percentage Buttons */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Tip Percentage
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[15, 18, 20, 25].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setTipRate(String(rate));
                      setCustomTip('');
                    }}
                    className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                      tipRate === String(rate) && customTip === ''
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white/80 dark:bg-white/5 border-pink-100 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  className="px-1 text-center text-xs font-semibold rounded-lg border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>
            </div>

            {/* Number of Friends Stepper */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Number of Besties 👭
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNumPeople((n) => Math.max(1, n - 1))}
                  className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-slate-800 text-pink-700 dark:text-pink-300 font-bold flex items-center justify-center hover:bg-pink-200 transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-sm text-slate-800 dark:text-slate-100">
                  {numPeople}
                </span>
                <button
                  type="button"
                  onClick={() => setNumPeople((n) => n + 1)}
                  className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-slate-800 text-pink-700 dark:text-pink-300 font-bold flex items-center justify-center hover:bg-pink-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Round up switch */}
            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={roundUp}
                onChange={(e) => setRoundUp(e.target.checked)}
                className="rounded accent-pink-500 w-4 h-4"
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Round up to nearest dollar ($) for clean Venmo/Zelle
              </span>
            </label>
          </div>

          {/* Bill Summary Result */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-purple-950/30 border border-pink-200/80 dark:border-pink-900/40 space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Per Person Share:
              </span>
              <span className="font-tape font-bold text-2xl text-rose-600 dark:text-rose-400">
                ${effectivePerPerson.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-pink-200/60 dark:border-white/5">
              <span>Tip: ${totalTip.toFixed(2)} ({effectiveTipRate}%)</span>
              <span>Total: ${adjustedGrandTotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  copyFeedback(
                    `Hey besties! The bill total is $${adjustedGrandTotal.toFixed(2)}. That's $${effectivePerPerson.toFixed(2)} each! 💕`,
                    'bill'
                  )
                }
                className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-xl bg-pink-500 hover:bg-pink-600 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedText === 'bill' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied for Group Chat! 💕</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy for Group Chat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BAKING SCALER TAB */}
      {activeTab === 'recipe' && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                🧁 Baking Recipe Scaler
              </span>
              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-medium">
                Perfect Batch Math
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Original Servings
                </label>
                <input
                  type="number"
                  min="1"
                  value={recipeOrigServings}
                  onChange={(e) => setRecipeOrigServings(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Desired Servings
                </label>
                <input
                  type="number"
                  min="1"
                  value={recipeTargetServings}
                  onChange={(e) => setRecipeTargetServings(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>
            </div>

            {/* Multiplier Badge */}
            <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-center border border-pink-200/60 dark:border-pink-900/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">Scale Factor: </span>
              <span className="font-tape font-bold text-sm text-pink-600 dark:text-pink-300">
                {scaleMultiplier.toFixed(2)}×
              </span>
            </div>

            {/* Test Ingredient Calculator */}
            <div className="pt-1">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Quick Ingredient Amount to Scale:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={ingredientQty}
                  onChange={(e) => setIngredientQty(e.target.value)}
                  className="w-24 px-3 py-1.5 text-xs font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
                <input
                  type="text"
                  value={ingredientUnit}
                  onChange={(e) => setIngredientUnit(e.target.value)}
                  placeholder="cups / grams / tsp"
                  className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>
            </div>
          </div>

          {/* Scaled Output Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-purple-950/30 border border-pink-200/80 dark:border-pink-900/40 space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Scaled Ingredient:
              </span>
              <span className="font-tape font-bold text-xl text-rose-600 dark:text-rose-400">
                {scaledQty.toFixed(2)} {ingredientUnit}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSendToCalc(scaledQty.toFixed(2))}
              className="w-full py-1.5 px-2 text-xs font-semibold rounded-xl bg-pink-500 hover:bg-pink-600 text-white transition-colors"
            >
              Use {scaledQty.toFixed(2)} in Calculator
            </button>
          </div>
        </div>
      )}

      {/* 4. BEAUTY & UNITS TAB */}
      {activeTab === 'units' && (
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                🌸 Beauty & Skincare Travel Units
              </span>
              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-medium">
                TSA Approved Check
              </span>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'ml_floz', label: 'ml ⇄ fl oz' },
                { id: 'g_oz', label: 'g ⇄ oz' },
                { id: 'c_f', label: '°C ⇄ °F' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setConverterType(t.id as 'ml_floz' | 'g_oz' | 'c_f')}
                  className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                    converterType === t.id
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white/80 dark:bg-white/5 border-pink-100 dark:border-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Amount ({converterType === 'ml_floz' ? 'Milliliters ml' : converterType === 'g_oz' ? 'Grams g' : 'Celsius °C'})
              </label>
              <input
                type="number"
                step="any"
                value={convertInput}
                onChange={(e) => setConvertInput(e.target.value)}
                className="w-full px-3 py-1.5 text-sm font-semibold rounded-xl border border-pink-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {/* Quick Presets for Skincare / TSA */}
            {converterType === 'ml_floz' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[30, 50, 100, 150, 250].map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() => setConvertInput(String(ml))}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg border border-pink-200/80 bg-white/70 dark:bg-slate-800 hover:bg-pink-50 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {ml}ml
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Converted Output Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-purple-950/30 border border-pink-200/80 dark:border-pink-900/40 space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Converted:</span>
              <span className="font-tape font-bold text-2xl text-rose-600 dark:text-rose-400">
                {convertResult}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {unitLabel}
            </p>
            <button
              type="button"
              onClick={() => onSendToCalc(String(parseFloat(convertResult) || 0))}
              className="w-full py-1.5 px-2 text-xs font-semibold rounded-xl bg-pink-500 hover:bg-pink-600 text-white transition-colors"
            >
              Send Value to Calculator
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
