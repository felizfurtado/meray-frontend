import React, { useEffect, useState } from "react";
import api from "../api/api";
import InvoicesTable from "../components/invoices/InvoicesTable";
import InvoicesAddModal from "../components/invoices/InvoicesAddModal";
import PageHeader from "../components/layout/PageHeader";

const Invoices = ({ sidebarCollapsed = false }) => {
  const [invoices, setInvoices] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/invoices/"),
        api.get("/invoices/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setInvoices(listRes.data.rows || []);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
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
      icon: "fas fa-file-invoice",
    },
    {
      label: "Paid",
      value: invoices.filter(i => i.status === "paid").length,
      color: "bg-green-400",
      icon: "fas fa-check-circle",
    },
    {
      label: "Draft",
      value: invoices.filter(i => i.status === "draft").length,
      color: "bg-gray-400",
      icon: "fas fa-edit",
    }
  ];

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Manage and track all invoices"
        icon="fas fa-file-invoice-dollar"
        buttonText="Create Invoice"
        onButtonClick={() => setAddOpen(true)}
        stats={stats}
        collapsed={sidebarCollapsed}
      />

      <InvoicesTable
        invoices={invoices}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        schema={schema}
        refetchInvoices={fetchInvoices}
      />

      <InvoicesAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        schema={schema}
        refetchInvoices={fetchInvoices}
      />
    </>
  );
};

export default Invoices;
