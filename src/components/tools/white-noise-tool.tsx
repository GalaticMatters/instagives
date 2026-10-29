"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorNote } from "@/components/feedback";
import { ChoiceField } from "@/components/choice-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Kind = "white" | "pink" | "brown" | "tone";

function noiseBuffer(context: AudioContext, kind: Exclude<Kind, "tone">) {
  const length = context.sampleRate * 2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);

  if (kind === "white") {
    for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
    return buffer;
  }

  if (kind === "pink") {
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let index = 0; index < length; index += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[index] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  let last = 0;
  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[index] = last * 3.5;
  }
  return buffer;
}

export function WhiteNoiseTool() {
  const [kind, setKind] = useState<Kind>("white");
  const [volume, setVolume] = useState(0.35);
  const [frequency, setFrequency] = useState(220);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioScheduledSourceNode | null>(null);
  const playingRef = useRef(false);

  function disconnectSource() {
    const source = sourceRef.current;
    sourceRef.current = null;
    if (!source) return;
    try {
      source.stop();
    } catch {
      /* already stopped */
    }
    source.disconnect();
  }

  function stop() {
    disconnectSource();
    playingRef.current = false;
    setPlaying(false);
  }

  useEffect(() => {
    return () => {
      disconnectSource();
      void contextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const gain = gainRef.current;
    const context = contextRef.current;
    if (!gain || !context) return;
    gain.gain.setTargetAtTime(volume, context.currentTime, 0.03);
  }, [volume]);

  async function start(nextKind = kind, nextFrequency = frequency) {
    setError(null);
    const AudioContextCtor = window.AudioContext;
    if (!AudioContextCtor) {
      setError("This browser does not offer Web Audio, so sound is not available here.");
      return;
    }

    try {
      if (!contextRef.current) contextRef.current = new AudioContextCtor();
      const context = contextRef.current;
      if (context.state === "suspended") await context.resume();
      disconnectSource();

      if (!gainRef.current) {
        const created = context.createGain();
        created.connect(context.destination);
        gainRef.current = created;
      }
      const gain = gainRef.current;
      gain.gain.value = volume;

      if (nextKind === "tone") {
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = nextFrequency;
        oscillator.connect(gain);
        oscillator.start();
        sourceRef.current = oscillator;
      } else {
        const source = context.createBufferSource();
        source.buffer = noiseBuffer(context, nextKind);
        source.loop = true;
        source.connect(gain);
        source.start();
        sourceRef.current = source;
      }

      playingRef.current = true;
      setPlaying(true);
    } catch {
      stop();
      setError("Sound could not start. Try again, or use another browser.");
    }
  }

  function changeKind(next: string) {
    const value = next as Kind;
    setKind(value);
    if (playingRef.current) void start(value, frequency);
  }

  function changeFrequency(next: number) {
    setFrequency(next);
    const source = sourceRef.current;
    if (source instanceof OscillatorNode) {
      source.frequency.setTargetAtTime(next, contextRef.current?.currentTime ?? 0, 0.02);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Audio stays in this tab. It does not start on its own. Press stop when you are done.
      </p>
      <ChoiceField
        id="noise-kind"
        label="Sound"
        value={kind}
        onChange={changeKind}
        options={[
          { value: "white", label: "White noise" },
          { value: "pink", label: "Pink noise" },
          { value: "brown", label: "Brown noise" },
          { value: "tone", label: "Steady tone" },
        ]}
      />
      {kind === "tone" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="tone-frequency">Tone frequency, {frequency} Hz</Label>
          <input
            id="tone-frequency"
            type="range"
            min={80}
            max={880}
            value={frequency}
            onChange={(event) => changeFrequency(Number(event.target.value))}
            className="w-full accent-primary"
          />
        </div>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="noise-volume">Volume</Label>
        <input
          id="noise-volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          className="w-full accent-primary"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="h-10" onClick={() => void start()}>
          {playing ? "Restart" : "Play"}
        </Button>
        <Button type="button" variant="destructive" className="h-10" onClick={stop} disabled={!playing}>
          Stop
        </Button>
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {playing ? "Playing. Stop ends the sound." : "Stopped."}
      </p>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
    </div>
  );
}
