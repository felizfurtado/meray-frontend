import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const AccountsAddModal = ({ open, onClose, refetch }) => {
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "Asset",
    description: "",
    vat_applicable: false,
    parent_id: "",
  });

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load parent accounts for dropdown
  useEffect(() => {
    if (!open) return;

    const fetchParents = async () => {
      try {
        const res = await api.get("/accounts/list/");
        setParents(res.data.accounts || []);
      } catch (err) {
        console.error("Failed to load parents", err);
      }
    };

    fetchParents();
  }, [open]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      type: "Asset",
      description: "",
      vat_applicable: false,
      parent_id: "",
    });
  };

  const handleSave = async () => {
    if (!form.code || !form.name) {
      alert("Code and Name are required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        parent_id: form.parent_id || null,
      };

      await api.post("/accounts/", payload);

      resetForm();
      onClose();
      refetch?.();
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title="Add Account"
      width="max-w-4xl"
    >
      {/* Header - Matching theme */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
              <i className="fas fa-book text-2xl"></i>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-[#4a636e] rounded-full border-2 border-white flex items-center justify-center">
              <i className="fas fa-plus-circle text-xs text-white"></i>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
              New Chart of Account
            </h1>
            <p className="text-[#4a636e] text-sm flex items-center gap-2">
              <i className="fas fa-info-circle text-blue2 text-xs"></i>
              Add a new account to your chart of accounts
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 bg-blue2 rounded-full"></div>
          <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
            <i className="fas fa-book-open text-blue2"></i>
            Account Information
          </h3>
          <span className="ml-2 px-2 py-0.5 bg-blue2/10 text-blue2 text-xs rounded-full border border-blue2/30">
            New Account
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e] uppercase tracking-wide">
                <i className="fas fa-hashtag text-blue2/70 text-xs"></i>
                Account Code
                <span className="text-[#d95a4a] ml-1">*</span>
              </label>
            </div>
            <div className="bg-white rounded-lg border border-[#e5e7eb] hover:border-blue2/30 focus-within:border-blue2 focus-within:ring-2 focus-within:ring-blue2/20 transition-all">
              <input
                value={form.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="e.g. 1000"
                className="w-full border-0 focus:ring-0 px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 bg-transparent"
              />
            </div>
            <p className="text-xs text-[#8b8f8c] mt-1 flex items-center gap-1">
              <i className="fas fa-info-circle text-[10px]"></i>
              Unique code for this account
            </p>
          </div>

          {/* Account Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e] uppercase tracking-wide">
                <i className="fas fa-tag text-blue2/70 text-xs"></i>
                Account Name
                <span className="text-[#d95a4a] ml-1">*</span>
              </label>
            </div>
            <div className="bg-white rounded-lg border border-[#e5e7eb] hover:border-blue2/30 focus-within:border-blue2 focus-within:ring-2 focus-within:ring-blue2/20 transition-all">
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Cash, Accounts Receivable"
                className="w-full border-0 focus:ring-0 px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 bg-transparent"
              />
            </div>
          </div>

          {/* Account Type */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <i className="fas fa-sitemap text-blue2/70 text-xs"></i>
              <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide">
                Account Type
              </label>
            </div>
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
            >
              <option value="Asset" className="text-[#1f221f]">Asset</option>
              <option value="Liability" className="text-[#1f221f]">Liability</option>
              <option value="Equity" className="text-[#1f221f]">Equity</option>
              <option value="Revenue" className="text-[#1f221f]">Revenue</option>
              <option value="Expense" className="text-[#1f221f]">Expense</option>
            </select>
          </div>

          {/* Parent Account */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <i className="fas fa-level-up-alt text-blue2/70 text-xs transform rotate-90"></i>
              <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide">
                Parent Account
              </label>
            </div>
            <select
              value={form.parent_id}
              onChange={(e) => handleChange("parent_id", e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
            >
              <option value="" className="text-[#8b8f8c]">None (Top Level)</option>
              {parents.map((acc) => (
                <option key={acc.id} value={acc.id} className="text-[#1f221f]">
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#8b8f8c] mt-1 flex items-center gap-1">
              <i className="fas fa-info-circle text-[10px]"></i>
              Leave empty for top-level account
            </p>
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <i className="fas fa-align-left text-blue2/70 text-xs"></i>
              <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide">
                Description
              </label>
            </div>
            <div className="bg-white rounded-lg border border-[#e5e7eb] hover:border-blue2/30 focus-within:border-blue2 focus-within:ring-2 focus-within:ring-blue2/20 transition-all">
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                placeholder="Enter a description for this account..."
                className="w-full border-0 focus:ring-0 px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 bg-transparent resize-none"
              />
            </div>
          </div>

          {/* VAT Applicable */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 p-4 bg-[#f6f6f4] rounded-lg border border-[#e5e7eb]">
              <div className="relative">
                <input
                  type="checkbox"
                  id="vat_applicable"
                  checked={form.vat_applicable}
                  onChange={(e) => handleChange("vat_applicable", e.target.checked)}
                  className="w-4 h-4 accent-blue2 rounded border-gray-300 text-blue2 focus:ring-blue2 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="vat_applicable" className="text-sm font-medium text-[#1f221f] cursor-pointer">
                  VAT Applicable
                </label>
                <p className="text-xs text-[#4a636e] mt-0.5">
                  Enable if this account is subject to VAT
                </p>
              </div>
              {form.vat_applicable && (
                <div className="px-3 py-1.5 bg-[#d9a44a]/10 rounded-lg border border-[#d9a44a]/20">
                  <span className="text-xs font-semibold text-[#d9a44a]">VAT @ 5%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8b8f8c]">
          <i className="fas fa-book text-blue2/70"></i>
          <span>Add a new account to your chart of accounts</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-[#4a636e] hover:text-[#1f221f] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
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
                Create Account
              </>
            )}
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

export default AccountsAddModal;