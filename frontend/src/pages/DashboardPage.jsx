import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  PlusCircle,
  Calendar,
  AlertTriangle,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import CategoryIcon from '../components/common/CategoryIcon';
import EmptyState from '../components/common/EmptyState';
import { reportsApi } from '../api/reports.api';
import { formatCurrency, formatDate, formatMonthYear } from '../utils/formatters';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B', '#F97316'];

export default function DashboardPage() {
  const { refreshTrigger, onOpenAddTransaction } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date filter state: 'this_month', 'last_month', 'this_year', 'all'
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, [dateFilter, refreshTrigger]);

  const getDateRange = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    if (dateFilter === 'this_month') {
      const start = new Date(currentYear, currentMonth, 1).toISOString().slice(0, 10);
      const end = new Date(currentYear, currentMonth + 1, 0).toISOString().slice(0, 10);
      return { startDate: start, endDate: end };
    }
    if (dateFilter === 'last_month') {
      const start = new Date(currentYear, currentMonth - 1, 1).toISOString().slice(0, 10);
      const end = new Date(currentYear, currentMonth, 0).toISOString().slice(0, 10);
      return { startDate: start, endDate: end };
    }
    if (dateFilter === 'this_year') {
      const start = `${currentYear}-01-01`;
      const end = `${currentYear}-12-31`;
      return { startDate: start, endDate: end };
    }
    return {}; // All time
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = getDateRange();
      const res = await reportsApi.getOverview(params);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-900 border-t-brand-teal rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading financial metrics...</p>
        </div>
      </div>
    );
  }

  const { summary, categoryBreakdown = [], monthlyTrend = [], recentTransactions = [], activeBudgets = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Reporting Period
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'this_year', label: 'This Year' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                dateFilter === filter.id
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* 4 Core Calculation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Available Balance"
          amount={formatCurrency(summary?.availableBalance)}
          subtitle={`Opening: ${formatCurrency(summary?.openingBalance, false)}`}
          icon={Wallet}
          color="navy"
        />

        <StatCard
          title="Total Income"
          amount={formatCurrency(summary?.totalIncome)}
          subtitle={`${summary?.transactionCount || 0} period records`}
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="Total Expenses"
          amount={formatCurrency(summary?.totalExpense)}
          subtitle="Filtered spending"
          icon={TrendingDown}
          color="rose"
        />

        <StatCard
          title="Net Savings"
          amount={formatCurrency(summary?.netSavings)}
          subtitle={`Savings rate: ${summary?.savingsRate || 0}%`}
          icon={PiggyBank}
          color="teal"
          trend={{
            isPositive: (summary?.netSavings || 0) >= 0,
            value: (summary?.netSavings || 0) >= 0 ? 'Surplus' : 'Deficit'
          }}
        />
      </div>

      {/* Charts Grid: Monthly Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar / Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cashflow Trend</h3>
              <p className="text-xs text-slate-500">Income vs Expenses over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                <span className="text-slate-600">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-500"></span>
                <span className="text-slate-600">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(val) => {
                      const [y, m] = val.split('-');
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return `${months[parseInt(m, 10) - 1]} '${y.slice(2)}`;
                    }}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), '']}
                    labelFormatter={(val) => formatMonthYear(val)}
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                No monthly data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown Donut Chart (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Spending Breakdown</h3>
            <p className="text-xs text-slate-500">Expense distribution by category</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), '']}
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No expenses recorded for this period.</p>
            )}
          </div>

          {/* Top 3 categories list */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
            {categoryBreakdown.slice(0, 3).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color || CHART_COLORS[idx] }}
                  />
                  <span className="font-medium text-slate-700 truncate max-w-[120px]">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{formatCurrency(cat.amount, false)}</span>
                  <span className="text-slate-400">({cat.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Budgets & Recent Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Budgets Watchlist (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Budget Progress</h3>
                <p className="text-xs text-slate-500">Current Month Status</p>
              </div>
              <Link
                to="/budgets"
                className="text-xs font-semibold text-brand-indigo hover:text-navy-900 flex items-center gap-1 text-blue-600"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {activeBudgets.length > 0 ? (
                activeBudgets.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.category_color }}
                        />
                        <span className="text-xs font-bold text-slate-800">{b.category_name}</span>
                      </div>
                      <Badge
                        variant={b.status === 'exceeded' ? 'exceeded' : b.status === 'warning' ? 'warning' : 'good'}
                        size="xs"
                      >
                        {b.percentage}%
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden my-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          b.status === 'exceeded'
                            ? 'bg-rose-500'
                            : b.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Spent: {formatCurrency(b.amount_spent, false)}</span>
                      <span>Budget: {formatCurrency(b.budget_amount, false)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 mb-3">No budgets configured for this month.</p>
                  <Link
                    to="/budgets"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <span>Set First Budget</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions List (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
                <p className="text-xs text-slate-500">Latest activity across accounts</p>
              </div>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-blue-600 hover:text-navy-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: tx.category_color || '#64748B' }}
                      >
                        <CategoryIcon name={tx.category_icon || 'Tag'} className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{tx.category_name || 'General'}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {tx.payment_method}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-bold block ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400 mb-3">No transactions found.</p>
                {onOpenAddTransaction && (
                  <button
                    onClick={onOpenAddTransaction}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition-all shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Transaction</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
