import React from "react";

const ExpenseTableFieldRenderer = ({ field, value, row }) => {
  if (value === null || value === undefined || value === "")
    return <span className="text-gray-300">—</span>;

  // Category field with consistent blue2 color for all categories
  if (field.key === "category" || field.key === "expense_category") {
    // All categories now use the same blue2 color scheme
    const categoryStyle = "bg-blue2/15 text-blue2 border border-blue2/30 font-medium";
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs ${categoryStyle}`}>
        {value}
      </span>
    );
  }

  // Amount fields with currency styling using theme colors
  if (["amount", "vat_amount", "total", "subtotal", "tax_amount", "grand_total"].includes(field.key)) {
    const isNegative = Number(value) < 0;
    const isZero = Number(value) === 0;
    
    let colorClass = "text-[#4a9b68] font-medium"; // success color
    if (isNegative) colorClass = "text-[#d95a4a] font-medium"; // danger color
    if (isZero) colorClass = "text-[#000000]"; // muted color
    
    return (
      <span className={`${colorClass} tabular-nums`}>
        {new Intl.NumberFormat('en-AE', {
          style: 'currency',
          currency: 'AED',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value)}
      </span>
    );
  }

  // Date field with modern format using theme
  if (field.key === "date" || field.key.includes("date") || field.type === "date") {
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateDisplay;
    if (date.toDateString() === today.toDateString()) {
      dateDisplay = (
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-blue2 rounded-full"></span>
          <span className="text-[#1f221f] text-sm">Today</span>
        </span>
      );
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateDisplay = (
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-[#d9a44a] rounded-full"></span>
          <span className="text-[#1f221f] text-sm">Yesterday</span>
        </span>
      );
    } else {
      dateDisplay = (
        <span className="flex items-center gap-1.5 text-[#000000] text-sm">
          <i className="fas fa-calendar-alt text-xs text-blue2/70"></i>
          {date.toLocaleDateString('en-AE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      );
    }
    
    return dateDisplay;
  }

  // Expense number / Reference fields - using blue2 theme
  if (field.key === "expense_number" || field.key === "reference" || field.key === "invoice_number") {
    return (
      <span className="font-mono text-xs bg-blue2/10 px-2.5 py-1.5 rounded-md text-blue2 border border-blue2/20">
        #{value}
      </span>
    );
  }

  // Vendor/Supplier fields with blue2 avatar
  if (field.key === "vendor_name" || field.key === "supplier" || field.key === "merchant") {
    return (
      <span className="flex items-center gap-2.5">
        <span className="w-7 h-7 bg-blue2 rounded-md flex items-center justify-center text-xs font-semibold text-white shadow-sm">
          {String(value).charAt(0).toUpperCase()}
        </span>
        <span className="font-medium text-[#1f221f] text-sm">{value}</span>
      </span>
    );
  }

  // Status field with theme colors
  if (field.key === "status" || field.key.includes("status")) {
    const statusStyles = {
      posted: "bg-[#4a9b68]/10 text-[#4a9b68] border border-[#4a9b68]/30",
      paid: "bg-[#4a9b68]/10 text-[#4a9b68] border border-[#4a9b68]/30",
      approved: "bg-[#4a9b68]/10 text-[#4a9b68] border border-[#4a9b68]/30",
      draft: "bg-[#d9a44a]/10 text-[#d9a44a] border border-[#d9a44a]/30",
      pending: "bg-[#d9a44a]/10 text-[#d9a44a] border border-[#d9a44a]/30",
      submitted: "bg-blue2/10 text-blue2 border border-blue2/30",
      rejected: "bg-[#d95a4a]/10 text-[#d95a4a] border border-[#d95a4a]/30",
      cancelled: "bg-[#d95a4a]/10 text-[#d95a4a] border border-[#d95a4a]/30",
      overdue: "bg-[#d95a4a]/10 text-[#d95a4a] border border-[#d95a4a]/30",
    };

    const status = String(value).toLowerCase();
    const statusStyle = statusStyles[status] || "bg-blue2/10 text-blue2 border border-blue2/30";

    return (
      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium ${statusStyle}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'posted' || status === 'paid' || status === 'approved' ? 'bg-[#4a9b68]' :
          status === 'draft' || status === 'pending' ? 'bg-[#d9a44a]' :
          status === 'submitted' ? 'bg-blue2' :
          status === 'rejected' || status === 'cancelled' || status === 'overdue' ? 'bg-[#d95a4a]' :
          'bg-[#000000]'
        }`}></span>
        {value}
      </span>
    );
  }

  // Boolean fields with theme colors
  if (field.type === "boolean" || field.key === "vat_applicable" || field.key.includes("is_") || field.key.includes("has_")) {
    const isTrue = value === true || value === "true" || value === 1 || value === "1" || value === "yes";
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
        isTrue 
          ? "bg-[#4a9b68]/10 text-[#4a9b68] border border-[#4a9b68]/30" 
          : "bg-[#000000]/10 text-[#000000] border border-[#000000]/30"
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isTrue ? "bg-[#4a9b68]" : "bg-[#000000]"}`}></span>
        {isTrue ? "Yes" : "No"}
      </span>
    );
  }

  // Email fields with theme colors
  if (field.key.includes("email") || (typeof value === 'string' && value.includes('@') && value.includes('.'))) {
    return (
      <span className="flex items-center gap-1.5 text-[#4a636e] text-sm">
        <i className="fas fa-envelope text-xs text-blue2/70"></i>
        <span className="text-[#1f221f]">{value}</span>
      </span>
    );
  }

  // Phone fields with theme colors
  if (field.key.includes("phone") || field.key.includes("mobile") || field.key.includes("tel")) {
    return (
      <span className="flex items-center gap-1.5 text-[#4a636e] text-sm">
        <i className="fas fa-phone text-xs text-blue2/70"></i>
        <span className="text-[#1f221f]">{value}</span>
      </span>
    );
  }

  // Percentage fields with theme colors
  if (field.key.includes("percentage") || field.key.includes("percent") || field.key.includes("rate") || field.type === "percentage") {
    return (
      <span className="inline-flex items-center gap-1 bg-blue2/10 px-2 py-1 rounded-md text-blue2 text-sm">
        <span className="font-medium tabular-nums">{value}</span>
        <span className="text-xs text-blue2/70">%</span>
      </span>
    );
  }

  // Default text/string fields
  if (typeof value === 'string' && value.length > 30) {
    return (
      <span className="text-sm text-[#1f221f]" title={value}>
        {value.substring(0, 30)}…
      </span>
    );
  }

  // Default fallback with theme colors
  return (
    <span className="text-sm text-[#1f221f]">
      {value}
    </span>
  );
};

export default ExpenseTableFieldRenderer;