import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const ExpensesViewModal = ({ open, onClose, expenseId }) => {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!open || !expenseId) return;

    setLoading(true);
    api.get(`/expenses/${expenseId}/`)
      .then((res) => {
        setExpense(res.data.expense);
      })
      .catch(() => {
        setExpense(null);
      })
      .finally(() => setLoading(false));
  }, [open, expenseId]);

  if (!open) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'AED 0.00';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getStatusColor = (status) => {
    const map = {
      DRAFT: "bg-[#d9a44a]/10 text-[#d9a44a] border-[#d9a44a]/20",
      POSTED: "bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20",
      PAID: "bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20",
      APPROVED: "bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20",
      SUBMITTED: "bg-blue2/10 text-blue2 border-blue2/20",
      REJECTED: "bg-[#d95a4a]/10 text-[#d95a4a] border-[#d95a4a]/20",
      CANCELLED: "bg-[#d95a4a]/10 text-[#d95a4a] border-[#d95a4a]/20",
    };
    return map[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const expenseNumber = expense?.expense_number || `EXP-${String(expenseId).slice(-6)}`;

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title="Expense Details" 
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-receipt absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-[#8b8f8c] font-medium">Loading expense details…</p>
          </div>
        </div>
      ) : expense ? (
        <>
          {/* 🔷 Header - Matching Leads/Expenses style */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                    <i className="fas fa-receipt text-2xl"></i>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-[#4a636e] rounded-full border-2 border-white flex items-center justify-center">
                    <i className="fas fa-search text-xs text-white"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
                    {expense.expense_number || expenseNumber}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {expense.status && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(expense.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          expense.status === 'POSTED' || expense.status === 'PAID' || expense.status === 'APPROVED' ? 'bg-[#4a9b68]' :
                          expense.status === 'DRAFT' ? 'bg-[#d9a44a]' :
                          expense.status === 'SUBMITTED' ? 'bg-blue2' :
                          expense.status === 'REJECTED' || expense.status === 'CANCELLED' ? 'bg-[#d95a4a]' :
                          'bg-[#8b8f8c]'
                        }`}></span>
                        {expense.status}
                      </span>
                    )}
                    {expense.vendor_name && (
                      <span className="inline-flex items-center gap-1.5 text-[#4a636e] bg-white/60 px-3 py-1 rounded-full border border-gray-200">
  <i className="fas fa-building text-blue2 text-xs"></i>
  {expense.vendor_name || "No Vendor"}
</span>
                    )}
                    {expense.account_name && (
                      <span className="inline-flex items-center gap-1.5 text-blue2 bg-blue2/10 px-3 py-1 rounded-full border border-blue2/30">
                        <i className="fas fa-book text-blue2 text-xs"></i>
                        {expense.account_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Total Amount Badge */}
              {expense.total && (
                <div className="flex flex-col items-end">
                  <span className="text-sm text-[#8b8f8c]">Total Amount</span>
                  <span className="text-3xl font-bold text-[#1f221f]">
                    {formatCurrency(expense.total)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs - Matching Leads/Expenses style */}
          <div className="mb-6 border-b border-[#e5e7eb]">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-[#8b8f8c] hover:text-[#4a636e] hover:border-gray-300'
                }`}
              >
                <i className="fas fa-info-circle mr-2"></i>
                Expense Details
              </button>
              {expense.notes && (
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === 'notes'
                      ? 'border-blue2 text-blue2'
                      : 'border-transparent text-[#8b8f8c] hover:text-[#4a636e] hover:border-gray-300'
                  }`}
                >
                  <i className="fas fa-sticky-note mr-2"></i>
                  Notes
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* 💳 Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {expense.amount && (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue2/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
                        <i className="fas fa-money-bill-wave text-[#4a9b68]"></i>
                        Amount
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-[#4a9b68]">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                )}
                
                {expense.vat_amount && (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue2/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
                        <i className="fas fa-percent text-blue2"></i>
                        VAT (5%)
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue2">
                      {formatCurrency(expense.vat_amount)}
                    </div>
                  </div>
                )}
                
                {expense.total && (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue2/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
                        <i className="fas fa-coins text-[#1f221f]"></i>
                        Total
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-[#1f221f]">
                      {formatCurrency(expense.total)}
                    </div>
                  </div>
                )}
              </div>

              {/* 🧾 Details */}
              <Section title="Expense Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard 
                    label="Date" 
                    value={formatDate(expense.date)} 
                    icon="fas fa-calendar-alt"
                  />
                  <InfoCard 
  label="Vendor" 
  value={expense.vendor_name || "—"} 
  icon="fas fa-building"
/>
                  <InfoCard 
                    label="Currency" 
                    value={expense.currency || 'AED'} 
                    icon="fas fa-money-bill"
                  />
                  <InfoCard 
                    label="Expense Account" 
                    value={expense.account_name} 
                    icon="fas fa-book"
                  />
                  <InfoCard 
  label="Paid From Account" 
  value={expense.payment_account_name || "—"} 
  icon="fas fa-university"
/>
                  <InfoCard 
                    label="VAT Applicable" 
                    value={expense.vat_applicable ? "Yes" : "No"} 
                    icon="fas fa-check-circle"
                    valueClassName={expense.vat_applicable ? "text-[#4a9b68]" : "text-[#8b8f8c]"}
                  />
                  <InfoCard 
                    label="Created By" 
                    value={expense.created_by} 
                    icon="fas fa-user-plus"
                  />
                  {expense.due_date && (
                    <InfoCard 
                      label="Due Date" 
                      value={formatDate(expense.due_date)} 
                      icon="fas fa-clock"
                    />
                  )}
                  {expense.payment_reference && (
                    <InfoCard 
                      label="Payment Reference" 
                      value={expense.payment_reference} 
                      icon="fas fa-hashtag"
                    />
                  )}
                  {expense.description && (
                    <InfoCard 
                      label="Description" 
                      value={expense.description} 
                      icon="fas fa-align-left"
                      className="md:col-span-2 lg:col-span-3"
                    />
                  )}
                </div>
              </Section>

              {/* System Information */}
              <Section title="System Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expense.created_at && (
                    <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-calendar-plus text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Created Date</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6">
                        {new Date(expense.created_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {expense.updated_at && (
                    <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-calendar-check text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Last Updated</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6">
                        {new Date(expense.updated_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {expense.id && (
                    <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-fingerprint text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Expense ID</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6 font-mono">
                        {expense.id}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            </div>
          ) : (
            /* Notes Tab */
            <div className="space-y-6">
              {expense.notes && (
                <Section title="Notes">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue2/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2/20 to-[#a9c0c9]/30 flex items-center justify-center">
                          <i className="fas fa-sticky-note text-blue2"></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-[#1f221f]">
                            {expense.created_by || 'System'}
                          </span>
                          <span className="text-xs text-[#8b8f8c]">
                            <i className="fas fa-calendar-alt mr-1"></i>
                            {formatDate(expense.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-[#4a636e] leading-relaxed whitespace-pre-wrap">
                          {expense.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* Footer - Matching Leads/Expenses style */}
          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#8b8f8c]">
              <span className="flex items-center gap-1.5">
                <i className="fas fa-fingerprint text-[10px]"></i>
                Expense ID: {expenseId}
              </span>
              {expense.updated_at && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-calendar-check text-[10px]"></i>
                    Updated {formatDate(expense.updated_at)}
                  </span>
                </>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-[#4a636e] hover:bg-[#f6f6f4] hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue2 transition-colors"
            >
              <i className="fas fa-times mr-2"></i>
              Close
            </button>
          </div>
        </>
      ) : (
        <div className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d95a4a]/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-[#d95a4a] text-3xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-[#1f221f] mb-2">Expense not found</h3>
          <p className="text-[#8b8f8c] text-sm mb-4">The expense you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue2 rounded-lg hover:bg-[#4a636e] transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </ViewEditModal>
  );
};

export default ExpensesViewModal;

/* Components */

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className="w-1 h-6 bg-blue2 rounded-full"></div>
      <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const InfoCard = ({ label, value, icon, valueClassName = "text-[#1f221f]", className = "" }) => (
  <div className={`group bg-white rounded-xl border border-gray-200 hover:border-blue2/30 hover:shadow-sm transition-all p-4 ${className}`}>
    <div className="flex items-center gap-2 mb-1.5">
      {icon && <i className={`${icon} text-blue2/70 text-xs`}></i>}
      <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">
        {label}
      </span>
    </div>
    <div className={`text-base font-medium break-words pl-5 ${valueClassName}`}>
      {value || "—"}
    </div>
  </div>
);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";