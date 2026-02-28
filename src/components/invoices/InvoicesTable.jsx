import React, { useState } from "react";
import Table from "../layout/Table";
import api from "../../api/api";
import InvoicesViewModal from "./InvoicesViewModal";

const InvoicesTable = ({
  invoices,
  loading,
  sidebarCollapsed,
  schema,
  refetchInvoices,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const openView = (row) => {
    setSelectedInvoice(row.id);
    setViewOpen(true);
  };

  const deleteInvoice = async (row) => {
    if (!window.confirm(`Delete invoice ${row.number}?`)) return;

    await api.delete(`/invoices/${row.id}/delete/`);
    refetchInvoices();
  };

  /* ================= DOWNLOAD PDF ================= */

  const downloadInvoice = async (row) => {
    try {
      setDownloadingId(row.id);

      const response = await api.get(
        `/invoices/${row.id}/pdf/`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice-${row.number}.pdf`;
      link.click();

    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloadingId(null);
    }
  };

  /* ================= COLUMNS ================= */

  const columns =
    schema?.table_columns?.map((key) => ({
      field: key,
      header: key.replace(/_/g, " ").toUpperCase(),
      render: (value) => value || "-"
    })) || [];

  columns.push({
    field: "actions",
    header: "Actions",
    render: (_, row) => (
      <div className="flex gap-2">

        {/* VIEW */}
        <button
          onClick={() => openView(row)}
          className="btn-blue"
        >
          <i className="fas fa-eye"></i>
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
        >
          <i className="fas fa-trash"></i>
        </button>

      </div>
    )
  });

  return (
    <>
      <Table
        title={schema?.name || "Invoices"}
        icon={schema?.icon || "🧾"}
        columns={columns}
        data={invoices}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        onRowClick={openView}
        searchPlaceholder="Search invoices..."
        pageSize={schema?.page_size || 10}
        defaultSort={schema?.default_sort}
        emptyMessage="No invoices found"
      />

      <InvoicesViewModal
        open={viewOpen}
        invoiceId={selectedInvoice}
        onClose={() => setViewOpen(false)}
        schema={schema}
      />
    </>
  );
};

export default InvoicesTable;
