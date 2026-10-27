import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  PieChart,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans selection:bg-brand-teal selection:text-navy-950">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-teal to-brand-emerald flex items-center justify-center text-navy-950 font-bold shadow-lg shadow-brand-teal/20">
              <Wallet className="w-6 h-6 text-navy-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SmartTracker</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-navy-950 bg-brand-teal hover:bg-brand-emerald px-4 sm:px-5 py-2 rounded-xl transition-all shadow-md shadow-brand-teal/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-brand-teal mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Academic Engineering Project • Personal Finance Management</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Smart Expense Tracking for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-emerald">Smarter Financial Decisions</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Record income and expenses, monitor category-wise spending patterns, enforce monthly budgets, and analyze financial health with interactive visualizations — formatted in Indian Rupees (₹).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-navy-950 bg-gradient-to-r from-brand-teal to-brand-emerald hover:opacity-95 rounded-xl shadow-lg shadow-brand-teal/25 transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
            >
              <span>Explore Demo Account</span>
            </Link>
          </div>

          {/* Quick Demo Credentials Box for College Evaluators */}
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 text-left flex items-start gap-3 shadow-xl">
            <div className="p-2 rounded-xl bg-brand-teal/10 text-brand-teal flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                Quick Evaluator Demo Credentials
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Email: <span className="font-mono text-white bg-slate-900 px-1.5 py-0.5 rounded">demo@expensetracker.com</span> &nbsp;•&nbsp;
                Password: <span className="font-mono text-white bg-slate-900 px-1.5 py-0.5 rounded">Demo@123</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Pre-populated with 3 months of realistic transactions, budget alerts, and category analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
              Comprehensive Financial Control
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Everything required to maintain healthy cash flow and achieve your savings targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Calculations</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatically calculates Available Balance (Opening Balance + Total Income − Expenses) and Net Savings computed from real SQLite records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mb-5">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Budget Utilization Warnings</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Set monthly category budgets and receive clear visual warnings when spending exceeds 80% or goes over 100% of limits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Visual Reports & CSV Export</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Explore income vs expense trends, category breakdowns, and export complete transaction reports to CSV with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
              How SmartTracker Works
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Three streamlined steps to take control of your financial journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-brand-teal font-bold text-lg flex items-center justify-center mb-4 border border-slate-700">
                1
              </div>
              <h4 className="text-base font-bold text-white mb-2">Register & Configure</h4>
              <p className="text-slate-400 text-sm">
                Create your account. Default income and expense categories are auto-provisioned immediately with custom opening balance support.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-brand-teal font-bold text-lg flex items-center justify-center mb-4 border border-slate-700">
                2
              </div>
              <h4 className="text-base font-bold text-white mb-2">Log Daily Cashflow</h4>
              <p className="text-slate-400 text-sm">
                Add transactions with payment methods (UPI, Card, Cash) and notes. Filter, search, and sort your transaction history effortlessly.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-brand-teal font-bold text-lg flex items-center justify-center mb-4 border border-slate-700">
                3
              </div>
              <h4 className="text-base font-bold text-white mb-2">Analyze & Optimize</h4>
              <p className="text-slate-400 text-sm">
                View monthly spending trends, identify high-spending categories, prevent budget overruns, and export data for review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Smart Expense Tracker • College Engineering Academic Project</p>
          <div className="flex items-center gap-6">
            <span>React + Vite</span>
            <span>Node.js Express</span>
            <span>SQLite</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
