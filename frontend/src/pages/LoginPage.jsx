import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@expensetracker.com');
    setPassword('Demo@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-teal to-brand-emerald flex items-center justify-center text-navy-950 font-bold shadow-lg shadow-brand-teal/20">
            <Wallet className="w-7 h-7 text-navy-950" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">SmartTracker</span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Or{' '}
          <Link to="/register" className="font-medium text-brand-teal hover:underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/90 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80">
          {/* Quick Demo Fill Pill */}
          <div className="mb-6 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-teal" />
              <span className="text-xs text-slate-300 font-medium">College Project Demo</span>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs font-semibold text-brand-teal hover:text-brand-emerald underline underline-offset-2"
            >
              Fill Demo Login
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-navy-950 bg-gradient-to-r from-brand-teal to-brand-emerald hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-brand-teal shadow-md shadow-brand-teal/20 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
