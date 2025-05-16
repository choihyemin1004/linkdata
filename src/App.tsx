import React, { useEffect } from "react";
import { useStore } from "./store";
import { useAuth } from "./contexts/AuthContext";
import { SocialLinks } from "./components/SocialLinks";
import { LinkList } from "./components/LinkList";
import { AddLinkForm } from "./components/AddLinkForm";
import { TagManager } from "./components/TagManager";
import { PasswordGate } from "./components/PasswordGate";
import { ActivityLog } from "./components/ActivityLog";
import {
  Search,
  Moon,
  Sun,
  Tags,
  Clock,
  Loader2,
  Calendar,
  ClipboardList,
} from "lucide-react";
import { validateConnection } from "./lib/supabase";

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
    initializeStore,
  } = useStore();

  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    validateConnection().then((isConnected) => {
      if (!isConnected) {
        console.error("Failed to connect to Supabase");
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
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">플랜홈 링크 Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={toggleActivityLog}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <Clock className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTagManager}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <Tags className="w-5 h-5" />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Visually Enhanced Centered Navigation Links */}
        <div className={`w-full flex justify-center mb-6`}>
          <div
            className={`flex gap-6 items-center p-3 rounded-lg shadow ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <a
              href="https://www.notion.so/Planhom-Plan-1f1e6602084380e0a78ff284dd965a1a?pvs=4"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-blue-300 hover:text-blue-200"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">시각적 달별 일정</span>
            </a>

            <a
              href="https://doc.weixin.qq.com/smartsheet/s3_AfQADwb3AHQG5B0s0D9TXuylKLBpF?scode=AJgAoAeRAAYgFcGiXlAfQADwb3AHQ&tab=q979lj&viewId=vukaF8"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-green-300 hover:text-green-200"
                  : "bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="font-medium">주간 업무보고</span>
            </a>
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
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTagId(null)}
              className={`px-3 py-1 rounded-full ${
                selectedTagId === null
                  ? "bg-blue-500 text-white"
                  : isDarkMode
                  ? "bg-gray-800"
                  : "bg-white"
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
                  backgroundColor:
                    selectedTagId === tag.id ? tag.color : tag.color + "20",
                  color: selectedTagId === tag.id ? "white" : "inherit",
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
