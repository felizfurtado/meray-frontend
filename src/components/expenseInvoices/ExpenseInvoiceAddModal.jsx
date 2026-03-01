import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";
import ExpenseInvoicePdfImport from "./ExpenseInvoicePdfImport";

const ExpenseInvoiceAddModal = ({
  open,
  onClose,
  refetchInvoices,
}) => {

  const [vendors, setVendors] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");

  const [form, setForm] = useState({
    invoice_number: "",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    due_date: new Date().toISOString().split("T")[0],
    invoice_type: "EXPENSE",
    debit_account: "",
    items: [
      {
        product_name: "",
        quantity: 1,
        unit_price: 0,
        vat_enabled: true,
        vat_included: false,
      }
    ],
  });

  /* ================= LOAD VENDORS ================= */

  useEffect(() => {
    if (!open) return;

    api.get("/vendors/list/")
      .then(res => setVendors(res.data.rows || []))
      .catch(() => setVendors([]));
  }, [open]);

  /* ================= LOAD ACCOUNTS BY TYPE ================= */

  useEffect(() => {
    if (!open) return;

    let accountType = "Expense";

    if (form.invoice_type === "INVENTORY") accountType = "Asset";
    if (form.invoice_type === "FIXED_ASSET") accountType = "Asset";

    api.get(`/accounts/by-type/?type=${accountType}`)
      .then(res => setAccounts(res.data.accounts || []))
      .catch(() => setAccounts([]));

  }, [open, form.invoice_type]);

  if (!open) return null;

  /* ================= CALCULATE PER ITEM ================= */

  const calculateItem = (item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unit_price || 0);

    let base = qty * price;
    let vat = 0;
    let total = base;

    if (item.vat_enabled) {
      if (item.vat_included) {
        vat = base * (5 / 105);
        base = base - vat;
        total = base + vat;
      } else {
        vat = base * 0.05;
        total = base + vat;
      }
    }

    return { base, vat, total };
  };

  /* ================= SUMMARY ================= */

  const summary = form.items.reduce(
    (acc, item) => {
      const { base, vat, total } = calculateItem(item);
      acc.subtotal += base;
      acc.vat += vat;
      acc.total += total;
      return acc;
    },
    { subtotal: 0, vat: 0, total: 0 }
  );

  /* ================= HANDLERS ================= */

  const updateItem = (index, key, value) => {
    const updated = [...form.items];
    updated[index][key] = value;
    setForm({ ...form, items: updated });
  };

  const addRow = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          product_name: "",
          quantity: 1,
          unit_price: 0,
          vat_enabled: true,
          vat_included: false,
        }
      ],
    });
  };

  const removeRow = (index) => {
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated });
  };

  const save = async () => {
    try {
      setSaving(true);

      await api.post("/expense-invoices/", {
        ...form,
        total_amount: summary.total
      });

      onClose();
      refetchInvoices?.();

    } catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("BACKEND ERROR:", err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Create Expense Invoice"
      width="max-w-7xl"
    >

      {/* HEADER - Your style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
            <i className="fas fa-file-invoice text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1f221f]">New Vendor Invoice</h2>
            <p className="text-xs text-[#8b8f8c]">Invoice will be posted immediately and added to Accounts Payable</p>
          </div>
        </div>
      </div>

      {/* TABS - Enhanced styling */}
      <div className="flex gap-1 mb-6 border-b border-[#e5e7eb] px-2">
        <button
          onClick={() => setActiveTab("manual")}
          className={`relative px-6 py-2.5 text-sm font-medium transition-all ${
            activeTab === "manual"
              ? "text-blue2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue2 after:rounded-full"
              : "text-[#8b8f8c] hover:text-[#4a636e]"
          }`}
        >
          <i className="fas fa-pen mr-2 text-xs"></i>
          Manual Entry
        </button>

        <button
          onClick={() => setActiveTab("import")}
          className={`relative px-6 py-2.5 text-sm font-medium transition-all ${
            activeTab === "import"
              ? "text-blue2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue2 after:rounded-full"
              : "text-[#8b8f8c] hover:text-[#4a636e]"
          }`}
        >
          <i className="fas fa-file-pdf mr-2 text-xs"></i>
          Import PDF
        </button>
      </div>

      {activeTab === "import" && (
        <div className="opacity-50 pointer-events-none">
          <ExpenseInvoicePdfImport />
        </div>
      )}

      {activeTab === "manual" && (
        <>
          {/* BASIC INFO - Grid with your styled fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            <DynamicField
              field={{
                key: "invoice_number",
                label: "Invoice Number",
                type: "text",
                icon: "fas fa-hashtag"
              }}
              value={form.invoice_number}
              onChange={(key, val) => setForm({ ...form, invoice_number: val })}
            />

            <DynamicField
              field={{
                key: "vendor",
                label: "Vendor",
                type: "select",
                options: vendors.map((v) => ({
                  label: v.company,
                  value: v.id,
                })),
                icon: "fas fa-building",
                required: true
              }}
              value={form.vendor}
              onChange={(key, val) => setForm({ ...form, vendor: val })}
            />

            <DynamicField
              field={{
                key: "date",
                label: "Invoice Date",
                type: "date",
                icon: "fas fa-calendar"
              }}
              value={form.date}
              onChange={(key, val) => setForm({ ...form, date: val })}
            />

            <DynamicField
              field={{
                key: "due_date",
                label: "Due Date",
                type: "date",
                icon: "fas fa-calendar-check"
              }}
              value={form.due_date}
              onChange={(key, val) => setForm({ ...form, due_date: val })}
            />

            <DynamicField
              field={{
                key: "invoice_type",
                label: "Invoice Type",
                type: "select",
                options: [
                  { label: "Expense", value: "EXPENSE" },
                  { label: "Inventory", value: "INVENTORY" },
                  { label: "Fixed Asset", value: "FIXED_ASSET" }
                ],
                icon: "fas fa-tag"
              }}
              value={form.invoice_type}
              onChange={(key, val) =>
                setForm({ ...form, invoice_type: val, debit_account: "" })
              }
            />

            <DynamicField
              field={{
                key: "debit_account",
                label: "Debit Account",
                type: "select",
                options: accounts.map(a => ({
                  label: `${a.code} - ${a.name}`,
                  value: a.id
                })),
                icon: "fas fa-book",
                required: true
              }}
              value={form.debit_account}
              onChange={(key, val) => setForm({ ...form, debit_account: val })}
            />
          </div>

          {/* LINE ITEMS - Enhanced with better spacing */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
              <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-list text-[#d9a44a] text-xs"></i>
                Line Items
              </h3>
              <span className="text-xs text-[#8b8f8c] ml-2">({form.items.length} items)</span>
            </div>

            <div className="overflow-x-auto border border-[#e5e7eb] rounded-xl shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-[#f6f6f4] to-white border-b-2 border-[#e5e7eb]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#4a636e] uppercase tracking-wider">Product Description</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-[#4a636e] uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-[#4a636e] uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-[#4a636e] uppercase tracking-wider">VAT</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-[#4a636e] uppercase tracking-wider">VAT Included</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-[#4a636e] uppercase tracking-wider">VAT Amount</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-[#4a636e] uppercase tracking-wider">Line Total</th>
                    <th className="px-6 py-4 text-center w-16"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e5e7eb]">
                  {form.items.map((item, i) => {
                    const { vat, total } = calculateItem(item);

                    return (
                      <tr key={i} className="hover:bg-blue2/5 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            value={item.product_name}
                            onChange={(e) =>
                              updateItem(i, "product_name", e.target.value)
                            }
                            className="w-full min-w-[200px] border border-[#e5e7eb] rounded-lg px-4 py-3 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                            placeholder="Enter product or service description"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(i, "quantity", e.target.value)
                            }
                            className="w-24 text-center border border-[#e5e7eb] rounded-lg px-3 py-3 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                            min="0"
                            step="1"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8f8c] text-sm font-medium">AED</span>
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) =>
                                updateItem(i, "unit_price", e.target.value)
                              }
                              className="w-32 text-right border border-[#e5e7eb] rounded-lg pl-14 pr-4 py-3 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <label className="inline-flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={item.vat_enabled}
                              onChange={(e) =>
                                updateItem(i, "vat_enabled", e.target.checked)
                              }
                              className="w-5 h-5 text-blue2 border-2 border-gray-300 rounded-md focus:ring-blue2 focus:ring-offset-0 transition-all"
                            />
                          </label>
                        </td>

                        <td className="px-6 py-4 text-center">
                          {item.vat_enabled ? (
                            <label className="inline-flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={item.vat_included}
                                onChange={(e) =>
                                  updateItem(i, "vat_included", e.target.checked)
                                }
                                className="w-5 h-5 text-[#d9a44a] border-2 border-gray-300 rounded-md focus:ring-[#d9a44a] focus:ring-offset-0 transition-all"
                              />
                            </label>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="font-medium text-[#d9a44a] bg-amber-50/50 px-3 py-1.5 rounded-lg inline-block">
                            AED {vat.toFixed(2)}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="font-semibold text-[#1f221f] bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                            AED {total.toFixed(2)}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          {form.items.length > 1 && (
                            <button
                              onClick={() => removeRow(i)}
                              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Remove item"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={addRow}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-blue2/10 to-blue2/5 text-blue2 hover:from-blue2/20 hover:to-blue2/10 rounded-lg transition-all border border-blue2/20 font-medium"
              >
                <i className="fas fa-plus-circle"></i>
                Add New Line Item
              </button>
              
              <div className="text-xs text-[#8b8f8c]">
                <i className="fas fa-info-circle mr-1"></i>
                Add all items from the invoice
              </div>
            </div>
          </div>

          {/* TOTALS - Enhanced summary */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-[#f6f6f4] to-white p-6 rounded-xl border border-[#e5e7eb]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-blue2 rounded-full"></div>
                <h4 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider">Invoice Summary</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-1">
                  <span className="text-[#4a636e]">Subtotal</span>
                  <span className="font-medium text-[#1f221f]">AED {summary.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-sm py-1">
                  <span className="text-[#4a636e]">Total VAT</span>
                  <span className="font-medium text-[#d9a44a]">AED {summary.vat.toFixed(2)}</span>
                </div>

                <div className="border-t border-[#e5e7eb] border-dashed my-3 pt-3"></div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#1f221f] text-base">Grand Total</span>
                  <span className="text-2xl font-bold text-blue2">
                    AED {summary.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER - Your style */}
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
                disabled={saving || !form.vendor || !form.debit_account}
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
                    Create Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </ViewEditModal>
  );
};

export default ExpenseInvoiceAddModal;

/* ================= DYNAMIC FIELD - Your style ================= */

const DynamicField = ({ field, value, onChange }) => {
  const getFieldIcon = (key) => {
    const icons = {
      invoice_number: 'fas fa-hashtag',
      vendor: 'fas fa-building',
      date: 'fas fa-calendar',
      due_date: 'fas fa-calendar-check',
      invoice_type: 'fas fa-tag',
      debit_account: 'fas fa-book',
    };
    return icons[field.key] || field.icon || 'fas fa-tag';
  };

  const common = {
    value,
    onChange: (e) => onChange(field.key, e.target.value),
    className: "w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white",
  };

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
        <select {...common}>
          <option value="" className="text-[#8b8f8c]">Select {field.label}</option>
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

      {field.type === "currency" && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8f8c] text-sm font-medium">AED</span>
          <input
            type="number"
            {...common}
            className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all pl-14"
          />
        </div>
      )}

      {field.type === "number" && (
        <input type="number" {...common} />
      )}

      {!["select", "date", "currency", "number"].includes(field.type) && (
        <input type="text" {...common} />
      )}
    </div>
  );
};