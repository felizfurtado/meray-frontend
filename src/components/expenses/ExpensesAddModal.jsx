import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const ExpensesAddModal = ({ open, onClose, schema, refetchExpenses }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [vendors, setVendors] = useState([]);

  // =========================
  // FETCH DATA ON OPEN
  // =========================

  useEffect(() => {
    if (!open) return;

    // Vendors
    api.get("/vendors/list/")
      .then((res) => setVendors(res.data.rows || []))
      .catch(() => setVendors([]));

    // Expense Accounts
    api.get("/accounts/by-type/?type=Expense")
      .then((res) => setExpenseAccounts(res.data.accounts || []))
      .catch(() => setExpenseAccounts([]));

    // Payment Accounts (Asset)
    api.get("/accounts/by-type/?type=Asset")
      .then((res) => setPaymentAccounts(res.data.accounts || []))
      .catch(() => setPaymentAccounts([]));

  }, [open]);

  if (!open) return null;

  // =========================
  // HANDLERS
  // =========================

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const amount = Number(formData.amount || 0);
  const vat = formData.vat_applicable ? amount * 0.05 : 0;
  const total = amount + vat;

  const handleSubmit = async () => {
    if (!formData.expense_number) {
      alert("Expense number required");
      return;
    }

    if (!formData.account) {
      alert("Expense account required");
      return;
    }

    if (formData.status === "POSTED" && !formData.payment_account) {
      alert("Payment account required for posted expense");
      return;
    }

    setLoading(true);

    try {
      await api.post("/expenses/", {
        ...formData,
        amount: amount,
      });

      refetchExpenses();
      setFormData({});
      onClose();

    } catch (err) {
      alert("Failed to create expense");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(value || 0);
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Add Expense"
      width="max-w-6xl"
    >
      {/* Header Decoration - Your style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
            <i className="fas fa-receipt text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1f221f]">New Expense</h2>
            <p className="text-xs text-[#8b8f8c]">Record an immediate payment expense with VAT calculation</p>
          </div>
        </div>
      </div>

      {/* FORM - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* Expense Number */}
        <DynamicField
          field={{
            key: "expense_number",
            label: "Expense Number",
            type: "text",
            required: true,
            icon: "fas fa-hashtag"
          }}
          value={formData.expense_number || ""}
          onChange={handleChange}
        />

        {/* Date */}
        <DynamicField
          field={{
            key: "date",
            label: "Expense Date",
            type: "date",
            icon: "fas fa-calendar"
          }}
          value={formData.date || ""}
          onChange={handleChange}
        />

        {/* Vendor */}
        <DynamicField
          field={{
            key: "vendor",
            label: "Vendor",
            type: "select",
            options: vendors.map((v) => ({
              label: v.company,
              value: v.id,
            })),
            icon: "fas fa-building"
          }}
          value={formData.vendor || ""}
          onChange={handleChange}
        />

        {/* Amount */}
        <DynamicField
          field={{
            key: "amount",
            label: "Amount",
            type: "currency",
            required: true,
            icon: "fas fa-money-bill-wave"
          }}
          value={formData.amount || ""}
          onChange={handleChange}
        />

        {/* Expense Account */}
        <DynamicField
          field={{
            key: "account",
            label: "Expense Account",
            type: "select",
            options: expenseAccounts.map((a) => ({
              label: `${a.code} - ${a.name}`,
              value: a.id,
            })),
            required: true,
            icon: "fas fa-book"
          }}
          value={formData.account || ""}
          onChange={handleChange}
        />

        {/* Payment Account */}
        <DynamicField
          field={{
            key: "payment_account",
            label: "Payment Account",
            type: "select",
            options: paymentAccounts.map((a) => ({
              label: `${a.code} - ${a.name}`,
              value: a.id,
            })),
            icon: "fas fa-credit-card"
          }}
          value={formData.payment_account || ""}
          onChange={handleChange}
        />

        {/* Status */}
        <DynamicField
          field={{
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Draft", value: "DRAFT" },
              { label: "Posted", value: "POSTED" },
            ],
            icon: "fas fa-flag"
          }}
          value={formData.status || "DRAFT"}
          onChange={handleChange}
        />

        {/* VAT Checkbox - Custom styling to match */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
            <i className="fas fa-percent text-blue2/70 text-xs"></i>
            VAT Applicable
          </label>
          <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#e5e7eb] hover:border-blue2/30 transition-all cursor-pointer">
            <input
              type="checkbox"
              checked={formData.vat_applicable || false}
              onChange={(e) => handleChange("vat_applicable", e.target.checked)}
              className="w-4 h-4 text-blue2 border-gray-300 rounded focus:ring-blue2"
            />
            <span className="text-sm text-[#1f221f]">Apply 5% VAT</span>
          </label>
        </div>

        {/* Notes - Full width */}
        <div className="md:col-span-2">
          <DynamicField
            field={{
              key: "notes",
              label: "Notes",
              type: "textarea",
              icon: "fas fa-sticky-note"
            }}
            value={formData.notes || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* SUMMARY SECTION - Your style */}
      <div className="p-4 border-t border-[#e5e7eb]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
          <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
            <i className="fas fa-calculator text-[#d9a44a] text-xs"></i>
            Expense Summary
          </h3>
        </div>
        
        <div className="bg-[#f6f6f4] rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#4a636e]">Subtotal</span>
            <span className="font-medium text-[#1f221f]">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#4a636e]">VAT (5%)</span>
            <span className="font-medium text-[#d9a44a]">{formatCurrency(vat)}</span>
          </div>
          <div className="border-t border-[#e5e7eb] pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#1f221f]">Total</span>
              <span className="text-lg font-bold text-blue2">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Actions - Your style */}
      <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8b8f8c]">
          <i className="fas fa-info-circle text-[10px]"></i>
          <span>Fields marked with * are required</span>
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
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-plus-circle mr-2"></i>
                Create Expense
              </>
            )}
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

