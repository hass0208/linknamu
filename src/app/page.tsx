import ProfileHeader from "@/components/ProfileHeader";
import { profile } from "@/config/links";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center bg-white pb-16">
      <ProfileHeader profile={profile} />
    </main>
  );
}
