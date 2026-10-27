import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import CategoryIcon from '../components/common/CategoryIcon';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { budgetsApi } from '../api/budgets.api';
import { categoriesApi } from '../api/categories.api';
import { formatCurrency, formatMonthYear } from '../utils/formatters';

export default function BudgetsPage() {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0, totalRemaining: 0, overallPercentage: 0 });
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [modalMonth, setModalMonth] = useState(currentMonthStr);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadExpenseCategories();
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth]);

  const loadExpenseCategories = async () => {
    try {
      const res = await categoriesApi.getAll('expense');
      if (res.success) setExpenseCategories(res.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetsApi.getAll(selectedMonth);
      if (res.success) {
        setBudgets(res.budgets);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (existing = null) => {
    setFormError('');
    if (existing) {
      setCategoryId(String(existing.category_id));
      setAmount(String(existing.budget_amount));
      setModalMonth(existing.month);
    } else {
      setCategoryId(expenseCategories.length > 0 ? String(expenseCategories[0].id) : '');
      setAmount('');
      setModalMonth(selectedMonth);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!categoryId || !amount || parseFloat(amount) < 0) {
      setFormError('Please select a category and enter a valid budget amount.');
      return;
    }

    setSaving(true);
    try {
      await budgetsApi.upsert({
        category_id: parseInt(categoryId, 10),
        month: modalMonth,
        amount: parseFloat(amount)
      });
      setIsModalOpen(false);
      loadBudgets();
    } catch (err) {
      setFormError(err.message || 'Failed to save budget.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await budgetsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadBudgets();
    } catch (err) {
      alert(err.message || 'Failed to delete budget.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    setSelectedMonth(prev.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    setSelectedMonth(next.toISOString().slice(0, 7));
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Monthly Category Budgets
          </h2>
          <p className="text-xs text-slate-500">
            Enforce spending limits and track utilization in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Navigator */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 text-xs font-bold"
            >
              ←
            </button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-slate-800 border-none bg-transparent focus:outline-none px-2 cursor-pointer"
            />
            <button
              onClick={handleNextMonth}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 text-xs font-bold"
            >
              →
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Allocated</span>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(summary.totalBudget, false)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Spent</span>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(summary.totalSpent, false)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block mb-1">Remaining</span>
          <span
            className={`text-xl font-bold ${
              summary.totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(summary.totalRemaining, false)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block mb-1">Overall Utilization</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-xl font-bold ${
                summary.overallPercentage >= 100
                  ? 'text-rose-600'
                  : summary.overallPercentage >= 80
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {summary.overallPercentage}%
            </span>
            <Badge
              variant={
                summary.overallPercentage >= 100
                  ? 'exceeded'
                  : summary.overallPercentage >= 80
                  ? 'warning'
                  : 'good'
              }
              size="xs"
            >
              {summary.overallPercentage >= 100
                ? 'Over Budget'
                : summary.overallPercentage >= 80
                ? 'Near Limit'
                : 'On Track'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Budget Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading budgets...</div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                  isExceeded
                    ? 'border-rose-300 ring-1 ring-rose-300'
                    : isWarning
                    ? 'border-amber-300'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: b.category_color || '#3B82F6' }}
                      >
                        <CategoryIcon name={b.category_icon || 'Tag'} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {b.category_name}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {formatMonthYear(b.month)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(b)}
                        className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Budget Amount"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(b)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & Status Pill */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Utilization</span>
                      <span
                        className={`font-bold ${
                          isExceeded
                            ? 'text-rose-600'
                            : isWarning
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {b.percentage}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isExceeded
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Alert message if warning or exceeded */}
                  {isExceeded && (
                    <div className="my-2 p-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Budget exceeded by {formatCurrency(Math.abs(b.remaining), false)}!
                      </span>
                    </div>
                  )}

                  {isWarning && (
                    <div className="my-2 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-700 text-xs">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Approaching limit (over 80% used).</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Spent</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(b.amount_spent)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Allocated</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(b.budget_amount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={`No budgets set for ${formatMonthYear(selectedMonth)}`}
          description="Establish monthly spending thresholds for each expense category to avoid unexpected expenses."
          icon={PieChart}
          actionLabel="Create Monthly Budget"
          onAction={() => handleOpenModal()}
        />
      )}

      {/* Set/Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Category Monthly Budget"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Month *
            </label>
            <input
              type="month"
              required
              value={modalMonth}
              onChange={(e) => setModalMonth(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Expense Category *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Budget Limit (₹) *
            </label>
            <div className="relative rounded-xl">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-2.5 text-base font-bold text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-xl shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Remove Budget"
        message={`Are you sure you want to remove the monthly budget for "${deleteTarget?.category_name}"? Existing transactions will not be deleted.`}
      />
    </div>
  );
}
