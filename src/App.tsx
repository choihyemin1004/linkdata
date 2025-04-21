import React, { useEffect } from 'react';
import { useStore } from './store';
import { useAuth } from './contexts/AuthContext';
import { SocialLinks } from './components/SocialLinks';
import { LinkList } from './components/LinkList';
import { AddLinkForm } from './components/AddLinkForm';
import { TagManager } from './components/TagManager';
import { PasswordGate } from './components/PasswordGate';
import { ActivityLog } from './components/ActivityLog';
import { Search, Moon, Sun, Tags, Clock, Loader2 } from 'lucide-react';
import { validateConnection } from './lib/supabase';

function App() {
  const {
    searchTerm,
    setSearchTerm,
    selectedTagId,
    setSelectedTagId,
    isDarkMode,
    toggleDarkMode,
    toggleTagManager,
    toggleActivityLog,
    tags,
    initializeStore
  } = useStore();

  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    validateConnection().then(isConnected => {
      if (!isConnected) {
        console.error('Failed to connect to Supabase');
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      initializeStore();
    }
  }, [isAuthenticated, initializeStore]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PasswordGate />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Link Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={toggleActivityLog}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <Clock className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTagManager}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <Tags className="w-5 h-5" />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <SocialLinks />

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTagId(null)}
              className={`px-3 py-1 rounded-full ${
                selectedTagId === null
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-800'
                  : 'bg-white'
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTagId(tag.id)}
                className={`px-3 py-1 rounded-full transition-colors`}
                style={{
                  backgroundColor: selectedTagId === tag.id
                    ? tag.color
                    : tag.color + '20',
                  color: selectedTagId === tag.id ? 'white' : 'inherit'
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <AddLinkForm />
        <LinkList />
        <TagManager />
        <ActivityLog />
      </div>
    </div>
  );
}

export default App;