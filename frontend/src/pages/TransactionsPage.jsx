import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Calendar,
  Download,
  Receipt,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Badge from '../components/common/Badge';
import CategoryIcon from '../components/common/CategoryIcon';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import TransactionModal from '../components/common/TransactionModal';
import { transactionsApi } from '../api/transactions.api';
import { categoriesApi } from '../api/categories.api';
import { reportsApi } from '../api/reports.api';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [summary, setSummary] = useState({ filteredIncome: 0, filteredExpense: 0, filteredSavings: 0 });
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [page, typeFilter, categoryFilter, startDate, endDate, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadCategories = async () => {
    try {
      const res = await categoriesApi.getAll();
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        type: typeFilter || undefined,
        category_id: categoryFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder
      };
      const res = await transactionsApi.getAll(params);
      if (res.success) {
        setTransactions(res.transactions);
        setPagination(res.pagination);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await transactionsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadTransactions();
    } catch (err) {
      alert(err.message || 'Failed to delete transaction.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await reportsApi.exportCSV({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        type: typeFilter || undefined,
        category_id: categoryFilter || undefined
      });
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('DESC');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Transaction Records
          </h2>
          <p className="text-xs text-slate-500">
            Manage, filter, and track all your income and expenses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-800">Filtered Income</span>
          <span className="text-sm font-bold text-emerald-700">
            {formatCurrency(summary.filteredIncome)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
          <span className="text-xs font-medium text-rose-800">Filtered Expense</span>
          <span className="text-sm font-bold text-rose-700">
            {formatCurrency(summary.filteredExpense)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">Period Net</span>
          <span
            className={`text-sm font-bold ${
              summary.filteredSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(summary.filteredSavings)}
          </span>
        </div>
      </div>

      {/* Search, Filter & Sort Controls Card */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description or notes..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-900"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-900"
            >
              <option value="">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-900"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-900"
            >
              <option value="date-DESC">Date: Newest First</option>
              <option value="date-ASC">Date: Oldest First</option>
              <option value="amount-DESC">Amount: Highest First</option>
              <option value="amount-ASC">Amount: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 font-medium">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            />
          </div>

          {(search || typeFilter || categoryFilter || startDate || endDate) && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium underline underline-offset-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-navy-900 border-t-brand-teal rounded-full animate-spin mx-auto mb-2"></div>
            Loading transactions...
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: tx.category_color || '#64748B' }}
                          >
                            <CategoryIcon name={tx.category_icon || 'Tag'} className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-semibold text-slate-800">
                            {tx.category_name || 'Uncategorized'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{tx.description}</div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {tx.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold text-sm ${
                            tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingTransaction(tx);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(tx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Showing{' '}
                <strong className="text-slate-900">
                  {(pagination.page - 1) * pagination.limit + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-900">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </strong>{' '}
                of <strong className="text-slate-900">{pagination.total}</strong> transactions
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No transactions found"
            description="No transactions match the selected filters. Try broadening your criteria or record a new transaction."
            icon={Receipt}
            actionLabel="Add Transaction"
            onAction={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={loadTransactions}
        transactionToEdit={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete "${deleteTarget?.description}" (${formatCurrency(
          deleteTarget?.amount
        )})? This will update your dashboard totals.`}
      />
    </div>
  );
}
