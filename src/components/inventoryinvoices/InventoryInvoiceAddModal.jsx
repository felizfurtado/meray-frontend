import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InventoryInvoiceAddModal = ({
  open,
  onClose,
  refetch,
}) => {

  const [vendors, setVendors] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    vendor: "",
    date: "",
    due_date: "",
    status: "draft",
    items: [],
  });

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const vendorRes = await api.get("/vendors/list/");
        const inventoryRes = await api.get("/inventories/list/");
        setVendors(vendorRes.data.rows || []);
        setInventoryItems(inventoryRes.data.rows || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

    setForm({
      vendor: "",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      status: "draft",
      items: [
        {
          inventory_item: "",
          quantity: 1,
          price: 0,
          vat_applicable: true,
        },
      ],
    });

    setErrors({});
  }, [open]);

  if (!open) return null;

  /* ================= ITEM LOGIC ================= */

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          inventory_item: "",
          quantity: 1,
          price: 0,
          vat_applicable: true,
        },
      ],
    }));
  };

  const updateItem = (index, key, value) => {
    const updated = [...form.items];

    if (key === "inventory_item") {
      const selected = inventoryItems.find(
        i => String(i.id) === String(value)
      );

      updated[index].inventory_item = value;

      if (selected) {
        updated[index].price = selected.cost_price || 0;
      }

    } else {
      updated[index][key] = value;
    }

    setForm({ ...form, items: updated });
    
    // Clear item error
    if (errors[`item_${index}_${key}`]) {
      const newErrors = { ...errors };
      delete newErrors[`item_${index}_${key}`];
      setErrors(newErrors);
    }
  };

  const removeItem = (index) => {
    if (form.items.length > 1) {
      setForm({
        ...form,
        items: form.items.filter((_, i) => i !== index),
      });
    }
  };

  /* ================= CALCULATIONS ================= */

  const subtotal = form.items.reduce(
    (acc, item) =>
      acc + Number(item.quantity || 0) * Number(item.price || 0),
    0
  );

  const vat = form.items.reduce((acc, item) => {
    const line =
      Number(item.quantity || 0) *
      Number(item.price || 0);

    return item.vat_applicable
      ? acc + line * 0.05
      : acc;
  }, 0);

  const total = subtotal + vat;

  /* ================= VALIDATION ================= */

  const validate = () => {
    const newErrors = {};

    if (!form.vendor) {
      newErrors.vendor = "Vendor is required";
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

    // Check if at least one valid item
    const hasValidItem = form.items.some(item => 
      item.inventory_item && item.quantity > 0 && item.price > 0
    );
    
    if (!hasValidItem) {
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
      await api.post("/inventory-invoices/create/", form);
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
      title="Create Inventory Purchase Invoice"
      width="max-w-6xl"
    >
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
            <i className="fas fa-truck text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1f221f]">Inventory Purchase Invoice</h2>
            <p className="text-xs text-[#8b8f8c]">Create a new inventory purchase invoice</p>
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

        {/* Vendor */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
            <i className="fas fa-building text-blue2/70 text-xs"></i>
            Vendor <span className="text-[#d95a4a]">*</span>
          </label>
          <select
            value={form.vendor}
            onChange={(e) => {
              setForm({ ...form, vendor: e.target.value });
              if (errors.vendor) {
                const newErrors = { ...errors };
                delete newErrors.vendor;
                setErrors(newErrors);
              }
            }}
            className={`w-full border-2 rounded-lg px-4 py-3 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
              errors.vendor ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
            }`}
          >
            <option value="">-- Select Vendor --</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>
                {v.company || v.contact_name}
              </option>
            ))}
          </select>
          {errors.vendor && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              {errors.vendor}
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
              <i className="fas fa-calendar text-blue2/70 text-xs"></i>
              Invoice Date <span className="text-[#d95a4a]">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value });
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

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
              <i className="fas fa-calendar-check text-blue2/70 text-xs"></i>
              Due Date <span className="text-[#d95a4a]">*</span>
            </label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => {
                setForm({ ...form, due_date: e.target.value });
                if (errors.due_date) {
                  const newErrors = { ...errors };
                  delete newErrors.due_date;
                  setErrors(newErrors);
                }
              }}
              className={`w-full border-2 rounded-lg px-4 py-3 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
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

        {/* Post Immediately Toggle */}
        <div className="bg-gray-50 border border-[#e5e7eb] rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.status === "posted"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.checked ? "posted" : "draft"
                  })
                }
                className="w-5 h-5 text-blue2 border-2 border-gray-300 rounded-md focus:ring-blue2 focus:ring-offset-0 transition-all"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-[#1f221f]">Post invoice immediately</span>
              <p className="text-xs text-[#8b8f8c] mt-0.5">This will update stock and create journal entries</p>
            </div>
          </label>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
              <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-box text-[#d9a44a] text-xs"></i>
                Inventory Items
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

          {/* Items List */}
          <div className="space-y-3">
            {form.items.map((item, index) => {
              const hasItemError = errors[`item_${index}_inventory_item`];
              const hasQtyError = errors[`item_${index}_quantity`];
              const hasPriceError = errors[`item_${index}_price`];
              const hasAnyError = hasItemError || hasQtyError || hasPriceError;
              
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

                  {/* Item Fields - Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Product - 4 cols */}
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-xs font-medium text-[#4a636e]">
                        Product <span className="text-[#d95a4a]">*</span>
                      </label>
                      <select
                        value={item.inventory_item}
                        onChange={(e) =>
                          updateItem(index, "inventory_item", e.target.value)
                        }
                        className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                          hasItemError ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
                        }`}
                      >
                        <option value="">-- Select Item --</option>
                        {inventoryItems.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.item_name} (Cost: AED {i.cost_price || 0})
                          </option>
                        ))}
                      </select>
                      {hasItemError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <i className="fas fa-exclamation-circle"></i>
                          {errors[`item_${index}_inventory_item`]}
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
                          value={item.price}
                          onChange={(e) =>
                            updateItem(index, "price", e.target.value)
                          }
                          min="0.01"
                          step="0.01"
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

                    {/* VAT - 2 cols */}
                    <div className="md:col-span-2 space-y-1.5">
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

                    {/* Line Total - 2 cols */}
                    <div className="md:col-span-2 flex items-center justify-between">
                      <div className="text-right">
                        <span className="text-xs text-[#8b8f8c] block">Line Total</span>
                        <span className="font-semibold text-[#1f221f]">
                          AED {(Number(item.quantity) * Number(item.price)).toFixed(2)}
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

export default InventoryInvoiceAddModal;