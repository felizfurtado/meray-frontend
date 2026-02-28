// pages/OperationsPage.jsx
import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import SubNav from '../components/layout/SubNav';

const OperationsPage = ({ collapsed = false }) => {
  const [activeSection, setActiveSection] = useState('revenue');

  const operationsData = {
    label: "Customers",
    icon: "fas fa-briefcase",
    sections: {
      revenue: {
        label: "Revenue",
        items: [
          { name: "Customers", path: "/customers", icon: "fas fa-users" },
          { name: "Invoicing", path: "/invoices", icon: "fas fa-file-invoice" }
        ]
      },
      expenses: {
        label: "Expenses",
        items: [
          { name: "Vendors", path: "/vendors", icon: "fas fa-truck" },
          { name: "Expense Input", path: "/expenses", icon: "fas fa-receipt" },
          { name: "Expense Invoicing", path: "/expense-invoices", icon: "fas fa-file-invoice-dollar" }
        ]
      },
      accounting: {
        label: "Accounting",
        items: [
          { name: "Chart of Accounts", path: "/chart-of-accounts", icon: "fas fa-book" },
          { name: "Manual Journals", path: "/manual-journals", icon: "fas fa-pen" }
        ]
      },
      inventory: {
        label: "Inventory",
        items: [
          { name: "Inventory", path: "/inventory", icon: "fas fa-box" },
          { name: "Sales Invoices", path: "/inventory-sales-invoices", icon: "fas fa-file-invoice" },
          { name: "Purchase Invoices", path: "/inventory-invoices", icon: "fas fa-file-invoice-dollar" }
        ]
      }
    }
  };

  const handleAddNew = () => {
    console.log('Add new in section:', operationsData.sections[activeSection].label);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      
      <PageHeader 
        title={operationsData.label}
        description="Manage your business operations"
        icon={operationsData.icon}
        buttonText="Add New"
        onButtonClick={handleAddNew}
        collapsed={collapsed}
      />

      <div className="mt-6">
        <SubNav collapsed={collapsed} />
      </div>

      

      
    </div>
  );
};

export default OperationsPage;