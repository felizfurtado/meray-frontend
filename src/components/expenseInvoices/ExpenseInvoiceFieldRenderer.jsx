import React from "react";

const ExpenseInvoiceFieldRenderer = ({ field, value }) => {
  if (!value && value !== 0)
    return <span className="text-gray-400">—</span>;

  switch (field) {
    case "status":
      return (
        <span className={`px-2 py-1 text-xs rounded-full border ${
          value === "Paid"
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-yellow-50 text-yellow-600 border-yellow-200"
        }`}>
          {value}
        </span>
      );

    case "total_amount":
      return (
        <span className="font-semibold text-blue2">
          AED {Number(value).toFixed(2)}
        </span>
      );

    case "date":
    case "due_date":
      return (
        <span>
          {new Date(value).toLocaleDateString("en-AE", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })}
        </span>
      );

    default:
      return <span>{value}</span>;
  }
};

export default ExpenseInvoiceFieldRenderer;
