import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const InvoiceAdjustmentViewModal = ({
  open,
  onClose,
  adjustmentId,
}) => {

  const [adjustment, setAdjustment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAccount, setPaymentAccount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  useEffect(() => {
    if (!open || !adjustmentId) return;

    setLoading(true);

    api
      .get(`/invoice-adjustments/${adjustmentId}/`)
      .then(res => {
        if (res.data.success) {
          setAdjustment(res.data.adjustment);
        }
      })
      .finally(() => setLoading(false));

  }, [open, adjustmentId]);

  // Fetch accounts when payment modal opens
  useEffect(() => {
    if (showPaymentModal) {
      setLoadingAccounts(true);
      api.get("/accounts/list/")
        .then((res) => {
          const allAccounts = res.data.rows || res.data.accounts || [];
          // Filter for cash (1010) and bank (1020) accounts
          const paymentAccounts = allAccounts.filter(acc => 
            acc.code === "1010" || acc.code === "1020"
          );
          setAccounts(paymentAccounts);
        })
        .catch((err) => {
          console.error("Error fetching accounts:", err);
        })
        .finally(() => setLoadingAccounts(false));
    }
  }, [showPaymentModal]);

  if (!open) return null;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-AE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleMarkPaid = async () => {
    if (!paymentAccount) {
      alert("Please select a payment account");
      return;
    }

    try {
      setPaying(true);

      await api.post(
        `/invoice-adjustments/${adjustment.id}/mark-paid/`,
        { 
          payment_account: paymentAccount 
        }
      );

      setAdjustment({
        ...adjustment,
        status: "paid"
      });
      
      setShowPaymentModal(false);
      setPaymentAccount("");

    } catch (err) {
      alert(err.response?.data?.error || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const getTypeStyles = () => {
    if (!adjustment) return "";
    return adjustment.document_type === "CREDIT_NOTE"
      ? "bg-red-50 text-red-600 border-red-200"
      : "bg-green-50 text-green-600 border-green-200";
  };

  const getTypeIcon = () => {
    if (!adjustment) return "";
    return adjustment.document_type === "CREDIT_NOTE"
      ? "fas fa-minus-circle"
      : "fas fa-plus-circle";
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'posted': 'bg-blue-100 text-blue-700 border-blue-200',
      'paid': 'bg-green-100 text-green-700 border-green-200',
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Adjustment Details"
      width="max-w-6xl"
    >
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1f221f] flex items-center gap-2">
                  <i className="fas fa-credit-card text-blue2"></i>
                  Record Payment
                </h3>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-[#8b8f8c] hover:text-[#1f221f] transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <p className="text-sm text-[#8b8f8c] mt-1">
                {adjustment?.document_type === "CREDIT_NOTE" 
                  ? "Record payment received for this credit note" 
                  : "Record payment made for this debit note"}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Account Selection */}
              <div>
                <label className="text-xs font-medium text-[#4a636e] uppercase tracking-wide mb-2 block">
                  Payment Account <span className="text-[#d95a4a]">*</span>
                </label>
                
                {loadingAccounts ? (
                  <div className="py-4 text-center">
                    <div className="w-8 h-8 border-4 border-blue2/20 border-t-blue2 rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="py-4 text-center border border-gray-200 rounded-lg">
                    <p className="text-sm text-[#8b8f8c]">No payment accounts found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {accounts.map((account) => (
                      <label
                        key={account.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          paymentAccount === account.id
                            ? "border-blue2 bg-blue2/5"
                            : "border-gray-200 hover:border-blue2/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentAccount"
                          value={account.id}
                          checked={paymentAccount === account.id}
                          onChange={(e) => setPaymentAccount(e.target.value)}
                          className="w-4 h-4 text-blue2 border-gray-300 focus:ring-blue2"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-[#1f221f]">{account.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue2/10 text-blue2">
                              {account.code === "1010" ? "Cash" : "Bank"}
                            </span>
                          </div>
                          <p className="text-xs text-[#8b8f8c] mt-0.5">
                            Balance: {formatCurrency(account.balance || 0)}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount Summary */}
              <div className="bg-gradient-to-br from-[#f6f6f4] to-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#4a636e]">Payment Amount</span>
                  <span className="text-xl font-bold text-[#1f221f]">
                    {formatCurrency(adjustment?.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-[#f6f6f4]/50 flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-sm font-medium text-[#4a636e] hover:text-[#1f221f] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                disabled={!paymentAccount || paying}
                className="inline-flex items-center px-5 py-2 bg-blue2 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#4a636e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {paying ? (
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
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-exchange-alt absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-[#8b8f8c] font-medium">Loading adjustment details…</p>
          </div>
        </div>
      ) : !adjustment ? (
        <div className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d95a4a]/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-[#d95a4a] text-3xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-[#1f221f] mb-2">Adjustment not found</h3>
          <p className="text-[#8b8f8c] text-sm mb-4">The adjustment you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue2 rounded-lg hover:bg-[#4a636e] transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ===== HEADER ===== */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                    adjustment.document_type === "CREDIT_NOTE" 
                      ? "from-red-500 to-red-600" 
                      : "from-green-500 to-green-600"
                  } text-white flex items-center justify-center text-2xl font-bold shadow-lg`}>
                    <i className={`${getTypeIcon()} text-2xl`}></i>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue2 to-[#4a636e] rounded-full border-2 border-white flex items-center justify-center">
                    <i className="fas fa-search text-xs text-white"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getTypeStyles()}`}>
                      <i className={`${getTypeIcon()} text-xs`}></i>
                      {adjustment.document_type === "CREDIT_NOTE" ? "Credit Note" : "Debit Note"}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(adjustment.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        adjustment.status?.toLowerCase() === 'paid' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></span>
                      {adjustment.status || '—'}
                    </span>
                    <span className="text-xs text-[#8b8f8c]">
                      <i className="fas fa-calendar-alt mr-1"></i>
                      {formatDate(adjustment.date)}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-[#1f221f] mb-1">
                    {adjustment.number}
                  </h1>

                  <div className="flex flex-wrap gap-3 mt-1">
                    {adjustment.original_invoice && (
                      <span className="inline-flex items-center gap-1.5 text-[#4a636e] bg-white/60 px-3 py-1 rounded-full border border-gray-200">
                        <i className="fas fa-file-invoice text-blue2 text-xs"></i>
                        Original Invoice: {adjustment.original_invoice.number}
                      </span>
                    )}

                    {adjustment.customer?.name && (
                      <span className="inline-flex items-center gap-1.5 text-[#4a636e] bg-white/60 px-3 py-1 rounded-full border border-gray-200">
                        <i className="fas fa-building text-blue2 text-xs"></i>
                        {adjustment.customer.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Total Amount Badge */}
              <div className="flex flex-col items-end">
                <span className="text-sm text-[#8b8f8c]">Total Amount</span>
                <span className={`text-3xl font-bold ${
                  adjustment.document_type === "CREDIT_NOTE" ? "text-red-600" : "text-green-600"
                }`}>
                  {adjustment.document_type === "CREDIT_NOTE" ? "−" : "+"} {formatCurrency(adjustment.total)}
                </span>
                {adjustment.remaining_balance !== null && (
                  <span className="text-xs text-[#8b8f8c] mt-1">
                    Remaining: {formatCurrency(adjustment.remaining_balance)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ===== ITEMS ===== */}
<div>
  <div className="flex items-center gap-2 mb-4">
    <div className="w-1 h-5 bg-blue2 rounded-full"></div>
    <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
      <i className="fas fa-boxes text-blue2"></i>
      Adjustment Items
    </h3>
  </div>

  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#f6f6f4] border-b border-gray-200 text-xs font-medium text-[#4a636e] uppercase tracking-wider">
      <div className="col-span-6">Description</div>
      <div className="col-span-2 text-right">Quantity</div>
      <div className="col-span-2 text-right">Unit Price</div>
      <div className="col-span-2 text-right">Amount</div>
    </div>

    {adjustment.items?.map((item, idx) => {
      const lineTotal = item.quantity * item.price;
      const vatAmount = item.vat_included ? lineTotal * 0.05 : 0;
      
      return (
        <div key={idx} className="px-4 py-3 border-b last:border-0 hover:bg-blue2/5 transition-colors">
          {/* Main Row */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <p className="font-medium text-[#1f221f]">{item.description}</p>
            </div>
            <div className="col-span-2 text-right font-medium text-[#1f221f]">{item.quantity}</div>
            <div className="col-span-2 text-right font-medium text-[#1f221f]">{formatCurrency(item.price)}</div>
            <div className="col-span-2 text-right font-semibold text-[#1f221f]">
              {formatCurrency(lineTotal)}
            </div>
          </div>
          
          {/* Badges Row - moved below */}
          <div className="grid grid-cols-12 gap-4 mt-1">
            <div className="col-span-6 flex items-center gap-2">
              {item.type === "inventory" && item.sku && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-blue2/10 text-blue2 px-2 py-0.5 rounded-full">
                  <i className="fas fa-box text-[8px]"></i>
                  SKU: {item.sku}
                </span>
              )}
              {item.vat_included && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  <i className="fas fa-percent text-[8px]"></i>
                  VAT: {formatCurrency(vatAmount)}
                </span>
              )}
            </div>
            <div className="col-span-2"></div>
            <div className="col-span-2"></div>
            <div className="col-span-2"></div>
          </div>
        </div>
      );
    })}
  </div>
</div>

          {/* ===== TOTALS ===== */}
          <div className="flex justify-end">
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
                  <span className="font-medium text-[#1f221f]">{formatCurrency(adjustment.subtotal)}</span>
                </div>

                {adjustment.vat > 0 && (
                  <div className="flex justify-between items-center text-sm py-2 border-b border-[#e5e7eb]">
                    <span className="text-[#4a636e]">VAT (5%)</span>
                    <span className="font-medium text-[#d9a44a]">{formatCurrency(adjustment.vat)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-[#1f221f]">Total</span>
                  <span className={`text-2xl font-bold ${
                    adjustment.document_type === "CREDIT_NOTE" ? "text-red-600" : "text-green-600"
                  }`}>
                    {adjustment.document_type === "CREDIT_NOTE" ? "−" : "+"} {formatCurrency(adjustment.total)}
                  </span>
                </div>

                {adjustment.remaining_balance !== null && (
                  <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#4a636e]">Remaining Invoice Balance</span>
                      <span className="font-medium text-[#1f221f]">
                        {formatCurrency(adjustment.remaining_balance)}
                      </span>
                    </div>
                  </div>
                )}

                {/* VAT Summary Info */}
                {adjustment.items?.some(item => item.vat_included) && (
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-xs text-[#8b8f8c]">
                    <p className="flex items-center gap-1">
                      <i className="fas fa-info-circle text-blue2/70"></i>
                      VAT applied to marked items only
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="border-t border-[#e5e7eb] bg-[#f6f6f4]/50 px-6 py-4 -mb-6 -mx-6 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#8b8f8c]">
              <span className="flex items-center gap-1.5">
                <i className="fas fa-fingerprint text-[10px]"></i>
                ID: {adjustmentId}
              </span>
              {adjustment.created_at && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-calendar-plus text-[10px]"></i>
                    Created {formatDate(adjustment.created_at)}
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {adjustment.status === "paid" ? (
                <span className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-sm font-medium text-green-700">
                  <i className="fas fa-check-circle mr-2"></i>
                  Paid
                </span>
              ) : (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={paying}
                  className="inline-flex items-center px-4 py-2 bg-blue2 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#4a636e] transition-colors shadow-sm"
                >
                  <i className="fas fa-credit-card mr-2"></i>
                  Record Payment
                </button>
              )}

              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-[#4a636e] hover:bg-[#f6f6f4] hover:border-gray-400 transition-colors"
              >
                <i className="fas fa-times mr-2"></i>
                Close
              </button>
            </div>
          </div>

        </div>
      )}
    </ViewEditModal>
  );
};

export default InvoiceAdjustmentViewModal;