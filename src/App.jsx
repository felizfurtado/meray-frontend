import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";

import RequireAuth from "./auth/RequireAuth";
import useAuth from "./auth/useAuth";

import Sidebar from "./components/layout/SideBar";
import TopBar from "./components/layout/TopBar";
import Tasks from "./pages/Tasks";
import CompanyProfile from "./pages/CompanyProfile";
import DataMigrationTool from "./pages/DataMigrationTool";
import PipelineDashboard from "./pages/PipelineDashboard";
import Inventory from "./pages/Inventory";
import BankReconciliation from "./pages/BankReconciliation";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import FinancialReports from "./pages/FinancialReports";
import VendorPage from "./pages/VendorPage";
import ExpensePage from "./pages/ExpensePage";
import WPSPayrollPage from "./pages/WPSPayrollPage";
import ManualJournals from "./pages/ManualJournals";
import ExpenseInvoices from "./pages/ExpenseInvoices";
import InvoiceAdjustments from "./pages/InvoiceAdjustments";
import InventoryInvoices from "./pages/InventoryInvoices";
import InventorySalesInvoices from "./pages/InventorySalesInvoices";
import OperationsPage from "./pages/OperationsPage";

function App() {
  const { isAuthenticated, loading, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  if (loading) return null;

  const renderPage = () => {
    switch (currentPage) {
      case "leads":
        return <Leads sidebarCollapsed={collapsed} />;
      // case "customers":
      //   return <Customers sidebarCollapsed={collapsed} />;
      // case "invoices":
      //   return <Invoices sidebarCollapsed={collapsed} />;
      // case "tasks":
      //   return <Tasks sidebarCollapsed={collapsed} />;

      case "company-profile":
        return <CompanyProfile sidebarCollapsed={collapsed} />;

      // case "datamigration":
      //   return <DataMigrationTool sidebarCollapsed={collapsed} />;

      // case "pipelinedashboard":
      //   return <PipelineDashboard sidebarCollapsed={collapsed} />;

      // case "inventory":
      //   return <Inventory sidebarCollapsed={collapsed} />;

      // case "bankrec":
      //   return <BankReconciliation sidebarCollapsed={collapsed} />;
      // case "chartsofaccounts":
      //   return <ChartOfAccounts sidebarCollapsed={collapsed} />;
      // case "financialreports":
      //   return <FinancialReports sidebarCollapsed={collapsed} />;
      // case "vendor":
      //   return <VendorPage sidebarCollapsed={collapsed} />;
      // case "expense":
      //   return <ExpensePage sidebarCollapsed={collapsed} />;
      // case "employee":
      //   return <WPSPayrollPage sidebarCollapsed={collapsed} />;
      // case "manualjournal":
      //   return <ManualJournals sidebarCollapsed={collapsed} />;
      // case "expensesinvoicing":
      //   return <ExpenseInvoices sidebarCollapsed={collapsed} />;
      case "invoiceadj":
        return <InvoiceAdjustments sidebarCollapsed={collapsed} />;
      case "inventoryinvoice":
        return <InventoryInvoices sidebarCollapsed={collapsed} />;
      case "inventorysalesinvoice":
        return <InventorySalesInvoices sidebarCollapsed={collapsed} />;
      case "operations":
        return <OperationsPage sidebarCollapsed={collapsed} setCurrentPage={setCurrentPage}/>;
      default:
        return <Leads />;
    }
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login />}
      />

      <Route
        path="/"
        element={
          <RequireAuth>
            <div className="flex">
              <Sidebar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                collapsed={collapsed}
                onLogout={logout}
              />

              <div
                className="flex-1 min-h-screen bg-gray-50"
                
              >
                <TopBar
                  pageTitle={currentPage.toUpperCase()}
                  sidebarCollapsed={collapsed}
                  onLogout={logout}
                />

                <div className="pt-[64px]">
                  {renderPage()}
                </div>
              </div>
            </div>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;