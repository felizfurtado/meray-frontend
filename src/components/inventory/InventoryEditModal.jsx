import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";
import FieldRenderer from "../expenses/FieldRenderer";

const InventoryEditModal = ({
  open,
  onClose,
  itemId,
  schema,
  refetchInventory,
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!open || !itemId) return;

    api.get(`/inventories/${itemId}/`).then((res) => {
      setFormData(res.data.inventory);
    });
  }, [open, itemId]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };

      // 🔥 Hide tax_rate if tax not applicable
      if (key === "tax_applicable" && !value) {
        delete updated.tax_rate;
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/inventories/${itemId}/update/`, formData);
      refetchInventory();
      onClose();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'AED 0.00';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getStockStatusColor = (quantity, reorderLevel) => {
    if (quantity <= 0) return 'bg-[#d95a4a]/10 text-[#d95a4a] border-[#d95a4a]/20';
    if (reorderLevel && quantity <= reorderLevel) return 'bg-[#d9a44a]/10 text-[#d9a44a] border-[#d9a44a]/20';
    return 'bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20';
  };

  const itemName = formData?.name || formData?.sku || `Item ${String(itemId).slice(-6)}`;

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Edit Inventory Item"
      width="max-w-6xl"
    >
      {/* Header - Matching theme */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                <i className="fas fa-boxes text-2xl"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-[#4a636e] rounded-full border-2 border-white flex items-center justify-center">
                <i className="fas fa-pencil-alt text-xs text-white"></i>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
                {formData.name || formData.sku || "Unnamed Item"}
              </h1>
              <div className="flex flex-wrap gap-2">
                {formData.sku && (
                  <span className="inline-flex items-center gap-1.5 text-[#4a636e] bg-white/60 px-3 py-1 rounded-full border border-gray-200">
                    <i className="fas fa-barcode text-blue2 text-xs"></i>
                    SKU: {formData.sku}
                  </span>
                )}
                {formData.category && (
                  <span className="inline-flex items-center gap-1.5 text-blue2 bg-blue2/10 px-3 py-1 rounded-full border border-blue2/30">
                    <i className="fas fa-folder text-blue2 text-xs"></i>
                    {formData.category}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-blue2 bg-blue2/10 px-3 py-1 rounded-full border border-blue2/30">
                  <i className="fas fa-edit text-blue2 text-xs"></i>
                  Editing Mode
                </span>
              </div>
            </div>
          </div>
          
          {/* Stock Status Badge */}
          {formData.quantity !== undefined && (
            <div className="flex flex-col items-end">
              <span className="text-sm text-[#8b8f8c]">Current Stock</span>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStockStatusColor(formData.quantity, formData.reorder_level)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    formData.quantity <= 0 ? 'bg-[#d95a4a]' :
                    formData.reorder_level && formData.quantity <= formData.reorder_level ? 'bg-[#d9a44a]' :
                    'bg-[#4a9b68]'
                  }`}></span>
                  {formData.quantity} units
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[#e5e7eb]">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'details'
                ? 'border-blue2 text-blue2'
                : 'border-transparent text-[#8b8f8c] hover:text-[#4a636e] hover:border-gray-300'
            }`}
          >
            <i className="fas fa-info-circle mr-2"></i>
            Item Details
          </button>
        </nav>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 px-6 pb-6">
        <div>
          <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
            <i className="fas fa-pencil-alt text-blue2"></i>
            Edit Item Information
            <span className="ml-2 px-2 py-0.5 bg-blue2/10 text-blue2 text-xs rounded-full border border-blue2/30">
              Editable Fields
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schema?.form_fields?.map((key) => {
              // 🔥 Hide tax_rate if tax not applicable
              if (key === "tax_rate" && !formData.tax_applicable) {
                return null;
              }

              const field = schema.fields.find((f) => f.key === key);
              if (!field) return null;

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e] uppercase tracking-wide">
                      <i className={`${getFieldIcon(field.key)} text-blue2/70 text-xs`}></i>
                      {field.label || prettify(field.key)}
                      {field.required && <span className="text-[#d95a4a]">*</span>}
                    </label>
                  </div>
                  <div className="bg-white rounded-lg border border-[#e5e7eb] hover:border-blue2/30 focus-within:border-blue2 focus-within:ring-2 focus-within:ring-blue2/20 transition-all">
                    <FieldRenderer
                      field={field}
                      value={formData[key]}
                      onChange={handleChange}
                      className="w-full border-0 focus:ring-0 px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 bg-transparent"
                    />
                  </div>
                  {field.description && (
                    <p className="text-xs text-[#8b8f8c] mt-1 flex items-center gap-1">
                      <i className="fas fa-info-circle text-[10px]"></i>
                      {field.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tax Info Banner - Only show if tax_applicable field exists */}
        {schema?.form_fields?.includes('tax_applicable') && (
          <div className="mt-4 p-4 bg-[#f6f6f4] rounded-lg border border-[#e5e7eb] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#d9a44a]/10 flex items-center justify-center">
              <i className="fas fa-percent text-[#d9a44a] text-sm"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1f221f]">Tax Status</p>
              <p className="text-xs text-[#4a636e]">
                {formData.tax_applicable 
                  ? "Tax is applicable. Tax rate can be edited below." 
                  : "Toggle tax applicable to add or edit tax rate."}
              </p>
            </div>
            {formData.tax_applicable && formData.tax_rate && (
              <div className="px-3 py-1.5 bg-[#d9a44a]/10 rounded-lg border border-[#d9a44a]/20">
                <span className="text-sm font-semibold text-[#d9a44a]">{formData.tax_rate}%</span>
              </div>
            )}
          </div>
        )}

        {/* System Information */}
        <div className="pt-4 border-t border-[#e5e7eb]">
          <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
            <i className="fas fa-database text-blue2"></i>
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.created_at && (
              <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fas fa-calendar-plus text-blue2/70 text-xs"></i>
                  <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Created Date</span>
                </div>
                <div className="text-base font-medium text-[#1f221f] pl-6">
                  {new Date(formData.created_at).toLocaleString()}
                </div>
              </div>
            )}
            {formData.updated_at && (
              <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fas fa-calendar-check text-blue2/70 text-xs"></i>
                  <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Last Updated</span>
                </div>
                <div className="text-base font-medium text-[#1f221f] pl-6">
                  {new Date(formData.updated_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8b8f8c]">
          <i className="fas fa-boxes text-blue2/70"></i>
          <span>Item ID: {itemId}</span>
          {formData.updated_at && (
            <>
              <span className="text-gray-300">|</span>
              <span>Last modified: {new Date(formData.updated_at).toLocaleDateString()}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
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
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

export default InventoryEditModal;

/* Helper Functions */
const getFieldIcon = (key) => {
  const icons = {
    // Inventory specific fields
    sku: 'fas fa-barcode',
    name: 'fas fa-tag',
    description: 'fas fa-align-left',
    category: 'fas fa-folder',
    unit_price: 'fas fa-money-bill-wave',
    cost_price: 'fas fa-coins',
    quantity: 'fas fa-hashtag',
    reorder_level: 'fas fa-exclamation-triangle',
    location: 'fas fa-map-marker-alt',
    supplier: 'fas fa-truck',
    tax_applicable: 'fas fa-percent',
    tax_rate: 'fas fa-percentage',
    // Common fields
    notes: 'fas fa-sticky-note',
    status: 'fas fa-flag',
    created_at: 'fas fa-calendar-plus',
    updated_at: 'fas fa-calendar-check',
  };
  return icons[key] || 'fas fa-box';
};

const prettify = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};