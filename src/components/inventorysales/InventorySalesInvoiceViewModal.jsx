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
      currency: "AED"
    }).format(val || 0);

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

  return (
    <>
      <ViewEditModal
        open={open}
        onClose={onClose}
        title="Inventory Sales Invoice"
        width="max-w-6xl"
      >

        {loading ? (
          <div className="py-20 text-center">Loading...</div>
        ) : !invoice ? (
          <div className="py-20 text-center text-red-500">
            Invoice not found
          </div>
        ) : (
          <div className="space-y-6 px-6 py-6">

            {error && (
              <div className="bg-red-50 border text-red-600 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  #{invoice.number}
                </h2>
                <div className="text-sm text-gray-600">
                  Customer: {invoice.customer?.name}
                </div>
              </div>

              <StatusBadge status={invoice.status} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Invoice Date</div>
                <div>{new Date(invoice.date).toLocaleDateString()}</div>
              </div>

              <div>
                <div className="text-gray-500">Due Date</div>
                <div>
                  {invoice.due_date
                    ? new Date(invoice.due_date).toLocaleDateString()
                    : "—"}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border rounded-xl overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">VAT</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        {item.item_name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.vat_amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(
                          Number(item.line_amount) +
                          Number(item.vat_amount)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="text-right space-y-1">
              <div>Subtotal: {formatCurrency(invoice.subtotal)}</div>
              <div>VAT: {formatCurrency(invoice.vat)}</div>
              <div className="text-lg font-bold">
                Total: {formatCurrency(invoice.total)}
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-between items-center">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Close
          </button>

          {invoice?.status?.toLowerCase() === "draft" && (
            <button
              onClick={handlePost}
              disabled={processing}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg"
            >
              {processing ? "Posting..." : "Post Invoice"}
            </button>
          )}

          {invoice?.status?.toLowerCase() === "posted" && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="px-5 py-2 bg-green-600 text-white rounded-lg"
            >
              Mark as Paid
            </button>
          )}

          {invoice?.status?.toLowerCase() === "paid" && (
            <div className="text-green-600 font-semibold">
              ✓ Payment Completed
            </div>
          )}

        </div>

      </ViewEditModal>


      {/* Payment Modal */}
      {paymentModalOpen && (
        <ViewEditModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title="Receive Payment"
          width="max-w-md"
        >
          <div className="px-6 py-6 space-y-5">

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Select Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
              </select>
            </div>

            <div className="text-right font-semibold">
              Amount: {formatCurrency(invoice?.total)}
            </div>

          </div>

          <div className="border-t px-6 py-4 flex justify-end gap-3">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleMarkPaid}
              disabled={processing}
              className="px-5 py-2 bg-green-600 text-white rounded-lg"
            >
              {processing ? "Processing..." : "Confirm Payment"}
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
    draft: "bg-yellow-100 text-yellow-700",
    posted: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700"
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full ${styles[status]}`}>
      {status?.toUpperCase()}
    </span>
  );
};