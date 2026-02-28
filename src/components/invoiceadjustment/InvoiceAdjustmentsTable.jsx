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

  /* ================= STATUS STYLE ================= */

  const getStatusStyle = (status) => {
    const map = {
      draft: "bg-yellow-100 text-yellow-700",
      sent: "bg-blue-100 text-blue-700",
      approved: "bg-green-100 text-green-700",
    };

    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
  };

  /* ================= COLUMNS ================= */

  const columns = [
    {
      field: "number",
      header: "Number",
      render: (val) => val || "-"
    },
    {
      field: "document_type",
      header: "Type",
      render: (val) => (
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium border ${
            val === "CREDIT_NOTE"
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-green-50 text-green-600 border-green-200"
          }`}
        >
          {val === "CREDIT_NOTE" ? "Credit Note" : "Debit Note"}
        </span>
      )
    },
    {
      field: "date",
      header: "Date",
      render: (val) =>
        val ? new Date(val).toLocaleDateString() : "-"
    },
    {
      field: "total",
      header: "Total",
      render: (val) =>
        new Intl.NumberFormat("en-AE", {
          style: "currency",
          currency: "AED",
        }).format(val || 0)
    },
    {
      field: "status",
      header: "Status",
      render: (val) => (
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(val)}`}
        >
          {val || "-"}
        </span>
      )
    },
    {
      field: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">

          {/* VIEW */}
          <button
            onClick={() => onView(row.id)}
            className="btn-blue"
          >
            <i className="fas fa-eye"></i>
          </button>

          {/* DOWNLOAD */}
          <button
            onClick={() => downloadAdjustment(row)}
            className="btn-green"
            disabled={downloadingId === row.id}
          >
            {downloadingId === row.id ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-download"></i>
            )}
          </button>

          {/* DELETE */}
          <button
            onClick={() => deleteAdjustment(row)}
            className="btn-red"
            disabled={
              deletingId === row.id || row.status !== "draft"
            }
          >
            {deletingId === row.id ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-trash"></i>
            )}
          </button>

        </div>
      )
    }
  ];

  return (
    <Table
      title="Credit / Debit Notes"
      icon="🔁"
      columns={columns}
      data={adjustments}
      loading={loading}
      sidebarCollapsed={sidebarCollapsed}
      emptyMessage="No credit/debit notes found"
      pageSize={10}
    />
  );
};

export default InvoiceAdjustmentsTable;