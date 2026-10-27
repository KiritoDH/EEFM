import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Tags,
  PieChart,
  BarChart3,
  Settings,
  LogOut,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Categories', href: '/categories', icon: Tags },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ onCloseMobile }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-full bg-navy-900 text-white flex flex-col justify-between border-r border-navy-800 shadow-xl select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-navy-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-teal to-brand-emerald flex items-center justify-center text-navy-950 font-bold shadow-md shadow-brand-teal/20">
            <Wallet className="w-6 h-6 text-navy-950" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-tight">
              SmartTracker
            </span>
            <span className="text-xs text-brand-teal font-medium tracking-wide">
              Personal Finance
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-6 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-navy-800 text-brand-teal border border-navy-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800/50'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-navy-800/80">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-navy-950/60 border border-navy-800/60 mb-2">
          <div className="w-9 h-9 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center text-sm font-bold text-brand-teal flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
