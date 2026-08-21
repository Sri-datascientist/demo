import { Link } from 'react-router-dom';
import logoSrc from '../asset/images/OyeDesi_Logo_Transparency.png';

const sizeClasses = {
  xs: 'h-7',
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16',
} as const;

type LogoSize = keyof typeof sizeClasses;

interface LogoProps {
  size?: LogoSize;
  className?: string;
  linkToHome?: boolean;
}

export function Logo({ size = 'md', className = '', linkToHome = false }: LogoProps) {
  const image = (
    <img
      src={logoSrc}
      alt="Oye Desi — It's MY Choice"
      className={`${sizeClasses[size]} w-auto object-contain object-left ${className}`}
    />
  );

  if (linkToHome) {
    return (
      <Link to="/" className="inline-flex items-center shrink-0 hover:opacity-90 transition-opacity">
        {image}
      </Link>
    );
  }

  return <span className="inline-flex items-center shrink-0">{image}</span>;
}
