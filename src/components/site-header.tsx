"use client";

import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { categories } from "@/lib/catalog";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:ring-3 focus-visible:ring-ring">
          <LogoMark />
          <span className="font-display truncate text-xl tracking-tight text-foreground">Instagives</span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" className="h-10 shrink-0 bg-white/70 px-3" />}
          >
            Categories
            <ChevronDownIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[70vh] w-56">
            {categories.map((category) => (
              <DropdownMenuItem key={category.id} render={<Link href={`/#${category.id}`} />}>
                {category.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
