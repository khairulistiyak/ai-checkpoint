import React from 'react';

export const GlassButton = ({
  children,
  active = false,
  variant = 'secondary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  const sizeClasses = {
    xs: 'p-1 text-[9px] rounded-md',
    sm: 'px-2.5 py-1 text-[10px] rounded-lg',
    md: 'px-3.5 py-1.5 text-xs rounded-xl',
    lg: 'px-4 py-2 text-sm rounded-2xl',
  };

  const getVariantClasses = () => {
    if (active) {
      return 'bg-white/15 border-white/25 text-white shadow-sm';
    }

    switch (variant) {
      case 'primary':
        return 'bg-[#ededef] hover:bg-white text-zinc-950 font-bold border-transparent shadow-sm hover:-translate-y-0.5';
      case 'danger':
        return 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20 hover:-translate-y-0.5';
      case 'ghost':
        return 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5';
      case 'secondary':
      default:
        return 'bg-white/[0.04] border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5';
    }
  };

  return (
    <button
      disabled={disabled}
      className={`border transition-all duration-200 ease-in-out cursor-pointer active:scale-95 font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 ${sizeClasses[size]} ${getVariantClasses()} ${disabled ? 'opacity-50 cursor-not-allowed active:scale-100' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
