import { create } from 'zustand';
import { Link, SocialLink, Tag, Column, ActivityLog } from './types';
import { supabase } from './lib/supabase';

interface LinkState {
  columns: Column[];
  tags: Tag[];
  socialLinks: SocialLink[];
  searchTerm: string;
  selectedTagId: string | null;
  isDarkMode: boolean;
  isTagManagerOpen: boolean;
  isActivityLogOpen: boolean;
  activityLogs: ActivityLog[];
  setSearchTerm: (term: string) => void;
  setSelectedTagId: (tagId: string | null) => void;
  addLink: (columnId: string, link: Omit<Link, 'id' | 'isPinned' | 'order' | 'columnId'>) => Promise<void>;
  updateLink: (id: string, link: Partial<Link>) => Promise<void>;
  deleteLink: (columnId: string, linkId: string) => Promise<void>;
  togglePinned: (columnId: string, id: string) => Promise<void>;
  moveLink: (fromColumnId: string, toColumnId: string, linkId: string) => Promise<void>;
  reorderLinks: (columnId: string, links: Link[]) => Promise<void>;
  updateColumnTitle: (columnId: string, title: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<void>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  toggleTagManager: () => void;
  toggleActivityLog: () => void;
  toggleDarkMode: () => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => Promise<void>;
  initializeStore: () => Promise<void>;
}

export const useStore = create<LinkState>((set, get) => ({
  columns: [],
  tags: [],
  socialLinks: [
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/planhomkorea/', icon: 'Instagram' },
    { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/authwall?trk=bf&trkInfo=AQGCaiooHOlVtAAAAZZV3-ogszoqvpT1zybgtGgKmZ3OfdahBQjmVG9eiuqd-uW2SPGZWElOcDmTlPf-PQypFCQlr95ymJ2BL-Kmlnti5ScmRe7aAb23RrAh_4H8NE-r4_7wSnM=&original_referer=&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Fplanhom%2Fabout%2F%3FviewAsMember%3Dtrue', icon: 'Linkedin' },
    { id: 'twitter', name: 'X', url: 'https://x.com/PLANHOM', icon: 'Twitter' },
    { id: 'youtube', name: 'Youtube', url: 'https://www.youtube.com/@planhom', icon: 'Youtube' },
    { id: 'threads', name: 'threads', url: 'https://www.threads.net/@planhomkorea', icon: 'threads' },
  ],
  searchTerm: '',
  selectedTagId: null,
  isDarkMode: false,
  isTagManagerOpen: false,
  isActivityLogOpen: false,
  activityLogs: [],

  initializeStore: async () => {
    try {
      // Fetch tags
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (tagsError) throw tagsError;

      // Fetch links
      const { data: links, error: linksError } = await supabase
        .from('links')
        .select('*, link_tags(tag_id)')
        .order('created_at', { ascending: true });

      if (linksError) throw linksError;

      // Fetch categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Transform data into columns structure
      const transformedColumns = categories.map(category => ({
        id: category.id,
        title: category.name,
        emoji: category.order === 1 ? '🔴' : category.order === 2 ? '🟡' : '⚪',
        links: links
          .filter(link => link.category_id === category.id)
          .map(link => ({
            id: link.id,
            name: link.title,
            url: link.url,
            tagIds: link.link_tags.map((lt: any) => lt.tag_id),
            isPinned: link.is_pinned,
            order: link.order || 0,
            columnId: category.id
          }))
      }));

      set({
        columns: transformedColumns,
        tags: tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color
        }))
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedTagId: (tagId) => set({ selectedTagId: tagId }),

  addLink: async (columnId, linkData) => {
    try {
      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Insert into links table with user_id
      const { data: link, error: linkError } = await supabase
        .from('links')
        .insert({
          title: linkData.name,
          url: linkData.url,
          category_id: columnId,
          is_pinned: false,
          user_id: user.id // Add user_id to match RLS policy
        })
        .select()
        .single();

      if (linkError) throw linkError;

      // Insert tag relationships
      if (linkData.tagIds.length > 0) {
        const linkTags = linkData.tagIds.map(tagId => ({
          link_id: link.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('link_tags')
          .insert(linkTags);

        if (tagError) throw tagError;
      }

      // Update local state
      set((state) => ({
        columns: state.columns.map(column =>
          column.id === columnId
            ? {
                ...column,
                links: [...column.links, {
                  id: link.id,
                  name: linkData.name,
                  url: linkData.url,
                  tagIds: linkData.tagIds,
                  isPinned: false,
                  order: column.links.length,
                  columnId
                }]
              }
            : column
        )
      }));

      // Add activity log
      await get().addActivityLog({
        type: 'create',
        itemName: linkData.name,
        details: `Added to ${get().columns.find(c => c.id === columnId)?.title}`
      });
    } catch (error) {
      console.error('Failed to add link:', error);
      throw error; // Re-throw to be handled by the UI
    }
  },

  updateLink: async (id, updatedLink) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({
          title: updatedLink.name,
          url: updatedLink.url,
          is_pinned: updatedLink.isPinned
        })
        .eq('id', id);

      if (error) throw error;

      if (updatedLink.tagIds) {
        // Remove existing tags
        await supabase
          .from('link_tags')
          .delete()
          .eq('link_id', id);

        // Add new tags
        const linkTags = updatedLink.tagIds.map(tagId => ({
          link_id: id,
          tag_id: tagId
        }));

        await supabase
          .from('link_tags')
          .insert(linkTags);
      }

      set((state) => ({
        columns: state.columns.map(column => ({
          ...column,
          links: column.links.map(link =>
            link.id === id ? { ...link, ...updatedLink } : link
          )
        }))
      }));
    } catch (error) {
      console.error('Failed to update link:', error);
    }
  },

  deleteLink: async (columnId, linkId) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      const link = get().columns.find(c => c.id === columnId)?.links.find(l => l.id === linkId);
      
      set((state) => ({
        columns: state.columns.map(column =>
          column.id === columnId
            ? {
                ...column,
                links: column.links.filter(link => link.id !== linkId)
              }
            : column
        )
      }));

      if (link) {
        await get().addActivityLog({
          type: 'delete',
          itemName: link.name,
          details: `Removed from ${get().columns.find(c => c.id === columnId)?.title}`
        });
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  },

  togglePinned: async (columnId, id) => {
    try {
      const link = get().columns.find(c => c.id === columnId)?.links.find(l => l.id === id);
      if (!link) return;

      const newPinnedState = !link.isPinned;

      const { error } = await supabase
        .from('links')
        .update({ is_pinned: newPinnedState })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        columns: state.columns.map(column =>
          column.id === columnId
            ? {
                ...column,
                links: column.links.map(link =>
                  link.id === id ? { ...link, isPinned: newPinnedState } : link
                )
              }
            : column
        )
      }));

      await get().addActivityLog({
        type: newPinnedState ? 'pin' : 'unpin',
        itemName: link.name,
        details: newPinnedState ? 'Pinned' : 'Unpinned'
      });
    } catch (error) {
      console.error('Failed to toggle pin state:', error);
    }
  },

  moveLink: async (fromColumnId, toColumnId, linkId) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({ category_id: toColumnId })
        .eq('id', linkId);

      if (error) throw error;

      const link = get().columns.find(c => c.id === fromColumnId)?.links.find(l => l.id === linkId);
      
      set((state) => ({
        columns: state.columns.map(column => {
          if (column.id === fromColumnId) {
            return {
              ...column,
              links: column.links.filter(l => l.id !== linkId)
            };
          }
          if (column.id === toColumnId && link) {
            return {
              ...column,
              links: [...column.links, { ...link, columnId: toColumnId, order: column.links.length }]
            };
          }
          return column;
        })
      }));

      if (link) {
        await get().addActivityLog({
          type: 'move',
          itemName: link.name,
          details: `Moved from ${get().columns.find(c => c.id === fromColumnId)?.title} to ${get().columns.find(c => c.id === toColumnId)?.title}`
        });
      }
    } catch (error) {
      console.error('Failed to move link:', error);
    }
  },

  reorderLinks: async (columnId, links) => {
    try {
      // Update order in database
      for (const [index, link] of links.entries()) {
        const { error } = await supabase
          .from('links')
          .update({ order: index })
          .eq('id', link.id);

        if (error) throw error;
      }

      set((state) => ({
        columns: state.columns.map(column =>
          column.id === columnId
            ? { ...column, links }
            : column
        )
      }));
    } catch (error) {
      console.error('Failed to reorder links:', error);
    }
  },

  updateColumnTitle: async (columnId, title) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: title })
        .eq('id', columnId);

      if (error) throw error;

      set((state) => ({
        columns: state.columns.map(column =>
          column.id === columnId
            ? { ...column, title }
            : column
        )
      }));
    } catch (error) {
      console.error('Failed to update column title:', error);
    }
  },

  addTag: async (tag) => {
    try {
      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('tags')
        .insert({ 
          name: tag.name, 
          color: tag.color,
          user_id: user.id // Include the user_id in the insert
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tags: [...state.tags, { id: data.id, ...tag }]
      }));
    } catch (error) {
      console.error('Failed to add tag:', error);
      throw error; // Re-throw the error to be handled by the UI
    }
  },

  updateTag: async (id, updatedTag) => {
    try {
      const { error } = await supabase
        .from('tags')
        .update({ name: updatedTag.name, color: updatedTag.color })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        tags: state.tags.map(tag =>
          tag.id === id ? { ...tag, ...updatedTag } : tag
        )
      }));
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  },

  deleteTag: async (id) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        tags: state.tags.filter(tag => tag.id !== id),
        columns: state.columns.map(column => ({
          ...column,
          links: column.links.map(link => ({
            ...link,
            tagIds: link.tagIds.filter(tagId => tagId !== id)
          }))
        }))
      }));
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  },

  toggleTagManager: () => set((state) => ({ isTagManagerOpen: !state.isTagManagerOpen })),
  toggleActivityLog: () => set((state) => ({ isActivityLogOpen: !state.isActivityLogOpen })),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  addActivityLog: async (log) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          action: log.type,
          link_id: log.itemName // This should be the actual link ID
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        activityLogs: [{
          ...log,
          id: data.id,
          timestamp: data.timestamp
        }, ...state.activityLogs].slice(0, 100)
      }));
    } catch (error) {
      console.error('Failed to add activity log:', error);
    }
  }
}));