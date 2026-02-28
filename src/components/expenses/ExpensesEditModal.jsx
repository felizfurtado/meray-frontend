import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";
import FieldRenderer from "./FieldRenderer";

const ExpensesEditModal = ({
  open,
  onClose,
  expenseId,
  schema,
  refetchExpenses,
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!open || !expenseId) return;

    // 🔥 Fetch expense
    api.get(`/expenses/${expenseId}/`).then((res) => {
      setFormData(res.data.expense);
    });

    // 🔥 Fetch expense accounts
    api.get("/accounts/expense/list/")
      .then((res) => {
        setAccounts(res.data.accounts || []);
      })
      .catch(() => {
        setAccounts([]);
      });

  }, [open, expenseId]);

  if (!open) return null;

  const lockedFields = ["amount", "vat_applicable", "vat_amount", "total"];

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/expenses/${expenseId}/update/`, formData);
      refetchExpenses();
      onClose();
    } finally {
      setLoading(false);
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

  const expenseNumber = formData?.expense_number || `EXP-${String(expenseId).slice(-6)}`;

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Edit Expense"
      width="max-w-6xl"
    >
      {/* Header - Matching Leads/Expenses style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                <i className="fas fa-receipt text-2xl"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-[#4a636e] rounded-full border-2 border-white flex items-center justify-center">
                <i className="fas fa-pencil-alt text-xs text-white"></i>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
                {expenseNumber}
              </h1>
              <div className="flex flex-wrap gap-2">
                {formData.status && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(formData.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      formData.status === 'POSTED' || formData.status === 'PAID' || formData.status === 'APPROVED' ? 'bg-[#4a9b68]' :
                      formData.status === 'DRAFT' ? 'bg-[#d9a44a]' :
                      formData.status === 'SUBMITTED' ? 'bg-blue2' :
                      formData.status === 'REJECTED' || formData.status === 'CANCELLED' ? 'bg-[#d95a4a]' :
                      'bg-[#8b8f8c]'
                    }`}></span>
                    {formData.status}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-blue2 bg-blue2/10 px-3 py-1 rounded-full border border-blue2/30">
                  <i className="fas fa-edit text-blue2 text-xs"></i>
                  Editing Mode
                </span>
              </div>
            </div>
          </div>
          
          {/* Total Amount Badge */}
          {formData.total && (
            <div className="flex flex-col items-end">
              <span className="text-sm text-[#8b8f8c]">Total Amount</span>
              <span className="text-3xl font-bold text-[#1f221f]">
                {formatCurrency(formData.total)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 px-6 py-3 bg-[#f6f6f4] rounded-lg border border-[#e5e7eb] flex items-center gap-2 text-sm text-[#4a636e]">
        <i className="fas fa-info-circle text-blue2"></i>
        <span>Financial values are system-controlled and cannot be edited.</span>
      </div>

      {/* Financial Summary - Using theme colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          label="Amount" 
          value={formData.amount} 
          color="text-[#4a9b68]" 
          icon="fas fa-money-bill-wave"
        />
        <StatCard 
          label="VAT" 
          value={formData.vat_amount} 
          color="text-blue2" 
          icon="fas fa-percent"
        />
        <StatCard 
          label="Total" 
          value={formData.total} 
          color="text-[#1f221f]" 
          icon="fas fa-coins"
        />
      </div>

      {/* Tabs */}
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
        </nav>
      </div>

      {/* Editable Fields */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
            <i className="fas fa-pencil-alt text-blue2"></i>
            Editable Fields
            <span className="ml-2 px-2 py-0.5 bg-blue2/10 text-blue2 text-xs rounded-full border border-blue2/30">
              Modify non-financial details only
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schema?.form_fields?.map((key) => {

              if (lockedFields.includes(key)) return null;

              // 🔥 Replace category with account dropdown
              if (key === "account" || key === "category") {
                return (
                  <div key="account" className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <i className="fas fa-book text-blue2/70 text-xs"></i>
                      <label className="text-xs font-medium text-[#4a636e]">
                        Expense Account
                      </label>
                    </div>
                    <select
                      value={formData.account || ""}
                      onChange={(e) => handleChange("account", e.target.value)}
                      className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
                    >
                      <option value="" className="text-[#8b8f8c]">Select Expense Account</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id} className="text-[#1f221f]">
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-[#8b8f8c] mt-1 flex items-center gap-1">
                      <i className="fas fa-info-circle text-[10px]"></i>
                      Select the expense account for this transaction
                    </p>
                  </div>
                );
              }

              const field = schema.fields.find((f) => f.key === key);
              if (!field) return null;

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <i className={`${getFieldIcon(field.key)} text-blue2/70 text-xs`}></i>
                    <label className="text-xs font-medium text-[#4a636e]">
                      {field.label || prettify(field.key)}
                      {field.required && <span className="text-[#d95a4a] ml-1">*</span>}
                    </label>
                  </div>
                  <FieldRenderer
                    field={field}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* System Information */}
        <div className="pt-4 border-t border-[#e5e7eb]">
          <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
            <i className="fas fa-database text-blue2"></i>
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.created_at && (
              <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fas fa-calendar-plus text-blue2/70 text-xs"></i>
                  <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Created Date</span>
                </div>
                <div className="text-base font-medium text-[#1f221f] pl-6">
                  {new Date(formData.created_at).toLocaleString()}
                </div>
              </div>
            )}
            {formData.updated_at && (
              <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fas fa-calendar-check text-blue2/70 text-xs"></i>
                  <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Last Updated</span>
                </div>
                <div className="text-base font-medium text-[#1f221f] pl-6">
                  {new Date(formData.updated_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8b8f8c]">
          <i className="fas fa-lock text-[10px]"></i>
          <span>Amount, VAT & Total are locked</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#4a636e] hover:text-[#1f221f] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-5 py-2 bg-blue2 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#4a636e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

export default ExpensesEditModal;

const StatCard = ({ label, value, color, icon }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue2/30 transition-all">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
        {icon && <i className={`${icon} ${color}`}></i>}
        {label}
      </span>
    </div>
    <div className={`text-2xl font-bold ${color}`}>
      {new Intl.NumberFormat('en-AE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)}
    </div>
  </div>
);

// Helper functions
const getFieldIcon = (key) => {
  const icons = {
    date: 'fas fa-calendar-alt',
    due_date: 'fas fa-clock',
    vendor_name: 'fas fa-building',
    vendor_email: 'fas fa-envelope',
    vendor_phone: 'fas fa-phone',
    description: 'fas fa-align-left',
    payment_method: 'fas fa-credit-card',
    payment_reference: 'fas fa-hashtag',
    account: 'fas fa-book',
    category: 'fas fa-tag',
    reference: 'fas fa-file-invoice',
    expense_number: 'fas fa-receipt',
    notes: 'fas fa-sticky-note',
  };
  return icons[key] || 'fas fa-pencil-alt';
};

const prettify = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};