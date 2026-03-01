import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InventoryViewModal = ({ open, onClose, itemId, schema }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemId) return;

    setLoading(true);
    api
      .get(`/inventories/${itemId}/`)
      .then((res) => setItem(res.data.inventory))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [open, itemId]);

  if (!open) return null;

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "—";
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      active: "bg-green-50 text-green-600 border-green-200",
      inactive: "bg-gray-50 text-gray-600 border-gray-200",
      discontinued: "bg-red-50 text-red-600 border-red-200",
    };
    return statusMap[status?.toLowerCase()] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const getTransactionTypeColor = (type) => {
    const typeMap = {
      purchase: "bg-blue-50 text-blue-600",
      sale: "bg-green-50 text-green-600",
      adjustment: "bg-amber-50 text-amber-600",
      return: "bg-purple-50 text-purple-600",
    };
    return typeMap[type?.toLowerCase()] || "bg-gray-50 text-gray-600";
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Inventory Details"
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-boxes absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-[#8b8f8c] font-medium">Loading inventory details...</p>
          </div>
        </div>
      ) : !item ? (
        <div className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d95a4a]/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-[#d95a4a] text-3xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-[#1f221f] mb-2">Item not found</h3>
          <p className="text-[#8b8f8c] text-sm mb-4">The inventory item you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue2 rounded-lg hover:bg-[#4a636e] transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header with your style */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                <i className="fas fa-boxes text-white text-xl"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-3 mb-1">
                  <h1 className="text-xl font-semibold text-[#1f221f]">
                    {item.item_name}
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.status?.toLowerCase() === 'active' ? 'bg-green-500' :
                      item.status?.toLowerCase() === 'inactive' ? 'bg-gray-500' :
                      'bg-red-500'
                    }`}></span>
                    {item.status || "—"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#4a636e]">
                  <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md">
                    <i className="fas fa-barcode text-blue2/70 text-xs"></i>
                    <span className="font-mono">{item.item_code}</span>
                  </span>
                  {item.category && (
                    <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md">
                      <i className="fas fa-folder text-blue2/70 text-xs"></i>
                      {item.category}
                    </span>
                  )}
                  {item.unit && (
                    <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md">
                      <i className="fas fa-ruler text-blue2/70 text-xs"></i>
                      {item.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
            <StatCard 
              icon="fas fa-cubes" 
              label="Current Quantity" 
              value={item.current_quantity}
              color="blue"
            />
            <StatCard 
              icon="fas fa-coins" 
              label="Average Cost" 
              value={formatCurrency(item.average_cost || item.cost_price)}
              color="amber"
            />
            <StatCard 
              icon="fas fa-chart-line" 
              label="Inventory Value" 
              value={formatCurrency(item.inventory_value)}
              color="green"
            />
            <StatCard 
              icon="fas fa-tag" 
              label="Selling Price" 
              value={formatCurrency(item.selling_price)}
              color="purple"
            />
          </div>

          {/* Dynamic Fields Section */}
          <div className="px-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-blue2 rounded-full"></div>
              <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-info-circle text-blue2 text-xs"></i>
                Item Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schema?.fields?.map((field) => {
                const value = item[field.key];

                if (
                  value === undefined ||
                  value === null ||
                  typeof value === "object" ||
                  ["item_name", "item_code", "category", "status", "unit", 
                   "current_quantity", "average_cost", "inventory_value", 
                   "selling_price", "transactions"].includes(field.key)
                )
                  return null;

                return (
                  <div
                    key={field.key}
                    className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <i className={`${getFieldIcon(field.key)} text-blue2/70 text-xs`}></i>
                      <div className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">
                        {field.label || field.key}
                      </div>
                    </div>
                    <div className="text-base font-medium text-[#1f221f] pl-6 break-words">
                      {formatValue(field.type, value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stock Transactions Table */}
          {item.transactions?.length > 0 && (
            <div className="px-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
                <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-history text-[#d9a44a] text-xs"></i>
                  Stock Transactions
                </h3>
                <span className="text-xs bg-blue2/10 text-blue2 px-2 py-1 rounded-full ml-2">
                  {item.transactions.length} transactions
                </span>
              </div>

              <div className="border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-[#f6f6f4] to-white border-b border-[#e5e7eb]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a636e] uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a636e] uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[#4a636e] uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[#4a636e] uppercase tracking-wider">Unit Cost</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[#4a636e] uppercase tracking-wider">Total Cost</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a636e] uppercase tracking-wider">Reference</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#e5e7eb]">
                      {item.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-blue2/5 transition-colors">
                          <td className="px-4 py-3 text-[#4a636e]">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-calendar-alt text-blue2/50 text-xs"></i>
                              {formatDate(tx.date)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getTransactionTypeColor(tx.type)}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {tx.quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#4a636e]">
                            {formatCurrency(tx.unit_cost)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-blue2">
                            {formatCurrency(tx.total_cost)}
                          </td>
                          <td className="px-4 py-3 text-[#4a636e]">
                            {tx.reference || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="px-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#4a636e] rounded-full"></div>
              <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-database text-[#4a636e] text-xs"></i>
                System Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {item.created_at && (
                <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-calendar-plus text-blue2/70 text-xs"></i>
                    <span className="text-xs font-medium text-[#8b8f8c] uppercase">Created</span>
                  </div>
                  <div className="text-sm font-medium text-[#1f221f] pl-6">
                    {formatDate(item.created_at)}
                  </div>
                </div>
              )}
              
              {item.updated_at && (
                <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-calendar-check text-blue2/70 text-xs"></i>
                    <span className="text-xs font-medium text-[#8b8f8c] uppercase">Updated</span>
                  </div>
                  <div className="text-sm font-medium text-[#1f221f] pl-6">
                    {formatDate(item.updated_at)}
                  </div>
                </div>
              )}
              
              {item.created_by && (
                <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-user-plus text-blue2/70 text-xs"></i>
                    <span className="text-xs font-medium text-[#8b8f8c] uppercase">Created By</span>
                  </div>
                  <div className="text-sm font-medium text-[#1f221f] pl-6 break-words">
                    {typeof item.created_by === 'object' ? item.created_by.username : item.created_by}
                  </div>
                </div>
              )}
              
              {item.id && (
                <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-fingerprint text-blue2/70 text-xs"></i>
                    <span className="text-xs font-medium text-[#8b8f8c] uppercase">Item ID</span>
                  </div>
                  <div className="text-sm font-medium text-[#1f221f] pl-6 font-mono break-all">
                    {item.id}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#8b8f8c]">
              <span className="flex items-center gap-1.5">
                <i className="fas fa-fingerprint text-[10px]"></i>
                Item ID: {item.id}
              </span>
              {item.updated_at && (
                <>
                  <span className="text-gray-300 hidden sm:inline">|</span>
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-clock text-[10px]"></i>
                    Updated {formatDate(item.updated_at)}
                  </span>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-white border border-[#e5e7eb] rounded-lg text-sm font-medium text-[#4a636e] hover:bg-[#f6f6f4] hover:border-gray-400 transition-all"
            >
              <i className="fas fa-times mr-2"></i>
              Close
            </button>
          </div>
        </div>
      )}
    </ViewEditModal>
  );
};

export default InventoryViewModal;

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue2/10 text-blue2",
    amber: "bg-[#d9a44a]/10 text-[#d9a44a]",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <i className={`${icon} text-sm`}></i>
        </div>
        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-xl font-bold text-[#1f221f] pl-11">
        {value}
      </div>
    </div>
  );
};

const getFieldIcon = (key) => {
  const icons = {
    description: 'fas fa-align-left',
    brand: 'fas fa-trademark',
    supplier: 'fas fa-truck',
    location: 'fas fa-map-marker-alt',
    reorder_level: 'fas fa-exclamation-triangle',
    maximum_level: 'fas fa-arrow-up',
    minimum_level: 'fas fa-arrow-down',
    weight: 'fas fa-weight-hanging',
    dimensions: 'fas fa-cube',
    notes: 'fas fa-sticky-note',
  };
  return icons[key] || 'fas fa-circle';
};

function formatValue(type, value) {
  if (!value && value !== 0) return "—";

  switch (type) {
    case "number":
      return new Intl.NumberFormat("en-AE").format(value);
    case "boolean":
      return value ? "Yes" : "No";
    case "currency":
      return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
      }).format(value);
    case "date":
      return new Date(value).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    default:
      return value;
  }
}