import React from 'react';

export default function StatCard({ title, amount, subtitle, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
    navy: {
      bg: 'bg-navy-900',
      text: 'text-brand-teal',
      border: 'border-navy-800',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {amount}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            {trend && (
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
