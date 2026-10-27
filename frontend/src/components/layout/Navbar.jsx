import React from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenMobile, onOpenAddTransaction, title = 'Dashboard' }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Add Transaction Button */}
        {onOpenAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-navy-900 hover:bg-navy-800 active:scale-95 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
        )}

        {/* Currency & User Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>INR (₹)</span>
        </div>
      </div>
    </header>
  );
}
