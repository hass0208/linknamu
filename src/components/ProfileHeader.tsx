import Image from "next/image";
import type { Profile } from "@/config/links";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex flex-col items-center gap-4 pt-20 text-center">
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-[-28px] -z-10 rounded-full bg-accent/30 blur-2xl"
        />
        <Image
          src={profile.avatarPath}
          alt={`${profile.name} 프로필 사진`}
          width={144}
          height={144}
          priority
          className="h-36 w-36 rounded-full object-cover shadow-[0_16px_32px_-12px_rgba(74,52,40,0.35)] ring-4 ring-white/70"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-espresso">
          {profile.name}
        </h1>
        <p className="text-sm text-taupe">{profile.bio}</p>
      </div>
    </header>
  );
}
