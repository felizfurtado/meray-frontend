import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const CustomersAddModal = ({ open, onClose, schema, refetchCustomers }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (!open || !schema) return;

    const initial = {};
    schema.form_fields?.forEach((key) => {
      initial[key] = "";
    });

    initial.notes = []; // ✅ initialize notes array

    setForm(initial);
    setNoteText("");
  }, [open, schema]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const coreFields = [
        "company",
        "contact_name",
        "email",
        "phone",
        "status",
        "assigned_to",
      ];

      const payload = {
        extra_data: {},
        notes: [],
      };

      // ✅ If initial note entered → create note object
      if (noteText.trim()) {
        payload.notes.push({
          id: crypto.randomUUID(),
          text: noteText,
          created_at: new Date().toISOString(),
        });
      }

      Object.keys(form).forEach((key) => {
        if (key === "notes") return;

        if (coreFields.includes(key)) {
          payload[key] = form[key];
        } else {
          payload.extra_data[key] = form[key];
        }
      });

      await api.post("/customers/", payload);

      onClose();
      refetchCustomers?.();
    } catch (err) {
      console.error("Create failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title="Add Customer"
      width="max-w-4xl"
    >
      {/* Header Decoration */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
            <i className="fas fa-user-plus text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1f221f]">New Customer</h2>
            <p className="text-xs text-[#8b8f8c]">Fill in the details to create a new customer</p>
          </div>
        </div>
      </div>

      {/* Dynamic Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {schema?.fields
          ?.filter(
            (f) =>
              schema.form_fields?.includes(f.key) && f.type !== "repeat"
          )
          .map((field) => (
            <DynamicField
              key={field.key}
              field={field}
              value={form[field.key] || ""}
              onChange={handleChange}
            />
          ))}
      </div>

      {/* Initial Note */}
      <div className="p-4 border-t border-[#e5e7eb]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
          <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
            <i className="fas fa-sticky-note text-[#d9a44a] text-xs"></i>
            Initial Note
          </h3>
        </div>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note about this customer..."
          className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-[#d9a44a] focus:ring-2 focus:ring-[#d9a44a]/20 transition-all resize-none"
          rows={3}
        />
        <p className="text-xs text-[#8b8f8c] mt-1.5 flex items-center gap-1">
          <i className="fas fa-info-circle text-[10px]"></i>
          This note will be added to the customer's timeline
        </p>
      </div>

      {/* Footer with Actions */}
      <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8b8f8c]">
          <i className="fas fa-info-circle text-[10px]"></i>
          <span>All fields are optional unless marked</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#4a636e] hover:text-[#1f221f] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-5 py-2 bg-blue2 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#4a636e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-plus-circle mr-2"></i>
                Create Customer
              </>
            )}
          </button>
        </div>
      </div>
    </ViewEditModal>
  );
};

export default CustomersAddModal;

const DynamicField = ({ field, value, onChange }) => {
  const getFieldIcon = (key) => {
    const icons = {
      company: 'fas fa-building',
      contact_name: 'fas fa-user',
      email: 'fas fa-envelope',
      phone: 'fas fa-phone',
      status: 'fas fa-flag',
      assigned_to: 'fas fa-user-check',
      website: 'fas fa-globe',
      tax_number: 'fas fa-id-card',
      registration_number: 'fas fa-hashtag',
      industry: 'fas fa-industry',
      address: 'fas fa-map-marker-alt',
      city: 'fas fa-city',
      country: 'fas fa-flag',
      notes: 'fas fa-sticky-note',
    };
    return icons[field.key] || 'fas fa-tag';
  };

  const common = {
    value,
    onChange: (e) => onChange(field.key, e.target.value),
    className: "w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white",
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
          <i className={`${getFieldIcon(field.key)} text-blue2/70 text-xs`}></i>
          {field.label || prettify(field.key)}
          {field.required && <span className="text-[#d95a4a]">*</span>}
        </label>
      </div>

      {field.type === "select" && (
        <select {...common}>
          <option value="" className="text-[#8b8f8c]">Select {field.label || 'option'}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-[#1f221f]">
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "date" && (
        <input type="date" {...common} />
      )}

      {field.type === "textarea" && (
        <textarea
          {...common}
          rows={3}
          className="w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all resize-none"
        />
      )}

      {(field.type === "number" || field.type === "currency") && (
        <div className="relative">
          {field.type === "currency" && (
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b8f8c] text-sm">AED</span>
          )}
          <input
            type="number"
            {...common}
            className={`w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all ${field.type === "currency" ? 'pl-14' : ''}`}
          />
        </div>
      )}

      {!["select", "date", "textarea", "number", "currency"].includes(field.type) && (
        <input type="text" {...common} />
      )}

      {field.description && (
        <p className="text-xs text-[#8b8f8c] mt-1 flex items-center gap-1">
          <i className="fas fa-info-circle text-[10px]"></i>
          {field.description}
        </p>
      )}
    </div>
  );
};

// Helper function - NO LOGIC CHANGED, just moved for UI
const prettify = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};