import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const LeadsAddModal = ({ open, onClose, schema, refetchLeads }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
  if (!open || !schema) return;

  const initial = {};
  schema.form_fields?.forEach((key) => {
    // Skip notes field in add modal - notes should be added after lead is created
    if (key !== "notes") {
      initial[key] = "";
    }
  });

  setForm(initial);
  setErrors({});
  setTouched({});
}, [open, schema]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field when user types
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleBlur = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    
    // Validate on blur if field is required
    const field = schema.fields?.find(f => f.key === key);
    if (field?.required && !form[key]) {
      setErrors((prev) => ({ 
        ...prev, 
        [key]: `${field.label || prettify(key)} is required` 
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const allTouched = {};

    schema.fields?.forEach((field) => {
      if (schema.form_fields?.includes(field.key) && field.required) {
        allTouched[field.key] = true;
        if (!form[field.key]) {
          newErrors[field.key] = `${field.label || prettify(field.key)} is required`;
        }
      }
    });

    setErrors(newErrors);
    setTouched((prev) => ({ ...prev, ...allTouched }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
  if (!validate()) return;

  try {
    setLoading(true);
    
    // Create a copy of form data without notes field
    const { notes, ...leadData } = form;
    
    // Send only lead data, notes should be added separately
    await api.post("/leads/", leadData);
    
    onClose();
    refetchLeads?.();
  } catch (err) {
    console.error("Create failed", err);
    if (err.response?.data?.errors) {
      setErrors(err.response.data.errors);
    }
  } finally {
    setLoading(false);
  }
};

  if (!open) return null;

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title="Add New Lead"
      width="max-w-6xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl border border-blue-200 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-blue2/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                <i className="fas fa-user-plus text-2xl"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <i className="fas fa-plus text-xs text-white"></i>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Create New Lead
              </h1>
              <p className="text-sm text-gray-600">
                Fill in the information below to add a new lead
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <Section title="Lead Information" icon="fas fa-user-tie">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {schema?.fields
              ?.filter((f) => schema.form_fields?.includes(f.key))
              .map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  value={form[field.key] ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors[field.key]}
                  touched={touched[field.key]}
                />
              ))}
          </div>
        </Section>

        {/* Helper Text */}
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="fas fa-info-circle text-blue2"></i>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">About Lead Creation</h4>
              <p className="text-xs text-gray-600">
                Fields marked with <span className="text-red-500">*</span> are required. 
                You can add notes and additional details after creating the lead.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-6 py-4 mt-6 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded-md text-gray-600 text-[10px] font-mono shadow-sm">
              ESC
            </kbd>
            <span>to cancel</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="group relative px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="flex items-center gap-2">
              <i className="fas fa-times text-gray-500 group-hover:text-gray-700"></i>
              Cancel
            </span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={loading}
            className="group relative px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue1 to-blue2 rounded-xl hover:from-blue2 hover:to-blue1 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue1 disabled:hover:to-blue2"
          >
            <span className="flex items-center gap-2">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus-circle"></i>
                  Create Lead
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

/* -------------------- */
/* Form Components      */
/* -------------------- */

const DynamicField = ({ field, value, onChange, onBlur, error, touched }) => {
  const handleChange = (e) => {
    onChange(field.key, e.target.value);
  };

  const handleBlur = () => {
    onBlur?.(field.key);
  };

  const showError = error || (touched && !value && field.required);

  const common = {
    value: value || "",
    onChange: handleChange,
    onBlur: handleBlur,
    className: `w-full border ${
      showError 
        ? 'border-red-300 bg-red-50 focus:ring-red-500/30' 
        : 'border-gray-200 focus:ring-blue2/30 focus:border-blue2'
    } rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors`,
    placeholder: `Enter ${field.label?.toLowerCase() || 'value'}...`
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {field.label || prettify(field.key)}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.type && (
          <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
            {field.type}
          </span>
        )}
      </div>
      
      {field.type === "select" ? (
        <select {...common}>
          <option value="">Select {field.label}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea 
          {...common} 
          rows={4}
        />
      ) : (
        <input
          {...common}
          type={
            field.type === "number" || field.type === "currency" ? "number" :
            field.type === "date" ? "date" :
            field.type === "email" ? "email" :
            field.type === "phone" ? "tel" : "text"
          }
          step={field.type === "currency" ? "0.01" : "1"}
        />
      )}
      
      {showError && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <i className="fas fa-exclamation-circle"></i>
          {error || `${field.label || prettify(field.key)} is required`}
        </p>
      )}
      
      {field.description && !showError && (
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <i className="fas fa-info-circle text-gray-400"></i>
          {field.description}
        </p>
      )}
    </div>
  );
};

/* -------------------- */
/* UI Components        */
/* -------------------- */

const Section = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <i className={`${icon} text-blue2 text-lg`}></i>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

/* -------------------- */
/* Helper Functions     */
/* -------------------- */

const prettify = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default LeadsAddModal;