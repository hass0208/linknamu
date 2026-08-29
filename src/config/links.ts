export interface Profile {
  name: string;
  bio: string;
  avatarPath: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export const profile: Profile = {
  name: "HSS",
  bio: "유능한 바이브코더 꿈나무",
  avatarPath: "/profile.jpeg",
};

export const links: LinkItem[] = [
  { id: "blog", label: "블로그", url: "https://example.com/blog" },
  { id: "github", label: "GitHub", url: "https://github.com/example" },
  { id: "notion", label: "Notion 포트폴리오", url: "https://app.notion.com/p/About-Me-3c54c3bffc2a81b5af85c690f09249b5?source=copy_link" },
  { id: "instagram", label: "Instagram", url: "https://instagram.com/example" },
];

export function findLinkById(id: string): LinkItem | undefined {
  return links.find((link) => link.id === id);
}
