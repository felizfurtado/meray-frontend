import React, { useEffect, useState } from "react";
import api from "../api/api";
import PageHeader from "../components/layout/PageHeader";
import ManualJournalTable from "../components/manualJournals/ManualJournalTable";
import ManualJournalAddModal from "../components/manualJournals/ManualJournalAddModal";

const ManualJournals = ({ sidebarCollapsed = false }) => {
  const [journals, setJournals] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const fetchJournals = async () => {
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/manual-journals/"),
        api.get("/manual-journals/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setJournals(listRes.data.rows || []);
    } catch (err) {
      console.error("Failed to load journals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <>
      <PageHeader
        title="Manual Journals"
        description="Create and manage journal entries"
        icon="fas fa-book"
        buttonText="Create Journal"
        onButtonClick={() => setAddOpen(true)}
        collapsed={sidebarCollapsed}
      />

      <ManualJournalTable
        journals={journals}
        schema={schema}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        refetchJournals={fetchJournals}
      />

      <ManualJournalAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        refetchJournals={fetchJournals}
      />
    </>
  );
};

export default ManualJournals;
