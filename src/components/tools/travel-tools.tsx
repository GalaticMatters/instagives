"use client";

import { useMemo, useState } from "react";
import { jetLag, timeZones } from "@/lib/estimates";
import { ChoiceField } from "@/components/choice-field";
import { ErrorNote } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Climate = "warm" | "mild" | "cold" | "mixed";
type Trip = "city" | "beach" | "business" | "hiking" | "family";

type PackItem = { id: string; label: string; packed: boolean };

function count(days: number, laundry: boolean, every: number, laundryCap: number) {
  const raw = Math.max(1, Math.ceil(days / every));
  return laundry ? Math.min(raw, laundryCap) : raw;
}

function buildList(input: { days: number; climate: Climate; trip: Trip; laundry: boolean; formal: boolean; swimming: boolean }): PackItem[] {
  const { days, climate, trip, laundry, formal, swimming } = input;
  const items: { id: string; label: string }[] = [
    { id: "underwear", label: `Underwear × ${count(days, laundry, 1, 7)}` },
    { id: "socks", label: `Socks × ${count(days, laundry, 1, 7)}` },
    { id: "tops", label: `Tops × ${count(days, laundry, 1, 6)}` },
    { id: "bottoms", label: `Bottoms × ${count(days, laundry, 3, 3)}` },
    { id: "sleep", label: days > 4 ? "Sleepwear × 2" : "Sleepwear × 1" },
    { id: "shoes", label: "Shoes you can walk in" },
    { id: "toiletries", label: "Toiletry kit" },
    { id: "meds", label: "Any medicine you already take, enough for the trip" },
    { id: "charger", label: "Phone charger" },
    { id: "id", label: "Passport or other ID you need for the trip" },
    { id: "bottle", label: "Reusable water bottle" },
  ];

  if (climate === "warm" || climate === "mixed") {
    items.push(
      { id: "sun", label: "Sunscreen" },
      { id: "hat", label: "Sun hat or sunglasses" },
    );
  }
  if (climate === "mild" || climate === "mixed") items.push({ id: "layer", label: "Light layer for cooler hours" });
  if (climate === "cold") {
    items.push(
      { id: "coat", label: "Coat" },
      { id: "warm", label: "Warm mid-layer" },
      { id: "gloves", label: "Gloves and a hat" },
    );
  }
  if (trip === "city") items.push({ id: "bag", label: "Small day bag" });
  if (trip === "beach") items.push({ id: "sandals", label: "Sandals" }, { id: "cover", label: "Cover-up or extra shirt" });
  if (trip === "business") items.push({ id: "meeting", label: "One outfit that works for a meeting" }, { id: "notes", label: "Notebook or a way to take notes" });
  if (trip === "hiking") items.push({ id: "boots", label: "Broken-in walking shoes or boots" }, { id: "blister", label: "Blister care" }, { id: "pack", label: "Daypack" });
  if (trip === "family") items.push({ id: "snacks", label: "Snacks" }, { id: "papers", label: "Documents you need for anyone traveling with you" });
  if (laundry) items.push({ id: "soap", label: "Small travel detergent" });
  if (formal) items.push({ id: "formal", label: "One dressier outfit" });
  if (swimming || trip === "beach") items.push({ id: "swim", label: "Swimsuit" }, { id: "towel", label: "Quick-dry towel" });

  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).map((item) => ({ ...item, packed: false }));
}

