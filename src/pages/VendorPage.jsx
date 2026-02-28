import React, { useEffect, useState } from "react";
import api from "../api/api";
import VendorsTable from "../components/vendors/VendorsTable";
import VendorsAddModal from "../components/vendors/VendorsAddModal";
import PageHeader from "../components/layout/PageHeader";

const Vendors = ({ sidebarCollapsed = false }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schema, setSchema] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const fetchVendors = async () => {
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/vendors/"),
        api.get("/vendors/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setVendors(listRes.data.rows || []);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const vendorStats = [
    {
      label: "Total",
      value: vendors.length,
      color: "bg-blue-400",
      icon: "fas fa-truck",
    },
    {
      label: "Active",
      value: vendors.filter((v) => v.status === "active").length,
      color: "bg-green-400",
      icon: "fas fa-check-circle",
    },
    {
      label: "Inactive",
      value: vendors.filter((v) => v.status === "inactive").length,
      color: "bg-gray-400",
      icon: "fas fa-ban",
    },
  ];

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Vendors"
        description="Manage all your vendor accounts"
        icon="fas fa-truck"
        buttonText="Add Vendor"
        onButtonClick={() => setAddOpen(true)}
        stats={vendorStats}
        collapsed={sidebarCollapsed}
      />

      {/* Vendors Table */}
      <VendorsTable
        vendors={vendors}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        schema={schema}
        refetchVendors={fetchVendors}
      />

      {/* Add Vendor Modal */}
      <VendorsAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        schema={schema}
        refetchVendors={fetchVendors}
      />
    </>
  );
};

export default Vendors;
