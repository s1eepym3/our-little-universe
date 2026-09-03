export type MomentCategory = 'first_trip' | 'random';
export type MediaType = 'image' | 'video';

export interface Moment {
  id: string;
  title: string | null;
  caption: string | null;
  category: MomentCategory;
  is_public: boolean;
  cover_url: string | null;
  tags: string[];
  created_at: string;
}

export interface Media {
  id: string;
  moment_id: string;
  type: MediaType;
  url: string;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  mood: string | null;
  author_id: string;
  created_at: string;
}
