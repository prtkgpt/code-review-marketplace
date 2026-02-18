import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500':
              variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500':
              variant === 'secondary',
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-indigo-500':
              variant === 'outline',
            'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500':
              variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500':
              variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export { Button };
