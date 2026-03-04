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
  const [errors, setErrors] = useState({});
  
  // Account selector states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    currency: "AED",
    status: "Posted",
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
      setLoadingAccounts(true);
      try {
        const res = await api.get("/accounts/list/");
        setAccounts(res.data.accounts || []);
        setFilteredAccounts(res.data.accounts || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, [open]);

  // Filter accounts when search term changes
  useEffect(() => {
    if (!accountSearchTerm.trim()) {
      setFilteredAccounts(accounts);
    } else {
      const term = accountSearchTerm.toLowerCase();
      setFilteredAccounts(accounts.filter(acc => 
        acc.name?.toLowerCase().includes(term) ||
        acc.code?.toLowerCase().includes(term) ||
        acc.type?.toLowerCase().includes(term)
      ));
    }
  }, [accountSearchTerm, accounts]);

  if (!open) return null;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  const openAccountSelector = (index) => {
    setSelectedAccountIndex(index);
    setAccountSearchTerm("");
    setShowAccountModal(true);
  };

  const selectAccount = (account) => {
    if (selectedAccountIndex !== null) {
      updateEntry(selectedAccountIndex, "account", account.id);
      updateEntry(selectedAccountIndex, "account_name", account.name || "");
      updateEntry(selectedAccountIndex, "account_code", account.code || "");
      setShowAccountModal(false);
      setSelectedAccountIndex(null);
    }
  };

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
    
    // Clear error for this entry when fixed
    if (errors[`entry_${i}_${key}`]) {
      const newErrors = { ...errors };
      delete newErrors[`entry_${i}_${key}`];
      setErrors(newErrors);
    }
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
    const newErrors = {};
    
    // Check date
    if (!form.date) {
      newErrors.date = "Date is required";
    }
    
    // Check each entry
    form.entries.forEach((entry, index) => {
      if (!entry.account) {
        newErrors[`entry_${index}_account`] = "Account is required";
      }
      
      if (entry.debit === 0 && entry.credit === 0) {
        newErrors[`entry_${index}_amount`] = "Enter debit or credit amount";
      }
      
      if (entry.debit > 0 && entry.credit > 0) {
        newErrors[`entry_${index}_both`] = "Cannot have both debit and credit";
      }
    });
    
    // Check if at least one entry has a value
    const hasNoValues = form.entries.every(entry => entry.debit === 0 && entry.credit === 0);
    if (hasNoValues) {
      newErrors.general = "Enter at least one debit or credit amount";
    }
    
    // Check balance
    if (!isBalanced) {
      newErrors.balance = "Journal must balance (Debits = Credits)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const save = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
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
      width="max-w-7xl"
    >
      {/* Account Selection Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAccountModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1f221f] flex items-center gap-2">
                  <i className="fas fa-book text-blue2"></i>
                  Select Account
                </h3>
                <button 
                  onClick={() => setShowAccountModal(false)}
                  className="text-[#8b8f8c] hover:text-[#1f221f] transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={accountSearchTerm}
                  onChange={(e) => setAccountSearchTerm(e.target.value)}
                  placeholder="Search by code, name, or type..."
                  className="w-full border-2 border-[#e5e7eb] rounded-lg pl-10 pr-4 py-3 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                  autoFocus
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8f8c]"></i>
                {accountSearchTerm && (
                  <button
                    onClick={() => setAccountSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8f8c] hover:text-[#1f221f]"
                  >
                    <i className="fas fa-times-circle"></i>
                  </button>
                )}
              </div>
              
              <p className="text-xs text-[#8b8f8c] mt-2">
                {filteredAccounts.length} accounts found
              </p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {loadingAccounts ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 border-4 border-blue2/20 border-t-blue2 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-[#8b8f8c]">Loading accounts...</p>
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#f6f6f4] flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-book text-2xl text-[#8b8f8c]"></i>
                  </div>
                  <p className="text-sm font-medium text-[#1f221f] mb-1">
                    {accountSearchTerm ? "No matching accounts" : "No accounts found"}
                  </p>
                  <p className="text-xs text-[#8b8f8c]">
                    {accountSearchTerm ? "Try a different search term" : "Please create accounts first"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAccounts.map((account) => (
                    <div
                      key={account.id}
                      onClick={() => selectAccount(account)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue2/30 hover:bg-blue2/5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg ${
                          account.type === 'ASSET' ? 'bg-green-100' :
                          account.type === 'LIABILITY' ? 'bg-orange-100' :
                          account.type === 'EQUITY' ? 'bg-purple-100' :
                          account.type === 'REVENUE' ? 'bg-blue-100' :
                          account.type === 'EXPENSE' ? 'bg-red-100' :
                          'bg-gray-100'
                        } flex items-center justify-center`}>
                          <i className={`fas ${
                            account.type === 'ASSET' ? 'fa-building' :
                            account.type === 'LIABILITY' ? 'fa-credit-card' :
                            account.type === 'EQUITY' ? 'fa-chart-pie' :
                            account.type === 'REVENUE' ? 'fa-arrow-up' :
                            account.type === 'EXPENSE' ? 'fa-arrow-down' :
                            'fa-book'
                          } ${
                            account.type === 'ASSET' ? 'text-green-600' :
                            account.type === 'LIABILITY' ? 'text-orange-600' :
                            account.type === 'EQUITY' ? 'text-purple-600' :
                            account.type === 'REVENUE' ? 'text-blue-600' :
                            account.type === 'EXPENSE' ? 'text-red-600' :
                            'text-gray-600'
                          }`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#1f221f]">{account.name}</span>
                            <span className="text-xs bg-[#f6f6f4] px-2 py-0.5 rounded-full text-[#4a636e] font-mono">
                              {account.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue2/10 text-blue2">
                              {account.type}
                            </span>
                            {account.balance !== undefined && (
                              <span className="text-xs text-[#8b8f8c]">
                                Balance: {formatCurrency(account.balance)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <i className="fas fa-chevron-right text-[#8b8f8c] group-hover:text-blue2 transition-colors"></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-[#f6f6f4]/50 flex justify-between items-center">
              <span className="text-xs text-[#8b8f8c]">
                <i className="fas fa-info-circle mr-1"></i>
                Click on an account to select it
              </span>
              <button
                onClick={() => setShowAccountModal(false)}
                className="px-4 py-2 text-sm font-medium text-[#4a636e] hover:text-[#1f221f] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Your style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
            <i className="fas fa-journal-whills text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1f221f]">New Journal Entry</h2>
            <p className="text-xs text-[#8b8f8c]">Debits must equal credits for the journal to balance</p>
          </div>
        </div>
      </div>

      {/* Basic Info - Grid with your styled fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        <div>
          <DynamicField
            field={{
              key: "date",
              label: "Date",
              type: "date",
              icon: "fas fa-calendar",
              required: true
            }}
            value={form.date}
            onChange={(key, val) => setForm({ ...form, date: val })}
          />
          {errors.date && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              {errors.date}
            </p>
          )}
        </div>

        <DynamicField
          field={{
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Posted", value: "Posted" }
            ],
            icon: "fas fa-flag"
          }}
          value={form.status}
          onChange={(key, val) => setForm({ ...form, status: val })}
        />

        <DynamicField
          field={{
            key: "currency",
            label: "Currency",
            type: "text",
            icon: "fas fa-coins",
            disabled: true
          }}
          value={form.currency}
          onChange={(key, val) => setForm({ ...form, currency: val })}
        />
      </div>

      {/* Notes Field */}
      <div className="p-4">
        <DynamicField
          field={{
            key: "notes",
            label: "Notes / Description",
            type: "textarea",
            icon: "fas fa-sticky-note"
          }}
          value={form.notes}
          onChange={(key, val) => setForm({ ...form, notes: val })}
        />
      </div>

      {/* Journal Lines Header */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
            <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-list text-[#d9a44a] text-xs"></i>
              Journal Lines
            </h3>
            <span className="text-xs bg-blue2/10 text-blue2 px-2 py-1 rounded-full">
              {form.entries.length} entries
            </span>
          </div>
          
          {/* Add Line Button */}
          <button
            onClick={addRow}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue2/10 to-blue2/5 text-blue2 hover:from-blue2/20 hover:to-blue2/10 rounded-lg transition-all border border-blue2/20 font-medium"
          >
            <i className="fas fa-plus-circle"></i>
            Add Line
          </button>
        </div>
      </div>

      {/* Entries - Enhanced with better spacing */}
      <div className="px-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {form.entries.map((entry, i) => {
          const hasAccountError = errors[`entry_${i}_account`];
          const hasAmountError = errors[`entry_${i}_amount`];
          const hasBothError = errors[`entry_${i}_both`];
          
          return (
            <div
              key={i}
              className={`bg-white border-2 rounded-xl p-6 transition-all ${
                hasAccountError || hasAmountError || hasBothError
                  ? "border-red-200 bg-red-50/30"
                  : "border-[#e5e7eb] hover:border-blue2/30 hover:shadow-md"
              }`}
            >
              {/* Entry Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e5e7eb]">
                <span className="text-xs font-medium text-[#4a636e]">
                  Line #{i + 1}
                </span>
                {form.entries.length > 1 && (
                  <button
                    onClick={() => removeRow(i)}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-all flex items-center gap-1"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                    Remove
                  </button>
                )}
              </div>

              {/* Entry Fields - 2 column grid for better visibility */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Account & Description */}
                <div className="space-y-4">
                  {/* Account Selection - Clickable Field */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e] mb-1.5">
                      <i className="fas fa-book text-blue2/70 text-xs"></i>
                      Account <span className="text-[#d95a4a]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => openAccountSelector(i)}
                      className={`w-full text-left p-3 border-2 rounded-lg transition-all ${
                        entry.account 
                          ? 'border-blue2/30 bg-blue2/5 hover:bg-blue2/10' 
                          : 'border-[#e5e7eb] hover:border-blue2/30'
                      } ${hasAccountError ? 'border-red-300 bg-red-50' : ''}`}
                    >
                      {entry.account ? (
                        <div>
                          <div className="font-medium text-[#1f221f]">{entry.account_name}</div>
                          <div className="text-xs text-[#8b8f8c] flex items-center gap-1 mt-0.5">
                            <span className="bg-blue2/10 text-blue2 px-1.5 py-0.5 rounded text-[10px]">
                              {entry.account_code}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#8b8f8c] flex items-center gap-2">
                          <i className="fas fa-search text-xs"></i>
                          Click to select account
                        </span>
                      )}
                    </button>
                    {hasAccountError && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors[`entry_${i}_account`]}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e] mb-1.5">
                      <i className="fas fa-align-left text-blue2/70 text-xs"></i>
                      Description
                    </label>
                    <input
                      type="text"
                      value={entry.description}
                      onChange={(e) => updateEntry(i, "description", e.target.value)}
                      placeholder="Enter description for this line..."
                      className="w-full border-2 border-[#e5e7eb] rounded-lg px-4 py-3 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                    />
                  </div>
                </div>

                {/* Right Column - Debit & Credit */}
                <div className="space-y-4">
                  {/* Debit & Credit side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Debit */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e] mb-1.5">
                        <i className="fas fa-arrow-down text-green-600 text-xs"></i>
                        Debit Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8f8c] text-sm font-medium">AED</span>
                        <input
                          type="number"
                          value={entry.debit || ''}
                          onChange={(e) => updateEntry(i, "debit", e.target.value)}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className={`w-full border-2 rounded-lg pl-14 pr-4 py-3 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                            hasAmountError || hasBothError ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Credit */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e] mb-1.5">
                        <i className="fas fa-arrow-up text-red-600 text-xs"></i>
                        Credit Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8f8c] text-sm font-medium">AED</span>
                        <input
                          type="number"
                          value={entry.credit || ''}
                          onChange={(e) => updateEntry(i, "credit", e.target.value)}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className={`w-full border-2 rounded-lg pl-14 pr-4 py-3 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                            hasAmountError || hasBothError ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error messages for amounts */}
                  {hasAmountError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors[`entry_${i}_amount`]}
                    </p>
                  )}
                  {hasBothError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors[`entry_${i}_both`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            {errors.general}
          </div>
        </div>
      )}

      {/* Totals & Balance Summary */}
      <div className="p-4 mt-4">
        <div className="bg-gradient-to-br from-[#f6f6f4] to-white p-6 rounded-xl border border-[#e5e7eb]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue2 rounded-full"></div>
            <h4 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider">
              Journal Balance
            </h4>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debits & Credits Summary */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#e5e7eb]">
                <span className="text-[#4a636e] flex items-center gap-2">
                  <i className="fas fa-arrow-down text-green-600"></i>
                  Total Debits
                </span>
                <span className="font-mono font-semibold text-lg text-[#1f221f]">
                  AED {totalDebits.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#4a636e] flex items-center gap-2">
                  <i className="fas fa-arrow-up text-red-600"></i>
                  Total Credits
                </span>
                <span className="font-mono font-semibold text-lg text-[#1f221f]">
                  AED {totalCredits.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Balance Status */}
            <div className="bg-white rounded-lg p-4 border border-[#e5e7eb]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#4a636e]">Difference:</span>
                <span className={`font-mono font-bold text-xl ${
                  isBalanced ? "text-green-600" : "text-red-600"
                }`}>
                  AED {difference.toFixed(2)}
                </span>
              </div>
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                isBalanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                <i className={`fas ${isBalanced ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
                <span className="font-medium">
                  {isBalanced ? "Journal is BALANCED" : "Journal is UNBALANCED"}
                </span>
              </div>
              {errors.balance && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  {errors.balance}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Your style */}
      <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8b8f8c]">
          <i className="fas fa-info-circle text-[10px]"></i>
          <span>Fields marked with <span className="text-[#d95a4a]">*</span> are required</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#4a636e] hover:text-[#1f221f] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center px-5 py-2 bg-blue2 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#4a636e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Create Journal
              </>
            )}
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

export default ManualJournalAddModal;

/* ================= DYNAMIC FIELD - Your style ================= */

const DynamicField = ({ field, value, onChange }) => {
  const getFieldIcon = (key) => {
    const icons = {
      date: 'fas fa-calendar',
      status: 'fas fa-flag',
      currency: 'fas fa-coins',
      notes: 'fas fa-sticky-note',
    };
    return icons[field.key] || field.icon || 'fas fa-tag';
  };

  const common = {
    value,
    onChange: (e) => onChange(field.key, e.target.value),
    className: "w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white",
  };

  if (field.type === "textarea") {
    return (
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
          <i className={`${getFieldIcon(field.key)} text-blue2/70 text-xs`}></i>
          {field.label}
          {field.required && <span className="text-[#d95a4a]">*</span>}
        </label>
        <textarea
          {...common}
          rows={3}
          className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all resize-none"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
          <i className={`${getFieldIcon(field.key)} text-blue2/70 text-xs`}></i>
          {field.label}
          {field.required && <span className="text-[#d95a4a]">*</span>}
        </label>
      </div>

      {field.type === "select" && (
        <select {...common} disabled={field.disabled}>
          <option value="" className="text-[#8b8f8c]">Select {field.label}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-[#1f221f]">
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "date" && (
        <input type="date" {...common} disabled={field.disabled} />
      )}

      {field.type === "currency" && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8f8c] text-sm font-medium">AED</span>
          <input
            type="number"
            {...common}
            disabled={field.disabled}
            className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all pl-14"
          />
        </div>
      )}

      {field.type === "number" && (
        <input type="number" {...common} disabled={field.disabled} />
      )}

      {!["select", "date", "textarea", "currency", "number"].includes(field.type) && (
        <input type="text" {...common} disabled={field.disabled} />
      )}
    </div>
  );
};