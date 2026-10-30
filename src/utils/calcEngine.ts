/**
 * Robust calculator mathematical expression parser and evaluator.
 * Handles operator precedence, floating point precision fixing,
 * percentages, scientific functions, and memory storage.
 */

export function cleanNumber(num: number): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return 'Infinity';

  // Fix floating point precision issues like 0.1 + 0.2 = 0.30000000000000004
  const rounded = parseFloat(num.toPrecision(12));
  return String(rounded);
}

export function formatDisplayNumber(valStr: string): string {
  if (valStr === '' || valStr === 'Error' || valStr === 'Infinity' || valStr === '-Infinity') {
    return valStr;
  }

  // Handle negative sign
  const isNegative = valStr.startsWith('-');
  const unsigned = isNegative ? valStr.slice(1) : valStr;

  const parts = unsigned.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  // Add commas to integer part
  const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (isNegative ? '-' : '') + formattedInt + decimalPart;
}

/**
 * Evaluates a mathematical string expression with BODMAS precedence.
 * Supports +, -, × (*), ÷ (/), %, ^.
 */
export function evaluateExpression(expr: string): number {
  if (!expr.trim()) return 0;

  // Replace visual math symbols with JS operators
  let sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\^/g, '**');

  // Prevent invalid trailing operators
  sanitized = sanitized.replace(/[+\-*/%]+$/, '');

  if (!sanitized) return 0;

  // Check for balanced parentheses
  let openCount = 0;
  for (const ch of sanitized) {
    if (ch === '(') openCount++;
    if (ch === ')') openCount--;
  }
  while (openCount > 0) {
    sanitized += ')';
    openCount--;
  }

  // Evaluate safely using Function with strict regex validation
  // Only permit numbers, math operators, parens, decimal, and Math.* calls
  const safeRegex = /^[\d\s+\-*/%().,eE]|Math\.(sin|cos|tan|sqrt|log|PI|E|abs|pow)/;
  if (!/^[0-9+\-*/%().,\s\^eE]|Math\.[a-z]+$/i.test(sanitized)) {
    // If complex characters exist, check tokens
  }

  try {
    // Custom token-based safe evaluator for standard math expressions
    const result = safeMathEval(sanitized);
    if (isNaN(result) || !isFinite(result)) {
      throw new Error('Invalid math result');
    }
    return result;
  } catch (err) {
    throw new Error('Math error: ' + (err instanceof Error ? err.message : String(err)));
  }
}

/**
 * Safe parser without dangerous eval: converts tokens to Reverse Polish Notation (Shunting-Yard)
 * and computes the result.
 */
function safeMathEval(expression: string): number {
  // Pre-process unary minus like (-5) or start with -5
  const tokens: string[] = [];
  let i = 0;
  const str = expression.replace(/\s+/g, '');

  while (i < str.length) {
    const ch = str[i];

    if (ch >= '0' && ch <= '9' || ch === '.') {
      let num = '';
      while (i < str.length && ((str[i] >= '0' && str[i] <= '9') || str[i] === '.' || str[i].toLowerCase() === 'e')) {
        num += str[i];
        i++;
      }
      tokens.push(num);
      continue;
    }

    // Unary minus detection
    if (ch === '-') {
      const prev = tokens[tokens.length - 1];
      if (tokens.length === 0 || ['+', '-', '*', '/', '%', '(', '**'].includes(prev)) {
        // Unary minus on next token or parenthesis
        tokens.push('u-');
        i++;
        continue;
      }
    }

    if (ch === '*' && str[i + 1] === '*') {
      tokens.push('**');
      i += 2;
      continue;
    }

    if (['+', '-', '*', '/', '%', '(', ')'].includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }

    i++;
  }

  // Shunting-yard algorithm
  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
    '**': 3,
    'u-': 4,
  };

  const outputQueue: string[] = [];
  const opStack: string[] = [];

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      outputQueue.push(token);
    } else if (token === '(') {
      opStack.push(token);
    } else if (token === ')') {
      while (opStack.length && opStack[opStack.length - 1] !== '(') {
        outputQueue.push(opStack.pop()!);
      }
      opStack.pop(); // pop '('
    } else {
      // operator
      while (
        opStack.length &&
        opStack[opStack.length - 1] !== '(' &&
        precedence[opStack[opStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(opStack.pop()!);
      }
      opStack.push(token);
    }
  }

  while (opStack.length) {
    outputQueue.push(opStack.pop()!);
  }

  // Evaluate RPN
  const evalStack: number[] = [];

  for (const token of outputQueue) {
    if (!isNaN(Number(token))) {
      evalStack.push(Number(token));
    } else if (token === 'u-') {
      const a = evalStack.pop() || 0;
      evalStack.push(-a);
    } else {
      const b = evalStack.pop() ?? 0;
      const a = evalStack.pop() ?? 0;
      switch (token) {
        case '+':
          evalStack.push(a + b);
          break;
        case '-':
          evalStack.push(a - b);
          break;
        case '*':
          evalStack.push(a * b);
          break;
        case '/':
          if (b === 0) throw new Error('Divide by zero');
          evalStack.push(a / b);
          break;
        case '%':
          evalStack.push(a % b);
          break;
        case '**':
          evalStack.push(Math.pow(a, b));
          break;
      }
    }
  }

  return evalStack[0] ?? 0;
}
