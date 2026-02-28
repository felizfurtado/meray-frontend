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

  /* ================= FORMATTERS ================= */

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
    }).format(Number(val || 0));

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

    if (row.status !== "draft") {
      alert("Only draft invoices can be deleted.");
      return;
    }

    if (!window.confirm(`Delete invoice ${row.number}?`)) return;

    try {
      await api.delete(`/inventory-invoices/${row.id}/delete/`);
      refetch?.();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
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

    const baseCols =
      schema?.table_columns?.map((key) => ({
        field: key,
        header: key.replace(/_/g, " ").toUpperCase(),
        render: (value, row) => {

          if (["total", "subtotal", "vat"].includes(key)) {
            return formatCurrency(value);
          }

          if (key === "status") {
            return (
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(value)}`}
              >
                {value?.toUpperCase()}
              </span>
            );
          }

          return value ?? "-";
        },
      })) || [];

    baseCols.push({
      field: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">

          {/* VIEW */}
          <button
            onClick={() => onView?.(row)}
            className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
          >
            <i className="fas fa-eye text-sm"></i>
          </button>

          {/* DOWNLOAD */}
          <button
            onClick={() => downloadInvoice(row)}
            disabled={downloadingId === row.id}
            className="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition"
          >
            {downloadingId === row.id ? (
              <i className="fas fa-spinner fa-spin text-sm"></i>
            ) : (
              <i className="fas fa-download text-sm"></i>
            )}
          </button>

          {/* DELETE (Draft only) */}
          {row.status === "draft" && (
            <button
              onClick={() => deleteInvoice(row)}
              className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          )}

        </div>
      ),
    });

    return baseCols;

  }, [schema, downloadingId]);

  /* ================= RENDER ================= */

  return (
    <Table
      title={schema?.name || "Purchase Invoices"}
      icon={schema?.icon || "🧾"}
      columns={columns}
      data={data}
      loading={loading}
      sidebarCollapsed={sidebarCollapsed}
      searchPlaceholder="Search purchase invoices..."
      pageSize={schema?.page_size || 10}
      defaultSort={schema?.default_sort}
      emptyMessage="No purchase invoices found"
    />
  );
};

export default InventoryInvoiceTable;