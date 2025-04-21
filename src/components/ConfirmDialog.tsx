import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useStore } from '../store';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const isDarkMode = useStore((state) => state.isDarkMode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-md p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};