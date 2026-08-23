import Link from "next/link";
import type { LinkItem } from "@/config/links";

export default function LinkCard({ link }: { link: LinkItem }) {
  return (
    <Link
      href={`/r/${link.id}`}
      className="block w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-center font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
    >
      {link.label}
    </Link>
  );
}
