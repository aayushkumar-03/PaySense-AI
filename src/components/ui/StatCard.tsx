import React from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor?: string; // Tailwind color class e.g. 'text-sky-500'
  sparklineData?: any[];
  loading?: boolean;
}

export const StatCard = ({ title, value, change, changeLabel, icon, iconColor = 'text-sky-500', sparklineData, loading }: StatCardProps) => {
  if (loading) {
    return (
      <Card padding="md" className="animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/5" />
          <div className="h-4 bg-white/5 rounded w-24" />
        </div>
        <div className="h-8 bg-white/5 rounded w-32 mb-2" />
        <div className="h-3 bg-white/5 rounded w-20" />
      </Card>
    );
  }

  const isPositive = change ? change >= 0 : null;

  return (
    <Card padding="md" variant="default" className="relative group hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        
        {change !== undefined && (
          <div className="flex items-center mt-1">
            <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
              {Math.abs(change)}%
            </span>
            {changeLabel && (
              <span className="text-xs text-gray-500 ml-2">{changeLabel}</span>
            )}
          </div>
        )}
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="absolute bottom-0 right-0 left-0 h-[50px] opacity-40 mix-blend-screen pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive === false ? '#EF4444' : '#0EA5E9'} 
                fill={isPositive === false ? '#EF4444' : '#0EA5E9'} 
                fillOpacity={0.15} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
