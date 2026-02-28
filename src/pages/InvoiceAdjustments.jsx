

import React, { useEffect, useState } from "react";
import api from "../api/api";
import PageHeader from "../components/layout/PageHeader";
import InvoiceAdjustmentsTable from "../components/invoiceadjustment/InvoiceAdjustmentsTable";
import InvoiceAdjustmentModal from "../components/invoiceadjustment/InvoiceAdjustmentModal";
import InvoiceAdjustmentViewModal from "../components/invoiceadjustment/InvoiceAdjustmentViewModal";

const InvoiceAdjustments = ({ sidebarCollapsed = false }) => {

  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);

  const fetchAdjustments = async () => {
    try {
      const res = await api.get("/invoices/adjustments/list/");
      setAdjustments(res.data.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const openView = (id) => {
    setSelectedAdjustment(id);
    setViewOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Credit & Debit Notes"
        description="Manage all invoice adjustments"
        icon="fas fa-exchange-alt"
        buttonText="Create Adjustment"
        onButtonClick={() => setAddOpen(true)}
        collapsed={sidebarCollapsed}
      />

      <InvoiceAdjustmentsTable
        adjustments={adjustments}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        onView={openView}
      />

      <InvoiceAdjustmentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        refetchAdjustments={fetchAdjustments}
      />

      <InvoiceAdjustmentViewModal
        open={viewOpen}
        adjustmentId={selectedAdjustment}
        onClose={() => setViewOpen(false)}
      />
    </>
  );
};

export default InvoiceAdjustments;
