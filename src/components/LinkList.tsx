import React, { useState } from 'react';
import { useStore } from '../store';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pin, Trash2, GripVertical, ExternalLink, Pencil } from 'lucide-react';
import { Link, Column } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

const truncateUrl = (url: string): string => {
  const MAX_LENGTH = 30;
  if (url.length <= MAX_LENGTH) return url;

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    if (domain.length > MAX_LENGTH) {
      return `${domain.slice(0, MAX_LENGTH - 3)}...`;
    }
    
    const remainingLength = MAX_LENGTH - domain.length - 3;
    if (path.length > remainingLength) {
      return `${domain}${path.slice(0, remainingLength)}...`;
    }
    
    return `${domain}${path}`;
  } catch {
    return url.slice(0, MAX_LENGTH - 3) + '...';
  }
};

interface SortableItemProps {
  link: Link;
  columnId: string;
  isDragging?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ link, columnId, isDragging = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id });
  const { togglePinned, deleteLink, isDarkMode, tags } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullUrl, setShowFullUrl] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const linkTags = tags.filter((tag) => link.tagIds.includes(tag.id));

  const getFullUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center p-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg mb-2 ${
          link.isPinned ? 'border-2 border-blue-500' : ''
        } transition-colors duration-200`}
      >
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 ml-4 min-w-0">
          <div className="font-medium">{link.name}</div>
          <div className="relative group">
            <a
              href={getFullUrl(link.url)}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm flex items-center gap-1 hover:underline ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              } truncate max-w-[200px]`}
              onMouseEnter={() => setShowFullUrl(true)}
              onMouseLeave={() => setShowFullUrl(false)}
            >
              {truncateUrl(link.url)}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
            {showFullUrl && (
              <div className={`absolute left-0 top-full mt-1 p-2 rounded text-xs z-10 max-w-xs break-all ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-800 text-white'
              } shadow-lg`}>
                {getFullUrl(link.url)}
              </div>
            )}
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {linkTags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 text-xs rounded-full text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
          <button
            onClick={() => togglePinned(columnId, link.id)}
            className={`p-1 rounded hover:bg-gray-100 ${
              link.isPinned ? 'text-blue-500' : ''
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 rounded hover:bg-gray-100 text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteLink(columnId, link.id)}
        title="Delete Link"
        message="Are you sure you want to delete this link? This action cannot be undone."
      />
    </>
  );
};

const ColumnComponent: React.FC<{
  column: Column;
  isOver?: boolean;
  activeId?: string | null;
}> = ({ column, isOver, activeId }) => {
  const { searchTerm, selectedTagId, reorderLinks, isDarkMode, updateColumnTitle } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const { setNodeRef } = useDroppable({ id: column.id });

  const filteredLinks = column.links
    .filter((link) => {
      const matchesSearch = link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !selectedTagId || link.tagIds.includes(selectedTagId);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return a.order - b.order;
    });

  const handleTitleSubmit = () => {
    if (title.trim()) {
      updateColumnTitle(column.id, title);
    } else {
      setTitle(column.title);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[300px] p-4 rounded-lg transition-colors duration-200 ${
        isDarkMode
          ? isOver
            ? 'bg-gray-700/50 ring-2 ring-blue-500'
            : 'bg-gray-800/50'
          : isOver
          ? 'bg-gray-200/50 ring-2 ring-blue-500'
          : 'bg-gray-100/50'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            className="px-2 py-1 rounded border"
            autoFocus
          />
        ) : (
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>{column.emoji}</span>
            <span>{column.title}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </h2>
        )}
      </div>

      {isOver && (
        <div className="border-2 border-blue-500 border-dashed rounded-lg p-4 mb-2">
          <p className="text-center text-blue-500">Drop here</p>
        </div>
      )}
      
      <SortableContext items={filteredLinks} strategy={verticalListSortingStrategy}>
        {filteredLinks.map((link) => (
          <SortableItem
            key={link.id}
            link={link}
            columnId={column.id}
            isDragging={activeId === link.id}
          />
        ))}
      </SortableContext>
    </div>
  );
};

export const LinkList: React.FC = () => {
  const { columns, moveLink } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const columnId = columns.find(col => 
      col.links.some(link => link.id === active.id)
    )?.id;
    setActiveColumnId(columnId || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }

    const overId = over.id as string;
    const overColumn = columns.find(col => col.id === overId);
    
    if (overColumn) {
      setOverColumnId(overId);
    } else {
      const linkColumn = columns.find(col =>
        col.links.some(link => link.id === overId)
      );
      if (linkColumn) {
        setOverColumnId(linkColumn.id);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeColumnId || !overColumnId) {
      setActiveId(null);
      setActiveColumnId(null);
      setOverColumnId(null);
      return;
    }

    if (activeColumnId !== overColumnId) {
      moveLink(activeColumnId, overColumnId, active.id as string);
    } else {
      const activeColumn = columns.find(col => col.id === activeColumnId);
      if (!activeColumn) return;

      const activeIndex = activeColumn.links.findIndex(link => link.id === active.id);
      const overIndex = activeColumn.links.findIndex(link => link.id === over.id);

      if (activeIndex !== overIndex) {
        const newLinks = [...activeColumn.links];
        const [movedItem] = newLinks.splice(activeIndex, 1);
        newLinks.splice(overIndex, 0, movedItem);
        
        const updatedLinks = newLinks.map((link, index) => ({
          ...link,
          order: index
        }));
        
        useStore.getState().reorderLinks(activeColumnId, updatedLinks);
      }
    }

    setActiveId(null);
    setActiveColumnId(null);
    setOverColumnId(null);
  };

  const draggedLink = activeId
    ? columns.find(col => col.links.some(link => link.id === activeId))
        ?.links.find(link => link.id === activeId)
    : null;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <ColumnComponent
            key={column.id}
            column={column}
            isOver={overColumnId === column.id}
            activeId={activeId}
          />
        ))}
      </div>

      <DragOverlay>
        {draggedLink && (
          <div className="w-[300px]">
            <SortableItem
              link={draggedLink}
              columnId={activeColumnId || ''}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};