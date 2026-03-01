import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const VendorsViewModal = ({ open, onClose, vendorId, schema }) => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!open || !vendorId) return;

    setLoading(true);
    api
      .get(`/vendors/${vendorId}/`)
      .then((res) => {
        const data = res.data.vendor;
        setVendor({
          ...data,
          ...(data.extra_data || {}),
        });
      })
      .catch(() => {
        setVendor(null);
      })
      .finally(() => setLoading(false));
  }, [open, vendorId]);

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

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
    vendor?.company ||
    vendor?.contact_name ||
    `Vendor ${String(vendorId).slice(-6)}`;

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Vendor Details"
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
      ) : !vendor ? (
        <div className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d95a4a]/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-[#d95a4a] text-3xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-[#1f221f] mb-2">
            Vendor not found
          </h3>
          <p className="text-[#8b8f8c] text-sm mb-4">
            The vendor you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue2 rounded-lg hover:bg-[#4a636e] transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          {/* Header - Enhanced with contact info */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30 flex-shrink-0">
                <span className="text-white text-2xl font-bold">
                  {vendorName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-3 mb-1">
                  <h1 className="text-xl font-semibold text-[#1f221f] truncate max-w-md">
                    {vendor.company || vendor.contact_name || "Unnamed Vendor"}
                  </h1>
                  {vendor.status && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vendor.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        vendor.status?.toLowerCase() === 'active' ? 'bg-[#4a9b68]' : 'bg-[#8b8f8c]'
                      }`}></span>
                      {prettify(vendor.status)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#4a636e]">
                  {vendor.contact_name && (
                    <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md">
                      <i className="fas fa-user text-blue2/70 text-xs"></i>
                      <span className="truncate max-w-[150px]">{vendor.contact_name}</span>
                    </span>
                  )}
                  {vendor.email && (
                    <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md">
                      <i className="fas fa-envelope text-blue2/70 text-xs"></i>
                      <span className="truncate max-w-[200px]">{vendor.email}</span>
                    </span>
                  )}
                  {vendor.phone && (
                    <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-md">
                      <i className="fas fa-phone text-blue2/70 text-xs"></i>
                      <span>{vendor.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs - Enhanced styling */}
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
                {Array.isArray(vendor.notes) &&
                  vendor.notes.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-blue2 text-white">
                      {vendor.notes.length}
                    </span>
                  )}
              </button>
            </div>
          </div>

          {/* Details Tab */}
          {activeTab === "details" ? (
            <div className="px-4 space-y-6">
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {vendor.email && (
                  <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] hover:border-blue2/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#d9a44a]/10 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-envelope text-[#d9a44a]"></i>
                      </div>
                      <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Email</span>
                    </div>
                    <p className="text-base font-semibold text-[#1f221f] break-words pl-11">{vendor.email}</p>
                  </div>
                )}
                
                {vendor.phone && (
                  <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] hover:border-blue2/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue2/10 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-phone text-blue2"></i>
                      </div>
                      <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Phone</span>
                    </div>
                    <p className="text-base font-semibold text-[#1f221f] break-words pl-11">{vendor.phone}</p>
                  </div>
                )}
                
                {vendor.industry && (
                  <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] hover:border-blue2/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-industry text-purple-600"></i>
                      </div>
                      <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Industry</span>
                    </div>
                    <p className="text-base font-semibold text-[#1f221f] break-words pl-11">{vendor.industry}</p>
                  </div>
                )}
                
                {vendor.payment_terms && (
                  <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] hover:border-blue2/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-clock text-emerald-600"></i>
                      </div>
                      <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Payment Terms</span>
                    </div>
                    <p className="text-base font-semibold text-[#1f221f] break-words pl-11">{vendor.payment_terms}</p>
                  </div>
                )}
              </div>

              {/* Address Section - Full width if exists */}
              {(vendor.address || vendor.city || vendor.country) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
                    <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-[#d9a44a] text-xs"></i>
                      Address Information
                    </h3>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue2/10 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-map-pin text-blue2"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        {vendor.address && (
                          <p className="text-base font-medium text-[#1f221f] mb-2 break-words leading-relaxed">
                            {vendor.address}
                          </p>
                        )}
                        {(vendor.city || vendor.country) && (
                          <p className="text-sm text-[#4a636e]">
                            {[vendor.city, vendor.country].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Banking Information Section */}
              {(vendor.bank_name || vendor.bank_account || vendor.iban || vendor.swift) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-blue2 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-university text-blue2 text-xs"></i>
                      Banking Information
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendor.bank_name && (
                      <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fas fa-university text-blue2/70 text-xs"></i>
                          <span className="text-xs font-medium text-[#8b8f8c] uppercase">Bank Name</span>
                        </div>
                        <div className="text-base font-medium text-[#1f221f] pl-6">
                          {vendor.bank_name}
                        </div>
                      </div>
                    )}
                    
                    {vendor.bank_account && (
                      <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fas fa-credit-card text-blue2/70 text-xs"></i>
                          <span className="text-xs font-medium text-[#8b8f8c] uppercase">Account Number</span>
                        </div>
                        <div className="text-base font-medium text-[#1f221f] pl-6 font-mono">
                          {vendor.bank_account}
                        </div>
                      </div>
                    )}
                    
                    {vendor.iban && (
                      <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fas fa-passport text-blue2/70 text-xs"></i>
                          <span className="text-xs font-medium text-[#8b8f8c] uppercase">IBAN</span>
                        </div>
                        <div className="text-base font-medium text-[#1f221f] pl-6 font-mono">
                          {vendor.iban}
                        </div>
                      </div>
                    )}
                    
                    {vendor.swift && (
                      <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fas fa-code-branch text-blue2/70 text-xs"></i>
                          <span className="text-xs font-medium text-[#8b8f8c] uppercase">SWIFT/BIC</span>
                        </div>
                        <div className="text-base font-medium text-[#1f221f] pl-6 font-mono">
                          {vendor.swift}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#4a636e] rounded-full"></div>
                  <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                    <i className="fas fa-info-circle text-[#4a636e] text-xs"></i>
                    Additional Information
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schema?.fields?.map((field) => {
                    if (field.type === "repeat") return null;
                    const value = vendor[field.key];

                    if (
                      !value ||
                      typeof value === "object" ||
                      [
                        "company", "contact_name", "email", "phone", "status", "industry",
                        "address", "city", "country", "bank_name", "bank_account", 
                        "iban", "swift", "payment_terms", "notes", "created_at", 
                        "updated_at", "created_by"
                      ].includes(field.key)
                    )
                      return null;

                    return (
                      <div key={field.key} className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <i className={`${getFieldIcon(field.key)} text-blue2/70 text-xs`}></i>
                          <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">
                            {field.label || prettify(field.key)}
                          </span>
                        </div>
                        <div className="text-base font-medium text-[#1f221f] pl-6 break-words">
                          {formatValue(field.type, value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* System Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#8b8f8c] rounded-full"></div>
                  <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                    <i className="fas fa-database text-[#8b8f8c] text-xs"></i>
                    System Information
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {vendor.created_at && (
                    <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-calendar-plus text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase">Created</span>
                      </div>
                      <div className="text-sm font-medium text-[#1f221f] pl-6">
                        {formatDateTime(vendor.created_at)}
                      </div>
                    </div>
                  )}
                  
                  {vendor.updated_at && (
                    <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-calendar-check text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase">Updated</span>
                      </div>
                      <div className="text-sm font-medium text-[#1f221f] pl-6">
                        {formatDateTime(vendor.updated_at)}
                      </div>
                    </div>
                  )}
                  
                  {vendor.created_by && (
                    <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-user-plus text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase">Created By</span>
                      </div>
                      <div className="text-sm font-medium text-[#1f221f] pl-6 break-words">
                        {typeof vendor.created_by === 'object' ? vendor.created_by.username : vendor.created_by}
                      </div>
                    </div>
                  )}
                  
                  {vendor.id && (
                    <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-fingerprint text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase">Vendor ID</span>
                      </div>
                      <div className="text-sm font-medium text-[#1f221f] pl-6 font-mono break-all">
                        {vendor.id}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Notes Tab - Enhanced */
            <div className="px-4 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
                <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-sticky-note text-[#d9a44a] text-xs"></i>
                  Vendor Notes
                </h3>
              </div>

              {Array.isArray(vendor.notes) && vendor.notes.length > 0 ? (
                <div className="space-y-4">
                  {vendor.notes.map((note) => (
                    <div key={note.id} className="bg-white rounded-xl border border-[#e5e7eb] p-5 hover:border-blue2/30 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2/20 to-[#a9c0c9]/30 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue2">
                              {note.user_name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap justify-between gap-2 mb-2">
                            <span className="text-sm font-semibold text-[#1f221f]">
                              {note.user_name || 'System'}
                            </span>
                            <span className="text-xs text-[#8b8f8c] whitespace-nowrap">
                              <i className="fas fa-calendar-alt mr-1"></i>
                              {formatDate(note.created_at)}
                            </span>
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
                <div className="py-16 text-center bg-white rounded-xl border border-[#e5e7eb]">
                  <div className="w-20 h-20 rounded-full bg-blue2/10 flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-sticky-note text-3xl text-blue2"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1f221f] mb-2">No Notes</h3>
                  <p className="text-[#8b8f8c]">No notes have been added for this vendor yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#8b8f8c]">
              <span className="flex items-center gap-1.5">
                <i className="fas fa-fingerprint text-[10px]"></i>
                ID: {vendorId}
              </span>
              {vendor.updated_at && (
                <>
                  <span className="text-gray-300 hidden sm:inline">|</span>
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-clock text-[10px]"></i>
                    Updated {formatDate(vendor.updated_at)}
                  </span>
                </>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-white border border-[#e5e7eb] rounded-lg text-sm font-medium text-[#4a636e] hover:bg-[#f6f6f4] hover:border-gray-400 transition-all"
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

export default VendorsViewModal;

/* Helpers */
const prettify = (text) =>
  text?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function formatValue(type, value) {
  if (!value && value !== 0) return "—";

  switch (type) {
    case "currency":
      return `AED ${new Intl.NumberFormat("en-AE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)}`;
    case "date":
      return new Date(value).toLocaleDateString("en-AE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    case "number":
      return new Intl.NumberFormat("en-AE").format(value);
    default:
      return value;
  }
}