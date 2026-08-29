import { NextResponse, type NextRequest } from "next/server";
import { findLinkById } from "@/config/links";
import { incrementClick } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const { linkId } = await params;
  const link = findLinkById(linkId);

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url), {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }

  await incrementClick(linkId);

  return NextResponse.redirect(link.url, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
