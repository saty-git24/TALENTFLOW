import React from 'react';
import { MOCK_USERS } from '../../utils/constants.js';

export const MentionText = ({ children, className = '' }) => {
  if (!children || typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }

  // Split text by mentions and process each part
  const parts = children.split(/(@\w+)/g);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const username = part.slice(1);
          const user = MOCK_USERS.find(u => 
            u.name.toLowerCase().replace(/\s+/g, '') === username.toLowerCase() ||
            u.name.toLowerCase().includes(username.toLowerCase())
          );
          
          if (user) {
            return (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors cursor-default"
                title={`${user.name} (${user.email})`}
              >
                <span className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-1">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
                @{user.name}
              </span>
            );
          }
          
          // Return unmatched mentions as-is but styled
          return (
            <span
              key={index}
              className="text-primary-600 dark:text-primary-400 font-medium"
            >
              {part}
            </span>
          );
        }
        
        return part;
      })}
    </span>
  );
};