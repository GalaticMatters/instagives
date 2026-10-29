export type Ok<T> = { ok: true; data: T };
export type Err = { ok: false; error: string };
export type Result<T> = Ok<T> | Err;

function fail(error: string): Err {
  return { ok: false, error };
}

export function formatAmount(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCount(value: number, digits = 1) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export type ScheduleRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export function installment(principal: number, annualPercent: number, months: number) {
  if (!Number.isFinite(principal) || principal <= 0) return fail("Enter an amount greater than zero.");
  if (!Number.isFinite(annualPercent) || annualPercent < 0) return fail("Enter a rate of zero or higher.");
  if (annualPercent > 100) return fail("Enter an annual rate of 100% or less.");
  if (!Number.isInteger(months) || months < 1 || months > 600) {
    return fail("Enter a whole number of months from 1 to 600.");
  }

  const monthlyRate = annualPercent / 100 / 12;
  const payment = monthlyRate === 0 ? principal / months : (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);

  let balance = principal;
  const rows: ScheduleRow[] = [];
  let totalInterest = 0;

  for (let month = 1; month <= months; month += 1) {
    const interest = balance * monthlyRate;
    let principalPaid = payment - interest;
    if (month === months || principalPaid > balance) principalPaid = balance;
    const thisPayment = principalPaid + interest;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    if (rows.length < 12 || month === months) {
      rows.push({
        month,
        payment: thisPayment,
        principal: principalPaid,
        interest,
        balance,
      });
    }
  }

  return {
    ok: true as const,
    data: {
      payment,
      totalInterest,
      totalPaid: principal + totalInterest,
      rows,
      months,
    },
  };
}

export function bodyMassIndex(input: {
  system: "metric" | "imperial";
  kilograms: number;
  centimeters: number;
  pounds: number;
  feet: number;
  inches: number;
}): Result<{ bmi: number; band: string }> {
  let kilograms = input.kilograms;
  let meters = input.centimeters / 100;

  if (input.system === "metric") {
    if (!(kilograms >= 20 && kilograms <= 400)) return fail("Enter a weight from 20 to 400 kg.");
    if (!(input.centimeters >= 90 && input.centimeters <= 250)) return fail("Enter a height from 90 to 250 cm.");
  } else {
    const totalInches = input.feet * 12 + input.inches;
    if (!(input.pounds >= 44 && input.pounds <= 880)) return fail("Enter a weight from 44 to 880 lb.");
    if (!(totalInches >= 36 && totalInches <= 98)) return fail("Enter a height from 3 ft to 8 ft 2 in.");
    kilograms = input.pounds * 0.45359237;
    meters = totalInches * 0.0254;
  }

  const bmi = kilograms / (meters * meters);
  const band = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy weight range" : bmi < 30 ? "Overweight" : "Obesity range";
  return { ok: true, data: { bmi, band } };
}

const activities = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very: 1.9,
} as const;

export type ActivityId = keyof typeof activities;

export const activityOptions: { id: ActivityId; label: string }[] = [
  { id: "sedentary", label: "Mostly sitting" },
  { id: "light", label: "Light movement a few days a week" },
  { id: "moderate", label: "Exercise most days" },
  { id: "active", label: "Hard exercise or a physical job" },
  { id: "very", label: "Very hard training most days" },
];

export function calorieEstimate(input: {
  sex: "female" | "male";
  age: number;
  kilograms: number;
  centimeters: number;
  activity: ActivityId;
}): Result<{ bmr: number; maintenance: number }> {
  if (!Number.isInteger(input.age) || input.age < 18 || input.age > 100) {
    return fail("Enter an age from 18 to 100. This equation is for adults, not children.");
  }
  if (!(input.kilograms >= 30 && input.kilograms <= 300)) return fail("Enter a weight from 30 to 300 kg.");
  if (!(input.centimeters >= 120 && input.centimeters <= 230)) return fail("Enter a height from 120 to 230 cm.");

  const sexOffset = input.sex === "male" ? 5 : -161;
  const bmr = 10 * input.kilograms + 6.25 * input.centimeters - 5 * input.age + sexOffset;
  if (bmr <= 0) return fail("Those details did not produce a usable estimate.");
  return { ok: true, data: { bmr, maintenance: bmr * activities[input.activity] } };
}

