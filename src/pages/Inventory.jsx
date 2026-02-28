import React, { useEffect, useState } from "react";
import api from "../api/api";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryAddModal from "../components/inventory/InventoryAddModal";
import PageHeader from "../components/layout/PageHeader";

const Inventory = ({ sidebarCollapsed = false }) => {
  const [items, setItems] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const fetchInventory = async () => {
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/inventories/"),
        api.get("/inventories/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setItems(listRes.data.rows || []);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const stats = [
    {
      label: "Total Items",
      value: items.length,
      color: "bg-blue-400",
      icon: "fas fa-box"
    }
  ];

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Manage products and stock"
        icon="fas fa-warehouse"
        buttonText="Add Item"
        onButtonClick={() => setAddOpen(true)}
        stats={stats}
        collapsed={sidebarCollapsed}
      />

      <InventoryTable
        schema={schema}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        refetchInventory={fetchInventory}
      />

      <InventoryAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        schema={schema}
        refetchInventory={fetchInventory}
      />
    </>
  );
};

export default Inventory;
