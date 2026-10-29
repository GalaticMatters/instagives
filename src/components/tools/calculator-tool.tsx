"use client";

import { useState, type KeyboardEvent } from "react";
import { calcInput, initialCalc, type CalcState } from "@/lib/calculator";
import { Button } from "@/components/ui/button";

const keys = ["c", "back", "%", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "±", "0", ".", "="] as const;

const labels: Record<string, string> = {
  c: "C",
  back: "⌫",
  "%": "%",
  "/": "÷",
  "*": "×",
  "-": "−",
  "+": "+",
  "±": "±",
  "=": "=",
};

function tone(key: string) {
  if (key === "=") return "default" as const;
  if (key === "c" || key === "back") return "secondary" as const;
  if ("/*-+".includes(key)) return "outline" as const;
  return "outline" as const;
}

export function CalculatorTool() {
  const [state, setState] = useState<CalcState>(initialCalc);

  function press(key: string) {
    setState((current) => calcInput(current, key));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const mapped: Record<string, string> = {
      Enter: "=",
      Escape: "c",
      Backspace: "back",
      x: "*",
      X: "*",
    };
    const key = mapped[event.key] ?? event.key;
    const known = /^[0-9.%]$/.test(key) || ["+", "-", "*", "/", "=", "c", "back", "±"].includes(key);
    if (!known) return;
    event.preventDefault();
    press(key);
  }

  return (
    <div className="grid gap-4 outline-none" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="rounded-2xl bg-peach/40 px-4 py-5 text-right" aria-live="polite">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {state.op ? `Stored ${state.stored ?? ""}` : "Result"}
        </p>
        <p className="font-display mt-1 text-4xl tracking-tight break-all">{state.display}</p>
        {state.error ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Click the keys, or type while this panel is focused.</p>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {keys.map((key) => (
          <Button
            key={key}
            type="button"
            variant={tone(key)}
            className={`h-14 text-lg ${key === "0" ? "" : ""} ${key === "=" ? "" : "bg-white/80"}`}
            onClick={() => press(key)}
          >
            {labels[key] ?? key}
          </Button>
        ))}
      </div>
    </div>
  );
}
