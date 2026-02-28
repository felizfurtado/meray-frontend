import React, { useEffect, useState } from "react";
import ViewEditModal from "../layout/ViewEditModal";
import api from "../../api/api";

const ExpenseInvoiceViewModal = ({
  open,
  onClose,
  invoiceId,
  refetchInvoices,
}) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    if (!open || !invoiceId) return;

    setLoading(true);

    api
      .get(`/expense-invoices/${invoiceId}/`)
      .then((res) => setInvoice(res.data.invoice))
      .catch((err) => {
        console.error("Failed to fetch invoice", err);
        setInvoice(null);
      })
      .finally(() => setLoading(false));
  }, [open, invoiceId]);

  if (!open) return null;

  if (loading || !invoice) {
    return (
      <ViewEditModal open={open} onClose={onClose}>
        <div className="py-20 text-center text-[#8b8f8c]">
          Loading invoice...
        </div>
      </ViewEditModal>
    );
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  const markPaid = async () => {
    try {
      setMarkingPaid(true);

      await api.post(
        `/expense-invoices/${invoiceId}/mark-paid/`
      );

      setInvoice((prev) => ({
        ...prev,
        status: "Paid",
      }));

      refetchInvoices?.();
    } catch (err) {
      console.error("Failed to mark invoice paid", err);
    } finally {
      setMarkingPaid(false);
    }
  };

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title={`${invoice.invoice_number} - ${invoice.vendor?.company || ""}`}
      width="max-w-6xl"
    >
      {/* HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-2xl border border-blue2/20 p-6 mb-6">
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1f221f]">
              {invoice.invoice_number}
            </h1>
            <p className="text-sm text-[#8b8f8c]">
              {invoice.vendor?.company}
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
              invoice.status === "Paid"
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-yellow-50 text-yellow-600 border border-yellow-200"
            }`}
          >
            <i
              className={`fas ${
                invoice.status === "Paid"
                  ? "fa-check-circle"
                  : "fa-clock"
              }`}
            />
            {invoice.status}
          </div>
        </div>
      </div>

      {/* BASIC INFO */}
      {/* BASIC INFO */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  <Info label="Invoice Date" value={invoice.date} />
  <Info label="Due Date" value={invoice.due_date} />
</div>



      {/* LINE ITEMS */}
      {/* LINE ITEMS */}
<div className="border rounded-2xl overflow-hidden mb-8 shadow-sm bg-white">
  <div className="grid grid-cols-6 bg-[#f6f6f4] p-4 text-sm font-semibold text-[#4a636e]">
    <div>Product</div>
    <div className="text-center">Qty</div>
    <div className="text-right">Unit Price</div>
    <div className="text-right">Base</div>
    <div className="text-right">VAT</div>
    <div className="text-right">Total</div>
  </div>

  {invoice.items?.map((item, i) => (
    <div
      key={i}
      className="grid grid-cols-6 p-4 border-t text-sm items-center"
    >
      <div className="font-medium text-[#1f221f]">
        {item.product_name || "-"}
      </div>

      <div className="text-center">
        {item.quantity}
      </div>

      <div className="text-right">
        {formatCurrency(item.unit_price)}
      </div>

      <div className="text-right">
        {formatCurrency(item.line_amount)}
      </div>

      <div className="text-right text-orange-600">
        {formatCurrency(item.vat_amount)}
      </div>

      <div className="text-right font-semibold text-blue2">
        {formatCurrency(item.total)}
      </div>
    </div>
  ))}
</div>


      
{/* AMOUNT SUMMARY CARD */}
<div className="bg-gradient-to-br from-[#f6f6f4] to-white rounded-2xl p-6 border shadow-sm mb-8">
  <h3 className="text-sm font-semibold text-[#1f221f] mb-4 flex items-center gap-2">
    <i className="fas fa-calculator text-blue2"></i>
    Amount Summary
  </h3>

  <div className="space-y-3">
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Subtotal</span>
      <span className="font-medium">
        {formatCurrency(invoice.amount)}
      </span>
    </div>

    <div className="flex justify-between text-sm">
      <span className="text-gray-500">VAT (5%)</span>
      <span className="font-medium text-orange-600">
        {formatCurrency(invoice.vat_amount)}
      </span>
    </div>

    <div className="border-t pt-3 flex justify-between text-lg font-bold">
      <span>Total Amount</span>
      <span className="text-blue2">
        {formatCurrency(invoice.total_amount)}
      </span>
    </div>
  </div>
</div>

   

      {/* VENDOR INFO */}
      <div className="border rounded-2xl p-6 bg-white shadow-sm">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-building text-blue2"></i>
          Linked Vendor
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Info label="Vendor Name" value={invoice.vendor?.company} />
          <Info label="Email" value={invoice.vendor?.email} />
          <Info label="Phone" value={invoice.vendor?.phone} />
        </div>
      </div>

      {/* ACCOUNTING ENTRIES */}
<div className="mt-8 bg-white border rounded-2xl p-6 shadow-sm">
  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
    <i className="fas fa-book text-blue2"></i>
    Accounting Entries
  </h3>

  <div className="border rounded-xl overflow-hidden">
    <div className="grid grid-cols-3 bg-[#f6f6f4] p-3 text-sm font-semibold">
      <div>Account</div>
      <div className="text-right">Debit</div>
      <div className="text-right">Credit</div>
    </div>

    {/* Expense Entry */}
    <div className="grid grid-cols-3 p-3 border-t text-sm">
      <div>Expense Account</div>
      <div className="text-right">
        {formatCurrency(invoice.amount)}
      </div>
      <div className="text-right">-</div>
    </div>

    {/* VAT Entry */}
    {Number(invoice.vat_amount) > 0 && (
      <div className="grid grid-cols-3 p-3 border-t text-sm">
        <div>Input VAT</div>
        <div className="text-right">
          {formatCurrency(invoice.vat_amount)}
        </div>
        <div className="text-right">-</div>
      </div>
    )}

    {/* Payable Entry */}
    <div className="grid grid-cols-3 p-3 border-t text-sm font-semibold">
      <div>Accounts Payable</div>
      <div className="text-right">-</div>
      <div className="text-right">
        {formatCurrency(invoice.total_amount)}
      </div>
    </div>

    {/* If Paid */}
    {invoice.status === "Paid" && (
      <>
        <div className="grid grid-cols-3 p-3 border-t text-sm">
          <div>Accounts Payable</div>
          <div className="text-right">
            {formatCurrency(invoice.total_amount)}
          </div>
          <div className="text-right">-</div>
        </div>

        <div className="grid grid-cols-3 p-3 border-t text-sm font-semibold">
          <div>Bank / Cash</div>
          <div className="text-right">-</div>
          <div className="text-right">
            {formatCurrency(invoice.total_amount)}
          </div>
        </div>
      </>
    )}
  </div>
</div>


      {/* FOOTER */}
      <div className="flex justify-between items-center mt-8 border-t pt-4">
        <span className="text-xs text-gray-500">
          Invoice ID: {invoice.id}
        </span>

        {invoice.status === "Pending" && (
          <button
            onClick={markPaid}
            disabled={markingPaid}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {markingPaid ? "Updating..." : "Mark as Paid"}
          </button>
        )}
      </div>
    </ViewEditModal>
  );
};

export default ExpenseInvoiceViewModal;




const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium">
      {typeof value === "object"
        ? JSON.stringify(value)
        : value || "-"}
    </p>
  </div>
);
