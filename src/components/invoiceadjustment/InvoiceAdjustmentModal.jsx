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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    api.get("/invoices/list/")
      .then(res => {
        const normalInvoices = (res.data.rows || []).filter(
          inv => inv.document_type === "INVOICE" || !inv.document_type
        );
        setInvoices(normalInvoices);
      });

    // Reset form when opened
    setInvoiceId("");
    setSelectedInvoice(null);
    setDocumentType("CREDIT_NOTE");
    setItems([{ description: "", quantity: 1, price: 0 }]);
    setDate(new Date().toISOString().split("T")[0]);
    setErrors({});

  }, [open]);

  useEffect(() => {
    if (!invoiceId) {
      setSelectedInvoice(null);
      return;
    }

    api.get(`/invoices/${invoiceId}/`)
      .then(res => setSelectedInvoice(res.data.invoice))
      .catch(() => setSelectedInvoice(null));

  }, [invoiceId]);

  if (!open) return null;

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
    // Clear items error if exists
    if (errors.items) {
      const newErrors = { ...errors };
      delete newErrors.items;
      setErrors(newErrors);
    }
  };

  const updateItem = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
    
    // Clear error for this item
    if (errors[`item_${index}_${key}`]) {
      const newErrors = { ...errors };
      delete newErrors[`item_${index}_${key}`];
      setErrors(newErrors);
    }
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
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

  const validate = () => {
    const newErrors = {};

    if (!invoiceId) {
      newErrors.invoice = "Please select an invoice";
    }

    if (!date) {
      newErrors.date = "Adjustment date is required";
    }

    // Validate items
    items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = "Description required";
      }
      
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = "Quantity must be > 0";
      }
      
      if (item.price <= 0) {
        newErrors[`item_${index}_price`] = "Price must be > 0";
      }
    });

    // Check if at least one valid item
    const hasValidItem = items.some(item => 
      item.description.trim() && item.quantity > 0 && item.price > 0
    );
    
    if (!hasValidItem) {
      newErrors.items = "Add at least one valid item";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

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
      setErrors({
        general: err.response?.data?.error || "Failed to create adjustment"
      });
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
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
            <i className="fas fa-exchange-alt text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1f221f]">Credit / Debit Note</h2>
            <p className="text-xs text-[#8b8f8c]">Create adjustment notes for existing invoices</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-2 space-y-6">

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            {errors.general}
          </div>
        )}

        {/* Items Error */}
        {errors.items && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-600 text-sm flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            {errors.items}
          </div>
        )}

        {/* Invoice Selector */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
            <i className="fas fa-file-invoice text-blue2/70 text-xs"></i>
            Select Invoice <span className="text-[#d95a4a]">*</span>
          </label>
          <select
            value={invoiceId}
            onChange={(e) => {
              setInvoiceId(e.target.value);
              if (errors.invoice) {
                const newErrors = { ...errors };
                delete newErrors.invoice;
                setErrors(newErrors);
              }
            }}
            className={`w-full border-2 rounded-lg px-4 py-3 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
              errors.invoice ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
            }`}
          >
            <option value="">-- Select Invoice --</option>
            {invoices.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.number} — {inv.customer_name || "Customer"} ({formatCurrency(inv.total)})
              </option>
            ))}
          </select>
          {errors.invoice && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              {errors.invoice}
            </p>
          )}
        </div>

        {/* Selected Invoice Info */}
        {selectedInvoice && (
          <div className="bg-gradient-to-br from-blue2/5 to-blue2/10 border border-blue2/20 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-[#4a636e] mb-1">Customer</p>
                <p className="font-semibold text-[#1f221f]">
                  {selectedInvoice.customer_name}
                </p>
                <p className="text-xs text-[#8b8f8c] mt-1">
                  Invoice #{selectedInvoice.number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#4a636e] mb-1">Original Total</p>
                <p className="text-xl font-bold text-blue2">
                  {formatCurrency(selectedInvoice.total)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Type Toggle */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e] mb-2">
            <i className="fas fa-tag text-blue2/70 text-xs"></i>
            Document Type
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setDocumentType("CREDIT_NOTE")}
              className={`flex-1 py-3 rounded-lg font-medium border-2 transition-all ${
                documentType === "CREDIT_NOTE"
                  ? "bg-red-50 text-red-600 border-red-300 shadow-sm"
                  : "border-[#e5e7eb] text-[#4a636e] hover:bg-gray-50"
              }`}
            >
              <i className="fas fa-minus-circle mr-2"></i>
              Credit Note
            </button>

            <button
              onClick={() => setDocumentType("DEBIT_NOTE")}
              className={`flex-1 py-3 rounded-lg font-medium border-2 transition-all ${
                documentType === "DEBIT_NOTE"
                  ? "bg-green-50 text-green-600 border-green-300 shadow-sm"
                  : "border-[#e5e7eb] text-[#4a636e] hover:bg-gray-50"
              }`}
            >
              <i className="fas fa-plus-circle mr-2"></i>
              Debit Note
            </button>
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
            <i className="fas fa-calendar text-blue2/70 text-xs"></i>
            Adjustment Date <span className="text-[#d95a4a]">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) {
                const newErrors = { ...errors };
                delete newErrors.date;
                setErrors(newErrors);
              }
            }}
            className={`w-full border-2 rounded-lg px-4 py-3 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
              errors.date ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
            }`}
          />
          {errors.date && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              {errors.date}
            </p>
          )}
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
              <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-list text-[#d9a44a] text-xs"></i>
                Adjustment Items
              </h3>
              <span className="text-xs bg-blue2/10 text-blue2 px-2 py-1 rounded-full">
                {items.length} items
              </span>
            </div>
            
            <button
              onClick={addItem}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue2/10 to-blue2/5 text-blue2 hover:from-blue2/20 hover:to-blue2/10 rounded-lg transition-all border border-blue2/20 font-medium"
            >
              <i className="fas fa-plus-circle"></i>
              Add Item
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {items.map((item, index) => {
              const hasDescError = errors[`item_${index}_description`];
              const hasQtyError = errors[`item_${index}_quantity`];
              const hasPriceError = errors[`item_${index}_price`];
              const hasAnyError = hasDescError || hasQtyError || hasPriceError;
              
              return (
                <div 
                  key={index} 
                  className={`bg-white border-2 rounded-xl p-4 transition-all ${
                    hasAnyError 
                      ? "border-red-200 bg-red-50/30" 
                      : "border-[#e5e7eb] hover:border-blue2/30 hover:shadow-md"
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e5e7eb]">
                    <span className="text-xs font-medium text-[#4a636e]">
                      Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-all"
                      >
                        <i className="fas fa-trash-alt mr-1"></i>
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Item Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Description - 5 cols */}
                    <div className="md:col-span-5 space-y-1.5">
                      <label className="text-xs font-medium text-[#4a636e]">
                        Description <span className="text-[#d95a4a]">*</span>
                      </label>
                      <input
                        className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                          hasDescError ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
                        }`}
                        placeholder="Enter item description"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                      />
                      {hasDescError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <i className="fas fa-exclamation-circle"></i>
                          {errors[`item_${index}_description`]}
                        </p>
                      )}
                    </div>

                    {/* Quantity - 2 cols */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-[#4a636e]">
                        Qty <span className="text-[#d95a4a]">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                          hasQtyError ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
                        }`}
                      />
                      {hasQtyError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <i className="fas fa-exclamation-circle"></i>
                          {errors[`item_${index}_quantity`]}
                        </p>
                      )}
                    </div>

                    {/* Price - 2 cols */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-[#4a636e]">
                        Price <span className="text-[#d95a4a]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8f8c] text-xs">AED</span>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(index, "price", e.target.value)
                          }
                          className={`w-full border-2 rounded-lg pl-12 pr-3 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                            hasPriceError ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
                          }`}
                        />
                      </div>
                      {hasPriceError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <i className="fas fa-exclamation-circle"></i>
                          {errors[`item_${index}_price`]}
                        </p>
                      )}
                    </div>

                    {/* Line Total - 3 cols */}
                    <div className="md:col-span-3 flex items-center justify-between">
                      <div className="text-right w-full">
                        <span className="text-xs text-[#8b8f8c] block mb-1">Line Total</span>
                        <span className="text-lg font-semibold text-[#1f221f]">
                          {formatCurrency(item.quantity * item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full  bg-gradient-to-br from-[#f6f6f4] to-white p-6 rounded-xl border border-[#e5e7eb]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-blue2 rounded-full"></div>
              <h4 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider">
                {documentType === "CREDIT_NOTE" ? "Credit" : "Debit"} Summary
              </h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#e5e7eb]">
                <span className="text-[#4a636e]">Subtotal</span>
                <span className="font-mono font-medium text-[#1f221f]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-[#e5e7eb]">
                <span className="text-[#4a636e]">VAT (5%)</span>
                <span className="font-mono font-medium text-[#d9a44a]">
                  {formatCurrency(vat)}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-[#1f221f]">Total</span>
                <span className="text-2xl font-bold text-blue2">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
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
            onClick={handleSave}
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
                Create {documentType === "CREDIT_NOTE" ? "Credit" : "Debit"} Note
              </>
            )}
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

export default InvoiceAdjustmentModal;