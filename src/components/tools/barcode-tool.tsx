"use client";

import { useRef, useState } from "react";
import { downloadBlob } from "@/lib/download";
import { ErrorNote, LoadingNote } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BarcodeTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("INSTAGIVES");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    const value = text.trim();
    if (!value) {
      setError("Enter the text to encode.");
      setReady(false);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      setError("The drawing surface is not ready. Try again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const JsBarcode = (await import("jsbarcode")).default;
      JsBarcode(canvas, value, {
        format: "CODE128",
        displayValue: true,
        margin: 16,
        background: "#fffaf7",
        lineColor: "#3a2430",
        height: 96,
        fontSize: 16,
      });
      setReady(true);
    } catch {
      setReady(false);
      setError("That text cannot be a Code 128 barcode. Use letters, numbers, and common symbols.");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("The barcode could not be saved from this browser.");
        return;
      }
      downloadBlob(blob, "instagives-barcode.png");
    }, "image/png");
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="barcode-text">Text</Label>
        <Input id="barcode-text" value={text} onChange={(event) => setText(event.target.value)} className="h-10 bg-white/80" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="h-10" onClick={() => void generate()}>
          Make barcode
        </Button>
        <Button type="button" variant="outline" className="h-10 bg-white/80" disabled={!ready} onClick={download}>
          Download PNG
        </Button>
      </div>
      {loading ? <LoadingNote>Drawing the barcode…</LoadingNote> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      <canvas
        ref={canvasRef}
        className={`max-w-full rounded-2xl bg-white ring-1 ring-black/5 ${ready ? "" : "hidden"}`}
        role="img"
        aria-label={ready ? `Barcode for ${text.trim()}` : "Barcode preview"}
      />
      {!ready && !loading ? <p className="text-sm text-muted-foreground">The barcode appears here after you make it.</p> : null}
    </div>
  );
}
