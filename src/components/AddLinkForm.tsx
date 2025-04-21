import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Tags } from 'lucide-react';

export const AddLinkForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const { addLink, tags, isDarkMode, toggleTagManager, columns } = useStore();

  // Set initial column ID when form opens
  React.useEffect(() => {
    if (isOpen && columns.length > 0 && !selectedColumnId) {
      setSelectedColumnId(columns[0].id);
    }
  }, [isOpen, columns, selectedColumnId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url && selectedTagIds.length > 0 && selectedColumnId) {
      try {
        await addLink(selectedColumnId, { name, url, tagIds: selectedTagIds });
        setName('');
        setUrl('');
        setSelectedTagIds([]);
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to add link:', error);
      }
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center px-4 py-2 rounded-lg ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Link
        </button>
      ) : (
        <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded border"
            />
            <input
              type="url"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 rounded border"
            />
            <div>
              <label className="block text-sm font-medium mb-2">Select Column</label>
              <select
                value={selectedColumnId}
                onChange={(e) => setSelectedColumnId(e.target.value)}
                className="w-full p-2 rounded border"
                required
              >
                <option value="" disabled>Select a column</option>
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.emoji} {column.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Select Tags</label>
                <button
                  type="button"
                  onClick={toggleTagManager}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Tags className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                    style={{
                      backgroundColor: selectedTagIds.includes(tag.id)
                        ? tag.color
                        : tag.color + '20'
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={!name || !url || selectedTagIds.length === 0 || !selectedColumnId}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Link
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};