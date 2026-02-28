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

  const deleteJournal = async (row) => {
  if (!window.confirm(`Delete journal ${row.journal_number}?`))
    return;

  try {
    await api.delete(
      `/manual-journals/${row.id}/delete/`
    );

    refetchJournals();
  } catch (err) {
    alert(
      err.response?.data?.error ||
      "Failed to delete journal"
    );
  }
};

  const buildColumns = () => {
    if (!schema?.table_columns) return [];

    const cols = schema.table_columns.map((key) => ({
      field: key,
      header: prettify(key),
      sortable: true,
      render: (value) => (
        <ManualJournalFieldRenderer
          field={key}
          value={value}
        />
      ),
    }));

    cols.push({
      field: "actions",
      header: "Actions",
      width: "120px",
      render: (_, row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              setSelected(row.id);
              setViewOpen(true);
            }}
            className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
          >
            <i className="fas fa-eye text-sm"></i>
          </button>

          <button
            onClick={() => deleteJournal(row)}
            className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
          >
            <i className="fas fa-trash text-sm"></i>
          </button>
        </div>
      ),
    });

    return cols;
  };

  return (
    <>
      <Table
        title={schema?.name || "Manual Journals"}
        icon="📒"
        columns={buildColumns()}
        data={journals}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        searchPlaceholder="Search journals..."
        pageSize={schema?.page_size || 10}
        defaultSort={schema?.default_sort}
        emptyMessage="No journal entries found"
      />

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
