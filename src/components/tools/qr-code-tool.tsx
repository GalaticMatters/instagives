"use client";

import { useState } from "react";
import { ErrorNote, LoadingNote } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function QrCodeTool() {
  const [text, setText] = useState("https://instafives.com");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    const value = text.trim();
    if (!value) {
      setError("Enter a link or some text first.");
      setDataUrl(null);
      return;
    }
    if (value.length > 2000) {
      setError("Keep the text under 2,000 characters so the code stays readable.");
      setDataUrl(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(value, {
        margin: 2,
        width: 320,
        errorCorrectionLevel: "M",
        color: { dark: "#3a2430", light: "#fffaf7" },
      });
      setDataUrl(url);
    } catch {
      setDataUrl(null);
      setError("The QR code could not be created. Try a shorter note.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="qr-text">Link or text</Label>
        <Textarea id="qr-text" value={text} onChange={(event) => setText(event.target.value)} className="min-h-28 bg-white/80" />
      </div>
      <Button type="button" className="h-10 w-full sm:w-fit" onClick={() => void generate()}>
        Make QR code
      </Button>
      {loading ? <LoadingNote>Drawing the code…</LoadingNote> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {dataUrl ? (
        <div className="flex flex-col items-start gap-3">
          {/* The data URL is generated in this browser from the text above. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="Generated QR code" className="h-56 w-56 rounded-2xl bg-white ring-1 ring-black/5" />
          <a href={dataUrl} download="instagives-qr.png" className="text-sm font-medium text-primary hover:underline">
            Download PNG
          </a>
        </div>
      ) : null}
    </div>
  );
}
