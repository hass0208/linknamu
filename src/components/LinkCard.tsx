import Link from "next/link";
import type { LinkItem } from "@/config/links";

export default function LinkCard({ link }: { link: LinkItem }) {
  return (
    <Link
      href={`/r/${link.id}`}
      className="block w-full rounded-2xl border border-white/60 bg-white/50 px-5 py-4 text-center font-medium text-espresso shadow-[0_8px_24px_-12px_rgba(74,52,40,0.25)] backdrop-blur-md transition-[transform,box-shadow,background-color] duration-200 ease-out hover:bg-white/65 hover:shadow-[0_12px_28px_-10px_rgba(74,52,40,0.3)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      {link.label}
    </Link>
  );
}
