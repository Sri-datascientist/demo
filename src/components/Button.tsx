import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'danger';
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
  id,
  type = 'button',
  isLoading = false,
  disabled = false,
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-sans font-semibold transition-all duration-200 ease-out cursor-pointer text-center select-none rounded-full focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none';

  let variantClasses = '';
  if (variant === 'primary') {
    variantClasses = 'bg-[#051A24] text-white px-7 py-3 shadow-btn-primary hover:bg-[#0A2735] hover:shadow-lg';
  } else if (variant === 'secondary') {
    variantClasses = 'bg-white text-[#051A24] px-7 py-3 shadow-btn-secondary hover:bg-neutral-100';
  } else if (variant === 'tertiary') {
    variantClasses = 'bg-white text-[#051A24] px-7 py-3 shadow-btn-tertiary hover:bg-neutral-100';
  } else if (variant === 'outline') {
    variantClasses = 'border-2 border-[#2D5A27] text-[#2D5A27] bg-transparent hover:bg-[#2D5A27] hover:text-white px-6 py-2.5';
  } else if (variant === 'danger') {
    variantClasses = 'bg-red-600 text-white hover:bg-red-700 px-6 py-2.5 shadow-md';
  }

  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

  if (href) {
    const isExternal = href.startsWith('http') || href.includes('://');
    return (
      <a
        id={id}
        href={href}
        className={combinedClasses}
        onClick={onClick}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
        {children}
      </a>
    );
  }

  return (
    <button
      id={id}
      onClick={onClick}
      className={combinedClasses}
      type={type}
      disabled={disabled || isLoading}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
      {children}
    </button>
  );
}

