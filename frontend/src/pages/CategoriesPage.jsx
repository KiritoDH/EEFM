import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Tags,
  RotateCcw,
  AlertCircle,
  FolderPlus
} from 'lucide-react';
import CategoryIcon from '../components/common/CategoryIcon';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import Badge from '../components/common/Badge';
import { categoriesApi } from '../api/categories.api';
import { formatCurrency } from '../utils/formatters';

const AVAILABLE_ICONS = [
  'Utensils',
  'Car',
  'ShoppingBag',
  'GraduationCap',
  'Zap',
  'HeartPulse',
  'Film',
  'Home',
  'Briefcase',
  'Laptop',
  'TrendingUp',
  'DollarSign',
  'Gift',
  'PlusCircle',
  'Dumbbell',
  'Coffee',
  'Plane',
  'Smartphone',
  'BookOpen',
  'Wifi',
  'Tag'
];

const PRESET_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#14B8A6',
  '#F97316',
  '#64748B'
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('expense');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#3B82F6');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAll();
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = (tabType = activeTab) => {
    setEditingCategory(null);
    setName('');
    setType(tabType);
    setIcon('Tag');
    setColor('#3B82F6');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setType(category.type);
    setIcon(category.icon || 'Tag');
    setColor(category.color || '#3B82F6');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, {
          name: name.trim(),
          icon,
          color
        });
      } else {
        await categoriesApi.create({
          name: name.trim(),
          type,
          icon,
          color
        });
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await categoriesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Restore any missing default categories? Existing custom categories will be preserved.')) {
      try {
        await categoriesApi.resetDefaults();
        loadCategories();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const displayedCategories = categories.filter((c) => c.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Category Management
          </h2>
          <p className="text-xs text-slate-500">
            Organize and classify your income and expense transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
            title="Restore missing default categories"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restore Defaults</span>
          </button>

          <button
            onClick={() => handleOpenCreate(activeTab)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('expense')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'expense'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Expense Categories</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {categories.filter((c) => c.type === 'expense').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'income'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Income Categories</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {categories.filter((c) => c.type === 'income').length}
          </span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: cat.color || '#3B82F6' }}
                  >
                    <CategoryIcon name={cat.icon || 'Tag'} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] text-slate-500">
                        {cat.transaction_count || 0} transactions
                      </span>
                      {cat.is_default === 1 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-500 font-medium">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Volume:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(cat.total_spent || 0)}
                </span>
              </div>
            </div>
          ))}

          {/* Quick Create Card */}
          <button
            onClick={() => handleOpenCreate(activeTab)}
            className="p-6 rounded-2xl border border-dashed border-slate-300 hover:border-navy-900 hover:bg-slate-50/80 transition-all flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-navy-900 group min-h-[140px]"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-navy-900 group-hover:text-white flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">
              Add Custom {activeTab === 'expense' ? 'Expense' : 'Income'} Category
            </span>
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Custom Category'}
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
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gym & Fitness, Tech Gadgets"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 placeholder:text-slate-400"
            />
          </div>

          {!editingCategory && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Category Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
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
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>
          )}

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-navy-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Choose Icon
            </label>
            <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                    icon === ic
                      ? 'bg-navy-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CategoryIcon name={ic} className="w-4 h-4" />
                </button>
              ))}
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
              {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
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
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? ${
          deleteTarget?.transaction_count > 0
            ? `Warning: ${deleteTarget.transaction_count} existing transactions will be safely reassigned to the default "Other" category.`
            : 'No existing transactions are linked to this category.'
        }`}
      />
    </div>
  );
}
