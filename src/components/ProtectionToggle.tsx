import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Unlock } from 'lucide-react';

export const ProtectionToggle: React.FC = () => {
  const { isProtectionEnabled, toggleProtection, logout } = useAuth();

  const handleToggle = () => {
    if (isProtectionEnabled) {
      if (confirm('Are you sure you want to disable password protection?')) {
        toggleProtection();
      }
    } else {
      toggleProtection();
      logout(); // Force re-authentication when protection is enabled
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg transition-colors"
      title={isProtectionEnabled ? 'Password protection enabled' : 'Password protection disabled'}
    >
      {isProtectionEnabled ? (
        <Lock className="w-5 h-5" />
      ) : (
        <Unlock className="w-5 h-5" />
      )}
    </button>
  );
};