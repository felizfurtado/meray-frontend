import React, { useState } from "react";
import Table from "../layout/Table";
import api from "../../api/api";
import ManualJournalViewModal from "./ManualJournalViewModal";
import ManualJournalFieldRenderer from "./ManualJournalFieldRenderer";

const ManualJournalTable = ({
  journals,
  schema,
  loading,
  sidebarCollapsed,
  refetchJournals,
}) => {
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const deleteJournal = async (row) => {
    if (!window.confirm(`Delete journal ${row.journal_number}?`))
      return;

    setDeletingId(row.id);
    try {
      await api.delete(`/manual-journals/${row.id}/delete/`);
      refetchJournals();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete journal");
    } finally {
      setDeletingId(null);
    }
  };

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

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  const getStatusColor = (status) => {
    const statusMap = {
      'draft': 'bg-amber-100 text-amber-700 border-amber-200',
      'posted': 'bg-blue-100 text-blue-700 border-blue-200',
      'paid': 'bg-green-100 text-green-700 border-green-200',
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const buildColumns = () => {
    if (!schema?.table_columns) return [];

    const cols = schema.table_columns.map((key) => {
      // Special formatting for specific fields
      if (key === 'journal_number' || key === 'number') {
        return {
          field: key,
          header: 'Journal #',
          width: '150px',
          render: (value) => (
            <span className="font-medium text-blue2">{value || '—'}</span>
          )
        };
      }
      
      if (key === 'date') {
        return {
          field: key,
          header: 'Date',
          width: '120px',
          render: (value) => (
            <span className="text-[#4a636e] text-sm">{formatDate(value)}</span>
          )
        };
      }
      
      if (key === 'status') {
        return {
          field: key,
          header: 'Status',
          width: '120px',
          render: (value) => (
            <span className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${getStatusColor(value)}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                value?.toLowerCase() === 'posted' ? 'bg-blue-500' :
                value?.toLowerCase() === 'draft' ? 'bg-amber-500' :
                value?.toLowerCase() === 'paid' ? 'bg-green-500' :
                'bg-gray-500'
              }`}></span>
              {value || '—'}
            </span>
          )
        };
      }
      
      if (key === 'total_debits' || key === 'total_credits') {
        return {
          field: key,
          header: key === 'total_debits' ? 'Total Debits' : 'Total Credits',
          width: '140px',
          render: (value) => {
            const numValue = Number(value || 0);
            return (
              <span className={`font-mono font-medium ${
                key === 'total_debits' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(numValue)}
              </span>
            );
          }
        };
      }

      // Default column with field renderer
      return {
        field: key,
        header: prettify(key),
        width: '120px',
        render: (value) => (
          <ManualJournalFieldRenderer field={key} value={value} />
        ),
      };
    });

    // Add actions column
    cols.push({
      field: "actions",
      header: "Actions",
      width: "180px",
      render: (_, row) => (
        <div className="flex items-center justify-left gap-2">
         

          {/* VIEW */}
          <button
            onClick={() => {
              setSelected(row.id);
              setViewOpen(true);
            }}
            className="group relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="View Journal"
          >
            <i className="fas fa-eye text-sm"></i>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              View
            </span>
          </button>

          {/* DELETE */}
          <button
            onClick={() => deleteJournal(row)}
            disabled={deletingId === row.id}
            className="group relative p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Journal"
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
        </div>
      ),
    });

    return cols;
  };

  return (
    <>
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
  <i className="fas fa-book"></i>
</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1f221f]">{schema?.name || "Manual Journals"}</h2>
                  <p className="text-xs text-[#8b8f8c]">Track and manage journal entries</p>
                </div>
              </div>
            }
            icon=""
            columns={buildColumns()}
            data={journals}
            loading={loading}
            sidebarCollapsed={sidebarCollapsed}
            onRowClick={(row) => {
              setSelected(row.id);
              setViewOpen(true);
            }}
            searchPlaceholder="Search by journal number, notes, or status..."
            pageSize={schema?.page_size || 10}
            defaultSort={schema?.default_sort}
            emptyMessage={
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="fas fa-journal-whills text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-[#1f221f] mb-1">No journal entries found</h3>
                <p className="text-sm text-[#8b8f8c]">Get started by creating your first manual journal</p>
              </div>
            }
            rowClassName="hover:bg-gradient-to-r hover:from-blue2/5 hover:to-transparent transition-all duration-200 cursor-pointer group"
            headerClassName="bg-gradient-to-r from-gray-50 to-white border-b-2 border-[#e5e7eb] text-xs font-semibold text-[#4a636e] uppercase tracking-wider"
          />
        </div>
      </div>

      <ManualJournalViewModal
        open={viewOpen}
        journalId={selected}
        onClose={() => setViewOpen(false)}
      />
    </>
  );
};

export default ManualJournalTable;

/* Helper */
function prettify(text) {
  return text
    ?.replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}