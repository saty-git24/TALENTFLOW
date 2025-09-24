import React, { useState, useRef, useEffect } from 'react';
import { MOCK_USERS } from '../../utils/constants.js';
import { extractMentions } from '../../utils/helpers.js';

export const MentionInput = ({ 
  value, 
  onChange, 
  placeholder = 'Type your message...', 
  className = '',
  onSubmit,
  rows = 3
}) => {
  const [mentionQuery, setMentionQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filter users based on mention query
  const filteredUsers = MOCK_USERS.filter(user =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Handle text change and detect mentions
  const handleChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(cursorPos);
    
    // Check if we're typing a mention
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowSuggestions(true);
      
      // Calculate position for suggestions dropdown
      const textarea = textareaRef.current;
      if (textarea) {
        const lineHeight = 20; // Approximate line height
        const lines = textBeforeCursor.split('\n').length - 1;
        const currentLineText = textBeforeCursor.split('\n').pop();
        const charWidth = 8; // Approximate character width
        
        setSuggestionPosition({
          top: (lines * lineHeight) + 25,
          left: Math.min(currentLineText.length * charWidth, 300)
        });
      }
    } else {
      setShowSuggestions(false);
      setMentionQuery('');
    }
  };

  // Handle mention selection
  const selectMention = (user) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);
    
    // Find the start of the current mention
    const mentionStart = beforeCursor.lastIndexOf('@');
    const beforeMention = value.slice(0, mentionStart);
    const mention = `@${user.name}`;
    const newValue = beforeMention + mention + ' ' + afterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    setMentionQuery('');
    
    // Set cursor position after the mention
    setTimeout(() => {
      const newCursorPos = mentionStart + mention.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredUsers.length === 0) {
      if (e.key === 'Enter' && e.ctrlKey && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const current = document.querySelector('.mention-suggestion.selected');
      const next = current?.nextElementSibling || document.querySelector('.mention-suggestion');
      if (next) {
        current?.classList.remove('selected');
        next.classList.add('selected');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const current = document.querySelector('.mention-suggestion.selected');
      const prev = current?.previousElementSibling || document.querySelector('.mention-suggestion:last-child');
      if (prev) {
        current?.classList.remove('selected');
        prev.classList.add('selected');
      }
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const selected = document.querySelector('.mention-suggestion.selected');
      if (selected) {
        const userId = selected.dataset.userId;
        const user = MOCK_USERS.find(u => u.id === parseInt(userId));
        if (user) selectMention(user);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setMentionQuery('');
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          textareaRef.current && !textareaRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-300 placeholder:font-medium placeholder:px-1 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:bg-white dark:focus:bg-gray-600 hover:bg-white dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 resize-none px-4 py-3 ${className}`}
      />
      
      {showSuggestions && filteredUsers.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto"
          style={{
            top: suggestionPosition.top,
            left: suggestionPosition.left,
            minWidth: '220px'
          }}
        >
          {filteredUsers.map((user, index) => (
            <div
              key={user.id}
              data-user-id={user.id}
              className={`mention-suggestion px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                index === 0 ? 'selected bg-gray-100 dark:bg-gray-700' : ''
              }`}
              onClick={() => selectMention(user)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {onSubmit && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 px-1">
          Press Ctrl+Enter to submit, @ to mention users
        </div>
      )}
    </div>
  );
};