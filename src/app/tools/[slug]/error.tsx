"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ToolError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 py-16 sm:px-6" role="alert">
      <h1 className="font-display text-3xl tracking-tight">This tool hit a snag.</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        Something went wrong while opening it. Your files were not uploaded. You can try again, or go back to the directory.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="h-10" onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/" className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-primary hover:underline">
          All tools
        </Link>
      </div>
    </div>
  );
}
