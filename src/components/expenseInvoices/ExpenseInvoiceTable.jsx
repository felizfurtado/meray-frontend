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
          className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600"
        >
          <i className="fas fa-eye text-sm"></i>
        </button>

        {/* DELETE (only if NOT paid) */}
        {row.status !== "Paid" && (
          <button
            onClick={() => deleteInvoice(row)}
            className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600"
          >
            <i className="fas fa-trash text-sm"></i>
          </button>
        )}

        {/* MARK PAID (only if Posted) */}
        {row.status === "Posted" && (
          <button
            onClick={() => openMarkPaid(row)}
            className="w-8 h-8 rounded-lg bg-green-100 text-green-700"
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
        title={schema?.name}
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