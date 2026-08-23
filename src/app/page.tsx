import ProfileHeader from "@/components/ProfileHeader";
import LinkCard from "@/components/LinkCard";
import { profile, links } from "@/config/links";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center bg-white pb-16">
      <ProfileHeader profile={profile} />
      <section className="mt-8 flex w-full flex-col gap-3 px-6">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </section>
    </main>
  );
}