export function PackingTool() {
  const [days, setDays] = useState("5");
  const [climate, setClimate] = useState<Climate>("mild");
  const [trip, setTrip] = useState<Trip>("city");
  const [laundry, setLaundry] = useState(false);
  const [formal, setFormal] = useState(false);
  const [swimming, setSwimming] = useState(false);
  const [items, setItems] = useState<PackItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const packed = items?.filter((item) => item.packed).length ?? 0;

  return (
    <div className="grid gap-4">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const countDays = Number(days);
          if (!Number.isInteger(countDays) || countDays < 1 || countDays > 60) {
            setItems(null);
            setError("Enter a trip length from 1 to 60 days.");
            return;
          }
          setError(null);
          setItems(buildList({ days: countDays, climate, trip, laundry, formal, swimming }));
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="pack-days">Nights away, in days</Label>
          <Input id="pack-days" type="number" min={1} max={60} step={1} value={days} onChange={(event) => setDays(event.target.value)} className="h-10 bg-white/80" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceField
            id="pack-climate"
            label="Climate"
            value={climate}
            onChange={(value) => setClimate(value as Climate)}
            options={[
              { value: "warm", label: "Warm" },
              { value: "mild", label: "Mild" },
              { value: "cold", label: "Cold" },
              { value: "mixed", label: "Mixed" },
            ]}
          />
          <ChoiceField
            id="pack-trip"
            label="Kind of trip"
            value={trip}
            onChange={(value) => setTrip(value as Trip)}
            options={[
              { value: "city", label: "City" },
              { value: "beach", label: "Beach" },
              { value: "business", label: "Business" },
              { value: "hiking", label: "Hiking" },
              { value: "family", label: "Family" },
            ]}
          />
        </div>
        <div className="grid gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={laundry} onCheckedChange={(checked) => setLaundry(checked)} />
            I can do laundry
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={formal} onCheckedChange={(checked) => setFormal(checked)} />
            There is a formal event
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={swimming} onCheckedChange={(checked) => setSwimming(checked)} />
            I plan to swim
          </label>
        </div>
        <Button type="submit" className="h-10 w-full sm:w-fit">
          Build list
        </Button>
      </form>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {items ? (
        <div className="grid gap-3" aria-live="polite">
          <p className="text-sm text-muted-foreground">
            {packed} of {items.length} packed. Building the list again replaces these ticks.
          </p>
          <ul className="grid gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <label className="flex items-start gap-2 rounded-2xl bg-white px-3 py-2 text-sm ring-1 ring-black/5">
                  <Checkbox
                    className="mt-0.5"
                    checked={item.packed}
                    onCheckedChange={(checked) => {
                      setItems((current) => current?.map((entry) => (entry.id === item.id ? { ...entry, packed: checked } : entry)) ?? null);
                    }}
                  />
                  <span className={item.packed ? "text-muted-foreground line-through" : ""}>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              const label = custom.trim();
              if (!label) return;
              setItems((current) => [...(current ?? []), { id: `custom-${Date.now()}`, label, packed: false }]);
              setCustom("");
            }}
          >
            <Label htmlFor="pack-custom" className="sr-only">
              Add an item
            </Label>
            <Input id="pack-custom" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Add an item" className="h-10 bg-white/80" />
            <Button type="submit" variant="outline" className="h-10 bg-white/80">
              Add
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

const zoneOptions = [
  ...timeZones.map((zone) => ({
    value: zone.id,
    label: `${zone.label} (UTC${zone.offset >= 0 ? "+" : "−"}${Math.abs(zone.offset)})`,
  })),
  { value: "custom", label: "Custom UTC offset" },
];

function offsetFor(id: string, custom: string) {
  if (id === "custom") return Number(custom);
  return timeZones.find((zone) => zone.id === id)?.offset ?? Number.NaN;
}

export function JetLagTool() {
  const [origin, setOrigin] = useState("new-york");
  const [destination, setDestination] = useState("paris");
  const [originCustom, setOriginCustom] = useState("0");
  const [destinationCustom, setDestinationCustom] = useState("0");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!submitted) return null;
    return jetLag(offsetFor(origin, originCustom), offsetFor(destination, destinationCustom));
  }, [destination, destinationCustom, origin, originCustom, submitted]);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <p className="text-sm leading-6 text-muted-foreground">
        Offsets are standard time, not daylight saving. A one-hour seasonal shift will not show up here. This is a travel estimate, not medical advice.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <ChoiceField id="lag-from" label="Leaving" value={origin} onChange={setOrigin} options={zoneOptions} />
        <ChoiceField id="lag-to" label="Arriving" value={destination} onChange={setDestination} options={zoneOptions} />
      </div>
      {origin === "custom" || destination === "custom" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {origin === "custom" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="lag-from-offset">Leaving UTC offset</Label>
              <Input id="lag-from-offset" inputMode="decimal" value={originCustom} onChange={(event) => setOriginCustom(event.target.value)} className="h-10 bg-white/80" />
            </div>
          ) : null}
          {destination === "custom" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="lag-to-offset">Arriving UTC offset</Label>
              <Input id="lag-to-offset" inputMode="decimal" value={destinationCustom} onChange={(event) => setDestinationCustom(event.target.value)} className="h-10 bg-white/80" />
            </div>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" className="h-10 w-full sm:w-fit">
        Estimate the shift
      </Button>
      {result?.ok ? (
        <div className="rounded-2xl bg-lavender/45 px-4 py-4" aria-live="polite">
          <p className="text-base leading-7">{result.data.summary}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            {result.data.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      ) : result ? (
        <ErrorNote>{result.error}</ErrorNote>
      ) : null}
    </form>
  );
}
