import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";
import FieldRenderer from "./FieldRenderer";

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
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue2/10 to-[#a9c0c9]/30 rounded-2xl border border-blue2/20 p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#1f221f]">
          New Expense Entry
        </h2>
        <p className="text-sm text-[#4a636e] mt-1">
          Record an immediate payment expense.
        </p>
      </div>



      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Expense Number */}
        <Input
          label="Expense Number"
          value={formData.expense_number || ""}
          onChange={(v) => handleChange("expense_number", v)}
        />

        {/* Date */}
        <Input
          label="Expense Date"
          type="date"
          value={formData.date || ""}
          onChange={(v) => handleChange("date", v)}
        />

        {/* Vendor */}
        <Select
          label="Vendor"
          value={formData.vendor || ""}
          options={vendors.map((v) => ({
            label: v.company,
            value: v.id,
          }))}
          onChange={(v) => handleChange("vendor", v)}
        />

        {/* Amount */}
        <Input
          label="Amount"
          type="number"
          value={formData.amount || ""}
          onChange={(v) => handleChange("amount", v)}
        />

        {/* VAT */}
        <Checkbox
          label="VAT Applicable (5%)"
          checked={formData.vat_applicable || false}
          onChange={(v) => handleChange("vat_applicable", v)}
        />

        {/* Expense Account */}
        <Select
          label="Expense Account"
          value={formData.account || ""}
          options={expenseAccounts.map((a) => ({
            label: `${a.code} - ${a.name}`,
            value: a.id,
          }))}
          onChange={(v) => handleChange("account", v)}
        />

        {/* Payment Account */}
        <Select
          label="Payment Account (Cash/Bank)"
          value={formData.payment_account || ""}
          options={paymentAccounts.map((a) => ({
            label: `${a.code} - ${a.name}`,
            value: a.id,
          }))}
          onChange={(v) => handleChange("payment_account", v)}
        />

        {/* Status */}
        <Select
          label="Status"
          value={formData.status || "DRAFT"}
          options={[
            { label: "Draft", value: "DRAFT" },
            { label: "Posted", value: "POSTED" },
          ]}
          onChange={(v) => handleChange("status", v)}
        />

        {/* Notes */}
        <TextArea
          label="Notes"
          value={formData.notes || ""}
          onChange={(v) => handleChange("notes", v)}
        />
      </div>

            {/* SUMMARY */}
      <div className="bg-[#f6f6f4] p-6 rounded-xl border mb-6">
        <div className="flex justify-between">
          <span>Amount</span>
          <span>{formatCurrency(amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT (5%)</span>
          <span>{formatCurrency(vat)}</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2 mt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue2 text-white rounded-lg"
        >
          {loading ? "Creating..." : "Create Expense"}
        </button>
      </div>
    </ViewEditModal>
  );
};

export default ExpensesAddModal;


/* =========================
   REUSABLE UI COMPONENTS
========================= */

const Input = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="text-xs text-gray-500 block mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 text-sm"
    />
  </div>
);

const Select = ({ label, value, options, onChange }) => (
  <div>
    <label className="text-xs text-gray-500 block mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 text-sm"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm mt-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    {label}
  </label>
);

const TextArea = ({ label, value, onChange }) => (
  <div>
    <label className="text-xs text-gray-500 block mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full border rounded-lg px-3 py-2 text-sm"
    />
  </div>
);