import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const CustomersViewModal = ({ open, onClose, customerId, schema }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!open || !customerId) return;

    setLoading(true);
    api
      .get(`/customers/${customerId}/`)
      .then((res) => {
        const data = res.data.customer;
        setCustomer({
          ...data,
          ...(data.extra_data || {})
        });
      })
      .catch(() => {
        setCustomer(null);
      })
      .finally(() => setLoading(false));
  }, [open, customerId]);

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

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'AED 0.00';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
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

  const customerName = customer?.company || customer?.contact_name || `Customer ${String(customerId).slice(-6)}`;

  return (
    <ViewEditModal 
      open={open} 
      onClose={onClose} 
      title="Customer Details"
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
      ) : !customer ? (
        <div className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d95a4a]/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-[#d95a4a] text-3xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-[#1f221f] mb-2">Customer not found</h3>
          <p className="text-[#8b8f8c] text-sm mb-4">The customer you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue2 rounded-lg hover:bg-[#4a636e] transition-colors"
          >
            Close
          </button>
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
                    <i className="fas fa-search text-xs text-white"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
                    {customer.company || customer.contact_name || "Unnamed Customer"}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {customer.status && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          customer.status?.toLowerCase() === 'active' || customer.status?.toLowerCase() === 'customer' ? 'bg-[#4a9b68]' :
                          customer.status?.toLowerCase() === 'inactive' ? 'bg-[#8b8f8c]' :
                          customer.status?.toLowerCase() === 'lead' ? 'bg-[#d9a44a]' :
                          customer.status?.toLowerCase() === 'prospect' ? 'bg-blue2' :
                          'bg-[#8b8f8c]'
                        }`}></span>
                        {prettify(customer.status)}
                      </span>
                    )}
                    {customer.industry && (
                      <span className="inline-flex items-center gap-1.5 text-blue2 bg-blue2/10 px-3 py-1 rounded-full border border-blue2/30">
                        <i className="fas fa-industry text-blue2 text-xs"></i>
                        {customer.industry}
                      </span>
                    )}
                    {customer.contact_name && (
                      <span className="inline-flex items-center gap-1.5 text-[#4a636e] bg-white/60 px-3 py-1 rounded-full border border-gray-200">
                        <i className="fas fa-user text-blue2 text-xs"></i>
                        {customer.contact_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick Stats Badge */}
              {customer.email && (
                <div className="flex flex-col items-end">
                  <span className="text-sm text-[#8b8f8c]">Primary Contact</span>
                  <span className="text-base font-semibold text-[#1f221f] flex items-center gap-2">
                    <i className="fas fa-envelope text-blue2 text-sm"></i>
                    {customer.email}
                  </span>
                </div>
              )}
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
                {Array.isArray(customer.notes) && customer.notes.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-blue2 text-white">
                    {customer.notes.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {customer.phone && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
                        <i className="fas fa-phone text-[#4a9b68]"></i>
                        Phone
                      </span>
                    </div>
                    <div className="text-lg font-bold text-[#1f221f]">
                      {customer.phone}
                    </div>
                  </div>
                )}
                
                {customer.email && !customer.phone && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
                        <i className="fas fa-envelope text-[#d9a44a]"></i>
                        Email
                      </span>
                    </div>
                    <div className="text-lg font-bold text-[#1f221f] truncate">
                      {customer.email}
                    </div>
                  </div>
                )}
                
                {customer.assigned_to && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
                        <i className="fas fa-user-check text-blue2"></i>
                        Assigned To
                      </span>
                    </div>
                    <div className="text-lg font-bold text-[#1f221f]">
                      {typeof customer.assigned_to === 'object' ? customer.assigned_to.username : customer.assigned_to}
                    </div>
                  </div>
                )}
                
                {customer.created_at && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
                        <i className="fas fa-calendar-alt text-[#d9a44a]"></i>
                        Customer Since
                      </span>
                    </div>
                    <div className="text-lg font-bold text-[#1f221f]">
                      {formatDate(customer.created_at)}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Fields Grid */}
              <div>
                <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
                  <i className="fas fa-building text-blue2"></i>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schema?.fields?.map((field) => {
                    if (field.type === "repeat") return null;

                    const value = customer[field.key];
                    
                    // Skip fields we show elsewhere
                    if (!value || typeof value === "object" || 
                        ["company", "contact_name", "status", "industry", "email", "phone", 
                         "assigned_to", "notes", "created_at", "updated_at", "created_by"].includes(field.key)) {
                      return null;
                    }

                    return (
                      <div key={field.key} className="group bg-white rounded-xl border border-gray-200 hover:border-blue2/30 hover:shadow-sm transition-all p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <i className={`${getFieldIcon(field.key)} text-blue2/70 text-xs`}></i>
                          <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">
                            {field.label || prettify(field.key)}
                          </span>
                        </div>
                        <div className="text-base font-medium text-[#1f221f] break-words pl-5">
                          {formatValue(field.type, value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Address Section */}
              {(customer.address || customer.city || customer.country) && (
                <div>
                  <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
                    <i className="fas fa-map-marker-alt text-blue2"></i>
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.address && (
                      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 md:col-span-2">
                        <div className="w-10 h-10 bg-blue2/10 rounded-lg flex items-center justify-center">
                          <i className="fas fa-map-pin text-blue2"></i>
                        </div>
                        <div>
                          <p className="text-xs text-[#8b8f8c]">Address</p>
                          <p className="text-sm font-medium text-[#1f221f]">{customer.address}</p>
                          {(customer.city || customer.country) && (
                            <p className="text-xs text-[#4a636e] mt-0.5">
                              {[customer.city, customer.country].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Information */}
              <div>
                <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
                  <i className="fas fa-database text-blue2"></i>
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.created_at && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-calendar-plus text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Created Date</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6">
                        {new Date(customer.created_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {customer.updated_at && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-calendar-check text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Last Updated</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6">
                        {new Date(customer.updated_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {customer.created_by && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-user-plus text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Created By</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6">
                        {typeof customer.created_by === 'object' ? customer.created_by.username : customer.created_by}
                      </div>
                    </div>
                  )}
                  {customer.id && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-fingerprint text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Customer ID</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6 font-mono">
                        {customer.id}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Notes Tab */
            <div className="space-y-6">
              {Array.isArray(customer.notes) && customer.notes.length > 0 ? (
                <div className="space-y-4">
                  {customer.notes.map((note) => (
                    <div key={note.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue2/30 transition-colors">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-24 h-24 rounded-full bg-blue2/10 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-sticky-note text-4xl text-blue2"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1f221f] mb-2">No Notes</h3>
                  <p className="text-[#8b8f8c]">No notes have been added for this customer yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Footer - Matching Leads/Expenses style */}
          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#8b8f8c]">
              <span className="flex items-center gap-1.5">
                <i className="fas fa-fingerprint text-[10px]"></i>
                Customer ID: {customerId}
              </span>
              {customer.updated_at && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-calendar-check text-[10px]"></i>
                    Updated {formatDate(customer.updated_at)}
                  </span>
                </>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-[#4a636e] hover:bg-[#f6f6f4] hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue2 transition-colors"
            >
              <i className="fas fa-times mr-2"></i>
              Close
            </button>
          </div>
        </>
      )}
    </ViewEditModal>
  );
};

export default CustomersViewModal;

/* Helper Functions - NO LOGIC CHANGES, only moved for UI */
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
    created_at: 'fas fa-calendar-plus',
    updated_at: 'fas fa-calendar-check',
    created_by: 'fas fa-user-plus',
    id: 'fas fa-fingerprint',
  };
  return icons[key] || 'fas fa-circle';
};

const prettify = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function formatValue(type, value) {
  if (!value && value !== 0) return '—';
  
  switch (type) {
    case "currency":
      return `AED ${new Intl.NumberFormat('en-AE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    case "date":
      return new Date(value).toLocaleDateString('en-AE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    case "number":
      return new Intl.NumberFormat('en-AE').format(value);
    default:
      return value;
  }
}