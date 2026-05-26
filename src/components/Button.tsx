import { ButtonHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: LucideIcon;
  block?: boolean;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  icon: Icon,
  block = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  }[variant];

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${block ? 'btn-block' : ''} ${className}`.trim()}
      {...props}
    >
      {Icon ? <Icon size={18} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
