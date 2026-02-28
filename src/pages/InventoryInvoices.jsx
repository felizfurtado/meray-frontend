import React, { useEffect, useState } from "react";
import api from "../api/api";
import InventoryInvoiceAddModal from "../components/inventoryinvoices/InventoryInvoiceAddModal";
import InventoryInvoiceTable from "../components/inventoryinvoices/InventoryInvoiceTable";
import InventoryInvoiceViewModal from "../components/inventoryinvoices/InventoryInvoiceViewModal";
import PageHeader from "../components/layout/PageHeader";

const InventoryInvoices = ({ sidebarCollapsed }) => {
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [schemaRes, listRes] = await Promise.all([
        api.get("/inventory-invoices/schema/"),
        api.get("/inventory-invoices/"),
      ]);

      setSchema(schemaRes.data.schema);
      setData(listRes.data.rows || []);
    } catch (err) {
      console.error("Failed to fetch purchase invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <PageHeader
        title="Purchase Invoices"
        description="Manage vendor purchase invoices"
        icon="fas fa-file-invoice"
        buttonText="Create Invoice"
        onButtonClick={() => setAddOpen(true)}
        collapsed={sidebarCollapsed}
      />

      <InventoryInvoiceTable
        data={data}
        schema={schema}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        refetch={fetchData}
        onView={(row) => {
          setSelectedId(row.id);
          setViewOpen(true);
        }}
      />

      {/* Add Modal */}
      <InventoryInvoiceAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        refetch={fetchData}
      />

      {/* View Modal */}
      <InventoryInvoiceViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        invoiceId={selectedId}
        refetch={fetchData}
      />
    </>
  );
};

export default InventoryInvoices;