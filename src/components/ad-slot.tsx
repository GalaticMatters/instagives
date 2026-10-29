export function AdSlot() {
  return (
    <aside
      aria-label="Advertisement"
      className="flex items-center gap-3 rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-sm shadow-sm"
    >
      <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-background uppercase">
        Ad
      </span>
      <p className="text-muted-foreground">One slim placement on this page. No popup, no video, no takeover.</p>
    </aside>
  );
}
