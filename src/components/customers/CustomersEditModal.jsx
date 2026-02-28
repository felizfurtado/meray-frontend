import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const CustomersEditModal = ({
  open,
  onClose,
  customerId,
  schema,
  refetchCustomers,
}) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!open || !customerId) return;

    setLoading(true);
    api.get(`/customers/${customerId}/`).then((res) => {
      const data = res.data.customer;
      setForm({
        ...data,
        ...(data.extra_data || {})
      });
      setLoading(false);
    });
  }, [open, customerId]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await api.put(`/customers/${customerId}/update/`, form);
    setSaving(false);
    onClose();
    refetchCustomers?.();
  };

  if (!open) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'active': 'bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20',
      'inactive': 'bg-[#8b8f8c]/10 text-[#8b8f8c] border-[#8b8f8c]/20',
      'lead': 'bg-[#d9a44a]/10 text-[#d9a44a] border-[#d9a44a]/20',
      'prospect': 'bg-blue2/10 text-blue2 border-blue2/20',
      'customer': 'bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20',
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const customerName = form?.company || form?.contact_name || `Customer ${String(customerId).slice(-6)}`;

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title="Edit Customer"
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-building absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-[#8b8f8c] font-medium">Loading customer details…</p>
          </div>
        </div>
      ) : (
        <>
          {/* Customer Header - Matching Leads/Expenses style */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-[#4a636e] rounded-full border-2 border-white flex items-center justify-center">
                    <i className="fas fa-pencil-alt text-xs text-white"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
                    {form.company || form.contact_name || "Unnamed Customer"}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {form.status && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(form.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          form.status?.toLowerCase() === 'active' || form.status?.toLowerCase() === 'customer' ? 'bg-[#4a9b68]' :
                          form.status?.toLowerCase() === 'inactive' ? 'bg-[#8b8f8c]' :
                          form.status?.toLowerCase() === 'lead' ? 'bg-[#d9a44a]' :
                          form.status?.toLowerCase() === 'prospect' ? 'bg-blue2' :
                          'bg-[#8b8f8c]'
                        }`}></span>
                        {prettify(form.status)}
                      </span>
                    )}
                    {form.industry && (
                      <span className="inline-flex items-center gap-1.5 text-blue2 bg-blue2/10 px-3 py-1 rounded-full border border-blue2/30">
                        <i className="fas fa-industry text-blue2 text-xs"></i>
                        {form.industry}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Edit Badge */}
              <div className="flex flex-col items-end">
                <span className="text-sm text-[#8b8f8c]">Editing Mode</span>
                <span className="text-base font-semibold text-blue2 flex items-center gap-2">
                  <i className="fas fa-pencil-alt text-sm"></i>
                  Customer #{String(customerId).slice(-6)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs - Matching Leads/Expenses style */}
          <div className="mb-6 border-b border-[#e5e7eb]">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-[#8b8f8c] hover:text-[#4a636e] hover:border-gray-300'
                }`}
              >
                <i className="fas fa-info-circle mr-2"></i>
                Customer Details
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'notes'
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-[#8b8f8c] hover:text-[#4a636e] hover:border-gray-300'
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
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Edit Fields Grid */}
              <div>
                <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
                  <i className="fas fa-pencil-alt text-blue2"></i>
                  Edit Customer Information
                  <span className="ml-2 px-2 py-0.5 bg-blue2/10 text-blue2 text-xs rounded-full border border-blue2/30">
                    Editable Fields
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {schema?.fields?.map((field) => {
                    if (field.type === "repeat") return null;

                    return (
                      <EditField
                        key={field.key}
                        field={field}
                        value={form[field.key] ?? ""}
                        onChange={handleChange}
                      />
                    );
                  })}
                </div>
              </div>

              {/* System Information - Read-only */}
              <div className="pt-4 border-t border-[#e5e7eb]">
                <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
                  <i className="fas fa-database text-blue2"></i>
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.created_at && (
                    <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-calendar-plus text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Created Date</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6">
                        {new Date(form.created_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {form.updated_at && (
                    <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-calendar-check text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Last Updated</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6">
                        {new Date(form.updated_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Notes Tab */
            <div className="space-y-6">
              {Array.isArray(form.notes) && form.notes.length > 0 ? (
                <div className="space-y-4">
                  {form.notes.map((note) => (
                    <div key={note.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue2/30 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2/20 to-[#a9c0c9]/30 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue2">
                                {note.user_name?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-[#1f221f]">
                                {note.user_name || 'System'}
                              </span>
                              <span className="text-xs text-[#8b8f8c]">
                                <i className="fas fa-calendar-alt mr-1"></i>
                                {formatDate(note.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-[#4a636e] leading-relaxed whitespace-pre-wrap">
                              {note.text}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            await api.delete(
                              `/customers/${customerId}/notes/${note.id}/delete/`
                            );
                            setForm((prev) => ({
                              ...prev,
                              notes: prev.notes.filter((n) => n.id !== note.id),
                            }));
                          }}
                          className="ml-4 p-2 text-[#d95a4a]/70 hover:text-[#d95a4a] hover:bg-[#d95a4a]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete note"
                        >
                          <i className="fas fa-trash-alt text-sm"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-blue2/10 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-sticky-note text-3xl text-blue2"></i>
                  </div>
                  <h3 className="text-md font-semibold text-[#1f221f] mb-1">No Notes</h3>
                  <p className="text-sm text-[#8b8f8c]">No notes have been added for this customer yet.</p>
                </div>
              )}

              {/* Add Note Section */}
              <div className="bg-[#f6f6f4] rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
                  <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                    <i className="fas fa-plus-circle text-[#d9a44a] text-xs"></i>
                    Add New Note
                  </h3>
                </div>
                <AddNoteSection
                  customerId={customerId}
                  setForm={setForm}
                />
              </div>
            </div>
          )}

          {/* Footer with Actions - Matching Leads/Expenses style */}
          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#8b8f8c]">
              <span className="flex items-center gap-1.5">
                <i className="fas fa-fingerprint text-[10px]"></i>
                Customer ID: {customerId}
              </span>
              {form.updated_at && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-calendar-check text-[10px]"></i>
                    Last modified: {formatDate(form.updated_at)}
                  </span>
                </>
              )}
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

export default CustomersEditModal;

const EditField = ({ field, value, onChange }) => {
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
    return icons[key] || 'fas fa-tag';
  };

  const common = {
    value,
    onChange: (e) => onChange(field.key, e.target.value),
    className: "w-full rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
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

      {field.type === "date" && (
        <input type="date" {...common} />
      )}

      {!["select", "textarea", "number", "currency", "date"].includes(field.type) && (
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

const AddNoteSection = ({ customerId, setForm }) => {
  const [text, setText] = useState("");

  const addNote = async () => {
    if (!text.trim()) return;

    const res = await api.post(
      `/customers/${customerId}/notes/add/`,
      { text }
    );

    setForm((prev) => ({
      ...prev,
      notes: [...(prev.notes || []), res.data.note],
    }));

    setText("");
  };

  return (
    <div className="flex gap-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a note..."
        className="flex-1 rounded-lg border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#1f221f] placeholder:text-[#8b8f8c]/60 focus:border-[#d9a44a] focus:ring-2 focus:ring-[#d9a44a]/20 transition-all bg-white"
      />
      <button
        onClick={addNote}
        disabled={!text.trim()}
        className="inline-flex items-center px-5 py-2 bg-[#d9a44a] border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#c08a3a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d9a44a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        <i className="fas fa-plus-circle mr-2"></i>
        Add Note
      </button>
    </div>
  );
};

// Helper function
const prettify = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};