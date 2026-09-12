export interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  category: StoreCategory;
  rating: number;
  downloads: number;
  author: string;
  permissions: string[];
  installed: boolean;
  updateAvailable: boolean;
  changelog?: string;
}

export type StoreCategory = "all" | "productivity" | "security" | "integration" | "developer-tools";
export type StoreTab = "discover" | "installed" | "updates";
