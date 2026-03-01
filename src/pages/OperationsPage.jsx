import React, { useEffect, useState } from "react";
import SubNav from "../components/layout/SubNav";
import api from "../api/api";

// import pages
import Customers from "./Customers";
import Invoices from "./Invoices";
import VendorPage from "./VendorPage";
import ExpensePage from "./ExpensePage";
import ExpenseInvoices from "./ExpenseInvoices";
import ChartOfAccounts from "./ChartOfAccounts";
import ManualJournals from "./ManualJournals";
import Inventory from "./Inventory";
import InventoryInvoices from "./InventoryInvoices";
import InventorySalesInvoices from "./InventorySalesInvoices";

const OperationsPage = ({ collapsed = false }) => {

  const [operationsData, setOperationsData] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      const res = await api.get("/navigation/");
      if (res.data.success) {
        const data = res.data.operations;
        setOperationsData(data);

        // Default: first section → first item
        const firstSection = Object.keys(data.sections)[0];
        const firstItem = data.sections[firstSection].items[0];
        setActiveModule(firstItem.key);
      }
    } catch (error) {
      console.error("Navigation load failed", error);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case "customers":
        return <Customers sidebarCollapsed={collapsed} />;
      case "invoices":
        return <Invoices sidebarCollapsed={collapsed} />;
      case "vendor":
        return <VendorPage sidebarCollapsed={collapsed} />;
      case "expense":
        return <ExpensePage sidebarCollapsed={collapsed} />;
      case "expensesinvoicing":
        return <ExpenseInvoices sidebarCollapsed={collapsed} />;
      case "chartsofaccounts":
        return <ChartOfAccounts sidebarCollapsed={collapsed} />;
      case "manualjournal":
        return <ManualJournals sidebarCollapsed={collapsed} />;
      case "inventory":
        return <Inventory sidebarCollapsed={collapsed} />;
      case "inventoryinvoice":
        return <InventoryInvoices sidebarCollapsed={collapsed} />;
      case "inventorysalesinvoice":
        return <InventorySalesInvoices sidebarCollapsed={collapsed} />;
      default:
        return null;
    }
  };

  if (!operationsData) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">

      <div className="mt-6">
        <SubNav
          collapsed={collapsed}
          sections={operationsData.sections}
          setActiveModule={setActiveModule}
          activeModule={activeModule}
        />
      </div>

      <div className="mt-8">
        {renderModule()}
      </div>

    </div>
  );
};

export default OperationsPage;