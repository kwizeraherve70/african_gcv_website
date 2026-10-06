export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: 'Pi Network' | 'GCV Movement' | 'Events' | 'Community';
  author: string;
  publishedAt: string;
  readTime: string;
  viewCount: number;
  /** Country this story is about, for the News & Media country hub. Omitted for pan-African/global stories. */
  country?: string;
}

export interface Announcement {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  priority: 'high' | 'normal';
}
