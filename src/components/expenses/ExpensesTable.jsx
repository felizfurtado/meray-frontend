import React, { useEffect, useState } from "react";
import Table from "../layout/Table";
import ExpensesViewModal from "./ExpensesViewModal";
import ExpensesEditModal from "./ExpensesEditModal";
import api from "../../api/api";
import ExpenseTableFieldRenderer from "./ExpenseTableFieldRenderer";

const ExpensesTable = ({ sidebarCollapsed = false }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // ===============================
  // FETCH DATA
  // ===============================

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/expenses/"),
        api.get("/expenses/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setRows(listRes.data.rows);
      setColumns(buildColumns(schemaRes.data.schema, listRes.data.columns));
    } catch (err) {
      console.error("Failed to load expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ===============================
  // ACTIONS
  // ===============================

  const openView = (row) => {
    setSelectedExpense(row.id);
    setViewOpen(true);
  };

  const openEdit = (row) => {
    setSelectedExpense(row.id);
    setEditOpen(true);
  };

  const deleteExpense = async (row) => {
    if (!window.confirm(`Delete "${row.expense_number}"?`)) return;

    try {
      await api.delete(`/expenses/${row.id}/delete/`);
      fetchExpenses();
    } catch {
      alert("Delete failed");
    }
  };

  const postExpense = async (row) => {
    if (!window.confirm("Post this expense? This will create a journal entry.")) return;

    try {
      await api.post(`/expenses/${row.id}/post/`);
      fetchExpenses();
    } catch {
      alert("Failed to post expense");
    }
  };

  // ===============================
  // BUILD COLUMNS
  // ===============================

  function buildColumns(schema, columnKeys) {
    if (!schema || !columnKeys?.length) return [];

    const fieldMap = {};
    schema.fields?.forEach((f) => {
      fieldMap[f.key] = f;
    });

    const cols = columnKeys.map((key) => {
      const field = fieldMap[key] || {};

      return {
        field: key,
        header: field.label || prettify(key),
        sortable: true,
        render: (value, row) => {

          if (key === "vendor_name") return value || "-";
          if (key === "account_name") return value || "-";
          if (key === "payment_account_name") return value || "-";

          return (
            <ExpenseTableFieldRenderer
              field={field}
              value={value}
              row={row}
            />
          );
        },
      };
    });

    // ===============================
    // ACTION COLUMN
    // ===============================

    cols.push({
      field: "actions",
      header: "Actions",
      width: "180px",
      render: (_, row) => (
        <div className="flex items-center justify-left gap-2">

          {/* VIEW */}
          <button
            onClick={() => openView(row)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="View"
          >
            <i className="fas fa-eye text-sm"></i>
          </button>

          {/* EDIT (only draft) */}
          {row.status === "DRAFT" && (
            <button
              onClick={() => openEdit(row)}
              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              title="Edit"
            >
              <i className="fas fa-edit text-sm"></i>
            </button>
          )}

          {/* POST (only draft) */}
          {row.status === "DRAFT" && (
            <button
              onClick={() => postExpense(row)}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              title="Post Expense"
            >
              <i className="fas fa-check text-sm"></i>
            </button>
          )}

          {/* DELETE (only draft) */}
          {row.status === "DRAFT" && (
            <button
              onClick={() => deleteExpense(row)}
              className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title="Delete"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          )}

        </div>
      ),
    });

    return cols;
  }

  function prettify(text) {
    return text?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // ===============================
  // RENDER
  // ===============================

  return (
    <>
      <Table
        title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                  <span className="text-white text-lg">
  <i className="fas fa-money-bill-wave"></i>
</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1f221f]">{schema?.name || "Expenses"}</h2>
                  <p className="text-xs text-[#8b8f8c]">Track and manage journal entries</p>
                </div>
              </div>
            }
        icon={schema?.icon || "💳"}
        columns={columns}
        data={rows}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        onRowClick={openView}
        searchPlaceholder="Search by vendor, account, or amount..."
        pageSize={schema?.page_size || 10}
        defaultSort={schema?.default_sort}
        emptyMessage="No expenses found"
      />

      <ExpensesViewModal
        open={viewOpen}
        expenseId={selectedExpense}
        onClose={() => setViewOpen(false)}
        schema={schema}
      />

      <ExpensesEditModal
        open={editOpen}
        expenseId={selectedExpense}
        onClose={() => setEditOpen(false)}
        schema={schema}
        refetchExpenses={fetchExpenses}
      />
    </>
  );
};

export default ExpensesTable;