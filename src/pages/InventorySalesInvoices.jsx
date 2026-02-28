import React, { useEffect, useState } from "react";
import api from "../api/api";
import PageHeader from "../components/layout/PageHeader";
import InventorySalesInvoiceTable from "../components/inventorysales/InventorySalesInvoiceTable";
import InventorySalesInvoiceAddModal from "../components/inventorysales/InventorySalesInvoiceAddModal";
import InventorySalesInvoiceViewModal from "../components/inventorysales/InventorySalesInvoiceViewModal";

const InventorySalesInvoices = ({ sidebarCollapsed }) => {

  const [data, setData] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [schemaRes, listRes] = await Promise.all([
        api.get("/inventory-sales-invoices/schema/"),
        api.get("/inventory-sales-invoices/"),
      ]);

      setSchema(schemaRes.data.schema);
      setData(listRes.data.rows || []);
    } catch (err) {
      console.error("Failed to fetch inventory sales invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleView = (row) => {
    setSelectedId(row.id);
    setViewOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Inventory Sales Invoices"
        description="Sell inventory items to customers"
        icon="fas fa-box-open"
        buttonText="Create Invoice"
        onButtonClick={() => setCreateOpen(true)}
        collapsed={sidebarCollapsed}
      />

      <InventorySalesInvoiceTable
        data={data}
        schema={schema}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        refetch={fetchData}
        onView={handleView}
      />

      <InventorySalesInvoiceAddModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        refetch={fetchData}
      />

      <InventorySalesInvoiceViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        invoiceId={selectedId}
        refetch={fetchData}
      />
    </>
  );
};

export default InventorySalesInvoices;