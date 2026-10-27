import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  CreditCard,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import StatCard from '../components/common/StatCard';
import CategoryIcon from '../components/common/CategoryIcon';
import EmptyState from '../components/common/EmptyState';
import { reportsApi } from '../api/reports.api';
import { formatCurrency, formatMonthYear } from '../utils/formatters';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6', '#64748B'];

export default function ReportsPage() {
  const [timeFrame, setTimeFrame] = useState('monthly'); // 'monthly' or 'yearly'
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeFrame, selectedYear, selectedMonth]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const params = {
        timeFrame,
        year: selectedYear,
        ...(timeFrame === 'monthly' && { month: selectedMonth })
      };
      const res = await reportsApi.getAnalytics(params);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = timeFrame === 'yearly'
        ? { startDate: `${selectedYear}-01-01`, endDate: `${selectedYear}-12-31` }
        : { startDate: `${selectedMonth}-01`, endDate: `${selectedMonth}-31` };
      await reportsApi.exportCSV(params);
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const { summary, categorySpending = [], paymentMethods = [], timeSeries = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Financial Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Deep dive into spending behaviors, income trends, and payment distributions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm text-xs font-semibold">
            <button
              onClick={() => setTimeFrame('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeFrame === 'monthly' ? 'bg-navy-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeFrame('yearly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeFrame === 'yearly' ? 'bg-navy-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Period Selector */}
          {timeFrame === 'monthly' ? (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm"
            />
          ) : (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          )}

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          amount={formatCurrency(summary?.totalIncome)}
          subtitle={`${summary?.transactionCount || 0} transactions total`}
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="Total Spending"
          amount={formatCurrency(summary?.totalExpense)}
          subtitle={`Avg: ${formatCurrency(summary?.avgExpense || 0)} / tx`}
          icon={TrendingDown}
          color="rose"
        />

        <StatCard
          title="Net Savings"
          amount={formatCurrency(summary?.netSavings)}
          subtitle={`Savings rate: ${summary?.savingsRate || 0}%`}
          icon={BarChart3}
          color="teal"
          trend={{
            isPositive: (summary?.netSavings || 0) >= 0,
            value: (summary?.netSavings || 0) >= 0 ? 'Surplus' : 'Deficit'
          }}
        />

        <StatCard
          title="Highest Single Expense"
          amount={formatCurrency(summary?.maxExpense)}
          subtitle="Peak transaction"
          icon={ArrowUpRight}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time-Series Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {timeFrame === 'yearly' ? 'Monthly Cash Flow (2026)' : 'Daily Spend Timeline'}
              </h3>
              <p className="text-xs text-slate-500">Income vs Expense dynamics</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1 text-emerald-600">● Income</span>
              <span className="flex items-center gap-1 text-rose-600">● Expense</span>
            </div>
          </div>

          <div className="h-72 w-full">
            {timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="time_label"
                    tickFormatter={(val) => {
                      if (val.length === 7) {
                        const [, m] = val.split('-');
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return months[parseInt(m, 10) - 1];
                      }
                      return val.slice(8); // Day of month
                    }}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), '']}
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                No activity recorded for this period.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Payment Channels</h3>
            <p className="text-xs text-slate-500 mb-4">Methods used for expense settlements</p>

            <div className="space-y-3">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((pm, idx) => {
                  const total = summary?.totalExpense || 1;
                  const pct = ((pm.total_amount / total) * 100).toFixed(1);
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                        <span>{pm.payment_method}</span>
                        <span>{formatCurrency(pm.total_amount)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-navy-900 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {pm.count} transactions ({pct}%)
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400">No payment data recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Highest Spending Categories Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Category-Wise Spending Analysis
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Breakdown of total expenditures across all assigned categories.
        </p>

        {categorySpending.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Transactions</th>
                  <th className="py-2.5 px-3 text-right">Total Spent</th>
                  <th className="py-2.5 px-3 text-right">Share of Expense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categorySpending.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: cat.color || '#3B82F6' }}
                        >
                          <CategoryIcon name={cat.icon || 'Tag'} className="w-4 h-4" />
                        </span>
                        <span className="font-bold text-slate-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{cat.transaction_count} records</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(cat.total_amount)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-600">
                      <div className="flex items-center justify-end gap-2">
                        <span>{cat.percentage}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: cat.color || '#3B82F6'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No expense data"
            description="No expense transactions found for this period."
            icon={PieIcon}
          />
        )}
      </div>
    </div>
  );
}
