import { NextResponse } from "next/server";
import { z } from "zod";

import { submissionSchema, buildIssueUrl } from "@/lib/submit";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";

/**
 * v1 submission endpoint: validate the payload with zod and return a prefilled
 * GitHub-issue URL for the client to open. No database — submissions become
 * issues that are reviewed manually before listing.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  const issueUrl = buildIssueUrl(SITE.submitRepo, parsed.data);
  return NextResponse.json({ ok: true, issueUrl });
}
