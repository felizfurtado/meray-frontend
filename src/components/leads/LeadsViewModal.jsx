import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const LeadsViewModal = ({ open, onClose, leadId, schema }) => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!open || !leadId) return;

    setLoading(true);
    api
      .get(`/leads/${leadId}/`)
      .then((res) => {
        setLead(res.data.lead);
      })
      .catch(() => {
        setLead(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, leadId]);

  if (!open) return null;

  const leadName = lead?.name || lead?.company_name || lead?.email || "Lead Details";

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
      'new': 'bg-blue-100 text-blue-800 border-blue-200',
      'contacted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'qualified': 'bg-green-100 text-green-800 border-green-200',
      'lost': 'bg-red-100 text-red-800 border-red-200',
      'won': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title="Lead Details"
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue1/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-user-tie absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading lead details…</p>
          </div>
        </div>
      ) : lead ? (
        <>
          {/* Lead Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl border border-blue-200 p-6 mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-blue2/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                    {lead.name?.charAt(0)?.toUpperCase() || lead.company_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-blue1 rounded-full border-2 border-white flex items-center justify-center">
                    <i className="fas fa-user-tie text-xs text-white"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {lead.name || lead.company_name || "Unnamed Lead"}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {lead.status && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                        <i className={`fas ${
                          lead.status === 'new' ? 'fa-star' :
                          lead.status === 'contacted' ? 'fa-phone' :
                          lead.status === 'qualified' ? 'fa-check-circle' :
                          lead.status === 'lost' ? 'fa-times-circle' :
                          lead.status === 'won' ? 'fa-trophy' : 'fa-circle'
                        }`}></i>
                        {prettify(lead.status)}
                      </span>
                    )}
                    {lead.source && (
                      <span className="inline-flex items-center gap-1.5 text-gray-600 bg-white/60 px-3 py-1 rounded-full border border-gray-200">
                        <i className="fas fa-source text-blue2 text-xs"></i>
                        {prettify(lead.source)}
                      </span>
                    )}
                    {lead.industry && (
                      <span className="inline-flex items-center gap-1.5 text-gray-600 bg-white/60 px-3 py-1 rounded-full border border-gray-200">
                        <i className="fas fa-industry text-blue2 text-xs"></i>
                        {lead.industry}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-info-circle mr-2"></i>
                Lead Details
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'notes'
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-sticky-note mr-2"></i>
                Notes
                {lead.notes?.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-blue2 text-white">
                    {lead.notes.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {lead.expected_value && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <i className="fas fa-coins text-green-500"></i>
                        Expected Value
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      AED {new Intl.NumberFormat().format(lead.expected_value)}
                    </div>
                  </div>
                )}
                
                {lead.probability && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <i className="fas fa-chart-pie text-blue2"></i>
                        Probability
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue2">
                      {lead.probability}%
                    </div>
                  </div>
                )}
                
                {lead.contact_date && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <i className="fas fa-calendar-alt text-amber-500"></i>
                        Contact Date
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatDate(lead.contact_date)}
                    </div>
                  </div>
                )}
                
                {lead.assigned_to && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <i className="fas fa-user-check text-purple-500"></i>
                        Assigned To
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 truncate">
                      {lead.assigned_to_name || lead.assigned_to}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Fields */}
              <Section title="Lead Information" icon="fas fa-user-tie">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schema?.fields?.map((field) => {
                    if (field.type === "repeat") return null;

                    const value = resolveValue(lead, field.key);

                    if (
                      value === null ||
                      value === undefined ||
                      value === "" ||
                      typeof value === "object"
                    ) {
                      return null;
                    }

                    return (
                      <InfoCard
                        key={field.key}
                        label={field.label || prettify(field.key)}
                        value={formatValue(field.type, value)}
                        icon={getFieldIcon(field.key)}
                      />
                    );
                  })}
                </div>
              </Section>

              {/* Contact Information */}
              {(lead.email || lead.phone || lead.mobile) && (
                <Section title="Contact Information" icon="fas fa-address-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lead.email && (
                      <InfoCard
                        label="Email"
                        value={lead.email}
                        icon="fas fa-envelope"
                        link={`mailto:${lead.email}`}
                      />
                    )}
                    {lead.phone && (
                      <InfoCard
                        label="Phone"
                        value={lead.phone}
                        icon="fas fa-phone"
                        link={`tel:${lead.phone}`}
                      />
                    )}
                    {lead.mobile && (
                      <InfoCard
                        label="Mobile"
                        value={lead.mobile}
                        icon="fas fa-mobile-alt"
                        link={`tel:${lead.mobile}`}
                      />
                    )}
                  </div>
                </Section>
              )}

              {/* System Information */}
              <Section title="System Information" icon="fas fa-database">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lead.created_at && (
                    <InfoCard
                      label="Created Date"
                      value={new Date(lead.created_at).toLocaleString()}
                      icon="fas fa-calendar-plus"
                    />
                  )}
                  {lead.updated_at && (
                    <InfoCard
                      label="Last Updated"
                      value={new Date(lead.updated_at).toLocaleString()}
                      icon="fas fa-calendar-check"
                    />
                  )}
                  {lead.created_by && (
                    <InfoCard
                      label="Created By"
                      value={typeof lead.created_by === 'object' ? lead.created_by.username : lead.created_by}
                      icon="fas fa-user-plus"
                    />
                  )}
                </div>
              </Section>
            </div>
          ) : (
            /* Notes Tab - Fixed to properly display notes */
            <div className="space-y-6">
              {Array.isArray(lead.notes) && lead.notes.length > 0 ? (
                <div className="space-y-4">
                  {lead.notes.map((note, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue2/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue2">
                              {note.user_name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {note.user_name || 'System'}
                            </span>
                            <span className="text-xs text-gray-500">
                              <i className="fas fa-calendar-alt mr-1"></i>
                              {formatDate(note.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {note.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-sticky-note text-4xl text-blue2"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notes</h3>
                  <p className="text-gray-600">No notes have been added for this lead yet.</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
          <p className="text-gray-600">Lead not found</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue2 rounded-lg hover:bg-blue1 transition-colors"
          >
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

const Section = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <i className={`${icon} text-blue2 text-lg`}></i>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoCard = ({ label, value, icon, link = null }) => {
  const content = (
    <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue2/30 transition-colors h-full">
      <div className="flex items-center gap-2 mb-2">
        {icon && <i className={`${icon} text-blue2 text-sm`}></i>}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      
      {link ? (
        <a
          href={link}
          target={link?.startsWith('http') ? "_blank" : undefined}
          rel={link?.startsWith('http') ? "noopener noreferrer" : undefined}
          className="text-base font-medium text-blue2 hover:text-blue1 hover:underline block truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
          {link?.startsWith('http') && <i className="fas fa-external-link-alt text-xs ml-1"></i>}
        </a>
      ) : (
        <div className="text-base font-medium text-gray-900 break-words">
          {value}
        </div>
      )}
    </div>
  );

  return content;
};

/* -------------------- */
/* Helper Functions     */
/* -------------------- */

const getFieldIcon = (field) => {
  const icons = {
    name: 'fas fa-user',
    company_name: 'fas fa-building',
    email: 'fas fa-envelope',
    phone: 'fas fa-phone',
    mobile: 'fas fa-mobile-alt',
    source: 'fas fa-source',
    industry: 'fas fa-industry',
    status: 'fas fa-flag',
    expected_value: 'fas fa-coins',
    probability: 'fas fa-chart-pie',
    contact_date: 'fas fa-calendar-alt',
    assigned_to: 'fas fa-user-check',
    notes: 'fas fa-sticky-note',
    created_at: 'fas fa-calendar-plus',
    updated_at: 'fas fa-calendar-check',
    created_by: 'fas fa-user-plus',
    default: 'fas fa-tag'
  };
  
  return icons[field] || icons.default;
};

function resolveValue(lead, key) {
  if (lead[key] !== undefined && lead[key] !== null) {
    return lead[key];
  }

  if (lead.extra_data && lead.extra_data[key] !== undefined) {
    return lead.extra_data[key];
  }

  return null;
}

function prettify(text) {
  if (!text) return '';
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(type, value) {
  if (typeof value === "object") return "";

  switch (type) {
    case "currency":
      return `AED ${new Intl.NumberFormat().format(value)}`;

    case "date":
      return new Date(value).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

    case "number":
      return new Intl.NumberFormat().format(value);

    default:
      return value;
  }
}

export default LeadsViewModal;