import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InventorySalesInvoiceViewModal = ({
  open,
  onClose,
  invoiceId,
  refetch
}) => {

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    if (!open || !invoiceId) return;

    setLoading(true);

    api.get(`/inventory-sales-invoices/${invoiceId}/`)
      .then(res => {
        setInvoice(res.data.inventory_sales_invoice);
      })
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));

  }, [open, invoiceId]);

  if (!open) return null;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-AE", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  const handlePost = async () => {
    setProcessing(true);
    setError("");

    try {
      await api.post(`/inventory-sales-invoices/${invoiceId}/post/`);
      refetch?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post invoice");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkPaid = async () => {
    setProcessing(true);
    setError("");

    try {
      await api.post(
        `/inventory-sales-invoices/${invoiceId}/mark-paid/`,
        { payment_method: paymentMethod }
      );

      refetch?.();
      setPaymentModalOpen(false);
      onClose();

    } catch (err) {
      setError(err.response?.data?.error || "Failed to mark paid");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'draft': 'bg-amber-100 text-amber-700 border-amber-200',
      'posted': 'bg-blue-100 text-blue-700 border-blue-200',
      'paid': 'bg-green-100 text-green-700 border-green-200',
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <>
      <ViewEditModal
        open={open}
        onClose={onClose}
        title="Inventory Sales Invoice"
        width="max-w-6xl"
      >
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
                <i className="fas fa-shopping-cart absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
              </div>
              <p className="mt-4 text-[#8b8f8c] font-medium">Loading invoice details...</p>
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
          <div className="space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-center gap-2 mx-6">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            {/* Header - Enhanced */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mx-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
              
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue2/30">
                      <i className="fas fa-shopping-cart text-2xl"></i>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-[#4a636e] rounded-full border-2 border-white flex items-center justify-center">
                      <i className="fas fa-search text-xs text-white"></i>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          invoice.status?.toLowerCase() === 'paid' ? 'bg-green-500' :
                          invoice.status?.toLowerCase() === 'posted' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`}></span>
                        {invoice.status}
                      </span>
                    </div>

                    <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
                      {invoice.number}
                    </h1>

                    <div className="flex flex-wrap gap-3 mt-1">
                      {invoice.customer?.name && (
                        <span className="inline-flex items-center gap-1.5 text-[#4a636e] bg-white/60 px-3 py-1 rounded-full border border-gray-200">
                          <i className="fas fa-building text-blue2 text-xs"></i>
                          {invoice.customer.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Total Amount Badge */}
                <div className="flex flex-col items-end">
                  <span className="text-sm text-[#8b8f8c]">Total Amount</span>
                  <span className="text-3xl font-bold text-blue2">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue2/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue2/10 flex items-center justify-center">
                    <i className="fas fa-calendar-alt text-blue2"></i>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b8f8c] uppercase tracking-wide">Invoice Date</p>
                    <p className="text-base font-semibold text-[#1f221f]">{formatDate(invoice.date)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue2/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <i className="fas fa-clock text-amber-600"></i>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b8f8c] uppercase tracking-wide">Due Date</p>
                    <p className="text-base font-semibold text-[#1f221f]">
                      {invoice.due_date ? formatDate(invoice.due_date) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table - Clean VAT display */}
<div className="px-6">
  <div className="flex items-center gap-2 mb-4">
    <div className="w-1 h-5 bg-blue2 rounded-full"></div>
    <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
      <i className="fas fa-boxes text-blue2"></i>
      Invoice Items
    </h3>
  </div>

  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    {/* Table Header */}
    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#f6f6f4] border-b border-gray-200 text-xs font-medium text-[#4a636e] uppercase tracking-wider">
      <div className="col-span-5">Item</div>
      <div className="col-span-2 text-right">Qty</div>
      <div className="col-span-2 text-right">Price</div>
      <div className="col-span-3 text-right">Amount</div>
    </div>

    {/* Table Rows */}
    {invoice.items.map((item, i) => (
      <div key={i} className="px-4 py-4 border-b last:border-0 hover:bg-blue2/5 transition-colors">
        {/* Main Row */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium text-[#1f221f]">{item.item_name}</p>
            {item.description && (
              <p className="text-xs text-[#8b8f8c] mt-0.5">{item.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-8">
            <span className="text-[#1f221f] w-16 text-right">{item.quantity}</span>
            <span className="text-[#1f221f] w-24 text-right">{formatCurrency(item.price)}</span>
            <span className="font-semibold text-[#1f221f] w-32 text-right">
              {formatCurrency(Number(item.line_amount) + Number(item.vat_amount))}
            </span>
          </div>
        </div>
        
        {/* VAT Row - Subtle and clean */}
        {Number(item.vat_amount) > 0 && (
          <div className="flex justify-end items-center gap-2 mt-2 pt-1 border-t border-dashed border-gray-100">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded">
                <i className="fas fa-percent text-[9px]"></i>
                VAT 5%
              </span>
              <span className="text-[#8b8f8c]">included</span>
            </div>
            <span className="text-sm font-medium text-amber-600 w-32 text-right">
              {formatCurrency(item.vat_amount)}
            </span>
          </div>
        )}
      </div>
    ))}
  </div>
</div>

            {/* Totals - Enhanced */}
            <div className="flex justify-end px-6">
              <div className="w-full  bg-gradient-to-br from-[#f6f6f4] to-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-blue2 rounded-full"></div>
                  <h4 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider">
                    Summary
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm py-2 border-b border-[#e5e7eb]">
                    <span className="text-[#4a636e]">Subtotal</span>
                    <span className="font-medium text-[#1f221f]">{formatCurrency(invoice.subtotal)}</span>
                  </div>

                  {invoice.vat > 0 && (
                    <div className="flex justify-between items-center text-sm py-2 border-b border-[#e5e7eb]">
                      <span className="text-[#4a636e]">VAT (5%)</span>
                      <span className="font-medium text-[#d9a44a]">{formatCurrency(invoice.vat)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-[#1f221f]">Total</span>
                    <span className="text-2xl font-bold text-blue2">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Enhanced */}
        <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#8b8f8c]">
            <span className="flex items-center gap-1.5">
              <i className="fas fa-fingerprint text-[10px]"></i>
              Invoice ID: {invoiceId}
            </span>
            {invoice?.created_at && (
              <>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-calendar-plus text-[10px]"></i>
                  Created {formatDate(invoice.created_at)}
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#4a636e] hover:text-[#1f221f] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
            >
              <i className="fas fa-times mr-2"></i>
              Close
            </button>

            {invoice?.status?.toLowerCase() === "draft" && (
              <button
                onClick={handlePost}
                disabled={processing}
                className="inline-flex items-center px-5 py-2 bg-blue2 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#4a636e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Post Invoice
                  </>
                )}
              </button>
            )}

            {invoice?.status?.toLowerCase() === "posted" && (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="inline-flex items-center px-5 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 transition-colors shadow-sm"
              >
                <i className="fas fa-credit-card mr-2"></i>
                Mark as Paid
              </button>
            )}

            {invoice?.status?.toLowerCase() === "paid" && (
              <span className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-sm font-medium text-green-700">
                <i className="fas fa-check-circle mr-2"></i>
                Payment Completed
              </span>
            )}
          </div>
        </div>
      </ViewEditModal>

      {/* Payment Modal - Enhanced */}
      {paymentModalOpen && (
        <ViewEditModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title="Receive Payment"
          width="max-w-md"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                <i className="fas fa-credit-card text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1f221f]">Receive Payment</h2>
                <p className="text-xs text-[#8b8f8c]">Record payment for this invoice</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-2 space-y-5">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e] uppercase tracking-wide">
                <i className="fas fa-credit-card text-blue2/70 text-xs"></i>
                Payment Method <span className="text-[#d95a4a]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-3 rounded-lg font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === "cash"
                      ? "bg-green-50 text-green-600 border-green-300 shadow-sm"
                      : "border-[#e5e7eb] text-[#4a636e] hover:bg-gray-50"
                  }`}
                >
                  <i className="fas fa-money-bill-wave"></i>
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod("bank")}
                  className={`py-3 rounded-lg font-medium border-2 transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === "bank"
                      ? "bg-blue-50 text-blue-600 border-blue-300 shadow-sm"
                      : "border-[#e5e7eb] text-[#4a636e] hover:bg-gray-50"
                  }`}
                >
                  <i className="fas fa-university"></i>
                  Bank
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#f6f6f4] to-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#4a636e]">Payment Amount</span>
                <span className="text-xl font-bold text-[#1f221f]">
                  {formatCurrency(invoice?.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 mt-2 flex justify-end gap-3">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#4a636e] hover:text-[#1f221f] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkPaid}
              disabled={processing}
              className="inline-flex items-center px-5 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle mr-2"></i>
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </ViewEditModal>
      )}
    </>
  );
};

export default InventorySalesInvoiceViewModal;

const StatusBadge = ({ status }) => {
  const styles = {
    draft: "bg-amber-100 text-amber-700 border-amber-200",
    posted: "bg-blue-100 text-blue-700 border-blue-200",
    paid: "bg-green-100 text-green-700 border-green-200"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${styles[status?.toLowerCase()]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status?.toLowerCase() === 'paid' ? 'bg-green-500' :
        status?.toLowerCase() === 'posted' ? 'bg-blue-500' :
        'bg-amber-500'
      }`}></span>
      {status?.toUpperCase()}
    </span>
  );
};