import React from "react";

const FieldRenderer = ({ field, value, onChange }) => {
  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "date":
      return (
        <div>
          <label className="text-sm font-medium">{field.label}</label>
          <input
            type={field.type}
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className="text-sm font-medium">{field.label}</label>
          <textarea
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>
      );

    case "select":
      return (
        <div>
          <label className="text-sm font-medium">{field.label}</label>
          <select
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full border rounded-lg p-2 mt-1"
          >
            <option value="">Select</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "account_select":
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(field.key, e.target.value)}
      className="w-full border rounded-lg p-2"
    >
      <option value="">Select Account</option>
      {field.options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );


    case "boolean":
      return (
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(field.key, e.target.checked)}
          />
          <label>{field.label}</label>
        </div>
      );

    default:
      return null;
  }
};

export default FieldRenderer;
