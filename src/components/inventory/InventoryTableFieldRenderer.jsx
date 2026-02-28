import React from "react";

const InventoryTableFieldRenderer = ({ field, value, row }) => {
  if (value === null || value === undefined) return <span className="text-[#8b8f8c]">—</span>;

  // Format currency fields
  if (field?.type === "currency" || field?.key?.includes("price") || field?.key?.includes("cost")) {
    return (
      <span className="font-medium tabular-nums text-[#1f221f]">
        {new Intl.NumberFormat('en-AE', {
          style: 'currency',
          currency: 'AED',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value)}
      </span>
    );
  }

  // Format number fields
  if (field?.type === "number") {
    return (
      <span className="tabular-nums text-[#1f221f]">
        {new Intl.NumberFormat('en-AE').format(value)}
      </span>
    );
  }

  // SKU field with badge styling
  if (field?.key === "sku") {
    return (
      <span className="font-mono text-xs bg-[#a9c0c9]/20 px-2 py-1.5 rounded-md text-blue2 border border-blue2/20">
        {value}
      </span>
    );
  }

  // Category field with blue2 badge
  if (field?.key === "category") {
    return (
      <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue2/15 text-blue2 border border-blue2/30">
        <i className="fas fa-folder mr-1 text-[10px]"></i>
        {value}
      </span>
    );
  }

  // Current quantity with low stock indicator
  if (field?.key === "current_quantity" || field?.key === "quantity") {
    const low = Number(row.current_quantity || row.quantity) <= Number(row.minimum_quantity || row.reorder_level);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
        low 
          ? 'bg-[#d95a4a]/10 text-[#d95a4a] border border-[#d95a4a]/30' 
          : 'bg-[#4a9b68]/10 text-[#4a9b68] border border-[#4a9b68]/30'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${low ? 'bg-[#d95a4a]' : 'bg-[#4a9b68]'}`}></span>
        {value}
        {low && <span className="text-[10px] font-medium">(Low Stock)</span>}
      </span>
    );
  }

  // Minimum quantity / Reorder level
  if (field?.key === "minimum_quantity" || field?.key === "reorder_level") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#d9a44a]/10 text-[#d9a44a] border border-[#d9a44a]/30">
        <i className="fas fa-exclamation-triangle text-[10px]"></i>
        {value}
      </span>
    );
  }

  // Location field
  if (field?.key === "location") {
    return (
      <span className="flex items-center gap-1.5 text-[#4a636e]">
        <i className="fas fa-map-marker-alt text-xs text-blue2/70"></i>
        <span className="text-sm">{value}</span>
      </span>
    );
  }

  // Supplier field
  if (field?.key === "supplier") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="w-5 h-5 bg-blue2 rounded-md flex items-center justify-center text-xs font-medium text-white">
          {String(value).charAt(0).toUpperCase()}
        </span>
        <span className="text-sm font-medium text-[#1f221f]">{value}</span>
      </span>
    );
  }

  // Tax applicable boolean
  if (field?.key === "tax_applicable") {
    const isTrue = value === true || value === "true" || value === 1 || value === "1" || value === "yes";
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
        isTrue 
          ? "bg-[#4a9b68]/10 text-[#4a9b68] border border-[#4a9b68]/30" 
          : "bg-[#8b8f8c]/10 text-[#8b8f8c] border border-[#8b8f8c]/30"
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isTrue ? "bg-[#4a9b68]" : "bg-[#8b8f8c]"}`}></span>
        {isTrue ? "Yes" : "No"}
      </span>
    );
  }

  // Tax rate
  if (field?.key === "tax_rate") {
    return (
      <span className="inline-flex items-center gap-1 bg-[#d9a44a]/10 px-2 py-1 rounded-md text-[#d9a44a] text-sm">
        <span className="font-medium tabular-nums">{value}</span>
        <span className="text-xs">%</span>
      </span>
    );
  }

  // Status field
  if (field?.key === "status") {
    const statusStyles = {
      'active': 'bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20',
      'inactive': 'bg-[#8b8f8c]/10 text-[#8b8f8c] border-[#8b8f8c]/20',
      'discontinued': 'bg-[#d95a4a]/10 text-[#d95a4a] border-[#d95a4a]/20',
      'backorder': 'bg-[#d9a44a]/10 text-[#d9a44a] border-[#d9a44a]/20',
    };
    const status = String(value).toLowerCase();
    const statusStyle = statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border ${statusStyle}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'active' ? 'bg-[#4a9b68]' :
          status === 'inactive' ? 'bg-[#8b8f8c]' :
          status === 'discontinued' ? 'bg-[#d95a4a]' :
          status === 'backorder' ? 'bg-[#d9a44a]' :
          'bg-[#8b8f8c]'
        }`}></span>
        {value}
      </span>
    );
  }

  // Date fields
  if (field?.type === "date" || field?.key?.includes("date") || field?.key?.includes("at")) {
    if (!value) return <span className="text-[#8b8f8c]">—</span>;
    return (
      <span className="flex items-center gap-1.5 text-[#4a636e] text-sm">
        <i className="fas fa-calendar-alt text-xs text-blue2/70"></i>
        {new Date(value).toLocaleDateString('en-AE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}
      </span>
    );
  }

  // Boolean fields
  if (field?.type === "boolean") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
        value 
          ? "bg-[#4a9b68]/10 text-[#4a9b68] border border-[#4a9b68]/30" 
          : "bg-[#8b8f8c]/10 text-[#8b8f8c] border border-[#8b8f8c]/30"
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${value ? "bg-[#4a9b68]" : "bg-[#8b8f8c]"}`}></span>
        {value ? "Yes" : "No"}
      </span>
    );
  }

  // Default - truncate long text
  if (typeof value === 'string' && value.length > 30) {
    return (
      <span className="text-sm text-[#1f221f]" title={value}>
        {value.substring(0, 30)}…
      </span>
    );
  }

  // Default fallback
  return (
    <span className="text-sm text-[#1f221f]">
      {value}
    </span>
  );
};

export default InventoryTableFieldRenderer;