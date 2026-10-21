export interface ProjectPortal {
  id: string;
  title: string;
  category: string;
  role: string;
  year: string;
  description: string;
  url: string;
  thumbnail: string;
  themeColor: string;
  environmentType: 'cyberpunk' | 'fantasy' | 'stellar' | 'nature' | 'minimal' | 'retro';
  tags: string[];
  metrics?: string;
  featured?: boolean;
}

export interface AuthorProfile {
  name: string;
  title: string;
  avatarSeed: string;
  headline: string;
  bio: string;
  philosophy: string;
  stats: { label: string; value: string }[];
  skills: { category: string; items: string[] }[];
  socialLinks: { name: string; url: string; icon: string }[];
}

export interface MultiverseSettings {
  worldTheme: 'cosmic' | 'cyberpunk' | 'aurora' | 'twilight';
  showStarfield: boolean;
  ambientSound: boolean;
  pathLength: number;
}
