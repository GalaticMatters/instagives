import type { GuideTool } from "@/lib/catalog";

export function GuideEntry({ tool }: { tool: GuideTool }) {
  return (
    <div className="flex flex-col gap-4">
      {tool.paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-sm leading-7 text-foreground/90">
          {paragraph}
        </p>
      ))}
      {tool.links && tool.links.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-3">
          {tool.links.map((link) => (
            <li key={link.href} className="rounded-2xl bg-lavender/40 px-4 py-3">
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
              <p className="mt-1 text-sm text-muted-foreground">{link.note}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-foreground/15 px-4 py-4 text-sm text-muted-foreground">
          No outside link yet. This name is reserved on the directory until a real tool belongs here.
        </p>
      )}
    </div>
  );
}
