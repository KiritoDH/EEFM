import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Wallet,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  LogOut,
  IndianRupee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { settingsApi } from '../api/settings.api';
import { authApi } from '../api/auth.api';
import { formatCurrency } from '../utils/formatters';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();

  // Profile & Financial Preferences
  const [name, setName] = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setOpeningBalance(String(user.opening_balance || 0));
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    const parsedBalance = parseFloat(openingBalance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      setProfileError('Opening balance must be a valid non-negative number.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await settingsApi.update({
        name: name.trim(),
        opening_balance: parsedBalance
      });
      if (res.success) {
        updateUser(res.settings);
        setProfileSuccess('Preferences and Opening Balance saved successfully!');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update preferences.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in both current and new passwords.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword
      });
      if (res.success) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Account & Financial Preferences
        </h2>
        <p className="text-xs text-slate-500">
          Manage your personal details, opening balance, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile & Opening Balance Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-navy-900" />
            <h3 className="text-sm font-bold text-slate-900">Profile & Balance Settings</h3>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>

            {/* Opening Balance Configuration */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Opening Balance (₹) *
              </label>
              <div className="relative rounded-xl">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-2 text-xs font-bold text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your initial cash/bank balance before recorded transactions. (Available Balance = Opening Balance + All Income − All Expenses)
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Lock className="w-4 h-4 text-navy-900" />
            <h3 className="text-sm font-bold text-slate-900">Security & Password</h3>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                New Password (min 6 chars) *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* College Project Demonstration & System Information Card */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Project Demonstration Environment
            </h3>
            <p className="text-xs text-slate-400">
              Academic project configuration details
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800">
          <div>
            <span className="text-slate-500 block">Currency Standard</span>
            <span className="font-bold text-brand-teal">Indian Rupee (₹)</span>
          </div>
          <div>
            <span className="text-slate-500 block">Database Engine</span>
            <span className="font-bold text-white">SQLite (node:sqlite)</span>
          </div>
          <div>
            <span className="text-slate-500 block">Auth Security</span>
            <span className="font-bold text-white">bcryptjs + JWT</span>
          </div>
          <div>
            <span className="text-slate-500 block">Storage Persistence</span>
            <span className="font-bold text-emerald-400">Persistent Disk DB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
