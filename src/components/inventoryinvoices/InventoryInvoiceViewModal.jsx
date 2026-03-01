import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InventoryInvoiceViewModal = ({
  open,
  onClose,
  invoiceId,
  refetch,
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
    setError("");

    api.get(`/inventory-invoices/${invoiceId}/`)
      .then(res => setInvoice(res.data.inventory_invoice))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));

  }, [open, invoiceId]);

  if (!open) return null;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED"
    }).format(val || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handlePost = async () => {
    setProcessing(true);
    setError("");
    try {
      await api.post(`/inventory-invoices/${invoiceId}/post/`);
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
        `/inventory-invoices/${invoiceId}/mark-paid/`,
        { payment_method: paymentMethod }
      );
      refetch?.();
      setPaymentModalOpen(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to mark as paid");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <ViewEditModal
        open={open}
        onClose={onClose}
        title="Inventory Purchase Invoice"
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
          <>
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                    <i className="fas fa-truck text-white text-xl"></i>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-[#1f221f] flex items-center gap-3">
                      #{invoice.number}
                      <StatusBadge status={invoice.status} />
                    </h1>
                    <p className="text-sm text-[#4a636e] flex items-center gap-2">
                      <i className="fas fa-building text-blue2/70 text-xs"></i>
                      Vendor: {invoice.vendor_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8b8f8c]">Invoice Date</p>
                  <p className="text-sm font-medium text-[#1f221f]">{formatDate(invoice.date)}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mb-6">
              <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue2/10 flex items-center justify-center">
                    <i className="fas fa-calendar text-blue2"></i>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b8f8c] uppercase tracking-wide">Invoice Date</p>
                    <p className="text-base font-semibold text-[#1f221f]">{formatDate(invoice.date)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#d9a44a]/10 flex items-center justify-center">
                    <i className="fas fa-clock text-[#d9a44a]"></i>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b8f8c] uppercase tracking-wide">Due Date</p>
                    <p className="text-base font-semibold text-[#1f221f]">{formatDate(invoice.due_date)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-blue2/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <i className="fas fa-hashtag text-purple-600"></i>
                  </div>
                  <div>
                    <p className="text-xs text-[#8b8f8c] uppercase tracking-wide">Items</p>
                    <p className="text-base font-semibold text-[#1f221f]">{invoice.items?.length || 0} items</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="px-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
                <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-list text-[#d9a44a] text-xs"></i>
                  Invoice Items
                </h3>
              </div>

              <div className="border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-[#f6f6f4] to-white border-b border-[#e5e7eb]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#4a636e] uppercase tracking-wider">Item</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[#4a636e] uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[#4a636e] uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[#4a636e] uppercase tracking-wider">VAT</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[#4a636e] uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e7eb]">
                      {invoice.items.map((item, i) => (
                        <tr key={i} className="hover:bg-blue2/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-blue2/10 flex items-center justify-center">
                                <i className="fas fa-box text-blue2 text-xs"></i>
                              </div>
                              <span className="font-medium text-[#1f221f]">{item.item_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono text-[#4a636e]">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-3 text-right font-mono text-[#d9a44a]">{formatCurrency(item.vat_amount)}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-blue2">
                            {formatCurrency(Number(item.amount) + Number(item.vat_amount))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="px-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-blue2 rounded-full"></div>
                <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-calculator text-blue2 text-xs"></i>
                  Invoice Summary
                </h3>
              </div>

              <div className="bg-gradient-to-br from-white to-[#f6f6f4] rounded-xl border border-[#e5e7eb] p-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm py-1">
                    <span className="text-[#4a636e]">Subtotal</span>
                    <span className="font-mono font-medium text-[#1f221f]">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1">
                    <span className="text-[#4a636e]">VAT (5%)</span>
                    <span className="font-mono font-medium text-[#d9a44a]">{formatCurrency(invoice.vat)}</span>
                  </div>
                  <div className="border-t border-[#e5e7eb] border-dashed my-2 pt-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#1f221f] text-base">Total Amount</span>
                    <span className="text-2xl font-bold text-blue2">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-[#8b8f8c]">
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-fingerprint text-[10px]"></i>
                  Invoice ID: {invoice.id}
                </span>
                {invoice.created_at && (
                  <>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span className="flex items-center gap-1.5">
                      <i className="fas fa-calendar-alt text-[10px]"></i>
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

                {invoice?.status === "draft" && (
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
                        <i className="fas fa-check-circle mr-2"></i>
                        Post Invoice
                      </>
                    )}
                  </button>
                )}

                {invoice?.status === "posted" && (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="inline-flex items-center px-5 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <i className="fas fa-check-double mr-2"></i>
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </ViewEditModal>

      {/* Payment Modal */}
      {paymentModalOpen && invoice && (
        <ViewEditModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title="Vendor Payment"
          width="max-w-md"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                <i className="fas fa-credit-card text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1f221f]">Process Payment</h2>
                <p className="text-xs text-[#8b8f8c]">Select payment method for invoice #{invoice.number}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="bg-gradient-to-br from-white to-[#f6f6f4] rounded-xl border border-[#e5e7eb] p-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-[#4a636e]">Invoice Number</span>
                  <span className="font-medium text-[#1f221f]">#{invoice.number}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-[#e5e7eb] pt-2">
                  <span className="text-sm text-[#4a636e]">Total Amount</span>
                  <span className="text-xl font-bold text-blue2">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#4a636e]">
                <i className="fas fa-credit-card text-blue2/70 text-xs"></i>
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border-2 border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm text-[#1f221f] focus:border-blue2 focus:ring-2 focus:ring-blue2/20 transition-all bg-white"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 flex items-center justify-end gap-3">
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

export default InventoryInvoiceViewModal;

const StatusBadge = ({ status }) => {
  const styles = {
    draft: "bg-amber-50 text-amber-600 border-amber-200",
    posted: "bg-blue-50 text-blue-600 border-blue-200",
    paid: "bg-green-50 text-green-600 border-green-200",
  };

  const icons = {
    draft: "fa-clock",
    posted: "fa-check-circle",
    paid: "fa-check-double",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <i className={`fas ${icons[status]} text-xs`}></i>
      {status?.toUpperCase()}
    </span>
  );
};