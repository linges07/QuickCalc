import { useState } from 'react';
import { Delete } from 'lucide-react';

type Operation = '+' | '-' | '×' | '÷' | null;

interface CalcState {
  display: string;
  previous: string;
  operation: Operation;
  waitingForOperand: boolean;
}

const initialState: CalcState = {
  display: '0',
  previous: '',
  operation: null,
  waitingForOperand: false,
};

const formatResult = (n: number): string => {
  if (!isFinite(n)) return 'Error';
  return parseFloat(n.toPrecision(12)).toString();
};

const calculate = (a: number, b: number, op: Operation): number => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : NaN;
    default: return b;
  }
};

export default function App() {
  const [state, setState] = useState<CalcState>(initialState);

  const inputDigit = (digit: string) => {
    setState((prev) => {
      if (prev.waitingForOperand) {
        return { ...prev, display: digit, waitingForOperand: false };
      }
      if (prev.display === '0' && digit !== '.') return { ...prev, display: digit };
      if (digit === '.' && prev.display.includes('.')) return prev;
      return { ...prev, display: prev.display + digit };
    });
  };

  const inputOperation = (op: Operation) => {
    setState((prev) => {
      if (prev.operation && !prev.waitingForOperand) {
        const result = calculate(parseFloat(prev.previous), parseFloat(prev.display), prev.operation);
        const resultStr = formatResult(result);
        return { display: resultStr, previous: resultStr, operation: op, waitingForOperand: true };
      }
      return { ...prev, previous: prev.display, operation: op, waitingForOperand: true };
    });
  };

  const handleEquals = () => {
    setState((prev) => {
      if (!prev.operation || prev.waitingForOperand) return prev;
      const result = calculate(parseFloat(prev.previous), parseFloat(prev.display), prev.operation);
      return { display: formatResult(result), previous: '', operation: null, waitingForOperand: true };
    });
  };

  const handleClear = () => setState(initialState);

  const handleBackspace = () => {
    setState((prev) => {
      if (prev.waitingForOperand) return prev;
      const next = prev.display.length > 1 ? prev.display.slice(0, -1) : '0';
      return { ...prev, display: next };
    });
  };

  const handleToggleSign = () => {
    setState((prev) => ({
      ...prev,
      display: prev.display.startsWith('-') ? prev.display.slice(1) : prev.display === '0' ? '0' : '-' + prev.display,
    }));
  };

  const handlePercent = () => {
    setState((prev) => ({ ...prev, display: formatResult(parseFloat(prev.display) / 100) }));
  };

  const expressionDisplay = state.operation && state.previous ? `${state.previous} ${state.operation}` : '';

  const displayFontSize =
    state.display.length > 12 ? 'text-2xl' :
    state.display.length > 8 ? 'text-3xl' :
    state.display.length > 5 ? 'text-4xl' : 'text-5xl';

  type Variant = 'function' | 'operator' | 'number' | 'equals';

  const buttons: Array<{ label: React.ReactNode; action: () => void; variant: Variant }> = [
    { label: 'AC', action: handleClear, variant: 'function' },
    { label: '+/-', action: handleToggleSign, variant: 'function' },
    { label: '%', action: handlePercent, variant: 'function' },
    { label: '÷', action: () => inputOperation('÷'), variant: 'operator' },
    { label: '7', action: () => inputDigit('7'), variant: 'number' },
    { label: '8', action: () => inputDigit('8'), variant: 'number' },
    { label: '9', action: () => inputDigit('9'), variant: 'number' },
    { label: '×', action: () => inputOperation('×'), variant: 'operator' },
    { label: '4', action: () => inputDigit('4'), variant: 'number' },
    { label: '5', action: () => inputDigit('5'), variant: 'number' },
    { label: '6', action: () => inputDigit('6'), variant: 'number' },
    { label: '-', action: () => inputOperation('-'), variant: 'operator' },
    { label: '1', action: () => inputDigit('1'), variant: 'number' },
    { label: '2', action: () => inputDigit('2'), variant: 'number' },
    { label: '3', action: () => inputDigit('3'), variant: 'number' },
    { label: '+', action: () => inputOperation('+'), variant: 'operator' },
    { label: <Delete size={18} />, action: handleBackspace, variant: 'function' },
    { label: '0', action: () => inputDigit('0'), variant: 'number' },
    { label: '.', action: () => inputDigit('.'), variant: 'number' },
    { label: '=', action: handleEquals, variant: 'equals' },
  ];

  const baseClasses: Record<Variant, string> = {
    function: 'bg-slate-600 hover:bg-slate-500 text-white',
    operator: 'bg-amber-500 hover:bg-amber-400 text-white',
    number: 'bg-slate-700 hover:bg-slate-600 text-white',
    equals: 'bg-amber-500 hover:bg-amber-400 text-white',
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-80 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50" style={{ background: '#1c1c1e' }}>
        {/* Display */}
        <div className="px-6 pt-8 pb-5 flex flex-col items-end min-h-[130px] justify-end">
          <p className="text-slate-400 text-sm h-5 mb-2 tracking-wide font-light">{expressionDisplay}</p>
          <p
            className={`text-white font-light tracking-tight transition-all duration-100 leading-none ${displayFontSize}`}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {state.display}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-700/60 mx-4" />

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-1 p-3">
          {buttons.map((btn, i) => {
            const isActiveOp = btn.variant === 'operator' && state.operation === btn.label && state.waitingForOperand;
            return (
              <button
                key={i}
                onClick={btn.action}
                className={`
                  flex items-center justify-center
                  h-16 rounded-2xl text-xl font-medium
                  transition-all duration-100 active:scale-90 active:brightness-75
                  select-none cursor-pointer
                  ${baseClasses[btn.variant]}
                  ${isActiveOp ? 'ring-2 ring-white/70 brightness-110' : ''}
                `}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        <div className="pb-3 text-center">
          <span className="text-slate-600 text-xs tracking-widest uppercase">Calculator</span>
        </div>
      </div>
    </div>
  );
}
