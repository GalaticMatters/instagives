export default function ToolLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6" role="status">
      <div className="h-4 w-24 rounded-full bg-blush/80" />
      <div className="mt-4 h-10 w-64 max-w-full rounded-2xl bg-white/80" />
      <p className="mt-6 text-sm text-muted-foreground">Opening this tool…</p>
    </div>
  );
}
