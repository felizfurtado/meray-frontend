import React, { useState } from "react";
import Table from "../layout/Table";
import api from "../../api/api";

const InvoiceAdjustmentsTable = ({
  adjustments = [],
  loading,
  sidebarCollapsed,
  onView,
  refetchAdjustments,
}) => {

  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  /* ================= DELETE ================= */

  const deleteAdjustment = async (row) => {
    if (row.status !== "draft") {
      alert("Only draft adjustments can be deleted.");
      return;
    }

    if (!window.confirm(`Delete ${row.number}?`)) return;

    try {
      setDeletingId(row.id);

      await api.delete(`/invoices/${row.id}/delete/`);

      refetchAdjustments?.();

    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete adjustment");
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= DOWNLOAD ================= */

  const downloadAdjustment = async (row) => {
    try {
      setDownloadingId(row.id);

      const response = await api.get(
        `/invoice-adjustments/${row.id}/pdf/`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${row.document_type}-${row.number}.pdf`;
      link.click();

    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  /* ================= HELPER FUNCTIONS ================= */

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

  const getStatusStyle = (status) => {
    const map = {
      draft: "bg-amber-100 text-amber-700 border-amber-200",
      posted: "bg-blue-100 text-blue-700 border-blue-200",
      paid: "bg-green-100 text-green-700 border-green-200",
    };
    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getTypeStyles = (type) => {
    return type === "CREDIT_NOTE"
      ? "bg-red-50 text-red-600 border-red-200"
      : "bg-green-50 text-green-600 border-green-200";
  };

  const getTypeIcon = (type) => {
    return type === "CREDIT_NOTE"
      ? "fas fa-minus-circle"
      : "fas fa-plus-circle";
  };

  /* ================= COLUMNS ================= */

  const columns = [
    {
      field: "number",
      header: "Document Number",
      width: "180px",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${
            row.document_type === "CREDIT_NOTE" 
              ? "bg-red-100" 
              : "bg-green-100"
          } flex items-center justify-center`}>
            <i className={`${getTypeIcon(row.document_type)} ${
              row.document_type === "CREDIT_NOTE" 
                ? "text-red-600" 
                : "text-green-600"
            } text-xs`}></i>
          </div>
          <span className="font-medium text-blue2">{val || "—"}</span>
        </div>
      )
    },
    {
      field: "document_type",
      header: "Type",
      width: "130px",
      render: (val) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${getTypeStyles(val)}`}
        >
          <i className={`${getTypeIcon(val)} text-xs`}></i>
          {val === "CREDIT_NOTE" ? "Credit Note" : "Debit Note"}
        </span>
      )
    },
    {
      field: "date",
      header: "Date",
      width: "120px",
      render: (val) => (
        <span className="text-[#4a636e] text-sm">
          {formatDate(val)}
        </span>
      )
    },
    {
      field: "total",
      header: "Total",
      width: "140px",
      render: (val, row) => (
        <span className={`font-mono font-bold ${
          row.document_type === "CREDIT_NOTE" ? "text-red-600" : "text-green-600"
        }`}>
          {row.document_type === "CREDIT_NOTE" ? "−" : "+"} {formatCurrency(val)}
        </span>
      )
    },
    {
      field: "status",
      header: "Status",
      width: "120px",
      render: (val) => (
        <span
          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${getStatusStyle(val)}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            val?.toLowerCase() === 'draft' ? 'bg-amber-500' :
            val?.toLowerCase() === 'posted' ? 'bg-blue-500' :
            val?.toLowerCase() === 'paid' ? 'bg-green-500' :
            'bg-gray-500'
          }`}></span>
          {val || "—"}
        </span>
      )
    },
    {
      field: "actions",
      header: "Actions",
      width: "150px",
      render: (_, row) => (
        <div className="flex items-center justify-start gap-2">
          {/* VIEW */}
          <button
            onClick={() => onView(row.id)}
            className="group relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="View Details"
          >
            <i className="fas fa-eye text-sm"></i>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              View
            </span>
          </button>

          {/* DOWNLOAD */}
          <button
            onClick={() => downloadAdjustment(row)}
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

          {/* DELETE */}
          <button
            onClick={() => deleteAdjustment(row)}
            disabled={deletingId === row.id || row.status !== "draft"}
            className="group relative p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={row.status !== "draft" ? "Only draft can be deleted" : "Delete"}
          >
            {deletingId === row.id ? (
              <i className="fas fa-spinner fa-spin text-sm"></i>
            ) : (
              <i className="fas fa-trash-alt text-sm"></i>
            )}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {row.status !== "draft" ? "Cannot delete" : "Delete"}
            </span>
          </button>
        </div>
      )
    }
  ];

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
  <i className="fas fa-exchange-alt"></i>
</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1f221f]">Credit / Debit Notes</h2>
                <p className="text-xs text-[#8b8f8c]">Manage invoice adjustments and corrections</p>
              </div>
            </div>
          }
          icon=""
          columns={columns}
          data={adjustments}
          loading={loading}
          sidebarCollapsed={sidebarCollapsed}
          onRowClick={(row) => onView(row.id)}
          searchPlaceholder="Search by number, type, or invoice..."
          pageSize={10}
          emptyMessage={
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <i className="fas fa-exchange-alt text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-[#1f221f] mb-1">No adjustments found</h3>
              <p className="text-sm text-[#8b8f8c]">Get started by creating your first credit or debit note</p>
            </div>
          }
          rowClassName="hover:bg-gradient-to-r hover:from-blue2/5 hover:to-transparent transition-all duration-200 cursor-pointer group"
          headerClassName="bg-gradient-to-r from-gray-50 to-white border-b-2 border-[#e5e7eb] text-xs font-semibold text-[#4a636e] uppercase tracking-wider"
        />
      </div>
    </div>
  );
};

export default InvoiceAdjustmentsTable;