import React from 'react';
import { useStore } from '../store';
import * as Icons from 'lucide-react';

export const SocialLinks: React.FC = () => {
  const socialLinks = useStore((state) => state.socialLinks);
  const isDarkMode = useStore((state) => state.isDarkMode);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {socialLinks.map((link) => {
        const Icon = Icons[link.icon as keyof typeof Icons];
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center p-4 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Icon className="w-6 h-6 mr-2" />
            <span>{link.name}</span>
          </a>
        );
      })}
    </div>
  );
};