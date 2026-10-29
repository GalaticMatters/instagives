export type Op = "+" | "-" | "*" | "/";

export type CalcState = {
  display: string;
  stored: number | null;
  op: Op | null;
  fresh: boolean;
  error: string | null;
};

export const initialCalc: CalcState = {
  display: "0",
  stored: null,
  op: null,
  fresh: true,
  error: null,
};

function formatCalc(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Math.round(value * 1e10) / 1e10;
  const text = Object.is(rounded, -0) ? "0" : String(rounded);
  if (text.replace("-", "").length > 12) return rounded.toExponential(6);
  return text;
}

function compute(left: number, right: number, op: Op): number | "div0" {
  if (op === "+") return left + right;
  if (op === "-") return left - right;
  if (op === "*") return left * right;
  if (right === 0) return "div0";
  return left / right;
}

function apply(state: CalcState): { value: number } | { error: string } {
  const current = Number(state.display);
  if (!Number.isFinite(current)) return { error: "Enter a number first." };
  if (state.stored === null || state.op === null) return { value: current };
  const result = compute(state.stored, current, state.op);
  if (result === "div0") return { error: "Can't divide by zero." };
  return { value: result };
}

const operators = new Set<string>(["+", "-", "*", "/"]);

export function calcInput(state: CalcState, key: string): CalcState {
  if (key === "c") return initialCalc;

  if (state.error) {
    if (/^[0-9.]$/.test(key)) state = initialCalc;
    else return state;
  }

  if (key >= "0" && key <= "9") {
    if (state.fresh || state.display === "0") {
      return { ...state, display: key, fresh: false, error: null };
    }
    if (state.display.replace("-", "").replace(".", "").length >= 12) return state;
    return { ...state, display: state.display + key };
  }

  if (key === ".") {
    if (state.fresh) return { ...state, display: "0.", fresh: false, error: null };
    if (state.display.includes(".")) return state;
    return { ...state, display: state.display + "." };
  }

  if (key === "back") {
    if (state.fresh) return state;
    const next = state.display.slice(0, -1);
    if (next === "" || next === "-") return { ...state, display: "0", fresh: true };
    return { ...state, display: next };
  }

  if (key === "%") {
    const current = Number(state.display);
    if (!Number.isFinite(current)) {
      return { ...initialCalc, display: "Error", error: "Enter a number first." };
    }
    return { ...state, display: formatCalc(current / 100), fresh: true, error: null };
  }

  if (key === "±") {
    if (state.display === "0") return state;
    const display = state.display.startsWith("-") ? state.display.slice(1) : `-${state.display}`;
    return { ...state, display, fresh: false, error: null };
  }

  if (operators.has(key)) {
    const op = key as Op;
    if (state.fresh && state.op && state.stored !== null) {
      return { ...state, op };
    }
    const applied = apply(state);
    if ("error" in applied) {
      return { ...initialCalc, display: "Error", error: applied.error };
    }
    return {
      display: formatCalc(applied.value),
      stored: applied.value,
      op,
      fresh: true,
      error: null,
    };
  }

  if (key === "=") {
    const applied = apply(state);
    if ("error" in applied) {
      return { ...initialCalc, display: "Error", error: applied.error };
    }
    return {
      display: formatCalc(applied.value),
      stored: null,
      op: null,
      fresh: true,
      error: null,
    };
  }

  return state;
}
