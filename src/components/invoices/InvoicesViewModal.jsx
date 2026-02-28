import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InvoicesViewModal = ({ open, onClose, invoiceId }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!open || !invoiceId) return;

    setLoading(true);
    api
      .get(`/invoices/${invoiceId}/`)
      .then((res) => setInvoice(res.data.invoice))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [open, invoiceId]);

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

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  const getStatusColor = (status) => {
    const statusMap = {
      'draft': 'bg-[#d9a44a]/10 text-[#d9a44a] border-[#d9a44a]/20',
      'sent': 'bg-blue2/10 text-blue2 border-blue2/20',
      'paid': 'bg-[#4a9b68]/10 text-[#4a9b68] border-[#4a9b68]/20',
      'overdue': 'bg-[#d95a4a]/10 text-[#d95a4a] border-[#d95a4a]/20',
      'cancelled': 'bg-[#8b8f8c]/10 text-[#8b8f8c] border-[#8b8f8c]/20',
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Invoice Details"
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-file-invoice absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-[#8b8f8c] font-medium">Loading invoice details…</p>
          </div>
        </div>
      ) : !invoice ? (
        <div className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d95a4a]/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-[#d95a4a] text-3xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-[#1f221f] mb-2">Invoice not found</h3>
          <p className="text-[#8b8f8c] text-sm mb-4">The invoice you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue2 rounded-lg hover:bg-[#4a636e] transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          {/* Header - Matching theme */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                    <i className="fas fa-file-invoice text-2xl"></i>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-[#4a636e] rounded-full border-2 border-white flex items-center justify-center">
                    <i className="fas fa-search text-xs text-white"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
                    {invoice.number || `INV-${String(invoiceId).slice(-6)}`}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {invoice.status && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          invoice.status?.toLowerCase() === 'paid' ? 'bg-[#4a9b68]' :
                          invoice.status?.toLowerCase() === 'sent' ? 'bg-blue2' :
                          invoice.status?.toLowerCase() === 'draft' ? 'bg-[#d9a44a]' :
                          invoice.status?.toLowerCase() === 'overdue' ? 'bg-[#d95a4a]' :
                          'bg-[#8b8f8c]'
                        }`}></span>
                        {invoice.status}
                      </span>
                    )}
                    {(invoice.customer_name || invoice.custom_details?.companyName) && (
                      <span className="inline-flex items-center gap-1.5 text-[#4a636e] bg-white/60 px-3 py-1 rounded-full border border-gray-200">
                        <i className="fas fa-building text-blue2 text-xs"></i>
                        {invoice.customer_name || invoice.custom_details?.companyName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Total Amount Badge */}
              <div className="flex flex-col items-end">
                <span className="text-sm text-[#8b8f8c]">Total Amount</span>
                <span className="text-3xl font-bold text-[#1f221f]">
                  {formatCurrency(invoice.total)}
                </span>
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
                    : "border-transparent text-[#8b8f8c] hover:text-[#4a636e] hover:border-gray-300"
                }`}
              >
                <i className="fas fa-info-circle mr-2"></i>
                Invoice Details
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === "notes"
                    ? "border-blue2 text-blue2"
                    : "border-transparent text-[#8b8f8c] hover:text-[#4a636e] hover:border-gray-300"
                }`}
              >
                <i className="fas fa-sticky-note mr-2"></i>
                Notes
                {invoice.notes?.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-blue2 text-white">
                    {invoice.notes.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {activeTab === "details" ? (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
                      <i className="fas fa-calendar-alt text-[#d9a44a]"></i>
                      Date
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#1f221f]">
                    {formatDate(invoice.date)}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
                      <i className="fas fa-clock text-[#d9a44a]"></i>
                      Due Date
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#1f221f]">
                    {formatDate(invoice.due_date)}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#4a636e] flex items-center gap-2">
                      <i className="fas fa-flag text-blue2"></i>
                      Status
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(invoice.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        invoice.status?.toLowerCase() === 'paid' ? 'bg-[#4a9b68]' :
                        invoice.status?.toLowerCase() === 'sent' ? 'bg-blue2' :
                        invoice.status?.toLowerCase() === 'draft' ? 'bg-[#d9a44a]' :
                        invoice.status?.toLowerCase() === 'overdue' ? 'bg-[#d95a4a]' :
                        'bg-[#8b8f8c]'
                      }`}></span>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
                  <i className="fas fa-boxes text-blue2"></i>
                  Invoice Items
                </h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#f6f6f4] border-b border-gray-200 text-xs font-medium text-[#4a636e] uppercase tracking-wider">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-right">Quantity</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  {invoice.items?.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-3 border-b last:border-0 hover:bg-blue2/5 transition-colors">
                      <div className="col-span-6">
                        <p className="font-medium text-[#1f221f]">{item.description}</p>
                        {item.sku && <p className="text-xs text-[#8b8f8c]">SKU: {item.sku}</p>}
                      </div>
                      <div className="col-span-2 text-right font-medium text-[#1f221f]">{item.quantity}</div>
                      <div className="col-span-2 text-right font-medium text-[#1f221f]">{formatCurrency(item.price)}</div>
                      <div className="col-span-2 text-right font-semibold text-[#1f221f]">{formatCurrency(item.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full  bg-[#f6f6f4] rounded-xl border border-gray-200 p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#4a636e]">Subtotal</span>
                      <span className="font-medium text-[#1f221f]">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.vat > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#4a636e]">VAT (5%)</span>
                        <span className="font-medium text-[#1f221f]">{formatCurrency(invoice.vat)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="font-semibold text-[#1f221f]">Total</span>
                      <span className="text-xl font-bold text-[#1f221f]">{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div>
                <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
                  <i className="fas fa-database text-blue2"></i>
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {invoice.created_at && (
                    <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-calendar-plus text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Created Date</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6">
                        {new Date(invoice.created_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {invoice.updated_at && (
                    <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-calendar-check text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Last Updated</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6">
                        {new Date(invoice.updated_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {invoice.id && (
                    <div className="bg-[#f6f6f4] p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-fingerprint text-blue2/70 text-xs"></i>
                        <span className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wide">Invoice ID</span>
                      </div>
                      <div className="text-base font-medium text-[#1f221f] pl-6 font-mono">
                        {invoice.id}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <NotesSection
              invoiceId={invoiceId}
              notes={invoice.notes}
              setInvoice={setInvoice}
            />
          )}

          {/* Footer */}
          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#8b8f8c]">
              <span className="flex items-center gap-1.5">
                <i className="fas fa-fingerprint text-[10px]"></i>
                Invoice ID: {invoiceId}
              </span>
              {invoice.updated_at && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-calendar-check text-[10px]"></i>
                    Updated {formatDate(invoice.updated_at)}
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

export default InvoicesViewModal;

const NotesSection = ({ invoiceId, notes = [], setInvoice }) => {
  const [text, setText] = useState("");

  const addNote = async () => {
    if (!text.trim()) return;

    const res = await api.post(
      `/invoices/${invoiceId}/notes/add/`,
      { text }
    );

    setInvoice((prev) => ({
      ...prev,
      notes: [...(prev.notes || []), res.data.note],
    }));

    setText("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note) => (
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
        <div className="py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-blue2/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-sticky-note text-3xl text-blue2"></i>
          </div>
          <h3 className="text-md font-semibold text-[#1f221f] mb-1">No Notes</h3>
          <p className="text-sm text-[#8b8f8c]">No notes have been added for this invoice yet.</p>
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
      </div>
    </div>
  );
};