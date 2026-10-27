import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import TransactionModal from '../common/TransactionModal';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions History',
  '/categories': 'Category Management',
  '/budgets': 'Monthly Budgets',
  '/reports': 'Reports & Analytics',
  '/settings': 'Account Settings',
};

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Dashboard';

  const handleTransactionSuccess = () => {
    // Notify page to re-fetch if needed
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-navy-900 z-50">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={title}
          onOpenMobile={() => setMobileMenuOpen(true)}
          onOpenAddTransaction={() => setIsTransactionModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet context={{ refreshTrigger, onOpenAddTransaction: () => setIsTransactionModalOpen(true) }} />
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}
