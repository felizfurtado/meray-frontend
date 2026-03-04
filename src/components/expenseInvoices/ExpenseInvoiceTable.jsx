import React, { useState } from "react";
import Table from "../layout/Table";
import api from "../../api/api";
import ExpenseInvoiceViewModal from "./ExpenseInvoiceViewModal";
import ExpenseInvoiceFieldRenderer from "./ExpenseInvoiceFieldRenderer";
import ExpenseInvoiceMarkPaidModal from "./ExpenseInvoiceMarkPaidModal";

const ExpenseInvoiceTable = ({
  invoices,
  schema,
  loading,
  sidebarCollapsed,
  refetchInvoices
}) => {

  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [payOpen, setPayOpen] = useState(false);
  const [payInvoiceId, setPayInvoiceId] = useState(null);

  /* ================= DELETE ================= */

  const deleteInvoice = async (row) => {

    if (row.status === "Paid") {
      alert("Cannot delete a paid invoice.");
      return;
    }

    if (!window.confirm("Delete invoice?")) return;

    try {
      await api.delete(`/expense-invoices/${row.id}/delete/`);
      refetchInvoices();
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  /* ================= OPEN MARK PAID ================= */

  const openMarkPaid = (row) => {
    setPayInvoiceId(row.id);
    setPayOpen(true);
  };

  /* ================= COLUMNS ================= */

  const columns = schema?.table_columns?.map(key => ({
    field: key,
    header: key.replace(/_/g, " ").toUpperCase(),
    render: (val) => (
      <ExpenseInvoiceFieldRenderer
        field={key}
        value={val}
      />
    )
  })) || [];

  columns.push({
    field: "actions",
    header: "Actions",
    render: (_, row) => (
      <div className="flex gap-2 items-center">

        {/* VIEW */}
        <button
          onClick={() => {
            setSelected(row.id);
            setViewOpen(true);
          }}
                  className="group relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"

        >
          <i className="fas fa-eye text-sm"></i>
        </button>

        {/* DELETE (only if NOT paid) */}
        {row.status !== "Paid" && (
          <button
            onClick={() => deleteInvoice(row)}
                    className="group relative p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"

          >
            <i className="fas fa-trash text-sm"></i>
          </button>
        )}

        {/* MARK PAID (only if Posted) */}
        {row.status === "Posted" && (
          <button
            onClick={() => openMarkPaid(row)}
            className="group relative p-2 text-gray-400 hover:bg-green-100 hover:text-green-700 rounded-lg transition-all"
          >
            <i className="fas fa-check text-sm"></i>
          </button>
        )}

      </div>
    )
  });

  return (
    <>
      <Table
         title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                  <span className="text-white text-lg">
  <i className="fas fa-receipt"></i>
</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1f221f]">{schema?.name || "Expense Incoices"}</h2>
                  <p className="text-xs text-[#8b8f8c]">Track and manage journal entries</p>
                </div>
              </div>
            }
        icon="🧾"
        columns={columns}
        data={invoices}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* VIEW MODAL */}
      <ExpenseInvoiceViewModal
        open={viewOpen}
        invoiceId={selected}
        onClose={() => setViewOpen(false)}
        refetchInvoices={refetchInvoices}
      />

      {/* MARK PAID MODAL */}
      <ExpenseInvoiceMarkPaidModal
        open={payOpen}
        invoiceId={payInvoiceId}
        onClose={() => setPayOpen(false)}
        onSuccess={refetchInvoices}
      />
    </>
  );
};

export default ExpenseInvoiceTable;