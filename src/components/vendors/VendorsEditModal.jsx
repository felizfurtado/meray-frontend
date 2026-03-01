import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const VendorsEditModal = ({
  open,
  onClose,
  vendorId,
  schema,
  refetchVendors,
}) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open || !vendorId) return;

    setLoading(true);
    api.get(`/vendors/${vendorId}/`).then((res) => {
      const data = res.data.vendor;
      setForm({
        ...data,
        ...(data.extra_data || {}),
      });
      setLoading(false);
      setErrors({});
    });
  }, [open, vendorId]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors = {};

    // Required fields validation based on schema
    schema?.fields?.forEach((field) => {
      if (field.required && !form[field.key]?.toString().trim()) {
        newErrors[field.key] = `${field.label || prettify(field.key)} is required`;
      }
    });

    // Email validation if exists
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation (basic)
    if (form.phone && !/^[\d\s\+\-\(\)]{8,}$/.test(form.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await api.put(`/vendors/${vendorId}/update/`, form);
      onClose();
      refetchVendors?.();
    } catch (err) {
      setErrors({ 
        general: err.response?.data?.error || "Failed to update vendor" 
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      active: "bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20",
      inactive: "bg-[#8b8f8c]/10 text-[#8b8f8c] border-[#8b8f8c]/20",
    };
    return (
      statusMap[status?.toLowerCase()] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

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
      payment_terms: 'fas fa-clock',
      currency: 'fas fa-coins',
      bank_name: 'fas fa-university',
      bank_account: 'fas fa-credit-card',
      iban: 'fas fa-passport',
      swift: 'fas fa-code-branch',
    };
    return icons[key] || 'fas fa-circle';
  };

  const vendorName =
    form?.company ||
    form?.contact_name ||
    `Vendor ${String(vendorId).slice(-6)}`;

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Edit Vendor"
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-truck absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-[#8b8f8c] font-medium">
              Loading vendor details...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Header - Enhanced */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                  <span className="text-white text-2xl font-bold">
                    {vendorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                  <i className="fas fa-pencil-alt text-xs text-white"></i>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-3 mb-1">
                  <h1 className="text-xl font-semibold text-[#1f221f] truncate max-w-md">
                    {form.company || form.contact_name || "Unnamed Vendor"}
                  </h1>
                  {form.status && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(form.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        form.status?.toLowerCase() === 'active' ? 'bg-[#4a9b68]' : 'bg-[#8b8f8c]'
                      }`}></span>
                      {prettify(form.status)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#4a636e]">
                  {form.contact_name && (
                    <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md">
                      <i className="fas fa-user text-blue2/70 text-xs"></i>
                      <span className="truncate max-w-[150px]">{form.contact_name}</span>
                    </span>
                  )}
                  {form.email && (
                    <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md">
                      <i className="fas fa-envelope text-blue2/70 text-xs"></i>
                      <span className="truncate max-w-[200px]">{form.email}</span>
                    </span>
                  )}
                  {form.phone && (
                    <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md">
                      <i className="fas fa-phone text-blue2/70 text-xs"></i>
                      <span>{form.phone}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-[#8b8f8c]">Vendor ID</span>
                <span className="text-sm font-semibold text-blue2 font-mono">
                  #{String(vendorId).slice(-6)}
                </span>
              </div>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-center gap-2">
              <i className="fas fa-exclamation-triangle"></i>
              {errors.general}
            </div>
          )}

          {/* Tabs - Enhanced */}
          <div className="mb-6 border-b border-[#e5e7eb] px-2">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("details")}
                className={`relative px-6 py-2.5 text-sm font-medium transition-all ${
                  activeTab === "details"
                    ? "text-blue2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue2 after:rounded-full"
                    : "text-[#8b8f8c] hover:text-[#4a636e]"
                }`}
              >
                <i className="fas fa-info-circle mr-2"></i>
                Vendor Details
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`relative px-6 py-2.5 text-sm font-medium transition-all ${
                  activeTab === "notes"
                    ? "text-blue2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue2 after:rounded-full"
                    : "text-[#8b8f8c] hover:text-[#4a636e]"
                }`}
              >
                <i className="fas fa-sticky-note mr-2"></i>
                Notes
                {Array.isArray(form.notes) && form.notes.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-blue2 text-white">
                    {form.notes.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Details Tab */}
          {activeTab === "details" ? (
            <div className="px-4 pb-6 space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-blue2 rounded-full"></div>
                <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-pencil-alt text-blue2 text-xs"></i>
                  Edit Vendor Information
                </h3>
                <span className="text-xs text-[#8b8f8c] ml-2">Fields marked with * are required</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schema?.fields?.map((field) => {
                  if (field.type === "repeat") return null;

                  return (
                    <div key={field.key} className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
                        <i className={`${getFieldIcon(field.key)} text-blue2/70 text-xs`}></i>
                        {field.label || prettify(field.key)}
                        {field.required && <span className="text-[#d95a4a]">*</span>}
                      </label>
                      <EditField
                        field={field}
                        value={form[field.key] ?? ""}
                        onChange={handleChange}
                        error={errors[field.key]}
                      />
                      {errors[field.key] && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          <i className="fas fa-exclamation-circle"></i>
                          {errors[field.key]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Help text */}
              <div className="bg-blue2/5 border border-blue2/20 rounded-lg p-4 mt-4">
                <p className="text-xs text-[#4a636e] flex items-center gap-2">
                  <i className="fas fa-info-circle text-blue2"></i>
                  Changes will be saved immediately when you click "Save Changes"
                </p>
              </div>
            </div>
          ) : (
            /* Notes Tab - Enhanced */
            <div className="px-4 pb-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
                <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-sticky-note text-[#d9a44a] text-xs"></i>
                  Vendor Notes
                </h3>
              </div>

              {Array.isArray(form.notes) && form.notes.length > 0 ? (
                <div className="space-y-4">
                  {form.notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-white rounded-xl border border-[#e5e7eb] p-5 hover:border-blue2/30 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2/20 to-[#a9c0c9]/30 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue2">
                              {note.user_name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-sm font-semibold text-[#1f221f]">
                                {note.user_name || 'System'}
                              </span>
                              <span className="text-xs text-[#8b8f8c] ml-3">
                                <i className="fas fa-calendar-alt mr-1"></i>
                                {formatDate(note.created_at)}
                              </span>
                            </div>
                            <button
                              onClick={async () => {
                                await api.delete(
                                  `/vendors/${vendorId}/notes/${note.id}/delete/`
                                );
                                setForm((prev) => ({
                                  ...prev,
                                  notes: prev.notes.filter(
                                    (n) => n.id !== note.id
                                  ),
                                }));
                              }}
                              className="p-2 text-[#d95a4a]/70 hover:text-[#d95a4a] hover:bg-[#d95a4a]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Delete note"
                            >
                              <i className="fas fa-trash-alt text-sm"></i>
                            </button>
                          </div>
                          <p className="text-sm text-[#4a636e] leading-relaxed whitespace-pre-wrap break-words">
                            {note.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-white rounded-xl border border-[#e5e7eb]">
                  <div className="w-16 h-16 rounded-full bg-blue2/10 flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-sticky-note text-2xl text-blue2"></i>
                  </div>
                  <p className="text-[#4a636e]">No notes yet for this vendor</p>
                </div>
              )}

              {/* Add Note Section - Enhanced */}
              <AddNoteSection vendorId={vendorId} setForm={setForm} />
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#8b8f8c]">
              <i className="fas fa-info-circle text-[10px]"></i>
              <span>Fields marked with <span className="text-[#d95a4a]">*</span> are required</span>
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
                disabled={saving}
                className="inline-flex items-center px-5 py-2 bg-blue2 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#4a636e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </ViewEditModal>
  );
};

export default VendorsEditModal;

/* Enhanced EditField component */
const EditField = ({ field, value, onChange, error }) => {
  const common = {
    value: value || "",
    onChange: (e) => onChange(field.key, e.target.value),
    className: `w-full rounded-lg border-2 px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white ${
      error ? "border-red-300 bg-red-50" : "border-[#e5e7eb]"
    }`,
  };

  if (field.type === "select") {
    return (
      <select {...common}>
        <option value="" className="text-[#8b8f8c]">-- Select {field.label || "option"} --</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-[#1f221f]">
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return <textarea rows={3} {...common} />;
  }

  if (field.type === "email") {
    return <input type="email" {...common} />;
  }

  if (field.type === "tel" || field.key === "phone") {
    return <input type="tel" {...common} />;
  }

  if (field.type === "url" || field.key === "website") {
    return <input type="url" {...common} />;
  }

  return <input type="text" {...common} />;
};

/* Enhanced AddNoteSection */
const AddNoteSection = ({ vendorId, setForm }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const addNote = async () => {
    if (!text.trim()) return;

    setAdding(true);
    try {
      const res = await api.post(
        `/vendors/${vendorId}/notes/add/`,
        { text }
      );

      setForm((prev) => ({
        ...prev,
        notes: [...(prev.notes || []), res.data.note],
      }));

      setText("");
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e] mb-3">
        <i className="fas fa-plus-circle text-[#d9a44a]"></i>
        Add New Note
      </label>
      <div className="flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note about this vendor..."
          className="flex-1 rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all"
          disabled={adding}
        />
        <button
          onClick={addNote}
          disabled={!text.trim() || adding}
          className="inline-flex items-center px-5 py-2 bg-[#d9a44a] border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#c08b3a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d9a44a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {adding ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Adding...
            </>
          ) : (
            <>
              <i className="fas fa-plus-circle mr-2"></i>
              Add Note
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-[#8b8f8c] mt-2 flex items-center gap-1">
        <i className="fas fa-info-circle text-[10px]"></i>
        Notes are visible to all users and cannot be edited after creation
      </p>
    </div>
  );
};

const prettify = (text) =>
  text?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());