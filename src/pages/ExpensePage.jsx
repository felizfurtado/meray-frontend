import React, { useEffect, useState } from "react";
import api from "../api/api";
import ExpensesTable from "../components/expenses/ExpensesTable";
import ExpensesAddModal from "../components/expenses/ExpensesAddModal";
import PageHeader from "../components/layout/PageHeader";

const Expenses = ({ sidebarCollapsed = false }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schema, setSchema] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const fetchExpenses = async () => {
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/expenses/"),
        api.get("/expenses/list/")
      ]);

      setSchema(schemaRes.data.schema);
      setExpenses(listRes.data.rows || []);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const expenseStats = [
    {
      label: "Total",
      value: expenses.length,
      color: "bg-blue-400",
      icon: "fas fa-receipt",
    },
    {
      label: "Draft",
      value: expenses.filter(e => e.status === "DRAFT").length,
      color: "bg-gray-400",
      icon: "fas fa-file",
    },
    {
      label: "Posted",
      value: expenses.filter(e => e.status === "POSTED").length,
      color: "bg-green-400",
      icon: "fas fa-check-circle",
    },
  ];

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Track and manage company expenses"
        icon="fas fa-wallet"
        buttonText="Add Expense"
        onButtonClick={() => setAddOpen(true)}
        stats={expenseStats}
        collapsed={sidebarCollapsed}
      />

      <ExpensesTable
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        schema={schema}
        refetchExpenses={fetchExpenses}
      />

      <ExpensesAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        schema={schema}
        refetchExpenses={fetchExpenses}
      />
    </>
  );
};

export default Expenses;
