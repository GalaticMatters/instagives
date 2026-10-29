"use client";

import { useMemo, useState } from "react";
import { convertUnit, formatConverted, unitGroups } from "@/lib/estimates";
import { ChoiceField } from "@/components/choice-field";
import { ErrorNote } from "@/components/feedback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UnitConverterTool() {
  const [groupId, setGroupId] = useState(unitGroups[0].id);
  const group = unitGroups.find((item) => item.id === groupId) ?? unitGroups[0];
  const [fromId, setFromId] = useState(group.units[0].id);
  const [toId, setToId] = useState(group.units[1]?.id ?? group.units[0].id);
  const [raw, setRaw] = useState("1");

  function chooseGroup(nextGroup: string) {
    const found = unitGroups.find((item) => item.id === nextGroup) ?? unitGroups[0];
    setGroupId(found.id);
    setFromId(found.units[0].id);
    setToId(found.units[1]?.id ?? found.units[0].id);
  }

  const result = useMemo(() => {
    const value = Number(raw);
    if (raw.trim() === "") return { ok: false as const, error: "Enter a number to convert." };
    return convertUnit(groupId, fromId, toId, value);
  }, [fromId, groupId, raw, toId]);

  const fromLabel = group.units.find((unit) => unit.id === fromId)?.label ?? "";
  const toLabel = group.units.find((unit) => unit.id === toId)?.label ?? "";

  return (
    <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
      <ChoiceField
        id="unit-group"
        label="Measure"
        value={groupId}
        onChange={chooseGroup}
        options={unitGroups.map((item) => ({ value: item.id, label: item.label }))}
      />
      <div className="grid gap-1.5">
        <Label htmlFor="unit-value">Amount</Label>
        <Input id="unit-value" inputMode="decimal" value={raw} onChange={(event) => setRaw(event.target.value)} className="h-10 bg-white/80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ChoiceField id="unit-from" label="From" value={fromId} onChange={setFromId} options={group.units.map((unit) => ({ value: unit.id, label: unit.label }))} />
        <ChoiceField id="unit-to" label="To" value={toId} onChange={setToId} options={group.units.map((unit) => ({ value: unit.id, label: unit.label }))} />
      </div>
      {result.ok ? (
        <div className="rounded-2xl bg-lavender/45 px-4 py-4" aria-live="polite">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Converted</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatConverted(result.data)} <span className="text-base font-medium text-muted-foreground">{toLabel}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {raw} {fromLabel}
          </p>
        </div>
      ) : (
        <ErrorNote>{result.error}</ErrorNote>
      )}
    </form>
  );
}
