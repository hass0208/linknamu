import Image from "next/image";
import type { Profile } from "@/config/links";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex flex-col items-center gap-3 px-6 pt-12 text-center">
      <Image
        src={profile.avatarPath}
        alt={`${profile.name} 프로필 사진`}
        width={128}
        height={128}
        priority
        className="h-32 w-32 rounded-full object-cover"
      />
      <h1 className="text-xl font-bold text-zinc-900">{profile.name}</h1>
      <p className="max-w-xs text-sm text-zinc-600">{profile.bio}</p>
    </header>
  );
}
