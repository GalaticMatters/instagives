"use client";

import { useState } from "react";
import { downloadBlob, formatBytes, safeFileName } from "@/lib/download";
import { ErrorNote, LoadingNote, UnavailableNote } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChoiceField } from "@/components/choice-field";

const imageTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

async function decodeImage(file: File) {
  if (typeof createImageBitmap === "function") return createImageBitmap(file);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawToBlob(source: CanvasImageSource, width: number, height: number, type: string, quality: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("canvas"));
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  if (source instanceof ImageBitmap) source.close();
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("encode"));
      else resolve(blob);
    }, type, quality);
  });
}

export function ImageResizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lock, setLock] = useState(true);
  const [aspect, setAspect] = useState(1);
  const [format, setFormat] = useState("image/png");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function onFile(next: File | null) {
    setError(null);
    setUnavailable(null);
    setNote(null);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return next ? URL.createObjectURL(next) : null;
    });
    setFile(next);
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setUnavailable(`${next.name} is not an image this page can resize.`);
      return;
    }
    if (!imageTypes.has(next.type) && next.type !== "image/bmp") {
      setUnavailable(`${next.type || "This format"} is not available in the browser yet.`);
      return;
    }
    setLoading(true);
    try {
      const decoded = await decodeImage(next);
      const naturalWidth = "width" in decoded ? decoded.width : 0;
      const naturalHeight = "height" in decoded ? decoded.height : 0;
      if ("close" in decoded && typeof decoded.close === "function") decoded.close();
      if (!naturalWidth || !naturalHeight) throw new Error("size");
      setAspect(naturalWidth / naturalHeight);
      setWidth(String(naturalWidth));
      setHeight(String(naturalHeight));
      if (next.type === "image/gif") setNote("An animated GIF becomes a single still image.");
    } catch {
      setUnavailable("This image could not be read, so it is not available in the browser yet.");
    } finally {
      setLoading(false);
    }
  }

  function changeWidth(value: string) {
    setWidth(value);
    const next = Number(value);
    if (lock && next > 0 && aspect > 0) setHeight(String(Math.max(1, Math.round(next / aspect))));
  }

  function changeHeight(value: string) {
    setHeight(value);
    const next = Number(value);
    if (lock && next > 0 && aspect > 0) setWidth(String(Math.max(1, Math.round(next * aspect))));
  }

  async function resize() {
    if (!file || unavailable) return;
    const targetWidth = Math.round(Number(width));
    const targetHeight = Math.round(Number(height));
    if (!(targetWidth >= 1 && targetHeight >= 1 && targetWidth <= 8000 && targetHeight <= 8000)) {
      setError("Use a width and height from 1 to 8,000 pixels.");
      return;
    }
    if (targetWidth * targetHeight > 16_000_000) {
      setError("That size is too large to resize comfortably in the browser.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const decoded = await decodeImage(file);
      const blob = await drawToBlob(decoded, targetWidth, targetHeight, format, 0.92);
      const extension = format === "image/jpeg" ? "jpg" : "png";
      const base = safeFileName(file.name).replace(/\.[^.]+$/, "");
      downloadBlob(blob, `${base}-${targetWidth}x${targetHeight}.${extension}`);
    } catch {
      setError("The resized image could not be created.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-muted-foreground">The picture is resized on this device and downloaded. It is not uploaded.</p>
      <div className="grid gap-1.5">
        <Label htmlFor="resize-file">Image</Label>
        <Input id="resize-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/bmp" className="h-10 bg-white/80" onChange={(event) => void onFile(event.target.files?.[0] ?? null)} />
      </div>
      {loading ? <LoadingNote>Reading the image…</LoadingNote> : null}
      {unavailable ? <UnavailableNote>{unavailable}</UnavailableNote> : null}
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
      {preview && !unavailable ? (
        <>
          {/* Local object URL for a file the visitor just chose. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selected image preview" className="max-h-64 max-w-full rounded-2xl object-contain ring-1 ring-black/5" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="resize-width">Width (px)</Label>
              <Input id="resize-width" inputMode="numeric" value={width} onChange={(event) => changeWidth(event.target.value)} className="h-10 bg-white/80" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="resize-height">Height (px)</Label>
              <Input id="resize-height" inputMode="numeric" value={height} onChange={(event) => changeHeight(event.target.value)} className="h-10 bg-white/80" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={lock} onCheckedChange={(checked) => setLock(checked)} />
            Keep the original shape
          </label>
          <ChoiceField
            id="resize-format"
            label="Download as"
            value={format}
            onChange={setFormat}
            options={[
              { value: "image/png", label: "PNG" },
              { value: "image/jpeg", label: "JPEG" },
            ]}
          />
          <Button type="button" className="h-10 w-full sm:w-fit" onClick={() => void resize()} disabled={loading}>
            Download resized image
          </Button>
        </>
      ) : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}
    </div>
  );
}

export function FileConversionTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("image/png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function onFile(next: File | null) {
    setFile(next);
    setError(null);
    setNote(null);
    if (!next) {
      setUnavailable(null);
      return;
    }
    if (!next.type.startsWith("image/") || (!imageTypes.has(next.type) && next.type !== "image/bmp")) {
      setUnavailable(`${next.name} is not available in the browser yet. This page converts PNG, JPEG, WebP, GIF, and BMP images.`);
      return;
    }
    setUnavailable(null);
    if (next.type === "image/gif") setNote("Animation is not kept. The result is a still image.");
  }

  async function convert() {
    if (!file || unavailable) return;
    setLoading(true);
    setError(null);
    try {
      const decoded = await decodeImage(file);
      const width = "width" in decoded ? decoded.width : 0;
      const height = "height" in decoded ? decoded.height : 0;
      const blob = await drawToBlob(decoded, width, height, format, 0.92);
      const extension = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
      const base = safeFileName(file.name).replace(/\.[^.]+$/, "");
      downloadBlob(blob, `${base}.${extension}`);
    } catch {
      setError("This image could not be converted in the browser.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-muted-foreground">Conversion happens on this device. Documents, video, and audio are not converted here.</p>
      <div className="grid gap-1.5">
        <Label htmlFor="convert-file">File</Label>
        <Input id="convert-file" type="file" className="h-10 bg-white/80" onChange={(event) => onFile(event.target.files?.[0] ?? null)} />
      </div>
      {file && !unavailable ? (
        <p className="text-sm text-muted-foreground">
          {file.name} · {formatBytes(file.size)}
        </p>
      ) : null}
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
      {unavailable ? <UnavailableNote>{unavailable}</UnavailableNote> : null}
      {file && !unavailable ? (
        <>
          <ChoiceField
            id="convert-format"
            label="Convert to"
            value={format}
            onChange={setFormat}
            options={[
              { value: "image/png", label: "PNG" },
              { value: "image/jpeg", label: "JPEG" },
              { value: "image/webp", label: "WebP" },
            ]}
          />
          <Button type="button" className="h-10 w-full sm:w-fit" onClick={() => void convert()} disabled={loading}>
            Convert and download
          </Button>
        </>
      ) : null}
      {loading ? <LoadingNote>Converting…</LoadingNote> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}
    </div>
  );
}

type ZipResult = { before: number; after: number; name: string };

export function FileCompressionTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ZipResult | null>(null);

  async function zipFiles() {
    setResult(null);
    if (files.length === 0) {
      setError("Choose at least one file.");
      return;
    }
    if (files.length > 40) {
      setError("Choose 40 files or fewer.");
      return;
    }
    const before = files.reduce((sum, file) => sum + file.size, 0);
    if (before > 150 * 1024 * 1024) {
      setError("That selection is over 150 MB, which is too large to zip comfortably in the browser.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const used = new Map<string, number>();
      for (const file of files) {
        const base = safeFileName(file.name);
        const count = used.get(base) ?? 0;
        used.set(base, count + 1);
        const name = count === 0 ? base : base.replace(/(\.[^.]+)?$/, `-${count + 1}$1`);
        zip.file(name, file);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, "instagives-files.zip");
      setResult({ before, after: blob.size, name: "instagives-files.zip" });
    } catch {
      setError("The zip archive could not be created.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Files are packed into a zip on this device. Text and documents often shrink. Photos, music, and video usually do not, because they are already compressed.
      </p>
      <div className="grid gap-1.5">
        <Label htmlFor="zip-files">Files</Label>
        <Input
          id="zip-files"
          type="file"
          multiple
          className="h-10 bg-white/80"
          onChange={(event) => {
            setFiles(Array.from(event.target.files ?? []));
            setResult(null);
            setError(null);
          }}
        />
      </div>
      {files.length > 0 ? (
        <ul className="grid gap-1 text-sm text-muted-foreground">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`}>
              {safeFileName(file.name)} · {formatBytes(file.size)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No files chosen yet.</p>
      )}
      <Button type="button" className="h-10 w-full sm:w-fit" onClick={() => void zipFiles()} disabled={loading}>
        Create zip
      </Button>
      {loading ? <LoadingNote>Packing the archive…</LoadingNote> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {result ? (
        <div className="rounded-2xl bg-peach/45 px-4 py-4 text-sm leading-6" role="status">
          <p>
            {result.name} is {formatBytes(result.after)}. The originals were {formatBytes(result.before)} together.
          </p>
          {result.after >= result.before ? <p className="mt-1 text-muted-foreground">The archive is not smaller. That is common when the files were already compressed.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
