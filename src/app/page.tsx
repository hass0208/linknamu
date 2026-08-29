import ProfileHeader from "@/components/ProfileHeader";
import LinkCard from "@/components/LinkCard";
import { profile, links } from "@/config/links";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[26rem] flex-col items-center px-6 pb-20 sm:px-8">
      <ProfileHeader profile={profile} />
      <section className="mt-10 flex w-full flex-col gap-4">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </section>
    </main>
  );
}
