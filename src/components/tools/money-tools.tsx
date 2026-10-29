"use client";

import { useState } from "react";
import { formatAmount, installment } from "@/lib/estimates";
import { ErrorNote } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Field({ id, label, value, onChange, hint }: { id: string; label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} inputMode="decimal" type="number" min="0" step="any" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 bg-white/80" />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function read(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function Schedule({ rows, skipped }: { rows: { month: number; payment: number; principal: number; interest: number; balance: number }[]; skipped: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <caption className="mb-2 text-left text-xs text-muted-foreground">
          {skipped ? "First 12 months, then the final month. Amounts are rounded for display." : "Each month in the term. Amounts are rounded for display."}
        </caption>
        <thead className="text-muted-foreground">
          <tr>
            <th className="py-2 pr-3 font-medium">Month</th>
            <th className="py-2 pr-3 font-medium">Payment</th>
            <th className="py-2 pr-3 font-medium">Principal</th>
            <th className="py-2 pr-3 font-medium">Interest</th>
            <th className="py-2 font-medium">Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month} className="border-t border-black/5">
              <td className="py-2 pr-3">{row.month}</td>
              <td className="py-2 pr-3">{formatAmount(row.payment)}</td>
              <td className="py-2 pr-3">{formatAmount(row.principal)}</td>
              <td className="py-2 pr-3">{formatAmount(row.interest)}</td>
              <td className="py-2">{formatAmount(row.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Summary({ paymentLabel, payment, interest, total }: { paymentLabel: string; payment: number; interest: number; total: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
      <div className="rounded-2xl bg-sand/70 px-4 py-3">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{paymentLabel}</p>
        <p className="mt-1 text-xl font-semibold">{formatAmount(payment)}</p>
      </div>
      <div className="rounded-2xl bg-peach/50 px-4 py-3">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">Interest</p>
        <p className="mt-1 text-xl font-semibold">{formatAmount(interest)}</p>
      </div>
      <div className="rounded-2xl bg-lavender/50 px-4 py-3">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">Total paid</p>
        <p className="mt-1 text-xl font-semibold">{formatAmount(total)}</p>
      </div>
    </div>
  );
}

export function LoanTool() {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState("7.5");
  const [years, setYears] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Extract<ReturnType<typeof installment>, { ok: true }>["data"] | null>(null);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const months = Math.round(read(years) * 12);
        if (!Number.isFinite(read(years)) || read(years) <= 0) {
          setData(null);
          setError("Enter a term in years.");
          return;
        }
        const result = installment(read(amount), read(rate), months);
        if (!result.ok) {
          setData(null);
          setError(result.error);
          return;
        }
        setError(null);
        setData(result.data);
      }}
    >
      <p className="text-sm text-muted-foreground">Use the same currency for every amount. This page does not convert money.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="loan-amount" label="Amount" value={amount} onChange={setAmount} />
        <Field id="loan-rate" label="Annual rate (%)" value={rate} onChange={setRate} />
        <Field id="loan-years" label="Years" value={years} onChange={setYears} />
      </div>
      <Button type="submit" className="h-10 w-full sm:w-fit">
        Estimate payment
      </Button>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {data ? (
        <>
          <Summary paymentLabel="Each month" payment={data.payment} interest={data.totalInterest} total={data.totalPaid} />
          <Schedule rows={data.rows} skipped={data.months > 13} />
        </>
      ) : null}
    </form>
  );
}

export function EmiTool() {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate] = useState("9");
  const [months, setMonths] = useState("60");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Extract<ReturnType<typeof installment>, { ok: true }>["data"] | null>(null);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const result = installment(read(principal), read(rate), Math.round(read(months)));
        if (!result.ok) {
          setData(null);
          setError(result.error);
          return;
        }
        setError(null);
        setData(result.data);
      }}
    >
      <p className="text-sm text-muted-foreground">The EMI here is a level payment for the whole term. Fees and changing rates are not included.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="emi-principal" label="Principal" value={principal} onChange={setPrincipal} />
        <Field id="emi-rate" label="Annual rate (%)" value={rate} onChange={setRate} />
        <Field id="emi-months" label="Months" value={months} onChange={setMonths} />
      </div>
      <Button type="submit" className="h-10 w-full sm:w-fit">
        Estimate EMI
      </Button>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {data ? (
        <>
          <Summary paymentLabel="EMI" payment={data.payment} interest={data.totalInterest} total={data.totalPaid} />
          <Schedule rows={data.rows} skipped={data.months > 13} />
        </>
      ) : null}
    </form>
  );
}

export function MortgageTool() {
  const [price, setPrice] = useState("400000");
  const [down, setDown] = useState("80000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [tax, setTax] = useState("0");
  const [insurance, setInsurance] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<{ loan: number; monthlyHousing: number; data: Extract<ReturnType<typeof installment>, { ok: true }>["data"] } | null>(null);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const priceValue = read(price);
        const downValue = read(down);
        const taxValue = read(tax);
        const insuranceValue = read(insurance);
        const yearValue = read(years);
        if (!(priceValue > 0)) {
          setView(null);
          setError("Enter a home price greater than zero.");
          return;
        }
        if (!(downValue >= 0) || downValue >= priceValue) {
          setView(null);
          setError("Down payment has to be zero or more, and less than the price.");
          return;
        }
        if (!(taxValue >= 0) || !(insuranceValue >= 0)) {
          setView(null);
          setError("Tax and insurance cannot be negative.");
          return;
        }
        const months = Math.round(yearValue * 12);
        const result = installment(priceValue - downValue, read(rate), months);
        if (!result.ok) {
          setView(null);
          setError(result.error);
          return;
        }
        setError(null);
        setView({
          loan: priceValue - downValue,
          monthlyHousing: result.data.payment + taxValue / 12 + insuranceValue / 12,
          data: result.data,
        });
      }}
    >
      <p className="text-sm text-muted-foreground">Tax and insurance are optional yearly amounts, split across 12 months. Leave them at 0 to see principal and interest only.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="mort-price" label="Home price" value={price} onChange={setPrice} />
        <Field id="mort-down" label="Down payment" value={down} onChange={setDown} />
        <Field id="mort-rate" label="Annual rate (%)" value={rate} onChange={setRate} />
        <Field id="mort-years" label="Years" value={years} onChange={setYears} />
        <Field id="mort-tax" label="Yearly property tax" value={tax} onChange={setTax} hint="Optional" />
        <Field id="mort-ins" label="Yearly insurance" value={insurance} onChange={setInsurance} hint="Optional" />
      </div>
      <Button type="submit" className="h-10 w-full sm:w-fit">
        Estimate housing payment
      </Button>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {view ? (
        <>
          <p className="text-sm text-muted-foreground">Amount financed: {formatAmount(view.loan)}</p>
          <div className="rounded-2xl bg-blush/55 px-4 py-4" aria-live="polite">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Estimated monthly housing</p>
            <p className="mt-1 text-3xl font-semibold">{formatAmount(view.monthlyHousing)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Principal and interest, plus one twelfth of the yearly tax and insurance you entered.</p>
          </div>
          <Summary paymentLabel="Principal and interest" payment={view.data.payment} interest={view.data.totalInterest} total={view.data.totalPaid} />
          <Schedule rows={view.data.rows} skipped={view.data.months > 13} />
        </>
      ) : null}
    </form>
  );
}
