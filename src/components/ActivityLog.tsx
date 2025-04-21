import React from 'react';
import { useStore } from '../store';
import { Clock, Plus, Pencil, Trash2, MoveRight, Pin, ChevronLeft } from 'lucide-react';
import { ActivityLog as ActivityLogType } from '../types';

const ActivityIcon: React.FC<{ type: ActivityLogType['type'] }> = ({ type }) => {
  switch (type) {
    case 'create':
      return <Plus className="w-4 h-4 text-green-500" />;
    case 'edit':
      return <Pencil className="w-4 h-4 text-blue-500" />;
    case 'delete':
      return <Trash2 className="w-4 h-4 text-red-500" />;
    case 'move':
      return <MoveRight className="w-4 h-4 text-purple-500" />;
    case 'pin':
    case 'unpin':
      return <Pin className="w-4 h-4 text-amber-500" />;
    default:
      return null;
  }
};

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ActivityLog: React.FC = () => {
  const { activityLogs, isDarkMode, isActivityLogOpen, toggleActivityLog } = useStore();

  return (
    <>
      {/* Toggle button when drawer is closed */}
      {!isActivityLogOpen && (
        <button
          onClick={toggleActivityLog}
          className={`fixed right-0 top-1/2 -translate-y-1/2 p-2 rounded-l-lg shadow-lg ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}
        >
          <Clock className="w-5 h-5" />
        </button>
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 transform transition-transform duration-300 ease-in-out ${
          isActivityLogOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-lg z-50`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center gap-2">
            <button
              onClick={toggleActivityLog}
              className={`p-1 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <Clock className="w-5 h-5" />
            <h2 className="font-semibold">Activity Log</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activityLogs.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No activity recorded yet
              </div>
            ) : (
              <div className="divide-y">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 flex items-start gap-3 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="mt-1">
                      <ActivityIcon type={log.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{log.itemName}</div>
                      {log.details && (
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {log.details}
                        </div>
                      )}
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};