function utcDate(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day));
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function formatUtcDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function pregnancyEstimate(lmpIso: string, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lmpIso)) return fail("Choose the first day of the last period.");
  const [year, month, day] = lmpIso.split("-").map(Number);
  const lmp = utcDate(year, month - 1, day);
  if (lmp.getUTCFullYear() !== year || lmp.getUTCMonth() !== month - 1 || lmp.getUTCDate() !== day) {
    return fail("That is not a real calendar day.");
  }

  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (lmp.getTime() > todayUtc) return fail("The last period date cannot be in the future.");

  const elapsed = Math.round((todayUtc - lmp.getTime()) / 86_400_000);
  if (elapsed > 308) {
    return fail("That date is past 44 weeks, so this due-date estimate does not apply.");
  }

  const weeks = Math.floor(elapsed / 7);
  const days = elapsed % 7;
  const trimester = weeks < 13 ? "First" : weeks < 27 ? "Second" : "Third";
  const passed = elapsed > 280;

  return {
    ok: true as const,
    data: {
      due: addUtcDays(lmp, 280),
      conception: addUtcDays(lmp, 14),
      weeks,
      days,
      trimester,
      passed,
    },
  };
}

export type Zone = { id: string; label: string; offset: number };

export const timeZones: Zone[] = [
  { id: "honolulu", label: "Honolulu", offset: -10 },
  { id: "los-angeles", label: "Los Angeles", offset: -8 },
  { id: "denver", label: "Denver", offset: -7 },
  { id: "chicago", label: "Chicago", offset: -6 },
  { id: "new-york", label: "New York", offset: -5 },
  { id: "sao-paulo", label: "São Paulo", offset: -3 },
  { id: "utc", label: "UTC", offset: 0 },
  { id: "london", label: "London", offset: 0 },
  { id: "paris", label: "Paris", offset: 1 },
  { id: "athens", label: "Athens", offset: 2 },
  { id: "dubai", label: "Dubai", offset: 4 },
  { id: "india", label: "India", offset: 5.5 },
  { id: "singapore", label: "Singapore", offset: 8 },
  { id: "tokyo", label: "Tokyo", offset: 9 },
  { id: "sydney", label: "Sydney", offset: 10 },
  { id: "auckland", label: "Auckland", offset: 12 },
];

export function jetLag(origin: number, destination: number) {
  if (!Number.isFinite(origin) || !Number.isFinite(destination)) return fail("Enter both time offsets.");
  if (origin < -12 || origin > 14 || destination < -12 || destination > 14) {
    return fail("Use a UTC offset from −12 to +14.");
  }

  const shift = destination - origin;
  const hours = Math.abs(shift);
  const direction = shift === 0 ? "none" : shift > 0 ? "forward" : "back";
  const adjustmentDays = shift === 0 ? 0 : Math.max(1, Math.round(hours));
  const hourLabel = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);

  let summary = "The clocks match, so jet lag is unlikely.";
  if (direction === "forward") {
    summary = `The destination clock is ${hourLabel} ${hours === 1 ? "hour" : "hours"} ahead. Plan on about ${adjustmentDays} ${adjustmentDays === 1 ? "day" : "days"} to settle.`;
  } else if (direction === "back") {
    summary = `The destination clock is ${hourLabel} ${hours === 1 ? "hour" : "hours"} behind. Plan on about ${adjustmentDays} ${adjustmentDays === 1 ? "day" : "days"} to settle.`;
  }

  const tips =
    direction === "none"
      ? ["Keep your usual sleep. A long flight can still leave you tired."]
      : direction === "forward"
        ? [
            "Eastward trips, where the clock jumps forward, often take a little longer to feel normal.",
            "For a few nights before you fly, try moving bedtime 30–60 minutes earlier.",
            "After you land, morning daylight is the more useful light.",
          ]
        : [
            "Westward trips, where the clock jumps back, are often a bit easier than eastward ones.",
            "For a few nights before you fly, try moving bedtime 30–60 minutes later.",
            "After you land, light later in the day is the more useful light.",
          ];

  return { ok: true as const, data: { shift, hours, direction, adjustmentDays, summary, tips } };
}

