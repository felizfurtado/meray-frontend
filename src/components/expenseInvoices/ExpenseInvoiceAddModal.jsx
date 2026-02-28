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
      width="max-w-6xl"
    >

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
        <h2 className="text-xl font-bold text-[#1f221f]">
          New Vendor Invoice
        </h2>
        <p className="text-sm text-[#8b8f8c]">
          Invoice will be posted immediately and added to Accounts Payable
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-8 mb-6 border-b">
        <button
          onClick={() => setActiveTab("manual")}
          className={`pb-2 text-sm font-medium ${
            activeTab === "manual"
              ? "border-b-2 border-blue2 text-blue2"
              : "text-gray-500"
          }`}
        >
          Manual Entry
        </button>

        <button
          onClick={() => setActiveTab("import")}
          className={`pb-2 text-sm font-medium ${
            activeTab === "import"
              ? "border-b-2 border-blue2 text-blue2"
              : "text-gray-500"
          }`}
        >
          Import PDF
        </button>
      </div>

      {activeTab === "import" && <ExpenseInvoicePdfImport />}

      {activeTab === "manual" && (
        <>
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            <Input
              label="Invoice Number"
              value={form.invoice_number}
              onChange={(v) => setForm({ ...form, invoice_number: v })}
            />

            <Select
              label="Vendor"
              value={form.vendor}
              options={vendors.map((v) => ({
                label: v.company,
                value: v.id,
              }))}
              onChange={(v) => setForm({ ...form, vendor: v })}
            />

            <Input
              label="Invoice Date"
              type="date"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })}
            />

            <Input
              label="Due Date"
              type="date"
              value={form.due_date}
              onChange={(v) => setForm({ ...form, due_date: v })}
            />

            <Select
              label="Invoice Type"
              value={form.invoice_type}
              options={[
                { label: "Expense", value: "EXPENSE" },
                { label: "Inventory", value: "INVENTORY" },
                { label: "Fixed Asset", value: "FIXED_ASSET" }
              ]}
              onChange={(v) =>
                setForm({ ...form, invoice_type: v, debit_account: "" })
              }
            />

            <Select
              label="Debit Account"
              value={form.debit_account}
              options={accounts.map(a => ({
                label: `${a.code} - ${a.name}`,
                value: a.id
              }))}
              onChange={(v) =>
                setForm({ ...form, debit_account: v })
              }
            />

          </div>

          {/* LINE ITEMS */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-4 text-[#1f221f]">
              Line Items
            </h3>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-[#f6f6f4] uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-center">VAT</th>
                    <th className="px-4 py-3 text-center">Included</th>
                    <th className="px-4 py-3 text-right">VAT Amt</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {form.items.map((item, i) => {
                    const { vat, total } = calculateItem(item);

                    return (
                      <tr key={i} className="border-t">

                        <td className="px-4 py-3">
                          <input
                            value={item.product_name}
                            onChange={(e) =>
                              updateItem(i, "product_name", e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </td>

                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(i, "quantity", e.target.value)
                            }
                            className="w-20 text-center border rounded-lg"
                          />
                        </td>

                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) =>
                              updateItem(i, "unit_price", e.target.value)
                            }
                            className="w-full text-right border rounded-lg"
                          />
                        </td>

                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.vat_enabled}
                            onChange={(e) =>
                              updateItem(i, "vat_enabled", e.target.checked)
                            }
                          />
                        </td>

                        <td className="px-4 py-3 text-center">
                          {item.vat_enabled && (
                            <input
                              type="checkbox"
                              checked={item.vat_included}
                              onChange={(e) =>
                                updateItem(i, "vat_included", e.target.checked)
                              }
                            />
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-blue2">
                          AED {vat.toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold">
                          AED {total.toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {form.items.length > 1 && (
                            <button
                              onClick={() => removeRow(i)}
                              className="text-red-500"
                            >
                              ✕
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <button
                onClick={addRow}
                className="px-4 py-2 text-sm bg-blue2/10 text-blue2 rounded-lg"
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* TOTALS */}
          <div className="bg-[#f6f6f4] p-6 rounded-xl border mb-8">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>AED {summary.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Total VAT</span>
              <span>AED {summary.vat.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold mt-3 text-lg">
              <span>Grand Total</span>
              <span className="text-blue2">
                AED {summary.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={save}
              disabled={saving || !form.vendor || !form.debit_account}
              className="px-5 py-2 bg-blue2 text-white rounded-lg"
            >
              {saving ? "Saving..." : "Create Invoice"}
            </button>
          </div>
        </>
      )}
    </ViewEditModal>
  );
};

export default ExpenseInvoiceAddModal;

/* ================= UI HELPERS ================= */

const Input = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="text-xs text-gray-500 block mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 text-sm"
    />
  </div>
);

const Select = ({ label, value, options, onChange }) => (
  <div>
    <label className="text-xs text-gray-500 block mb-1">
      {label}
    </label>
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
  <label className="flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    {label}
  </label>
);

const Display = ({ label, value }) => (
  <div>
    <label className="text-xs text-gray-500 block mb-1">
      {label}
    </label>
    <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm">
      AED {Number(value || 0).toFixed(2)}
    </div>
  </div>
);