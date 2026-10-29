import { AdSlot } from "@/components/ad-slot";
import { Directory } from "@/components/directory";
import { countTools } from "@/lib/catalog";

export default function HomePage() {
  const counts = countTools();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex max-w-2xl flex-col gap-4">
        <h1 className="font-display text-4xl tracking-tight text-balance sm:text-5xl">Free tools, kept simple.</h1>
        <p className="text-base leading-7 text-muted-foreground">
          Instagives is the tool directory for instafives.com. Open a tool in a new tab and leave this list where it is. {counts.apps} tools run in the browser. {counts.guides} names are guides, because a safe in-browser version is not here yet.
        </p>
        <AdSlot />
      </div>
      <Directory />
    </div>
  );
}
