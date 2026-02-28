import React from "react";

const AccountFieldRenderer = ({ field, value }) => {
  if (value === null || value === undefined) return <span className="text-[#8b8f8c]">—</span>;

  // Account Type field
  if (field === "type") {
    const typeColors = {
      'Asset': 'bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20',
      'Liability': 'bg-[#d95a4a]/10 text-[#d95a4a] border-[#d95a4a]/20',
      'Equity': 'bg-[#4a636e]/10 text-[#4a636e] border-[#4a636e]/20',
      'Revenue': 'bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20',
      'Expense': 'bg-[#d9a44a]/10 text-[#d9a44a] border-[#d9a44a]/20',
    };
    
    const colorClass = typeColors[value] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border ${colorClass}`}>
        {value}
      </span>
    );
  }

  // VAT Applicable field
  if (field === "vat_applicable") {
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

  // Default fallback
  return (
    <span className="text-sm text-[#1f221f]">
      {value}
    </span>
  );
};

export default AccountFieldRenderer;