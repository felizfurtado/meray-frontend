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

  if (!open) return null;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(val || 0);

  const getTypeStyles = () => {
    if (!adjustment) return "";
    return adjustment.document_type === "CREDIT_NOTE"
      ? "bg-red-50 text-red-600 border-red-200"
      : "bg-green-50 text-green-600 border-green-200";
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title="Adjustment Details"
      width="max-w-6xl"
    >
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-14 h-14 border-4 border-blue2/20 border-t-blue2 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#8b8f8c]">Loading adjustment...</p>
        </div>
      ) : !adjustment ? (
        <div className="py-24 text-center text-[#d95a4a] font-medium">
          Adjustment not found
        </div>
      ) : (
        <div className="space-y-8">

          {/* ===== HEADER ===== */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6">
            <div className="flex justify-between items-start flex-wrap gap-4">

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTypeStyles()}`}>
                    {adjustment.document_type === "CREDIT_NOTE"
                      ? "Credit Note"
                      : "Debit Note"}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-[#1f221f]">
                  {adjustment.number}
                </h2>

                {adjustment.original_invoice && (
                  <p className="text-sm text-[#4a636e] mt-1">
                    Linked to Invoice:
                    <span className="font-medium ml-1">
                      {adjustment.original_invoice.number}
                    </span>
                  </p>
                )}

                {adjustment.customer?.name && (
                  <p className="text-sm text-[#4a636e] mt-1">
                    Customer:
                    <span className="font-medium ml-1">
                      {adjustment.customer.name}
                    </span>
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm text-[#8b8f8c]">Total</p>
                <p className="text-3xl font-bold text-[#1f221f]">
                  {formatCurrency(adjustment.total)}
                </p>
              </div>

            </div>
          </div>

          {/* ===== ITEMS ===== */}
          <div>
            <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
              <i className="fas fa-boxes text-blue2"></i>
              Adjustment Items
            </h3>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#f6f6f4] border-b text-xs font-medium text-[#4a636e] uppercase tracking-wider">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>

              {adjustment.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b last:border-0 hover:bg-blue2/5 transition"
                >
                  <div className="col-span-6 font-medium text-[#1f221f]">
                    {item.description}
                  </div>
                  <div className="col-span-2 text-right text-[#1f221f]">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-[#1f221f]">
                    {formatCurrency(item.price)}
                  </div>
                  <div className="col-span-2 text-right font-semibold text-[#1f221f]">
                    {formatCurrency(item.quantity * item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== TOTALS ===== */}
          <div className="flex justify-end">
            <div className="w-full bg-[#f6f6f4] rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="space-y-3">

                <div className="flex justify-between text-sm">
                  <span className="text-[#4a636e]">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(adjustment.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#4a636e]">VAT (5%)</span>
                  <span className="font-medium">
                    {formatCurrency(adjustment.vat)}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(adjustment.total)}</span>
                </div>

                {adjustment.remaining_balance !== null && (
                  <div className="flex justify-between pt-3 border-t text-sm text-[#4a636e]">
                    <span>Remaining Invoice Balance</span>
                    <span className="font-medium">
                      {formatCurrency(adjustment.remaining_balance)}
                    </span>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="border-t pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-[#4a636e] hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>

        </div>
      )}
    </ViewEditModal>
  );
};

export default InvoiceAdjustmentViewModal;