export default ExpensesAddModal;

// =========================
// REUSABLE DYNAMIC FIELD - Your style from CustomersAddModal
// =========================
const DynamicField = ({ field, value, onChange }) => {
  const getFieldIcon = (key) => {
    const icons = {
      expense_number: 'fas fa-hashtag',
      date: 'fas fa-calendar',
      vendor: 'fas fa-building',
      amount: 'fas fa-money-bill-wave',
      account: 'fas fa-book',
      payment_account: 'fas fa-credit-card',
      status: 'fas fa-flag',
      notes: 'fas fa-sticky-note',
      vat_applicable: 'fas fa-percent',
    };
    return icons[field.key] || field.icon || 'fas fa-tag';
  };

  const common = {
    value,
    onChange: (e) => onChange(field.key, e.target.value),
    className: "w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white",
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
          <i className={`${getFieldIcon(field.key)} text-blue2/70 text-xs`}></i>
          {field.label || prettify(field.key)}
          {field.required && <span className="text-[#d95a4a]">*</span>}
        </label>
      </div>

      {field.type === "select" && (
        <select {...common}>
          <option value="" className="text-[#8b8f8c]">Select {field.label || 'option'}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-[#1f221f]">
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "date" && (
        <input type="date" {...common} />
      )}

      {field.type === "textarea" && (
        <textarea
          {...common}
          rows={3}
          className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all resize-none"
        />
      )}

      {field.type === "currency" && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8f8c] text-sm">AED</span>
          <input
            type="number"
            {...common}
            className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all pl-14"
          />
        </div>
      )}

      {field.type === "number" && (
        <input type="number" {...common} />
      )}

      {!["select", "date", "textarea", "currency", "number"].includes(field.type) && (
        <input type="text" {...common} />
      )}

      {field.description && (
        <p className="text-xs text-[#8b8f8c] mt-1 flex items-center gap-1">
          <i className="fas fa-info-circle text-[10px]"></i>
          {field.description}
        </p>
      )}
    </div>
  );
};

// Helper function
const prettify = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};