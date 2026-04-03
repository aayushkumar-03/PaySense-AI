import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pro';
  children: React.ReactNode;
}

export const Badge = ({ className = '', variant = 'neutral', children, ...props }: BadgeProps) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const variants = {
    success: "bg-emerald-500/15 text-emerald-400",
    warning: "bg-amber-500/15 text-amber-400",
    danger: "bg-red-500/15 text-red-400",
    info: "bg-sky-500/15 text-sky-400",
    neutral: "bg-white/10 text-gray-300",
    pro: "bg-transparent border border-transparent [background:linear-gradient(135deg,#0EA5E9,#6366F1)_border-box] [-webkit-mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] mask-composite-exclude text-white border-solid border",
  };

  if (variant === 'pro') {
    return (
      <span className={`relative ${baseStyles} text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 font-bold ${className}`} {...props}>
        <div className="absolute inset-0 rounded-full border border-sky-500/50" />
        {children}
      </span>
    );
  }

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
