import React, { useState } from "react";
import LeadsTable from "../components/leads/Leadstable";
import LeadsAddModal from "../components/leads/LeadsAddModal";
import PageHeader from "../components/layout/PageHeader";

const Leads = ({ sidebarCollapsed = false }) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [schema, setSchema] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <PageHeader
        title="Leads"
        description="Manage all your customer leads in one place"
        icon="fas fa-users"
        buttonText="Add Lead"
        onButtonClick={() => setAddModalOpen(true)}
        collapsed={sidebarCollapsed}
      />

      <LeadsTable
        key={refreshKey}
        sidebarCollapsed={sidebarCollapsed}
        onSchemaLoad={setSchema}
      />

      <LeadsAddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        schema={schema}
        refetchLeads={handleRefresh}
      />
    </>
  );
};

export default Leads;