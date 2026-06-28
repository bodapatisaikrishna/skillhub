import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="hero-glow relative mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-soft">
        <Compass className="size-7" aria-hidden="true" />
      </div>
      <p className="font-mono text-sm font-medium text-primary">404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 text-muted-foreground">
        We couldn&apos;t find that page. The skill may have been renamed or the
        link may be out of date.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/browse">Browse skills</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
