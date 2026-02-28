import React, { useState, useEffect } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const ManualJournalAddModal = ({
  open,
  onClose,
  refetchJournals,
}) => {
  const [accounts, setAccounts] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    currency: "AED",
    status: "Draft",
    notes: "",
    entries: [
      { 
        account: "", 
        account_name: "", 
        account_code: "", 
        debit: 0, 
        credit: 0,
        description: "" 
      }
    ],
  });

  useEffect(() => {
    if (!open) return;

    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts/list/");
        setAccounts(res.data.accounts || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, [open]);

  if (!open) return null;

  const updateEntry = (i, key, value) => {
    const updated = [...form.entries];
    
    // Convert empty strings to 0 for debit/credit
    if (key === 'debit' || key === 'credit') {
      updated[i][key] = value === '' ? 0 : Number(value);
      
      // Auto-clear the opposite field when one is filled
      if (key === 'debit' && value) {
        updated[i].credit = 0;
      } else if (key === 'credit' && value) {
        updated[i].debit = 0;
      }
    } else {
      updated[i][key] = value;
    }
    
    setForm({ ...form, entries: updated });
  };

  const addRow = () => {
    setForm({
      ...form,
      entries: [
        ...form.entries,
        { 
          account: "", 
          account_name: "", 
          account_code: "", 
          debit: 0, 
          credit: 0,
          description: "" 
        },
      ],
    });
  };

  const removeRow = (i) => {
    setForm({
      ...form,
      entries: form.entries.filter((_, idx) => idx !== i),
    });
  };

  const totalDebits = form.entries.reduce(
    (sum, e) => sum + Number(e.debit || 0),
    0
  );

  const totalCredits = form.entries.reduce(
    (sum, e) => sum + Number(e.credit || 0),
    0
  );

  const difference = totalDebits - totalCredits;
  const isBalanced = Math.abs(difference) < 0.01;

  const validateForm = () => {
    // Check if all entries have accounts selected
    const hasEmptyAccounts = form.entries.some(entry => !entry.account);
    if (hasEmptyAccounts) {
      alert("Please select an account for all entries");
      return false;
    }

    // Check if at least one entry has a value
    const hasNoValues = form.entries.every(entry => entry.debit === 0 && entry.credit === 0);
    if (hasNoValues) {
      alert("Please enter at least one debit or credit amount");
      return false;
    }

    // Check if entries are balanced
    if (!isBalanced) {
      alert("Journal entries must balance! Debits must equal Credits.");
      return false;
    }

    return true;
  };

  const save = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Format the data before sending
      const formattedData = {
        ...form,
        entries: form.entries.map(entry => ({
          account: entry.account,
          account_name: entry.account_name,
          account_code: entry.account_code,
          description: entry.description || "",
          debit: entry.debit || 0,
          credit: entry.credit || 0
        }))
      };

      await api.post("/manual-journals/", formattedData);
      setSaving(false);
      onClose();
      refetchJournals?.();
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("Failed to save journal. Please try again.");
      setSaving(false);
    }
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Create Manual Journal"
      width="max-w-6xl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
        <h2 className="text-xl font-bold">New Journal Entry</h2>
        <p className="text-sm text-[#8b8f8c]">
          Debits must equal credits
        </p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(v) => setForm({ ...form, date: v })}
        />

        <Select
          label="Status"
          value={form.status}
          options={["Draft", "Posted"]}
          onChange={(v) => setForm({ ...form, status: v })}
        />

        <Input label="Currency" value="AED" disabled />
      </div>

      {/* Notes Field */}
      <div className="mb-6">
        <Input
          label="Notes"
          type="textarea"
          value={form.notes}
          onChange={(v) => setForm({ ...form, notes: v })}
          placeholder="Enter journal notes or description..."
        />
      </div>

      {/* Entries */}
      <h3 className="text-sm font-semibold mb-4">
        Journal Lines
      </h3>

      <div className="space-y-4">
        {form.entries.map((entry, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white border rounded-xl p-4"
          >
            {/* Account Dropdown - 4 cols */}
            <div className="md:col-span-3">
              <label className="text-xs text-[#8b8f8c] block mb-1">
                Account *
              </label>
              <select
                value={entry.account}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedAccount = accounts.find(
                    (acc) => String(acc.id) === selectedId
                  );

                  updateEntry(i, "account", selectedId);
                  updateEntry(i, "account_name", selectedAccount?.name || "");
                  updateEntry(i, "account_code", selectedAccount?.code || "");
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description - 3 cols */}
            <div className="md:col-span-3">
              <Input
                label="Description"
                value={entry.description}
                onChange={(v) => updateEntry(i, "description", v)}
                placeholder="Entry description..."
              />
            </div>

            {/* Debit - 2 cols */}
            <div className="md:col-span-2">
              <Input
                label="Debit"
                type="number"
                value={entry.debit}
                onChange={(v) => updateEntry(i, "debit", v)}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            {/* Credit - 2 cols */}
            <div className="md:col-span-2">
              <Input
                label="Credit"
                type="number"
                value={entry.credit}
                onChange={(v) => updateEntry(i, "credit", v)}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            {/* Remove button - 2 cols */}
            {form.entries.length > 1 && (
              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={() => removeRow(i)}
                  className="text-red-500 text-sm mb-1 hover:text-red-700 transition-colors"
                >
                  <i className="fas fa-trash mr-1"></i>
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="text-blue2 mt-4 text-sm font-medium hover:text-blue-700 transition-colors"
      >
        <i className="fas fa-plus mr-1"></i>
        Add Line
      </button>

      {/* Totals */}
      <div className="bg-[#f6f6f4] rounded-xl p-6 border mt-6">
        <div className="flex justify-between py-1">
          <span className="font-medium">Total Debits:</span>
          <span className="font-mono">{totalDebits.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-medium">Total Credits:</span>
          <span className="font-mono">{totalCredits.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-300 my-2"></div>
        <div className="flex justify-between py-1 font-bold">
          <span>Difference:</span>
          <span
            className={`font-mono ${
              isBalanced ? "text-green-600" : "text-red-600"
            }`}
          >
            {difference.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span>Status:</span>
          <span
            className={`font-medium ${
              isBalanced ? "text-green-600" : "text-red-600"
            }`}
          >
            {isBalanced ? "✓ BALANCED" : "✗ UNBALANCED"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={save}
          disabled={!isBalanced || saving}
          className="px-5 py-2 bg-blue2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i>
              Create Journal
            </>
          )}
        </button>
      </div>
    </ViewEditModal>
  );
};

export default ManualJournalAddModal;

/* UI Helpers */

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  disabled,
  placeholder,
  step,
  min
}) => {
  if (type === "textarea") {
    return (
      <div>
        <label className="text-xs text-[#8b8f8c] block mb-1">
          {label}
        </label>
        <textarea
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows="3"
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs text-[#8b8f8c] block mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
};

const Select = ({
  label,
  value,
  options,
  onChange,
}) => (
  <div>
    <label className="text-xs text-[#8b8f8c] block mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 text-sm"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);