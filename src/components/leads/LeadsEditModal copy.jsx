import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const LeadsEditModal = ({ open, onClose, leadId, schema, refetchLeads }) => {
  const [lead, setLead] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!open || !leadId) return;

    setLoading(true);
    api.get(`/leads/${leadId}/`)
      .then(res => {
        const data = res.data;
        console.log("Edit modal lead data:", data);
        setLead(data);

        // Build initial form state from lead data
        const initialForm = {};
        
        // Add all fields from lead (flatten custom_data into form)
        Object.keys(data).forEach(key => {
          if (key !== 'custom_data' && key !== 'notes' && key !== 'created_by' && key !== 'assigned_to') {
            initialForm[key] = data[key];
          }
        });
        
        // Add custom_data fields
        if (data.custom_data && typeof data.custom_data === 'object') {
          Object.keys(data.custom_data).forEach(key => {
            initialForm[key] = data.custom_data[key];
          });
        }

        setForm(initialForm);
      })
      .catch(error => {
        console.error("Failed to fetch lead:", error);
      })
      .finally(() => setLoading(false));
  }, [open, leadId]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setSaving(true);
    try {
      const response = await api.post(`/leads/${leadId}/add-note/`, { 
        note: newNote.trim() 
      });
      
      // Refresh lead data to get updated notes
      const res = await api.get(`/leads/${leadId}/`);
      setLead(res.data);
      setNewNote("");
      
      // Show success message
      alert("Note added successfully!");
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Failed to add note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!leadId) return;

    setSaving(true);

    // Prepare payload for update
    const payload = {
      name: form.name || "",
      email: form.email || "",
      phone: form.phone || "",
      company: form.company || "",
      status: form.status || "new",
      source: form.source || "",
      industry: form.industry || "",
      probability: form.probability ? parseInt(form.probability) : 0,
      value: form.value ? parseFloat(form.value) : null,
      custom_data: {}
    };

    // Add other fields to custom_data
    const coreFields = ['name', 'email', 'phone', 'company', 'status', 'source', 'industry', 'probability', 'value'];
    Object.keys(form).forEach(key => {
      if (!coreFields.includes(key)) {
        payload.custom_data[key] = form[key];
      }
    });

    try {
      // Use PATCH to update
      const response = await api.patch(`/leads/${leadId}/edit/`, payload);
      console.log("Save successful:", response.data);
      
      // Refresh the leads list
      if (refetchLeads) {
        refetchLeads();
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error("Failed to save lead:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(`Failed to save: ${error.response.data.error || 'Please check your input'}`);
      } else {
        alert("Failed to save changes. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  // Get field configuration
  const getFieldConfig = (field) => {
    if (schema?.field_configs?.[field]) {
      return schema.field_configs[field];
    }
    
    if (schema?.custom_fields?.[field]) {
      return schema.custom_fields[field];
    }
    
    // Default config for core fields
    const defaultConfigs = {
      "name": { type: "string", label: "Full Name", required: true },
      "email": { type: "email", label: "Email Address", required: true },
      "phone": { type: "phone", label: "Phone Number", required: true },
      "company": { type: "string", label: "Company", required: true },
      "status": { type: "select", label: "Status", required: true },
      "industry": { type: "select", label: "Industry", required: false },
      "source": { type: "select", label: "Source", required: true },
      "probability": { type: "number", label: "Probability (%)", required: false },
      "value": { type: "currency", label: "Deal Value", required: false },
      "budget": { type: "currency", label: "Budget", required: false },
      "expected_close_date": { type: "date", label: "Expected Close Date", required: false },
      "decision_maker": { type: "string", label: "Decision Maker", required: false },
      "website": { type: "url", label: "Website", required: false },
      "location": { type: "string", label: "Location", required: false },
      "employees": { type: "number", label: "Employees", required: false },
    };
    
    return defaultConfigs[field] || { 
      type: "string", 
      label: field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) 
    };
  };

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title="Edit Lead"
      className="animate-slideInRight"
      width="max-w-4xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue1/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-user absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading lead details…</p>
          </div>
        </div>
      ) : lead ? (
        <div className="space-y-6">
          {/* Lead Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl border border-blue-200 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-blue2/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                    {lead.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-blue1 rounded-full border-2 border-white flex items-center justify-center">
                    <i className="fas fa-edit text-xs text-white"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <input
                      type="text"
                      value={form.name || ""}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="text-2xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-blue2 focus:border-blue2 focus:outline-none px-1 py-0.5 rounded"
                      placeholder="Lead Name"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-1.5 text-gray-600 bg-white/60 px-3 py-1 rounded-full border border-gray-200">
                      <i className="fas fa-building text-blue2 text-xs"></i>
                      <input
                        type="text"
                        value={form.company || ""}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-sm min-w-[120px]"
                        placeholder="Company"
                      />
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-gray-600 bg-white/60 px-3 py-1 rounded-full border border-gray-200">
                      <i className="fas fa-industry text-blue2 text-xs"></i>
                      <select
                        value={form.industry || ""}
                        onChange={(e) => handleChange('industry', e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-sm appearance-none pr-4"
                      >
                        <option value="">Industry</option>
                        <option value="IT">IT</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:ml-auto">
                <select
                  value={form.status || "new"}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold uppercase tracking-wide appearance-none ${
                    getStatusStyle(form.status).class
                  }`}
                >
                  <option value="new" className="bg-blue-100 text-blue-800">New</option>
                  <option value="contacted" className="bg-yellow-100 text-yellow-800">Contacted</option>
                  <option value="qualified" className="bg-green-100 text-green-800">Qualified</option>
                  <option value="proposal" className="bg-purple-100 text-purple-800">Proposal</option>
                  <option value="won" className="bg-emerald-100 text-emerald-800">Won</option>
                  <option value="lost" className="bg-red-100 text-red-800">Lost</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === "details"
                  ? "text-blue2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue2"
                  : "text-gray-600 hover:text-blue2"
              }`}
              onClick={() => setActiveTab("details")}
            >
              <i className="fas fa-edit mr-2"></i>
              Edit Details
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === "notes"
                  ? "text-blue2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue2"
                  : "text-gray-600 hover:text-blue2"
              }`}
              onClick={() => setActiveTab("notes")}
            >
              <i className="fas fa-sticky-note mr-2"></i>
              Notes
              {Array.isArray(lead.notes) && lead.notes.length > 0 && (
                <span className="ml-2 bg-blue2 text-white text-xs rounded-full px-2 py-0.5">
                  {lead.notes.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Probability */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <i className="fas fa-chart-line text-blue2"></i>
                        Probability
                      </span>
                      <span className="text-lg font-bold text-blue2">
                        {form.probability || 0}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={form.probability || 0}
                        onChange={(e) => handleChange('probability', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue2 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>0%</span>
                        <span className="font-bold">50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-money-bill-wave text-green-500"></i>
                      <span className="text-sm font-semibold text-gray-700">
                        Deal Value
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-gray-500">
                        AED
                      </div>
                      <input
                        type="number"
                        value={form.value || ""}
                        onChange={(e) => handleChange('value', e.target.value)}
                        className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue2/30 focus:border-blue2"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Source */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-compass text-purple-500"></i>
                      <span className="text-sm font-semibold text-gray-700">
                        Source
                      </span>
                    </div>
                    <select
                      value={form.source || ""}
                      onChange={(e) => handleChange('source', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue2/30 focus:border-blue2 appearance-none"
                    >
                      <option value="">Select Source</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Event">Event</option>
                      <option value="Email Campaign">Email Campaign</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <Section title="Contact Information" icon="fas fa-address-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableField
                      label="Full Name"
                      value={form.name || ""}
                      onChange={(value) => handleChange('name', value)}
                      icon="fas fa-user"
                      required={true}
                      placeholder="Enter full name"
                    />
                    
                    <EditableField
                      label="Email Address"
                      value={form.email || ""}
                      onChange={(value) => handleChange('email', value)}
                      icon="fas fa-envelope"
                      type="email"
                      placeholder="name@company.com"
                    />
                    
                    <EditableField
                      label="Phone Number"
                      value={form.phone || ""}
                      onChange={(value) => handleChange('phone', value)}
                      icon="fas fa-phone"
                      type="tel"
                      placeholder="+971 50 123 4567"
                    />
                    
                    <EditableField
                      label="Company"
                      value={form.company || ""}
                      onChange={(value) => handleChange('company', value)}
                      icon="fas fa-building"
                      placeholder="Company name"
                    />
                  </div>
                </Section>

                {/* Business Details */}
                <Section title="Business Details" icon="fas fa-briefcase">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableSelect
                      label="Industry"
                      value={form.industry || ""}
                      onChange={(value) => handleChange('industry', value)}
                      icon="fas fa-industry"
                      options={[
                        { value: 'IT', label: 'Information Technology' },
                        { value: 'Finance', label: 'Finance & Banking' },
                        { value: 'Healthcare', label: 'Healthcare' },
                        { value: 'Manufacturing', label: 'Manufacturing' },
                        { value: 'Education', label: 'Education' },
                        { value: 'Retail', label: 'Retail' },
                        { value: 'Real Estate', label: 'Real Estate' },
                        { value: 'Other', label: 'Other' }
                      ]}
                    />
                    
                    <EditableSelect
                      label="Status"
                      value={form.status || "new"}
                      onChange={(value) => handleChange('status', value)}
                      icon="fas fa-flag"
                      options={[
                        { value: 'new', label: 'New' },
                        { value: 'contacted', label: 'Contacted' },
                        { value: 'qualified', label: 'Qualified' },
                        { value: 'proposal', label: 'Proposal' },
                        { value: 'won', label: 'Won' },
                        { value: 'lost', label: 'Lost' }
                      ]}
                    />
                    
                    <EditableSelect
                      label="Source"
                      value={form.source || ""}
                      onChange={(value) => handleChange('source', value)}
                      icon="fas fa-compass"
                      options={[
                        { value: 'Website', label: 'Website' },
                        { value: 'Referral', label: 'Referral' },
                        { value: 'Social Media', label: 'Social Media' },
                        { value: 'Cold Call', label: 'Cold Call' },
                        { value: 'Event', label: 'Event' },
                        { value: 'Email Campaign', label: 'Email Campaign' },
                        { value: 'Other', label: 'Other' }
                      ]}
                    />
                    
                    <EditableField
                      label="Probability"
                      value={form.probability || ""}
                      onChange={(value) => handleChange('probability', value)}
                      icon="fas fa-chart-line"
                      type="number"
                      placeholder="0-100"
                      suffix="%"
                    />
                  </div>
                </Section>

                {/* Additional Information */}
                {schema?.custom_fields && Object.keys(schema.custom_fields).length > 0 && (
                  <Section title="Additional Information" icon="fas fa-info-circle">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(schema.custom_fields).map(([field, config]) => {
                        const value = form[field] || "";
                        const label = config.label || field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                        const fieldType = config.type || 'text';
                        
                        if (fieldType === 'select' || config.options?.length > 0) {
                          const options = config.options || [];
                          return (
                            <EditableSelect
                              key={field}
                              label={label}
                              value={value}
                              onChange={(val) => handleChange(field, val)}
                              icon={getFieldIcon(fieldType)}
                              options={options.map(opt => ({ 
                                value: typeof opt === 'string' ? opt : opt.value, 
                                label: typeof opt === 'string' ? opt : opt.label 
                              }))}
                            />
                          );
                        }
                        
                        return (
                          <EditableField
                            key={field}
                            label={label}
                            value={value}
                            onChange={(val) => handleChange(field, val)}
                            icon={getFieldIcon(fieldType)}
                            type={fieldType === 'date' ? 'date' : fieldType === 'number' ? 'number' : 'text'}
                            placeholder={`Enter ${label}`}
                          />
                        );
                      })}
                    </div>
                  </Section>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-6">
                {/* Existing Notes */}
                {Array.isArray(lead.notes) && lead.notes.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <i className="fas fa-history text-blue2"></i>
                      Activity History ({lead.notes.length})
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {lead.notes.map((note, index) => (
                        <div
                          key={note.id || index}
                          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue2/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white text-xs font-semibold flex items-center justify-center">
                                {note.user_name?.charAt(0)?.toUpperCase() || 'S'}
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  {note.user_name || 'System'}
                                </span>
                                {note.user_id && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    (ID: {note.user_id})
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {note.created_at ? new Date(note.created_at).toLocaleString() : 'Unknown date'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 pl-10 whitespace-pre-wrap">
                            {note.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-sticky-note text-4xl text-gray-300 mb-3"></i>
                    <p className="text-gray-500">No notes yet</p>
                  </div>
                )}

                {/* Add New Note */}
                <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-plus-circle text-blue2"></i>
                    Add New Note
                  </h3>
                  <div className="space-y-4">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue2 focus:border-blue2 transition-colors"
                      rows="4"
                      placeholder="Type your note here... You can add important details, follow-up actions, or observations about this lead."
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || saving}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue1 to-blue2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                      >
                        {saving ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Adding Note...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus"></i>
                            Add Note
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue1 to-blue2 rounded-xl hover:opacity-90 disabled:opacity-70 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
          <p className="text-gray-600">Lead not found</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue1 to-blue2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
          >
            <i className="fas fa-times"></i>
            Close
          </button>
        </div>
      )}
    </ViewEditModal>
  );
};

/* -------------------- */
/* UI Components        */
/* -------------------- */

const Section = ({ title, icon, children, description }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <i className={`${icon} text-blue2 text-lg`}></i>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {description && (
      <p className="text-sm text-gray-600 -mt-2">{description}</p>
    )}
    {children}
  </div>
);

const EditableField = ({ label, value, onChange, icon, type = 'text', placeholder, required = false, suffix }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
      {icon && <i className={`${icon} text-blue2 text-xs`}></i>}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue2/30 focus:border-blue2 transition-colors ${suffix ? 'pr-10' : ''}`}
        placeholder={placeholder}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

const EditableSelect = ({ label, value, onChange, icon, options }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
      {icon && <i className={`${icon} text-blue2 text-xs`}></i>}
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue2/30 focus:border-blue2 transition-colors appearance-none pr-10"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <i className="fas fa-chevron-down text-gray-400 text-sm"></i>
      </div>
    </div>
  </div>
);

/* -------------------- */
/* Helper Functions     */
/* -------------------- */

const getFieldIcon = (type) => {
  const icons = {
    text: 'fas fa-font',
    string: 'fas fa-font',
    number: 'fas fa-hashtag',
    email: 'fas fa-envelope',
    phone: 'fas fa-phone',
    date: 'fas fa-calendar',
    select: 'fas fa-list',
    currency: 'fas fa-dollar-sign',
    url: 'fas fa-link',
    default: 'fas fa-edit'
  };
  return icons[type] || icons.default;
};

const getStatusStyle = (status) => {
  const styles = {
    new: {
      class: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: 'fas fa-star'
    },
    contacted: {
      class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: 'fas fa-phone'
    },
    qualified: {
      class: 'bg-green-100 text-green-800 border-green-200',
      icon: 'fas fa-check-circle'
    },
    proposal: {
      class: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: 'fas fa-file-contract'
    },
    won: {
      class: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: 'fas fa-trophy'
    },
    lost: {
      class: 'bg-red-100 text-red-800 border-red-200',
      icon: 'fas fa-times-circle'
    }
  };
  
  return styles[status?.toLowerCase()] || {
    class: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: 'fas fa-circle'
  };
};

export default LeadsEditModal;