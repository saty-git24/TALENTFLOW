import React from 'react';
import { cn } from '../../utils/helpers.js';

export const Select = React.forwardRef(({
  className,
  error,
  label,
  helperText,
  required,
  options = [],
  placeholder,
  children,
  ...props
}, ref) => {
  const selectId = props.id || props.name;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        ref={ref}
        className={cn(
          'block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm transition-all duration-200',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          'px-4 py-3 text-sm font-medium',
          // Light theme
          'bg-white text-gray-900 hover:bg-gray-50',
          // Dark theme  
          'dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
          'dark:disabled:bg-gray-900 dark:disabled:text-gray-600',
          error && 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500',
          error && 'dark:border-red-600 dark:text-red-300 dark:focus:border-red-400 dark:focus:ring-red-400'
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="text-gray-500 dark:text-gray-400">
            {placeholder}
          </option>
        )}
        
        {options.map((option) => {
          if (typeof option === 'string') {
            return (
              <option key={option} value={option} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 py-2">
                {option}
              </option>
            );
          }
          
          return (
            <option key={option.value} value={option.value} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 py-2">
              {option.label}
            </option>
          );
        })}
        
        {children}
      </select>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';