import React from 'react';

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    income: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    expense: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    good: 'bg-teal-50 text-teal-700 border-teal-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    exceeded: 'bg-red-50 text-red-700 border-red-200 font-semibold',
    navy: 'bg-navy-900 text-white border-navy-800',
  };

  const sizeStyles = {
    xs: 'text-xs px-2 py-0.5 rounded-full',
    sm: 'text-xs px-2.5 py-1 rounded-md',
    md: 'text-sm px-3 py-1.5 rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border tracking-tight ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
}
