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

  /* ================= HELPER FUNCTIONS ================= */

  const getStatusColor = (status) => {
    const statusMap = {
      'draft': 'bg-amber-50 text-amber-600 border-amber-200',
      'posted': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'paid': 'bg-blue-50 text-blue-600 border-blue-200',
      'overdue': 'bg-rose-50 text-rose-600 border-rose-200',
      'cancelled': 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'AED 0.00';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-AE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  /* ================= COLUMNS ================= */

  const baseColumns = schema?.table_columns?.map((key) => {
    // Special formatting for certain fields
    if (key === 'total' || key === 'amount' || key === 'subtotal' || key === 'vat') {
      return {
        field: key,
        header: key.replace(/_/g, " ").toUpperCase(),
        render: (value) => (
          <span className="font-mono font-medium text-[#1f221f]">
            {formatCurrency(value)}
          </span>
        )
      };
    }
    
    if (key === 'date' || key === 'due_date' || key === 'created_at') {
      return {
        field: key,
        header: key.replace(/_/g, " ").toUpperCase(),
        render: (value) => (
          <span className="text-[#4a636e] text-sm">
            {formatDate(value)}
          </span>
        )
      };
    }

    if (key === 'status') {
      return {
        field: key,
        header: 'STATUS',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              value?.toLowerCase() === 'draft' ? 'bg-amber-500' :
              value?.toLowerCase() === 'posted' ? 'bg-emerald-500' :
              value?.toLowerCase() === 'paid' ? 'bg-blue-500' :
              value?.toLowerCase() === 'overdue' ? 'bg-rose-500' :
              'bg-gray-500'
            }`}></span>
            {value?.toUpperCase() || '—'}
          </span>
        )
      };
    }

    if (key === 'number' || key === 'invoice_number') {
      return {
        field: key,
        header: 'INVOICE #',
        render: (value) => (
          <span className="font-medium text-blue2">
            {value || '—'}
          </span>
        )
      };
    }

    // Default column
    return {
      field: key,
      header: key.replace(/_/g, " ").toUpperCase(),
      render: (value) => value || '—'
    };
  }) || [];

  // Add actions column with enhanced buttons
  const columns = [
    ...baseColumns,
    {
      field: "actions",
      header: "ACTIONS",
      width: "180px",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          {/* Status Badge (for quick reference) */}
          {row.status && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mr-2 ${getStatusColor(row.status)}`}>
              {row.status}
            </span>
          )}

          {/* VIEW */}
          <button
            onClick={() => openView(row)}
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

          {/* DELETE */}
          <button
            onClick={() => deleteInvoice(row)}
            className="group relative p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Delete Invoice"
          >
            <i className="fas fa-trash-alt text-sm"></i>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Delete
            </span>
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue2/5 to-[#a9c0c9]/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#d9a44a]/5 to-transparent rounded-full -ml-20 -mb-20"></div>
        </div>

        {/* Main Table */}
        <div className="relative">
          <Table
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                  <span className="text-white text-lg">{schema?.icon || '🧾'}</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1f221f]">{schema?.name || "Invoices"}</h2>
                  <p className="text-xs text-[#8b8f8c]">Manage and track all invoice transactions</p>
                </div>
              </div>
            }
            icon={schema?.icon || "🧾"}
            columns={columns}
            data={invoices}
            loading={loading}
            sidebarCollapsed={sidebarCollapsed}
            onRowClick={openView}
            searchPlaceholder="Search by invoice number, customer, or amount..."
            pageSize={schema?.page_size || 10}
            defaultSort={schema?.default_sort}
            emptyMessage={
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="fas fa-file-invoice text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-[#1f221f] mb-1">No invoices found</h3>
                <p className="text-sm text-[#8b8f8c]">Get started by creating your first invoice</p>
              </div>
            }
            rowClassName="hover:bg-gradient-to-r hover:from-blue2/5 hover:to-transparent transition-all duration-200 cursor-pointer group"
            headerClassName="bg-gradient-to-r from-gray-50 to-white border-b-2 border-[#e5e7eb] text-xs font-semibold text-[#4a636e] uppercase tracking-wider"
          />
        </div>
      </div>

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