type LinearUnit = { id: string; label: string; factor: number };

type UnitGroup = {
  id: string;
  label: string;
  units: LinearUnit[];
};

const length: UnitGroup = {
  id: "length",
  label: "Length",
  units: [
    { id: "mm", label: "Millimeters", factor: 0.001 },
    { id: "cm", label: "Centimeters", factor: 0.01 },
    { id: "m", label: "Meters", factor: 1 },
    { id: "km", label: "Kilometers", factor: 1000 },
    { id: "in", label: "Inches", factor: 0.0254 },
    { id: "ft", label: "Feet", factor: 0.3048 },
    { id: "yd", label: "Yards", factor: 0.9144 },
    { id: "mi", label: "Miles", factor: 1609.344 },
  ],
};

const weight: UnitGroup = {
  id: "weight",
  label: "Weight",
  units: [
    { id: "mg", label: "Milligrams", factor: 0.000001 },
    { id: "g", label: "Grams", factor: 0.001 },
    { id: "kg", label: "Kilograms", factor: 1 },
    { id: "oz", label: "Ounces", factor: 0.028349523125 },
    { id: "lb", label: "Pounds", factor: 0.45359237 },
  ],
};

const volume: UnitGroup = {
  id: "volume",
  label: "Volume",
  units: [
    { id: "ml", label: "Milliliters", factor: 0.001 },
    { id: "l", label: "Liters", factor: 1 },
    { id: "tsp", label: "US teaspoons", factor: 0.00492892159375 },
    { id: "tbsp", label: "US tablespoons", factor: 0.01478676478125 },
    { id: "floz", label: "US fluid ounces", factor: 0.0295735295625 },
    { id: "cup", label: "US cups", factor: 0.2365882365 },
    { id: "gal", label: "US gallons", factor: 3.785411784 },
  ],
};

export const unitGroups = [
  { id: length.id, label: length.label, units: length.units.map(({ id, label }) => ({ id, label })) },
  { id: weight.id, label: weight.label, units: weight.units.map(({ id, label }) => ({ id, label })) },
  { id: "temperature", label: "Temperature", units: [
    { id: "c", label: "Celsius" },
    { id: "f", label: "Fahrenheit" },
    { id: "k", label: "Kelvin" },
  ] },
  { id: volume.id, label: volume.label, units: volume.units.map(({ id, label }) => ({ id, label })) },
];

const linear = new Map<string, UnitGroup>([
  [length.id, length],
  [weight.id, weight],
  [volume.id, volume],
]);

function toCelsius(value: number, unit: string) {
  if (unit === "f") return ((value - 32) * 5) / 9;
  if (unit === "k") return value - 273.15;
  return value;
}

function fromCelsius(value: number, unit: string) {
  if (unit === "f") return (value * 9) / 5 + 32;
  if (unit === "k") return value + 273.15;
  return value;
}

export function convertUnit(groupId: string, fromId: string, toId: string, value: number): Result<number> {
  if (!Number.isFinite(value)) return fail("Enter a number to convert.");

  if (groupId === "temperature") {
    const celsius = toCelsius(value, fromId);
    if (celsius < -273.15) return fail("That temperature is below absolute zero.");
    return { ok: true, data: fromCelsius(celsius, toId) };
  }

  const group = linear.get(groupId);
  const from = group?.units.find((unit) => unit.id === fromId);
  const to = group?.units.find((unit) => unit.id === toId);
  if (!from || !to) return fail("Choose both units.");
  if (groupId === "weight" && value < 0) return fail("Weight cannot be negative.");
  if (groupId === "volume" && value < 0) return fail("Volume cannot be negative.");
  if (groupId === "length" && value < 0) return fail("Length cannot be negative.");
  return { ok: true, data: (value * from.factor) / to.factor };
}

export function formatConverted(value: number) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const digits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}
