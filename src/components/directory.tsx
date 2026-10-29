import { categories } from "@/lib/catalog";

const wash: Record<string, string> = {
  utilities: "hover:bg-blush/55",
  music: "hover:bg-lavender/70",
  image: "hover:bg-peach/70",
  "money-business": "hover:bg-sand/80",
  health: "hover:bg-blush/65",
  travel: "hover:bg-lavender/55",
  cybersecurity: "hover:bg-sand/70",
};

const dot: Record<string, string> = {
  utilities: "bg-blush",
  music: "bg-lavender",
  image: "bg-peach",
  "money-business": "bg-sand",
  health: "bg-[#f3b7c9]",
  travel: "bg-lavender",
  cybersecurity: "bg-sand",
};

export function Directory() {
  return (
    <div className="flex flex-col gap-12">
      {categories.map((category) => (
        <section key={category.id} id={category.id} className="scroll-mt-24" aria-labelledby={`${category.id}-title`}>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id={`${category.id}-title`} className="font-display text-2xl tracking-tight sm:text-3xl">
                {category.name}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{category.description}</p>
            </div>
          </div>
          {category.tools.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-foreground/15 bg-white/50 px-5 py-10 text-center">
              <p className="font-medium">Tools coming soon</p>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                Video and audio tools are not listed yet. This shelf stays empty until there is something real to open.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.tools.map((tool) => (
                <li key={tool.slug}>
                  <a
                    href={`/tools/${tool.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex min-h-32 flex-col justify-between rounded-3xl bg-white/75 px-5 py-4 text-left shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none ${wash[category.id] ?? ""}`}
                  >
                    <span>
                      <span className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${dot[category.id] ?? "bg-blush"}`} aria-hidden="true" />
                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          {tool.kind === "guide" ? "Guide" : "Tool"}
                        </span>
                      </span>
                      <span className="mt-2 block text-lg font-semibold tracking-tight">{tool.name}</span>
                    </span>
                    <span className="mt-3 block text-sm leading-5 text-muted-foreground">{tool.summary}</span>
                    <span className="sr-only">Opens in a new tab.</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
