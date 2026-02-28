import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InvoiceAdjustmentModal = ({
  open,
  onClose,
  refetchAdjustments,
}) => {

  const [invoices, setInvoices] = useState([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [documentType, setDocumentType] = useState("CREDIT_NOTE");
  const [items, setItems] = useState([
    { description: "", quantity: 1, price: 0 },
  ]);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    api.get("/invoices/list/")
      .then(res => {
        const normalInvoices = (res.data.rows || []).filter(
          inv => inv.document_type === "INVOICE" || !inv.document_type
        );
        setInvoices(normalInvoices);
      });

  }, [open]);

  useEffect(() => {
    if (!invoiceId) {
      setSelectedInvoice(null);
      return;
    }

    api.get(`/invoices/${invoiceId}/`)
      .then(res => setSelectedInvoice(res.data.invoice));

  }, [invoiceId]);

  if (!open) return null;

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const updateItem = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce(
    (acc, item) =>
      acc + Number(item.quantity) * Number(item.price),
    0
  );

  const vat = subtotal * 0.05;
  const total = subtotal + vat;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(val || 0);

  const handleSave = async () => {

    if (!invoiceId) {
      alert("Please select an invoice");
      return;
    }

    if (!items.length) {
      alert("Add at least one item");
      return;
    }

    try {
      setSaving(true);

      await api.post("/invoices/adjustment/", {
        invoice_id: invoiceId,
        document_type: documentType,
        date,
        items,
      });

      onClose();
      refetchAdjustments?.();

    } catch (err) {
      console.error(err);
      alert("Failed to create adjustment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Create Credit / Debit Note"
      width="max-w-6xl"
    >
      <div className="p-6 space-y-8">

        {/* Invoice Selector */}
        <div>
          <label className="text-xs font-medium text-[#4a636e] uppercase">
            Select Invoice *
          </label>
          <select
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            className="w-full mt-2 rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue2/30"
          >
            <option value="">Select Invoice</option>
            {invoices.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.number} — {inv.customer_name || "Customer"}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Invoice Info */}
        {selectedInvoice && (
          <div className="bg-blue2/5 border border-blue2/20 rounded-xl p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-[#4a636e]">
                  Customer
                </p>
                <p className="font-semibold">
                  {selectedInvoice.customer_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#4a636e]">
                  Invoice Total
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(selectedInvoice.total)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setDocumentType("CREDIT_NOTE")}
            className={`flex-1 py-2 rounded-lg font-medium border ${
              documentType === "CREDIT_NOTE"
                ? "bg-red-50 text-red-600 border-red-200"
                : "border-gray-200"
            }`}
          >
            Credit Note
          </button>

          <button
            onClick={() => setDocumentType("DEBIT_NOTE")}
            className={`flex-1 py-2 rounded-lg font-medium border ${
              documentType === "DEBIT_NOTE"
                ? "bg-green-50 text-green-600 border-green-200"
                : "border-gray-200"
            }`}
          >
            Debit Note
          </button>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-medium text-[#4a636e] uppercase">
            Adjustment Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-2 rounded-lg border border-gray-200 px-4 py-2"
          />
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold">
              Adjustment Items
            </h3>
            <button
              onClick={addItem}
              className="text-blue2 text-xs font-medium"
            >
              + Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 mb-3"
            >
              <input
                className="col-span-5 border rounded-lg px-3 py-2"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
              />
              <input
                type="number"
                className="col-span-2 border rounded-lg px-3 py-2"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", e.target.value)
                }
              />
              <input
                type="number"
                className="col-span-2 border rounded-lg px-3 py-2"
                value={item.price}
                onChange={(e) =>
                  updateItem(index, "price", e.target.value)
                }
              />
              <div className="col-span-2 text-right font-medium flex items-center justify-end">
                {formatCurrency(item.quantity * item.price)}
              </div>
              <button
                onClick={() => removeItem(index)}
                className="col-span-1 text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full bg-gray-50 rounded-xl border p-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT (5%)</span>
              <span>{formatCurrency(vat)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t mt-2">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue2 text-white rounded-lg"
          >
            {saving ? "Creating..." : "Create Adjustment"}
          </button>
        </div>

      </div>
    </ViewEditModal>
  );
};

export default InvoiceAdjustmentModal;
