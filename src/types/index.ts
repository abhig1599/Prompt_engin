export type ResourceType = 'prompt' | 'site';
export type ResourceStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

export interface Resource {
  $id: string;
  type: ResourceType;
  slug: string;
  title: string;
  summary: string;
  categoryId: string;
  status: ResourceStatus;
  submittedBy?: string;
  featured: boolean;
  qualityScore: number;
  viewCount: number;
  saveCount: number;
  actionCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  // Relationships joined by Appwrite
  promptDetails?: PromptDetails;
  siteDetails?: SiteDetails;
  category?: Category;
  tags?: Tag[];
}

export interface PromptDetails {
  $id: string;
  resourceId: string;
  promptText: string;
  negativePrompt?: string;
  modelId: string;
  modelVersion?: string;
  params?: any;
  variables?: any;
  outputImages: any[]; // JSON array of objects { url, width, height, blurhash, alt }
  sourceUrl?: string;
  creditName?: string;
  license: 'cc0' | 'cc-by' | 'personal-use' | 'unknown';
  parentId?: string;
}

export interface SiteDetails {
  $id: string;
  resourceId: string;
  url: string;
  urlHash: string;
  domain: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  coverUrl?: string;
  bio: string;
  useCase?: string;
  pricing: 'free' | 'freemium' | 'paid' | 'open-source';
  platform: string[]; // 'web', 'ios', 'android', 'desktop', 'cli', 'api', 'extension'
  listedDate: string;
  lastCheckedAt?: string;
  healthStatus: 'ok' | 'redirect' | 'slow' | 'dead';
  failCount: number;
}

export interface Category {
  $id: string;
  name: string;
  slug: string;
  parentId?: string;
  icon?: string;
  description?: string;
  sortOrder: number;
}

export interface Tag {
  $id: string;
  name: string;
  slug: string;
  aliases: string[];
  usageCount: number;
}
