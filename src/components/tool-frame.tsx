import type { ReactNode } from "react";
import Link from "next/link";
import type { Category, Tool } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";

const disclaimerCopy = {
  health:
    "These results are estimates, not medical advice. A clinician who knows the person is the right source for health decisions.",
  money:
    "These results are estimates, not financial, tax, or lending advice. A lender’s own terms decide the real payment.",
};

export function ToolFrame({
  tool,
  category,
  children,
}: {
  tool: Tool;
  category: Category;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href={`/#${category.id}`} className="text-sm font-medium text-primary hover:underline">
        {category.name}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{tool.kind === "guide" ? "Directory entry" : "In this browser"}</Badge>
      </div>
      <h1 className="font-display mt-3 text-4xl tracking-tight text-balance">{tool.name}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{tool.description}</p>
      {tool.disclaimer ? (
        <p className="mt-4 rounded-2xl bg-blush/70 px-4 py-3 text-sm leading-6 text-foreground">{disclaimerCopy[tool.disclaimer]}</p>
      ) : null}
      <div className="mt-6 rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 sm:p-6">{children}</div>
    </div>
  );
}
