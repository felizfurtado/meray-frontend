// components/SubNav.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SubNav = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('revenue');

  // Static data based on your backend response
  const operationsData = {
    sections: {
      revenue: {
        label: "Revenue",
        icon: "fas fa-chart-line",
        items: [
          {
            name: "Customers",
            path: "/customers",
            icon: "fas fa-users"
          },
          {
            name: "Invoicing",
            path: "/invoices",
            icon: "fas fa-file-invoice"
          }
        ]
      },
      expenses: {
        label: "Expenses",
        icon: "fas fa-arrow-trend-down",
        items: [
          {
            name: "Vendors",
            path: "/vendors",
            icon: "fas fa-truck"
          },
          {
            name: "Expense Input",
            path: "/expenses",
            icon: "fas fa-receipt"
          },
          {
            name: "Expense Invoicing",
            path: "/expense-invoices",
            icon: "fas fa-file-invoice-dollar"
          }
        ]
      },
      accounting: {
        label: "Accounting",
        icon: "fas fa-calculator",
        items: [
          {
            name: "Chart of Accounts",
            path: "/chart-of-accounts",
            icon: "fas fa-book"
          },
          {
            name: "Manual Journals",
            path: "/manual-journals",
            icon: "fas fa-pen"
          }
        ]
      },
      inventory: {
        label: "Inventory",
        icon: "fas fa-boxes",
        items: [
          {
            name: "Inventory",
            path: "/inventory",
            icon: "fas fa-box"
          },
          {
            name: "Sales Invoices",
            path: "/inventory-sales-invoices",
            icon: "fas fa-file-invoice"
          },
          {
            name: "Purchase Invoices",
            path: "/inventory-invoices",
            icon: "fas fa-file-invoice-dollar"
          }
        ]
      }
    }
  };

  // Calculate left margin based on sidebar width
  const leftMargin = collapsed ? 'ml-[60px]' : 'ml-[140px]';

  // Handle item click
  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className={`${leftMargin} mr-14 transition-all duration-300`}>
      {/* Simple Top Navigation */}
      <nav className="bg-blue2 rounded-xl border border-blue2/20 w-full overflow-hidden">
        {/* Section Icons Row */}
        <div className="flex items-center justify-between w-full px-4 py-2 border-b border-white/20 gap-2">
          {Object.entries(operationsData.sections).map(([key, section]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border ${
                activeSection === key
                  ? 'border-white bg-white text-blue2'
                  : 'border-transparent text-white/90 hover:border-white/40 hover:bg-white/10'
              }`}
            >
              <i className={`${section.icon} text-base`}></i>
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Items Row */}
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {operationsData.sections[activeSection].items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item.path)}
                className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5   hover:border border-white hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30">
                  <i className={`${item.icon} text-sm text-white`}></i>
                </div>
                <span className="text-sm font-medium text-white">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SubNav;