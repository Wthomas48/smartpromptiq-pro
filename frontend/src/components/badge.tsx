import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
      destructive: 'bg-red-100 text-red-800 hover:bg-red-200'
    };

    return (
      <div 
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-default',
          variants[variant],
          className
        )} 
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };