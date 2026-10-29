"use client";

import { useSyncExternalStore, useState } from "react";
import { ErrorNote } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const storageKey = "instagives.clipboard";

let pad = "";
let storageError: string | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    pad = window.localStorage.getItem(storageKey) ?? "";
    storageError = null;
  } catch {
    pad = "";
    storageError = "This browser blocked local storage, so the pad cannot be kept on this device.";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readPad() {
  ensureLoaded();
  return pad;
}

function readError() {
  ensureLoaded();
  return storageError;
}

function writePad(next: string) {
  pad = next;
  try {
    window.localStorage.setItem(storageKey, next);
    storageError = null;
    emit();
    return true;
  } catch {
    storageError = "The pad could not be saved. It may be larger than this browser allows.";
    emit();
    return false;
  }
}

export function ClipboardTool() {
  const text = useSyncExternalStore(subscribe, readPad, () => "");
  const storedError = useSyncExternalStore(subscribe, readError, () => null);
  const [status, setStatus] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const error = actionError ?? storedError;

  function update(next: string) {
    writePad(next);
    setStatus(null);
    setActionError(null);
  }

  async function copyOut() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied to the system clipboard.");
      setActionError(null);
    } catch {
      setStatus(null);
      setActionError("The browser blocked copying. Select the text and copy it with the keyboard.");
    }
  }

  async function pasteIn() {
    try {
      const value = await navigator.clipboard.readText();
      writePad(value);
      setStatus("Pasted from the system clipboard.");
      setActionError(null);
    } catch {
      setStatus(null);
      setActionError("The browser blocked reading the clipboard. You can still paste into the box with the keyboard.");
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-muted-foreground">
        This note stays in this browser only. It is not sent anywhere. The system clipboard is touched only when you press Copy or Paste.
      </p>
      <Textarea
        aria-label="Local clipboard"
        value={text}
        onChange={(event) => update(event.target.value)}
        placeholder="Type or paste a note"
        className="min-h-56 bg-white/80"
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="h-10" onClick={() => void copyOut()}>
          Copy
        </Button>
        <Button type="button" variant="outline" className="h-10 bg-white/80" onClick={() => void pasteIn()}>
          Paste
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-10"
          onClick={() => {
            writePad("");
            setStatus("Cleared.");
            setActionError(null);
          }}
        >
          Clear
        </Button>
      </div>
      {status ? (
        <p role="status" className="text-sm text-muted-foreground">
          {status}
        </p>
      ) : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}
    </div>
  );
}
