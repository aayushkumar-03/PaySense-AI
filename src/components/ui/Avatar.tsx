import React, { useMemo } from 'react';

interface AvatarProps {
  src?: string;
  name?: string; // used for initials and color hash
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
}

export const Avatar = ({ src, name = 'User', size = 'md', isOnline }: AvatarProps) => {
  const sizes = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
    xl: "w-16 h-16 text-xl",
  };

  const getHashColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'from-sky-500 to-indigo-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-purple-500 to-pink-500',
      'from-rose-500 to-red-500',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const colorClass = useMemo(() => getHashColor(name), [name]);
  const initials = name.substring(0, 1).toUpperCase();

  return (
    <div className="relative inline-block flex-shrink-0">
      <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br ${colorClass} border border-white/10 shadow-sm`}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-white shadow-sm">
            {initials}
          </span>
        )}
      </div>
      
      {isOnline !== undefined && (
        <span 
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-[#111827]
            ${isOnline ? 'bg-emerald-500' : 'bg-gray-500'}
            ${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}
          `}
        />
      )}
    </div>
  );
};
