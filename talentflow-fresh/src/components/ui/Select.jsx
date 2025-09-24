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
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 px-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        ref={ref}
        className={cn(
          'block w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm transition-all duration-200',
          'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20',
          'disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 dark:disabled:border-gray-700',
          'px-4 py-3 text-sm font-medium min-h-[48px]',
          // Light theme
          'bg-gray-50 text-gray-900 hover:bg-gray-100 focus:bg-white',
          // Dark theme  
          'dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:bg-gray-600',
          error && 'border-red-400 dark:border-red-500 text-red-900 dark:text-red-100 bg-red-50 dark:bg-red-900/20 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20'
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="text-gray-600 dark:text-gray-300 py-3">
            {placeholder}
          </option>
        )}
        
        {options.map((option) => {
          if (typeof option === 'string') {
            return (
              <option key={option} value={option} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">
                {option}
              </option>
            );
          }
          
          return (
            <option key={option.value} value={option.value} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3">
              {option.label}
            </option>
          );
        })}
        
        {children}
      </select>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1 px-1">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 px-1">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';