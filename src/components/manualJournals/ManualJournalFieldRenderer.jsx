import React from "react";

const ManualJournalFieldRenderer = ({ field, value }) => {
  if (value === null || value === undefined || value === "")
    return <span className="text-gray-400">—</span>;

  switch (field) {
    case "status":
      return (
        <span
          className={`px-2 py-1 text-xs rounded-full border ${
            value === "Posted"
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-yellow-50 text-yellow-600 border-yellow-200"
          }`}
        >
          {value}
        </span>
      );

    case "total_debits":
      return (
        <span className="font-semibold text-green-600">
          {Number(value).toFixed(2)}
        </span>
      );

    case "total_credits":
      return (
        <span className="font-semibold text-red-600">
          {Number(value).toFixed(2)}
        </span>
      );

    case "journal_number":
      return (
        <span className="font-medium text-[#1f221f]">
          {value}
        </span>
      );

    case "date":
      return (
        <span>
          {new Date(value).toLocaleDateString("en-AE", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );

      case "is_balanced":
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full border ${
        value
          ? "bg-green-50 text-green-600 border-green-200"
          : "bg-red-50 text-red-600 border-red-200"
      }`}
    >
      {value ? "Balanced" : "Not Balanced"}
    </span>
  );


    default:
      return <span>{value}</span>;
  }
  
};

export default ManualJournalFieldRenderer;
