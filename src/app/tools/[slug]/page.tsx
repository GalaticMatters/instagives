import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideEntry } from "@/components/guide-entry";
import { ToolFrame } from "@/components/tool-frame";
import { RenderTool } from "@/components/tools/render-tool";
import { getTool, tools } from "@/lib/catalog";

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = getTool(slug);
  if (!found) return { title: "Tool not found" };
  return { title: found.tool.name, description: found.tool.summary };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = getTool(slug);
  if (!found) notFound();

  return (
    <ToolFrame tool={found.tool} category={found.category}>
      {found.tool.kind === "guide" ? <GuideEntry tool={found.tool} /> : <RenderTool slug={found.tool.slug} />}
    </ToolFrame>
  );
}
