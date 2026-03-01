import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InventorySalesInvoiceAddModal = ({ open, onClose, refetch }) => {

  const [schema, setSchema] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({});

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {

      const [schemaRes, custRes, invRes] = await Promise.all([
        api.get("/inventory-sales-invoices/schema/"),
        api.get("/customers/list/"),
        api.get("/inventories/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setCustomers(custRes.data.rows || []);
      setInventoryItems(invRes.data.rows || []);
    };

    fetchData();

    setForm({
      customer: "",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "draft",
      items: [
        {
          inventory_item: "",
          quantity: 1,
          price: 0,
          vat_applicable: true
        }
      ]
    });

    setErrors({});
  }, [open]);

  if (!open || !schema) return null;

  const updateField = (key, value) => {
    setForm({ ...form, [key]: value });
    // Clear field error
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const updateItem = (index, key, value) => {
    const updated = [...form.items];
    updated[index][key] = value;
    setForm({ ...form, items: updated });
    
    // Clear item error
    if (errors[`item_${index}_${key}`]) {
      const newErrors = { ...errors };
      delete newErrors[`item_${index}_${key}`];
      setErrors(newErrors);
    }
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          inventory_item: "",
          quantity: 1,
          price: 0,
          vat_applicable: true
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (form.items.length > 1) {
      setForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  /* ================= TOTAL CALCULATION ================= */

  const subtotal = form.items?.reduce(
    (acc, item) =>
      acc + Number(item.quantity || 0) * Number(item.price || 0),
    0
  ) || 0;

  const vat = form.items?.reduce(
    (acc, item) =>
      item.vat_applicable
        ? acc + (Number(item.quantity) * Number(item.price) * 0.05)
        : acc,
    0
  ) || 0;

  const total = subtotal + vat;

  /* ================= VALIDATION ================= */

  const validate = () => {
    const newErrors = {};

    if (!form.customer) {
      newErrors.customer = "Customer is required";
    }

    if (!form.date) {
      newErrors.date = "Invoice date is required";
    }

    if (!form.due_date) {
      newErrors.due_date = "Due date is required";
    }

    // Validate items
    form.items.forEach((item, index) => {
      if (!item.inventory_item) {
        newErrors[`item_${index}_inventory_item`] = "Select an item";
      }
      
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = "Quantity must be > 0";
      }
      
      if (item.price <= 0) {
        newErrors[`item_${index}_price`] = "Price must be > 0";
      }
    });

    // Check if at least one item has values
    const hasItems = form.items.some(item => 
      item.inventory_item && item.quantity > 0 && item.price > 0
    );
    
    if (!hasItems) {
      newErrors.items = "Add at least one valid item";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await api.post("/inventory-sales-invoices/create/", form);
      onClose();
      refetch?.();
    } catch (err) {
      setErrors({ 
        general: err.response?.data?.error || "Failed to create invoice" 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title={schema.name}
      width="max-w-6xl"
    >
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
            <i className="fas fa-file-invoice text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1f221f]">{schema.name}</h2>
            <p className="text-xs text-[#8b8f8c]">Create a new inventory sales invoice</p>
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

        {/* ================= BASIC FIELDS ================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Customer */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
              <i className="fas fa-user text-blue2/70 text-xs"></i>
              Customer <span className="text-[#d95a4a]">*</span>
            </label>
            <select
              value={form.customer}
              onChange={(e) => updateField("customer", e.target.value)}
              className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                errors.customer ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
              }`}
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.company}
                </option>
              ))}
            </select>
            {errors.customer && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <i className="fas fa-exclamation-circle"></i>
                {errors.customer}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
              <i className="fas fa-calendar text-blue2/70 text-xs"></i>
              Invoice Date <span className="text-[#d95a4a]">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
              className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
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

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
              <i className="fas fa-calendar-check text-blue2/70 text-xs"></i>
              Due Date <span className="text-[#d95a4a]">*</span>
            </label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => updateField("due_date", e.target.value)}
              className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                errors.due_date ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
              }`}
            />
            {errors.due_date && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <i className="fas fa-exclamation-circle"></i>
                {errors.due_date}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
            <i className="fas fa-flag text-blue2/70 text-xs"></i>
            Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="draft"
                checked={form.status === "draft"}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-4 h-4 text-blue2"
              />
              <span className="text-sm text-[#1f221f]">Draft</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="posted"
                checked={form.status === "posted"}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-4 h-4 text-blue2"
              />
              <span className="text-sm text-[#1f221f]">Posted</span>
            </label>
          </div>
        </div>

        {/* ================= ITEMS ================= */}

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
              <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-box text-[#d9a44a] text-xs"></i>
                Invoice Items
              </h3>
              <span className="text-xs bg-blue2/10 text-blue2 px-2 py-1 rounded-full">
                {form.items.length} items
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

          {/* Items Table */}
          <div className="space-y-3">
            {form.items.map((item, index) => (
              <div key={index} className="bg-white border-2 border-[#e5e7eb] rounded-xl p-4 hover:border-blue2/30 transition-all">
                {/* Item Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e5e7eb]">
                  <span className="text-xs font-medium text-[#4a636e]">
                    Item #{index + 1}
                  </span>
                  {form.items.length > 1 && (
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Product */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#4a636e]">
                      Product <span className="text-[#d95a4a]">*</span>
                    </label>
                    <select
                      value={item.inventory_item}
                      onChange={(e) =>
                        updateItem(index, "inventory_item", e.target.value)
                      }
                      className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                        errors[`item_${index}_inventory_item`] 
                          ? "border-red-300 bg-red-50" 
                          : "border-[#e5e7eb]"
                      }`}
                    >
                      <option value="">-- Select Item --</option>
                      {inventoryItems.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.item_name} (Stock: {i.current_stock || 0})
                        </option>
                      ))}
                    </select>
                    {errors[`item_${index}_inventory_item`] && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors[`item_${index}_inventory_item`]}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#4a636e]">
                      Quantity <span className="text-[#d95a4a]">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      min="1"
                      step="1"
                      className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                        errors[`item_${index}_quantity`] 
                          ? "border-red-300 bg-red-50" 
                          : "border-[#e5e7eb]"
                      }`}
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors[`item_${index}_quantity`]}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#4a636e]">
                      Unit Price <span className="text-[#d95a4a]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8f8c] text-xs">AED</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, "price", e.target.value)
                        }
                        min="0.01"
                        step="0.01"
                        className={`w-full border-2 rounded-lg pl-12 pr-3 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                          errors[`item_${index}_price`] 
                            ? "border-red-300 bg-red-50" 
                            : "border-[#e5e7eb]"
                        }`}
                      />
                    </div>
                    {errors[`item_${index}_price`] && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors[`item_${index}_price`]}
                      </p>
                    )}
                  </div>

                  {/* VAT */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#4a636e]">
                      VAT
                    </label>
                    <select
                      value={item.vat_applicable ? "yes" : "no"}
                      onChange={(e) =>
                        updateItem(index, "vat_applicable", e.target.value === "yes")
                      }
                      className="w-full border-2 border-[#e5e7eb] rounded-lg px-3 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
                    >
                      <option value="yes">VAT 5%</option>
                      <option value="no">No VAT</option>
                    </select>
                  </div>
                </div>

                {/* Line Total Display */}
                {item.inventory_item && item.quantity > 0 && item.price > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#e5e7eb] flex justify-end">
                    <div className="bg-gray-50 rounded-lg px-4 py-2">
                      <span className="text-xs text-[#4a636e] mr-3">Line Total:</span>
                      <span className="font-semibold text-[#1f221f]">
                        AED {(item.quantity * item.price).toFixed(2)}
                      </span>
                      {item.vat_applicable && (
                        <span className="text-xs text-[#d9a44a] ml-2">
                          (+5% VAT)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ================= TOTALS ================= */}

        <div className="bg-gradient-to-br from-[#f6f6f4] to-white p-6 rounded-xl border border-[#e5e7eb]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue2 rounded-full"></div>
            <h4 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider">
              Invoice Summary
            </h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#e5e7eb]">
              <span className="text-[#4a636e]">Subtotal</span>
              <span className="font-mono font-medium text-[#1f221f]">
                AED {subtotal.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-[#e5e7eb]">
              <span className="text-[#4a636e]">VAT (5%)</span>
              <span className="font-mono font-medium text-[#d9a44a]">
                AED {vat.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-[#1f221f]">Total</span>
              <span className="text-2xl font-bold text-blue2">
                AED {total.toFixed(2)}
              </span>
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
                Create Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

export default InventorySalesInvoiceAddModal;