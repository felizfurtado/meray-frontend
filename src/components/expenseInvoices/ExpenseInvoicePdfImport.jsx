import React, { useState } from "react";
import api from "../../api/api";

const ExpenseInvoicePdfImport = ({ onExtract }) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [extracted, setExtracted] = useState(null);

  /* ================= PDF UPLOAD ================= */

  const handlePdfImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setImporting(true);
      setError(null);
      setExtracted(null);

      const res = await api.post(
        "/expense-invoices/import/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        setExtracted(res.data.data);
      } else {
        setError("Extraction failed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process PDF");
    } finally {
      setImporting(false);
    }
  };

  /* ================= ITEM UPDATE ================= */

  const updateItem = (index, key, value) => {
    const updated = [...extracted.items];
    updated[index][key] = value;

    recalculateTotals(updated);
  };

  /* ================= RECALCULATE ================= */

  const recalculateTotals = (items) => {
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
        Number(item.unit_price || 0),
      0
    );

    const vat = subtotal * 0.05;
    const total = subtotal + vat;

    setExtracted((prev) => ({
      ...prev,
      items,
      subtotal,
      vat,
      total,
    }));
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(val || 0);

  /* ================= UI ================= */

  return (
    <div className="border rounded-2xl p-8 bg-gray-50">

      {/* ========= INITIAL STATE ========= */}
      {!extracted && !importing && (
        <div className="text-center py-10">
          <i className="fas fa-file-pdf text-5xl text-red-500 mb-4"></i>

          <h3 className="text-lg font-semibold mb-2">
            Import Vendor Invoice
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            Upload supplier invoice PDF to auto-extract details
          </p>

          <label className="px-6 py-3 bg-blue2 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition shadow-sm">
            Upload PDF
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handlePdfImport}
            />
          </label>
        </div>
      )}

      {/* ========= LOADING ========= */}
      {importing && (
        <div className="text-center py-16">
          <div className="w-14 h-14 border-4 border-blue2/20 border-t-blue2 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Extracting invoice details...
          </p>
        </div>
      )}

      {/* ========= ERROR ========= */}
      {error && (
        <div className="text-center py-10 text-red-600">
          {error}
        </div>
      )}

      {/* ========= EDITABLE PREVIEW ========= */}
      {extracted && (
        <div className="space-y-8">

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-blue2">
              Editable Invoice Preview
            </h3>

            {/* {extracted.confidence && (
              <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-200">
                Confidence: {extracted.confidence}%
              </span>
            )} */}
          </div>

          {/* BASIC INFO */}
          <div className="grid grid-cols-2 gap-6">

            <Field
              label="Invoice Number"
              value={extracted.invoice_number}
              onChange={(v) =>
                setExtracted({ ...extracted, invoice_number: v })
              }
            />

            <Field
              label="Vendor Name"
              value={extracted.vendor_name}
              onChange={(v) =>
                setExtracted({ ...extracted, vendor_name: v })
              }
            />

            <Field
              label="Invoice Date"
              value={extracted.date}
              type="date"
              onChange={(v) =>
                setExtracted({ ...extracted, date: v })
              }
            />

            <Field
              label="Due Date"
              value={extracted.due_date}
              type="date"
              onChange={(v) =>
                setExtracted({ ...extracted, due_date: v })
              }
            />

          </div>

          {/* ITEMS */}
          <div className="border rounded-xl overflow-hidden">

            <div className="grid grid-cols-4 bg-gray-100 p-3 text-sm font-semibold">
              <div>Description</div>
              <div className="text-right">Qty</div>
              <div className="text-right">Unit Price</div>
              <div className="text-right">Amount</div>
            </div>

            {extracted.items?.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-3 p-3 border-t text-sm"
              >
                <input
                  className="border rounded px-2 py-1"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(i, "description", e.target.value)
                  }
                />

                <input
                  type="number"
                  className="border rounded px-2 py-1 text-right"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(i, "quantity", Number(e.target.value))
                  }
                />

                <input
                  type="number"
                  className="border rounded px-2 py-1 text-right"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(i, "unit_price", Number(e.target.value))
                  }
                />

                <div className="text-right font-medium">
                  {formatCurrency(
                    item.quantity * item.unit_price
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* TOTALS */}
          <div className="flex justify-end">
            <div className="w-full bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(extracted.subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>VAT (5%)</span>
                <span>{formatCurrency(extracted.vat)}</span>
              </div>

              <div className="flex justify-between font-bold mt-2 border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(extracted.total)}</span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between">

            <button
              onClick={() => setExtracted(null)}
              className="px-4 py-2 border rounded-lg"
            >
              Upload Another
            </button>

            <button
              onClick={() => onExtract?.(extracted)}
              className="px-6 py-2 bg-blue2 text-white rounded-lg"
            >
              Use This Invoice
            </button>

          </div>

        </div>
      )}
    </div>
  );
};

export default ExpenseInvoicePdfImport;


/* ========= FIELD COMPONENT ========= */

const Field = ({ label, value, onChange, type = "text" }) => (
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
