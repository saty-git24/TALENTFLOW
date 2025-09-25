import React from 'react';
import { cn } from '../../utils/helpers.js';

export const Card = React.forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200',
      className
    )}
    {...props}
  >
    {children}
  </div>
));

Card.displayName = 'Card';

export const CardHeader = ({ children, className, ...props }) => (
  <div
    className={cn('p-6 pb-4 px-7', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardContent = ({ children, className, ...props }) => (
  <div
    className={cn('p-6 pt-0 px-7', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div
    className={cn('flex items-center p-6 pt-0 px-7', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3
    className={cn('text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 px-1', className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p
    className={cn('text-sm text-gray-600 dark:text-gray-400 px-1', className)}
    {...props}
  >
    {children}
  </p>
);