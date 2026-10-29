import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 py-20 sm:px-6">
      <p className="text-sm font-medium text-primary">Missing page</p>
      <h1 className="font-display text-4xl tracking-tight">That page is not on Instagives.</h1>
      <p className="text-sm leading-6 text-muted-foreground">The directory is still on the home page. Tool links use the names listed there.</p>
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        Back to all tools
      </Link>
    </div>
  );
}
