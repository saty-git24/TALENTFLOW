import React from 'react';
import { cn } from '../../utils/helpers.js';

export const Input = React.forwardRef(({
  className,
  type = 'text',
  error,
  label,
  helperText,
  required,
  ...props
}, ref) => {
  const inputId = props.id || props.name;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-900 dark:text-gray-100 px-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        id={inputId}
        ref={ref}
        className={cn(
          'block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600',
          'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
          'placeholder-gray-600 dark:placeholder-gray-300 placeholder:font-medium placeholder:px-1',
          'shadow-sm transition-all duration-200 min-h-[48px]',
          'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:bg-white dark:focus:bg-gray-600',
          'hover:border-gray-400 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-600',
          'disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 dark:disabled:border-gray-700',
          error && 'border-red-400 dark:border-red-500 text-red-900 dark:text-red-100 bg-red-50 dark:bg-red-900/20 placeholder-red-400 dark:placeholder-red-300 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20'
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 px-1">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-600 dark:text-gray-400 px-1">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';