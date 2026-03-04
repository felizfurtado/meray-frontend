import React, { useState, useMemo } from "react";
import Table from "../layout/Table";
import api from "../../api/api";

const InventoryInvoiceTable = ({
  data,
  schema,
  loading,
  sidebarCollapsed,
  refetch,
  onView
}) => {

  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* ================= FORMATTERS ================= */

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(val || 0));

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

  const getStatusStyle = (status) => {
    const map = {
      draft: "bg-amber-100 text-amber-700 border-amber-200",
      posted: "bg-blue-100 text-blue-700 border-blue-200",
      paid: "bg-green-100 text-green-700 border-green-200",
    };
    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  /* ================= DELETE ================= */

  const deleteInvoice = async (row) => {
    if (row.status !== "draft") {
      alert("Only draft invoices can be deleted.");
      return;
    }

    if (!window.confirm(`Delete invoice ${row.number}?`)) return;

    setDeletingId(row.id);
    try {
      await api.delete(`/inventory-invoices/${row.id}/delete/`);
      refetch?.();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= DOWNLOAD ================= */

  const downloadInvoice = async (row) => {
    try {
      setDownloadingId(row.id);

      const response = await api.get(
        `/inventory-invoices/${row.id}/pdf/`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `PurchaseInvoice-${row.number}.pdf`;
      link.click();

    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloadingId(null);
    }
  };

  /* ================= BUILD COLUMNS ================= */

  const columns = useMemo(() => {

    const baseCols = [];

    // Number column
    if (schema?.table_columns?.includes("number")) {
      baseCols.push({
        field: "number",
        header: "INVOICE #",
        width: "150px",
        render: (value) => (
          <span className="font-medium text-blue2">{value || "—"}</span>
        )
      });
    }

    // Date column
    if (schema?.table_columns?.includes("date")) {
      baseCols.push({
        field: "date",
        header: "DATE",
        width: "120px",
        render: (value) => (
          <span className="text-[#4a636e] text-sm">{formatDate(value)}</span>
        )
      });
    }

    // Vendor column
    if (schema?.table_columns?.includes("vendor_name")) {
      baseCols.push({
        field: "vendor_name",
        header: "VENDOR",
        width: "200px",
        render: (value) => (
          <span className="text-[#1f221f] font-medium">{value || "—"}</span>
        )
      });
    }

    // Status column
    if (schema?.table_columns?.includes("status")) {
      baseCols.push({
        field: "status",
        header: "STATUS",
        width: "120px",
        render: (value) => (
          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${getStatusStyle(value)}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              value?.toLowerCase() === 'posted' ? 'bg-blue-500' :
              value?.toLowerCase() === 'draft' ? 'bg-amber-500' :
              value?.toLowerCase() === 'paid' ? 'bg-green-500' :
              'bg-gray-500'
            }`}></span>
            {value?.toUpperCase() || "—"}
          </span>
        )
      });
    }

    // Subtotal column
    if (schema?.table_columns?.includes("subtotal")) {
      baseCols.push({
        field: "subtotal",
        header: "SUBTOTAL",
        width: "140px",
        render: (value) => (
          <span className="font-mono font-medium text-[#1f221f]">{formatCurrency(value)}</span>
        )
      });
    }

    // VAT column
    if (schema?.table_columns?.includes("vat")) {
      baseCols.push({
        field: "vat",
        header: "VAT",
        width: "120px",
        render: (value) => (
          <span className="font-mono font-medium text-[#d9a44a]">{formatCurrency(value)}</span>
        )
      });
    }

    // Total column
    if (schema?.table_columns?.includes("total")) {
      baseCols.push({
        field: "total",
        header: "TOTAL",
        width: "140px",
        render: (value) => (
          <span className="font-mono font-bold text-blue2">{formatCurrency(value)}</span>
        )
      });
    }

    // Add any additional columns from schema
    schema?.table_columns?.forEach((key) => {
      // Skip columns we already handled
      if (!["number", "date", "vendor_name", "status", "subtotal", "vat", "total"].includes(key)) {
        baseCols.push({
          field: key,
          header: key.replace(/_/g, " ").toUpperCase(),
          width: "auto",
          render: (value) => {
            // Special handling for currency fields
            if (["amount", "price", "cost"].some(term => key.includes(term))) {
              return <span className="font-mono">{formatCurrency(value)}</span>;
            }
            // Special handling for date fields
            if (key.includes("date") || key.includes("_at")) {
              return <span className="text-[#4a636e] text-sm">{formatDate(value)}</span>;
            }
            return value ?? "—";
          }
        });
      }
    });

    // Actions column
    baseCols.push({
      field: "actions",
      header: "ACTIONS",
      width: "220px",
      render: (_, row) => (
        <div className="flex items-center justify-left gap-2">
         

          {/* VIEW */}
          <button
            onClick={() => onView?.(row)}
            className="group relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="View Invoice"
          >
            <i className="fas fa-eye text-sm"></i>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              View
            </span>
          </button>

          {/* DOWNLOAD */}
          <button
            onClick={() => downloadInvoice(row)}
            disabled={downloadingId === row.id}
            className="group relative p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download PDF"
          >
            {downloadingId === row.id ? (
              <i className="fas fa-spinner fa-spin text-sm"></i>
            ) : (
              <i className="fas fa-download text-sm"></i>
            )}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Download
            </span>
          </button>

          {/* DELETE (Draft only) */}
          {row.status === "draft" && (
            <button
              onClick={() => deleteInvoice(row)}
              disabled={deletingId === row.id}
              className="group relative p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete Invoice"
            >
              {deletingId === row.id ? (
                <i className="fas fa-spinner fa-spin text-sm"></i>
              ) : (
                <i className="fas fa-trash-alt text-sm"></i>
              )}
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Delete
              </span>
            </button>
          )}
        </div>
      ),
    });

    return baseCols;

  }, [schema, downloadingId, deletingId]);

  /* ================= RENDER ================= */

  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue2/5 to-[#a9c0c9]/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-500/5 to-transparent rounded-full -ml-20 -mb-20"></div>
      </div>

      {/* Main Table */}
      <div className="relative">
        <Table
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                <span className="text-white text-lg">
                  <i className="fas fa-shopping-cart"></i>
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1f221f]">{schema?.name || "Purchase Invoices"}</h2>
                <p className="text-xs text-[#8b8f8c]">Manage purchase invoices and track vendor payments</p>
              </div>
            </div>
          }
          icon={schema?.icon || "🧾"}
          columns={columns}
          data={data}
          loading={loading}
          sidebarCollapsed={sidebarCollapsed}
          onRowClick={(row) => onView?.(row)}
          searchPlaceholder="Search by invoice number, vendor, or amount..."
          pageSize={schema?.page_size || 10}
          defaultSort={schema?.default_sort}
          emptyMessage={
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <i className="fas fa-shopping-cart text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-[#1f221f] mb-1">No purchase invoices found</h3>
              <p className="text-sm text-[#8b8f8c]">Get started by creating your first purchase invoice</p>
            </div>
          }
          rowClassName="hover:bg-gradient-to-r hover:from-blue2/5 hover:to-transparent transition-all duration-200 cursor-pointer group"
          headerClassName="bg-gradient-to-r from-gray-50 to-white border-b-2 border-[#e5e7eb] text-xs font-semibold text-[#4a636e] uppercase tracking-wider"
        />
      </div>
    </div>
  );
};

export default InventoryInvoiceTable;