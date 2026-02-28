import React, { useState } from "react";
import Table from "../layout/Table";
import api from "../../api/api";

const InventorySalesInvoiceTable = ({
  data,
  schema,
  loading,
  sidebarCollapsed,
  refetch,
  onView,
  onEdit
}) => {

  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(val || 0);

  const getStatusStyle = (status) => {
    const map = {
      draft: "bg-yellow-100 text-yellow-700",
      posted: "bg-blue-100 text-blue-700",
      paid: "bg-green-100 text-green-700",
    };
    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
  };

  /* ================= DELETE ================= */

  const deleteInvoice = async (row) => {
    if (!window.confirm(`Delete invoice ${row.number}?`)) return;

    try {
      setDeletingId(row.id);

      await api.delete(
        `/inventory-sales-invoices/${row.id}/delete/`
      );

      refetch?.();

    } catch (err) {
      alert("Failed to delete invoice");
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= DOWNLOAD ================= */

  const downloadInvoice = async (row) => {
    try {
      setDownloadingId(row.id);

      const response = await api.get(
        `/inventory-sales-invoices/${row.id}/pdf/`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `InventorySalesInvoice-${row.number}.pdf`;
      link.click();

    } catch (error) {
      alert("Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  /* ================= COLUMNS ================= */

  const columns =
    schema?.table_columns?.map((key) => ({
      field: key,
      header: key.replace(/_/g, " ").toUpperCase(),
      render: (value) => {

        if (["subtotal", "vat", "total"].includes(key)) {
          return formatCurrency(value);
        }

        if (key === "status") {
          return (
            <span
              className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(value)}`}
            >
              {value}
            </span>
          );
        }

        return value ?? "-";
      },
    })) || [];

  /* ================= ACTIONS ================= */

  columns.push({
    field: "actions",
    header: "Actions",
    render: (_, row) => (
      <div className="flex gap-2">

        {/* VIEW */}
        <button
          onClick={() => onView?.(row)}
          className="btn-blue"
        >
          <i className="fas fa-eye"></i>
        </button>

        {/* EDIT */}
        <button
          onClick={() => onEdit?.(row)}
          className="btn-yellow"
        >
          <i className="fas fa-edit"></i>
        </button>

        {/* DOWNLOAD */}
        <button
          onClick={() => downloadInvoice(row)}
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
          onClick={() => deleteInvoice(row)}
          className="btn-red"
          disabled={deletingId === row.id}
        >
          {deletingId === row.id ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-trash"></i>
          )}
        </button>

      </div>
    )
  });

  return (
    <Table
      title={schema?.name || "Inventory Sales Invoices"}
      icon={schema?.icon || "📦💰"}
      columns={columns}
      data={data}
      loading={loading}
      sidebarCollapsed={sidebarCollapsed}
      emptyMessage="No inventory sales invoices found"
      pageSize={10}
    />
  );
};

export default InventorySalesInvoiceTable;