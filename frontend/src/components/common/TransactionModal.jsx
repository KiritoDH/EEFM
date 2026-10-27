import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { categoriesApi } from '../../api/categories.api';
import { transactionsApi } from '../../api/transactions.api';

const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Cheque',
  'Other'
];

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit = null
}) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Pre-fill fields if editing
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || 'expense');
      setAmount(String(transactionToEdit.amount || ''));
      setCategoryId(String(transactionToEdit.category_id || ''));
      setDate(transactionToEdit.date || new Date().toISOString().slice(0, 10));
      setPaymentMethod(transactionToEdit.payment_method || 'UPI');
      setDescription(transactionToEdit.description || '');
      setNotes(transactionToEdit.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setCategoryId('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('UPI');
      setDescription('');
      setNotes('');
    }
    setError('');
  }, [transactionToEdit, isOpen]);

  const loadCategories = async () => {
    try {
      const res = await categoriesApi.getAll();
      if (res.success) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  // Set default category when type changes if current category doesn't match
  useEffect(() => {
    if (filteredCategories.length > 0) {
      const isCurrentInFiltered = filteredCategories.some((c) => String(c.id) === String(categoryId));
      if (!isCurrentInFiltered) {
        setCategoryId(String(filteredCategories[0].id));
      }
    }
  }, [type, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }
    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        type,
        category_id: categoryId ? parseInt(categoryId, 10) : null,
        date,
        payment_method: paymentMethod,
        description: description.trim(),
        notes: notes ? notes.trim() : null
      };

      if (transactionToEdit) {
        await transactionsApi.update(transactionToEdit.id, payload);
      } else {
        await transactionsApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Record New Transaction'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Transaction Type Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Amount in INR */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
            Amount (₹) *
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-medium">
              ₹
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-2.5 text-slate-900 text-lg font-bold focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
            Description *
          </label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Swiggy food delivery, Grocery shopping"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 placeholder:text-slate-400"
          />
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
            Notes (Optional)
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details, invoice number, or context..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
