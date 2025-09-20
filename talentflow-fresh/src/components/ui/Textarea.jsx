import React from 'react';
import { cn } from '../../utils/helpers.js';

export const Textarea = React.forwardRef(({
  className,
  error,
  label,
  helperText,
  required,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = props.id || props.name;

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        rows={rows}
        ref={ref}
        className={cn(
          'block w-full rounded-md border-gray-300 shadow-sm transition-colors resize-vertical',
          'focus:border-primary-500 focus:ring-primary-500',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          error && 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';