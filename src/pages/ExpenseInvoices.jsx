import React, { useEffect, useState } from "react";
import api from "../api/api";
import PageHeader from "../components/layout/PageHeader";
import ExpenseInvoiceTable from "../components/expenseInvoices/ExpenseInvoiceTable";
import ExpenseInvoiceAddModal from "../components/expenseInvoices/ExpenseInvoiceAddModal";

const ExpenseInvoices = ({ sidebarCollapsed = false }) => {
  const [invoices, setInvoices] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/expense-invoices/"),
        api.get("/expense-invoices/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setInvoices(listRes.data.rows || []);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const stats = [
    {
      label: "Total",
      value: invoices.length,
      color: "bg-blue-400",
      icon: "fas fa-file-invoice"
    },
    {
      label: "Paid",
      value: invoices.filter(i => i.status === "Paid").length,
      color: "bg-green-400",
      icon: "fas fa-check-circle"
    },
    {
      label: "Pending",
      value: invoices.filter(i => i.status === "Pending").length,
      color: "bg-yellow-400",
      icon: "fas fa-clock"
    }
  ];

  return (
    <>
      <PageHeader
        title={schema?.name || "Expense Invoices"}
        description="Manage vendor bills and payments"
        icon="fas fa-file-invoice"
        buttonText="New Invoice"
        onButtonClick={() => setAddOpen(true)}
        stats={stats}
        collapsed={sidebarCollapsed}
      />

      <ExpenseInvoiceTable
        invoices={invoices}
        schema={schema}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        refetchInvoices={fetchInvoices}
      />

      <ExpenseInvoiceAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        refetchInvoices={fetchInvoices}
      />
    </>
  );
};

export default ExpenseInvoices;
