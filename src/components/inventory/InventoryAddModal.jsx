import React, { useState, useEffect } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import FieldRenderer from "../expenses/FieldRenderer";
import api from "../../api/api";

const InventoryAddModal = ({
  open,
  onClose,
  schema,
  refetchInventory
}) => {

  const [mode, setMode] = useState("CREATE"); // CREATE or PURCHASE
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({});
      setMode("CREATE");
      setErrors({});

      api.get("/inventories/list/")
        .then(res => setProducts(res.data.rows || []))
        .catch(() => setProducts([]));
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear error for this field
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (mode === "CREATE") {
      for (let fieldKey of schema?.form_fields || []) {
        const field = schema.fields.find(f => f.key === fieldKey);
        if (field?.required && !formData[fieldKey]) {
          newErrors[fieldKey] = `${field.label || fieldKey} is required`;
        }
      }
    }

    if (mode === "PURCHASE") {
      if (!formData.item_code) {
        newErrors.item_code = "Please select a product";
      }

      if (!formData.purchase_quantity || Number(formData.purchase_quantity) <= 0) {
        newErrors.purchase_quantity = "Purchase quantity must be greater than 0";
      }

      if (!formData.purchase_price || Number(formData.purchase_price) <= 0) {
        newErrors.purchase_price = "Purchase price must be greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {

    if (!validate()) return;

    try {
      setLoading(true);

      let payload = {};

      if (mode === "CREATE") {
        payload = { ...formData };
      }

      if (mode === "PURCHASE") {
        payload = {
          item_code: formData.item_code,
          purchase_quantity: Number(formData.purchase_quantity),
          purchase_price: Number(formData.purchase_price || 0)
        };
      }

      await api.post("/inventories/", payload);

      refetchInventory();
      onClose();

    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Inventory Management"
      width="max-w-5xl"
    >

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
            <i className="fas fa-boxes text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1f221f]">Inventory Management</h2>
            <p className="text-xs text-[#8b8f8c]">Create new products or add stock to existing inventory</p>
          </div>
        </div>
      </div>

      {/* MODE TOGGLE - Enhanced */}
      <div className="flex gap-2 p-4">
        <button
          onClick={() => {
            setMode("CREATE");
            setErrors({});
          }}
          className={`relative px-6 py-3 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none ${
            mode === "CREATE"
              ? "bg-blue2 text-white shadow-lg shadow-blue2/30"
              : "bg-[#f6f6f4] text-[#4a636e] hover:bg-[#e5e7eb]"
          }`}
        >
          <i className={`fas fa-plus-circle mr-2 ${mode === "CREATE" ? "text-white" : "text-blue2"}`}></i>
          Create New Product
        </button>

        <button
          onClick={() => {
            setMode("PURCHASE");
            setErrors({});
          }}
          className={`relative px-6 py-3 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none ${
            mode === "PURCHASE"
              ? "bg-blue2 text-white shadow-lg shadow-blue2/30"
              : "bg-[#f6f6f4] text-[#4a636e] hover:bg-[#e5e7eb]"
          }`}
        >
          <i className={`fas fa-truck mr-2 ${mode === "PURCHASE" ? "text-white" : "text-blue2"}`}></i>
          Add Stock / Purchase
        </button>
      </div>

      {/* Mode Indicator */}
      <div className="px-4 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-5 rounded-full ${mode === "CREATE" ? "bg-blue2" : "bg-[#d9a44a]"}`}></div>
          <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider">
            {mode === "CREATE" ? "Product Details" : "Stock Purchase Details"}
          </h3>
        </div>
      </div>

      {/* CREATE MODE (Schema Driven) */}
      {mode === "CREATE" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {schema?.form_fields?.map(key => {
            const field = schema.fields.find(f => f.key === key);
            if (!field) return null;

            return (
              <div key={key} className="space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
                  <i className="fas fa-tag text-blue2/70 text-xs"></i>
                  {field.label || key}
                  {field.required && <span className="text-[#d95a4a]">*</span>}
                </label>

                <FieldRenderer
                  field={field}
                  value={formData[key]}
                  onChange={(k, v) => handleChange(k, v)}
                />
                
                {errors[key] && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors[key]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PURCHASE MODE - Enhanced */}
      {mode === "PURCHASE" && (
        <div className="p-4">
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 space-y-6">
            {/* Product Selection */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
                <i className="fas fa-box text-blue2/70 text-xs"></i>
                Select Product <span className="text-[#d95a4a]">*</span>
              </label>
              <select
                value={formData.item_code || ""}
                onChange={(e) => handleChange("item_code", e.target.value)}
                className={`w-full border-2 rounded-lg px-4 py-3 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                  errors.item_code ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
                }`}
              >
                <option value="">-- Select a product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.item_code}>
                    {p.item_code} - {p.item_name} (Current Stock: {p.current_stock || 0})
                  </option>
                ))}
              </select>
              {errors.item_code && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.item_code}
                </p>
              )}
            </div>

            {/* Selected Product Details (if any) */}
            {formData.item_code && (
              <div className="bg-blue2/5 border border-blue2/20 rounded-lg p-4">
                <h4 className="text-xs font-medium text-[#4a636e] mb-2 flex items-center gap-1">
                  <i className="fas fa-info-circle"></i>
                  Selected Product Details
                </h4>
                {products.filter(p => p.item_code === formData.item_code).map(p => (
                  <div key={p.id} className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-[#8b8f8c]">Current Stock</span>
                      <p className="font-medium text-[#1f221f]">{p.current_stock || 0} units</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#8b8f8c]">Last Purchase Price</span>
                      <p className="font-medium text-[#1f221f]">AED {p.last_purchase_price || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity and Price - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Purchase Quantity */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
                  <i className="fas fa-sort-amount-up text-blue2/70 text-xs"></i>
                  Purchase Quantity <span className="text-[#d95a4a]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.purchase_quantity || ""}
                    onChange={(e) => handleChange("purchase_quantity", e.target.value)}
                    min="1"
                    step="1"
                    placeholder="Enter quantity"
                    className={`w-full border-2 rounded-lg px-4 py-3 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                      errors.purchase_quantity ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
                    }`}
                  />
                </div>
                {errors.purchase_quantity && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.purchase_quantity}
                  </p>
                )}
              </div>

              {/* Purchase Price */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
                  <i className="fas fa-money-bill-wave text-blue2/70 text-xs"></i>
                  Purchase Price (per unit) <span className="text-[#d95a4a]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8f8c] text-sm font-medium">AED</span>
                  <input
                    type="number"
                    value={formData.purchase_price || ""}
                    onChange={(e) => handleChange("purchase_price", e.target.value)}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full border-2 rounded-lg pl-14 pr-4 py-3 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${
                      errors.purchase_price ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
                    }`}
                  />
                </div>
                {errors.purchase_price && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.purchase_price}
                  </p>
                )}
              </div>
            </div>

            {/* Purchase Summary (if values exist) */}
            {formData.purchase_quantity > 0 && formData.purchase_price > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <h4 className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                  <i className="fas fa-calculator"></i>
                  Purchase Summary
                </h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Total Cost:</span>
                  <span className="text-lg font-bold text-green-700">
                    AED {(formData.purchase_quantity * formData.purchase_price).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  ({formData.purchase_quantity} units × AED {formData.purchase_price})
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-5 py-2 bg-blue2 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#4a636e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <i className={`fas ${mode === "CREATE" ? "fa-plus-circle" : "fa-truck"} mr-2`}></i>
                {mode === "CREATE" ? "Create Product" : "Add Stock"}
              </>
            )}
          </button>
        </div>
      </div>

    </ViewEditModal>
  );
};

export default InventoryAddModal;