import React, { useState } from 'react';
import { useStore } from '../store';
import { X, Plus } from 'lucide-react';
import { Tag } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

const PRESET_COLORS = [
  '#F24E1E', '#4285F4', '#34A853', '#FBBC05', '#EA4335',
  '#FF6B6B', '#4C6EF5', '#40C057', '#FAB005', '#7950F2',
];

export const TagManager: React.FC = () => {
  const { tags, addTag, updateTag, deleteTag, isTagManagerOpen, toggleTagManager, isDarkMode } = useStore();
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      addTag({ name: newTagName.trim(), color: selectedColor });
      setNewTagName('');
      setSelectedColor(PRESET_COLORS[0]);
    }
  };

  if (!isTagManagerOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-md p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tag Manager</h2>
          <button onClick={toggleTagManager}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name"
              className="flex-1 p-2 rounded border"
            />
            <div className="relative">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color ? 'border-blue-500' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </form>

        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-2 rounded"
              style={{ backgroundColor: tag.color + '20' }}
            >
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                />
                <span>{tag.name}</span>
              </div>
              <button
                onClick={() => setTagToDelete(tag.id)}
                className="text-red-500 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={tagToDelete !== null}
        onClose={() => setTagToDelete(null)}
        onConfirm={() => {
          if (tagToDelete) deleteTag(tagToDelete);
        }}
        title="Delete Tag"
        message="Are you sure you want to delete this tag? This action cannot be undone. All links using this tag will be updated."
      />
    </div>
  );
};