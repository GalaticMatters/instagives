"use client";

import { useState } from "react";
import {
  activityOptions,
  bodyMassIndex,
  calorieEstimate,
  formatCount,
  formatUtcDate,
  pregnancyEstimate,
  type ActivityId,
} from "@/lib/estimates";
import { ChoiceField } from "@/components/choice-field";
import { ErrorNote } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Field({ id, label, value, onChange, step = "any" }: { id: string; label: string; value: string; onChange: (value: string) => void; step?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} inputMode="decimal" type="number" step={step} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 bg-white/80" />
    </div>
  );
}

function numberOrNaN(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

export function BmiTool() {
  const [system, setSystem] = useState<"metric" | "imperial">("metric");
  const [kilograms, setKilograms] = useState("70");
  const [centimeters, setCentimeters] = useState("170");
  const [pounds, setPounds] = useState("154");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("7");
  const [result, setResult] = useState<ReturnType<typeof bodyMassIndex> | null>(null);

  function calculate() {
    setResult(
      bodyMassIndex({
        system,
        kilograms: numberOrNaN(kilograms),
        centimeters: numberOrNaN(centimeters),
        pounds: numberOrNaN(pounds),
        feet: numberOrNaN(feet),
        inches: numberOrNaN(inches),
      }),
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        calculate();
      }}
    >
      <ChoiceField
        id="bmi-system"
        label="Units"
        value={system}
        onChange={(value) => setSystem(value as "metric" | "imperial")}
        options={[
          { value: "metric", label: "Kilograms and centimeters" },
          { value: "imperial", label: "Pounds, feet, and inches" },
        ]}
      />
      {system === "metric" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="bmi-kg" label="Weight (kg)" value={kilograms} onChange={setKilograms} />
          <Field id="bmi-cm" label="Height (cm)" value={centimeters} onChange={setCentimeters} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="bmi-lb" label="Weight (lb)" value={pounds} onChange={setPounds} />
          <Field id="bmi-ft" label="Height (ft)" value={feet} onChange={setFeet} step="1" />
          <Field id="bmi-in" label="Height (in)" value={inches} onChange={setInches} />
        </div>
      )}
      <Button type="submit" className="h-10 w-full sm:w-fit">
        Estimate BMI
      </Button>
      {result?.ok ? (
        <div className="rounded-2xl bg-blush/55 px-4 py-4" aria-live="polite">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">BMI</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{formatCount(result.data.bmi, 1)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{result.data.band}, using common adult screening bands.</p>
        </div>
      ) : result ? (
        <ErrorNote>{result.error}</ErrorNote>
      ) : null}
    </form>
  );
}

export function CaloriesTool() {
  const [sex, setSex] = useState<"female" | "male">("female");
  const [age, setAge] = useState("30");
  const [kilograms, setKilograms] = useState("68");
  const [centimeters, setCentimeters] = useState("168");
  const [activity, setActivity] = useState<ActivityId>("light");
  const [result, setResult] = useState<ReturnType<typeof calorieEstimate> | null>(null);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setResult(
          calorieEstimate({
            sex,
            age: numberOrNaN(age),
            kilograms: numberOrNaN(kilograms),
            centimeters: numberOrNaN(centimeters),
            activity,
          }),
        );
      }}
    >
      <ChoiceField
        id="cal-sex"
        label="Equation basis"
        value={sex}
        onChange={(value) => setSex(value as "female" | "male")}
        options={[
          { value: "female", label: "Female coefficient" },
          { value: "male", label: "Male coefficient" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="cal-age" label="Age" value={age} onChange={setAge} step="1" />
        <Field id="cal-kg" label="Weight (kg)" value={kilograms} onChange={setKilograms} />
        <Field id="cal-cm" label="Height (cm)" value={centimeters} onChange={setCentimeters} />
      </div>
      <ChoiceField
        id="cal-activity"
        label="Typical day"
        value={activity}
        onChange={(value) => setActivity(value as ActivityId)}
        options={activityOptions.map((option) => ({ value: option.id, label: option.label }))}
      />
      <Button type="submit" className="h-10 w-full sm:w-fit">
        Estimate calories
      </Button>
      {result?.ok ? (
        <div className="grid gap-3 sm:grid-cols-2" aria-live="polite">
          <div className="rounded-2xl bg-peach/50 px-4 py-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Resting estimate</p>
            <p className="mt-1 text-2xl font-semibold">{Math.round(result.data.bmr).toLocaleString()} kcal</p>
          </div>
          <div className="rounded-2xl bg-lavender/50 px-4 py-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">With that activity</p>
            <p className="mt-1 text-2xl font-semibold">{Math.round(result.data.maintenance).toLocaleString()} kcal</p>
          </div>
        </div>
      ) : result ? (
        <ErrorNote>{result.error}</ErrorNote>
      ) : null}
    </form>
  );
}

export function PregnancyTool() {
  const [lmp, setLmp] = useState("");
  const [result, setResult] = useState<ReturnType<typeof pregnancyEstimate> | null>(null);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setResult(pregnancyEstimate(lmp));
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="lmp">First day of last period</Label>
        <Input id="lmp" type="date" value={lmp} onChange={(event) => setLmp(event.target.value)} className="h-10 bg-white/80" required />
      </div>
      <Button type="submit" className="h-10 w-full sm:w-fit">
        Estimate due date
      </Button>
      {result?.ok ? (
        <div className="grid gap-3" aria-live="polite">
          <div className="rounded-2xl bg-blush/60 px-4 py-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Estimated due date</p>
            <p className="mt-1 text-2xl font-semibold">{formatUtcDate(result.data.due)}</p>
            <p className="mt-1 text-sm text-muted-foreground">280 days after the date you entered.</p>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5">
              <dt className="text-muted-foreground">Time since that date</dt>
              <dd className="mt-1 font-medium">
                {result.data.weeks} weeks and {result.data.days} days
              </dd>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5">
              <dt className="text-muted-foreground">Trimester window</dt>
              <dd className="mt-1 font-medium">{result.data.trimester}</dd>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5 sm:col-span-2">
              <dt className="text-muted-foreground">Rough conception date</dt>
              <dd className="mt-1 font-medium">{formatUtcDate(result.data.conception)}, about 14 days after the period date.</dd>
            </div>
          </dl>
          {result.data.passed ? (
            <p className="text-sm leading-6 text-muted-foreground">
              The estimated due date has already passed. This page cannot say what that means for a pregnancy.
            </p>
          ) : null}
        </div>
      ) : result ? (
        <ErrorNote>{result.error}</ErrorNote>
      ) : null}
    </form>
  );
}
