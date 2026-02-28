import React, { useEffect, useState } from "react";
import api from "../api/api";
import CustomerTable from "../components/customers/CustomerTable";
import CustomersAddModal from "../components/customers/CustomersAddModal";
import PageHeader from "../components/layout/PageHeader";

const Customers = ({ sidebarCollapsed = false }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schema, setSchema] = useState(null);
  const [addOpen, setAddOpen] = useState(false); // ✅ modal state

  const fetchCustomers = async () => {
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/customers/"),
        api.get("/customers/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setCustomers(listRes.data.rows || []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const customerStats = [
    {
      label: "Total",
      value: customers.length,
      color: "bg-blue-400",
      icon: "fas fa-users",
    },
    {
      label: "Active",
      value: customers.filter((c) => c.status === "active").length,
      color: "bg-green-400",
      icon: "fas fa-check-circle",
    },
    {
      label: "Inactive",
      value: customers.filter((c) => c.status === "inactive").length,
      color: "bg-gray-400",
      icon: "fas fa-user-slash",
    },
  ];

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Customers"
        description="Manage all your customer accounts"
        icon="fas fa-user-tie"
        buttonText="Add Customer"
        onButtonClick={() => setAddOpen(true)}  // ✅ OPEN MODAL
        stats={customerStats}
        collapsed={sidebarCollapsed}
      />

      {/* Customers Table */}
      <CustomerTable
        customers={customers}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        schema={schema}
        refetchCustomers={fetchCustomers}
      />

      {/* ✅ Add Customer Modal */}
      <CustomersAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        schema={schema}
        refetchCustomers={fetchCustomers}
      />
    </>
  );
};

export default Customers;
