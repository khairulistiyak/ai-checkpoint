import React from 'react';

export const GlassButton = ({
  children,
  active = false,
  variant = "secondary",
  size = "md",
  className = "",
  disabled = false,
  ...props
}) => {
  const sizeClasses = {
    xs: "p-1 text-[9px] rounded-md",
    sm: "px-2 py-1 text-[10px] rounded-lg",
    md: "px-3 py-1.5 text-xs rounded-xl",
    lg: "px-4 py-2 text-sm rounded-2xl"
  };

  const getVariantClasses = () => {
    if (active) {
      return "bg-cyber-card-border/50 border-cyber-accent/50 text-cyber-text-primary shadow-sm";
    }

    switch (variant) {
      case "primary":
        return "bg-cyber-accent/10 border-cyber-accent/30 text-cyber-text-primary hover:bg-cyber-accent/20 hover:border-cyber-accent/50 hover:shadow-[0_0_20px_rgba(var(--cyber-accent-rgb),0.3)] hover:-translate-y-0.5";
      case "danger":
        return "bg-red-500/5 border-red-500/20 text-red-400/90 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:-translate-y-0.5";
      case "ghost":
        return "bg-transparent border-transparent text-cyber-text-secondary hover:text-cyber-text-primary hover:bg-cyber-card-border/20";
      case "secondary":
      default:
        return "bg-cyber-card-border/10 border-cyber-card-border/30 text-cyber-text-secondary hover:text-cyber-text-primary hover:bg-cyber-card-border/30 hover:border-cyber-card-border/50 hover:shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:-translate-y-0.5";
    }
  };

  return (
    <button
      disabled={disabled}
      className={`border transition-all duration-200 ease-in-out cursor-pointer active:scale-95 font-medium flex items-center justify-center gap-1.5 ${sizeClasses[size]} ${getVariantClasses()} ${disabled ? 'opacity-50 cursor-not-allowed active:scale-100' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
