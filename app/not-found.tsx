import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-accent">
        <Compass className="size-7 text-primary" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-primary">404</p>
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
