import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'glass' | 'stat';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', padding = 'md', children, ...props }, ref) => {
    
    const baseStyles = "rounded-2xl transition-all duration-300 relative overflow-hidden";
    
    const variants = {
      default: "bg-[#111827] border border-white/8",
      glow: "bg-[#111827] border border-white/8 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:border-sky-500/50 group",
      glass: "glass-card",
      stat: "bg-[#111827] border border-white/8 border-t-[3px] border-t-primary rounded-t-lg", // compact stat card
    };

    const paddings = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div 
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {variant === 'glow' && (
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);
Card.displayName = 'Card';
