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

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

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

  const markPaid = async () => {
    try {
      setMarkingPaid(true);

      await api.post(`/expense-invoices/${invoiceId}/mark-paid/`);

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

  if (loading || !invoice) {
    return (
      <ViewEditModal open={open} onClose={onClose}>
        <div className="py-20 text-center">
          <div className="inline-flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-file-invoice absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-lg"></i>
            </div>
            <p className="mt-4 text-[#8b8f8c] font-medium">Loading invoice details...</p>
          </div>
        </div>
      </ViewEditModal>
    );
  }

  return (
    <ViewEditModal
      open={open}
      onClose={onClose}
      title={`${invoice.invoice_number} - ${invoice.vendor?.company || ""}`}
      width="max-w-6xl"
    >
      {/* HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue2/5 to-[#a9c0c9]/20 rounded-t-2xl border-b border-blue2/20 px-6 py-4 -mt-6 -mx-6 mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/10 to-[#a9c0c9]/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
              <i className="fas fa-file-invoice text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#1f221f] flex items-center gap-3">
                {invoice.invoice_number}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  invoice.status === "Paid"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-amber-50 text-amber-600 border-amber-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    invoice.status === "Paid" ? "bg-green-500" : "bg-amber-500"
                  }`}></span>
                  {invoice.status}
                </span>
              </h1>
              <p className="text-sm text-[#4a636e] flex items-center gap-2">
                <i className="fas fa-building text-blue2/70 text-xs"></i>
                {invoice.vendor?.company}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VENDOR INFO */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#4a636e] rounded-full"></div>
          <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
            <i className="fas fa-building text-[#4a636e] text-xs"></i>
            Vendor Information
          </h3>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue2/10 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-building text-blue2 text-xs"></i>
              </div>
              <div>
                <p className="text-xs text-[#8b8f8c] mb-1">Company</p>
                <p className="text-sm font-medium text-[#1f221f]">{invoice.vendor?.company || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#d9a44a]/10 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-envelope text-[#d9a44a] text-xs"></i>
              </div>
              <div>
                <p className="text-xs text-[#8b8f8c] mb-1">Email</p>
                <p className="text-sm font-medium text-[#1f221f] break-words">{invoice.vendor?.email || "-"}</p>
              </div>
            </div>
            <br></br>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-phone text-green-600 text-xs"></i>
              </div>
              <div>
                <p className="text-xs text-[#8b8f8c] mb-1">Phone</p>
                <p className="text-sm font-medium text-[#1f221f]">{invoice.vendor?.phone || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BASIC INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 mb-6">
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
      </div>

      {/* LINE ITEMS - ENHANCED */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#d9a44a] rounded-full"></div>
          <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
            <i className="fas fa-list text-[#d9a44a] text-xs"></i>
            Line Items
          </h3>
          <span className="text-xs bg-blue2/10 text-blue2 px-2 py-1 rounded-full ml-2">
            {invoice.items?.length || 0} items
          </span>
        </div>

     <div className="border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm bg-white">
  {/* Table Header */}
  <div className="grid grid-cols-12 bg-gradient-to-r from-[#f6f6f4] to-white px-4 py-3 text-xs font-semibold text-[#4a636e] uppercase tracking-wider border-b border-[#e5e7eb]">
    <div className="col-span-4">Product Description</div>
    <div className="col-span-1 text-center">Qty</div>
    <div className="col-span-2 text-right">Unit Price</div>
    <div className="col-span-2 text-right">Base Amount</div>
    <div className="col-span-3 text-right">Total (Inc. VAT)</div>
  </div>

  {/* Table Body */}
  <div className="divide-y divide-[#e5e7eb]">
    {invoice.items?.map((item, i) => (
      <div
        key={i}
        className="grid grid-cols-12 px-4 py-3 text-sm items-center hover:bg-blue2/5 transition-colors group"
      >
        {/* Product Name */}
        <div className="col-span-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue2/10 flex items-center justify-center group-hover:bg-blue2/20 transition-colors flex-shrink-0">
              <i className="fas fa-box text-blue2 text-xs"></i>
            </div>
            <span className="font-medium text-[#1f221f] truncate" title={item.product_name}>
              {item.product_name || "—"}
            </span>
          </div>
        </div>

        {/* Quantity */}
        <div className="col-span-1 text-center">
          <span className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-[#4a636e]">
            {item.quantity}
          </span>
        </div>

        {/* Unit Price */}
        <div className="col-span-2 text-right">
          <span className="font-mono text-[#4a636e]">
            {formatCurrency(item.unit_price)}
          </span>
        </div>

        {/* Base Amount */}
        <div className="col-span-2 text-right">
          <span className="font-mono text-[#4a636e]">
            {formatCurrency(item.line_amount)}
          </span>
        </div>

        {/* Total */}
        <div className="col-span-3 text-right">
          <span className="font-mono font-semibold text-blue2 bg-blue2/5 px-3 py-1.5 rounded-lg">
            {formatCurrency(item.total)}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>
      </div>

      {/* AMOUNT SUMMARY */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-blue2 rounded-full"></div>
          <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
            <i className="fas fa-calculator text-blue2 text-xs"></i>
            Amount Summary
          </h3>
        </div>

        <div className="bg-gradient-to-br from-white to-[#f6f6f4] rounded-xl border border-[#e5e7eb] p-5">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm py-1">
              <span className="text-[#4a636e]">Subtotal</span>
              <span className="font-mono font-medium text-[#1f221f]">
                {formatCurrency(invoice.amount)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm py-1">
              <span className="text-[#4a636e]">VAT (5%)</span>
              <span className="font-mono font-medium text-[#d9a44a]">
                {formatCurrency(invoice.vat_amount)}
              </span>
            </div>

            <div className="border-t border-[#e5e7eb] border-dashed my-2 pt-2"></div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#1f221f] text-base">Total Amount</span>
              <span className="text-2xl font-bold text-blue2">
                {formatCurrency(invoice.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ACCOUNTING ENTRIES */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#4a9b68] rounded-full"></div>
          <h3 className="text-sm font-semibold text-[#1f221f] uppercase tracking-wider flex items-center gap-2">
            <i className="fas fa-book text-[#4a9b68] text-xs"></i>
            Accounting Entries
          </h3>
        </div>

        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-3 bg-gradient-to-r from-[#f6f6f4] to-white p-4 text-xs font-semibold text-[#4a636e] uppercase tracking-wider">
            <div>Account</div>
            <div className="text-right">Debit</div>
            <div className="text-right">Credit</div>
          </div>

          {/* Expense Entry */}
          <div className="grid grid-cols-3 p-4 border-t border-[#e5e7eb] text-sm hover:bg-blue2/5 transition-colors">
            <div className="font-medium text-[#1f221f]">Expense Account</div>
            <div className="text-right font-mono text-green-600">
              {formatCurrency(invoice.amount)}
            </div>
            <div className="text-right font-mono text-[#8b8f8c]">-</div>
          </div>

          {/* VAT Entry */}
          {Number(invoice.vat_amount) > 0 && (
            <div className="grid grid-cols-3 p-4 border-t border-[#e5e7eb] text-sm hover:bg-blue2/5 transition-colors">
              <div className="font-medium text-[#1f221f]">Input VAT</div>
              <div className="text-right font-mono text-green-600">
                {formatCurrency(invoice.vat_amount)}
              </div>
              <div className="text-right font-mono text-[#8b8f8c]">-</div>
            </div>
          )}

          {/* Payable Entry */}
          <div className="grid grid-cols-3 p-4 border-t border-[#e5e7eb] text-sm bg-gray-50 hover:bg-blue2/5 transition-colors">
            <div className="font-semibold text-[#1f221f]">Accounts Payable</div>
            <div className="text-right font-mono text-[#8b8f8c]">-</div>
            <div className="text-right font-mono font-semibold text-rose-600">
              {formatCurrency(invoice.total_amount)}
            </div>
          </div>

          {/* If Paid */}
          {invoice.status === "Paid" && (
            <>
              <div className="grid grid-cols-3 p-4 border-t border-[#e5e7eb] text-sm hover:bg-blue2/5 transition-colors">
                <div className="font-medium text-[#1f221f]">Accounts Payable</div>
                <div className="text-right font-mono text-green-600">
                  {formatCurrency(invoice.total_amount)}
                </div>
                <div className="text-right font-mono text-[#8b8f8c]">-</div>
              </div>

              <div className="grid grid-cols-3 p-4 border-t border-[#e5e7eb] text-sm bg-gray-50 hover:bg-blue2/5 transition-colors">
                <div className="font-semibold text-[#1f221f]">Bank / Cash</div>
                <div className="text-right font-mono text-[#8b8f8c]">-</div>
                <div className="text-right font-mono font-semibold text-rose-600">
                  {formatCurrency(invoice.total_amount)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
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

        {invoice.status !== "Paid" && (
          <button
            onClick={markPaid}
            disabled={markingPaid}
            className="inline-flex items-center px-5 py-2 bg-green-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {markingPaid ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-check-circle mr-2"></i>
                Mark as Paid
              </>
            )}
          </button>
        )}
      </div>
    </ViewEditModal>
  );
};

export default ExpenseInvoiceViewModal;