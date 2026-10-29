import type { ReactNode } from "react";

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-2xl bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
      {children}
    </p>
  );
}

export function LoadingNote({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function UnavailableNote({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="rounded-2xl border border-dashed border-foreground/15 bg-sand/40 px-4 py-5">
      <p className="font-medium">Not available in the browser yet</p>
      <div className="mt-1 text-sm leading-6 text-muted-foreground">{children}</div>
    </div>
  );
}
