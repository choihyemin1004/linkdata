export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Column {
  id: string;
  title: string;
  emoji: string;
  links: Link[];
}

export interface Link {
  id: string;
  name: string;
  url: string;
  tagIds: string[];
  isPinned: boolean;
  order: number;
  columnId: string;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'create' | 'edit' | 'delete' | 'move' | 'pin' | 'unpin';
  itemName: string;
  details?: string;
}