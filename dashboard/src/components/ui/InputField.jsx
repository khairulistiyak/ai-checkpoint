import React from 'react';
import { GlassButton } from './GlassButton';

export const InputField = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  readOnly = false,
  error = '',
  className = '',
  icon: Icon,
  onBrowse,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[10px] text-cyber-text-secondary font-semibold uppercase tracking-wider px-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && <Icon className="w-3.5 h-3.5 text-cyber-text-muted absolute left-3" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full px-3 py-2 text-xs text-cyber-text-primary bg-cyber-card/30 border border-cyber-card-border/50 rounded-xl outline-none transition-all hover:bg-cyber-card/50 hover:border-cyber-card-border/80 focus:bg-cyber-dark focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent/30 focus:shadow-[0_0_15px_rgba(var(--cyber-accent-rgb),0.15)] ${
            onBrowse ? "pr-16" : ""
          } ${Icon ? "pl-9" : ""} ${error ? "border-red-500/50" : ""} ${readOnly ? "opacity-70 cursor-not-allowed" : ""}`}
          {...props}
        />
        {onBrowse && (
          <GlassButton
            type="button"
            onClick={onBrowse}
            variant="secondary"
            size="xs"
            className="absolute right-1.5 !px-2 !py-0.5 text-[9px] font-bold"
          >
            Browse
          </GlassButton>
        )}
      </div>
      {error && <span className="text-[10px] text-red-400 mt-0.5 px-1">{error}</span>}
    </div>
  );
};
