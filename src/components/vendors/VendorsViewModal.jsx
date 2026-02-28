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
              Loading vendor details…
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
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                  {vendorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
                    {vendor.company ||
                      vendor.contact_name ||
                      "Unnamed Vendor"}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {vendor.status && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          vendor.status
                        )}`}
                      >
                        {prettify(vendor.status)}
                      </span>
                    )}
                    {vendor.industry && (
                      <span className="inline-flex items-center gap-1.5 text-blue2 bg-blue2/10 px-3 py-1 rounded-full border border-blue2/30">
                        <i className="fas fa-industry text-blue2 text-xs"></i>
                        {vendor.industry}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-[#e5e7eb]">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "details"
                    ? "border-blue2 text-blue2"
                    : "border-transparent text-[#8b8f8c]"
                }`}
              >
                <i className="fas fa-info-circle mr-2"></i>
                Vendor Details
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "notes"
                    ? "border-blue2 text-blue2"
                    : "border-transparent text-[#8b8f8c]"
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
            </nav>
          </div>

          {/* Details */}
          {activeTab === "details" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schema?.fields?.map((field) => {
                  if (field.type === "repeat") return null;
                  const value = vendor[field.key];

                  if (
                    !value ||
                    typeof value === "object" ||
                    [
                      "notes",
                      "created_at",
                      "updated_at",
                      "created_by",
                    ].includes(field.key)
                  )
                    return null;

                  return (
                    <div
                      key={field.key}
                      className="bg-white rounded-xl border border-gray-200 p-4"
                    >
                      <div className="text-xs text-[#8b8f8c] mb-1 uppercase tracking-wide">
                        {field.label || prettify(field.key)}
                      </div>
                      <div className="text-base font-medium text-[#1f221f]">
                        {formatValue(field.type, value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(vendor.notes) &&
              vendor.notes.length > 0 ? (
                vendor.notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-[#1f221f]">
                        {note.user_name || "System"}
                      </span>
                      <span className="text-xs text-[#8b8f8c]">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[#4a636e] whitespace-pre-wrap">
                      {note.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <i className="fas fa-sticky-note text-4xl text-blue2 mb-3"></i>
                  <p className="text-[#8b8f8c]">
                    No notes have been added for this vendor yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-[#4a636e] hover:bg-[#f6f6f4]"
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
