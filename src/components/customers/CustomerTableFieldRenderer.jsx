import React from "react";

const CustomerTableFieldRenderer = ({ field, value }) => {
  if (value === null || value === undefined || value === "")
    return <span className="text-gray-400">-</span>;

  switch (field.type) {
    case "currency":
      return (
        <span className="font-medium text-emerald-600">
          AED {new Intl.NumberFormat().format(value)}
        </span>
      );

    case "number":
      return <span>{new Intl.NumberFormat().format(value)}</span>;

    case "date":
      return (
        <span>
          {new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );

    case "select":
      return (
        <span className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700">
          {value}
        </span>
      );

    case "url":
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Visit
        </a>
      );

    default:
      return <span>{value}</span>;
  }
};

export default CustomerTableFieldRenderer;
