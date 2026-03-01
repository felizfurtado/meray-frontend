import React from 'react';

import logo from './logo_circle.png';
const Sidebar = ({ currentPage, setCurrentPage, collapsed, onLogout }) => {
  const navItems = [
    // { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie' },
    { id: 'leads', label: 'Leads', icon: 'fas fa-users' },
    // { id: 'customers', label: 'Customers', icon: 'fas fa-user-tie' },
    // { id: 'invoices', label: 'Invoices', icon: 'fas fa-file-invoice' },
    // { id: 'invoiceadj', label: 'Invoices Adjustment', icon: 'fas fa-file-invoice' },
    // { id: 'tasks', label: 'Tasks', icon: 'fas fa-tasks' },
    // { id: 'company-profile', label: 'Company', icon: 'fas fa-building' },
    // { id: 'vendor', label: 'vendor', icon: 'fas fa-building' },
    // { id: 'expense', label: 'expense', icon: 'fas fa-building' },
    // { id: 'employee', label: 'employee', icon: 'fas fa-building' },
    // { id: 'datamigration', label: 'Migration', icon: 'fas fa-exchange' },
    // { id: 'pipelinedashboard', label: 'Pipeline Dashboard', icon: 'fas fa-warehouse' },
    // { id: 'inventory', label: 'Inventory', icon: 'fas fa-warehouse' },
    // { id: 'inventoryinvoice', label: 'Inventory Purchase Invoice', icon: 'fas fa-warehouse' },
    // { id: 'inventorysalesinvoice', label: 'Inventory Sales Invoicing', icon: 'fas fa-warehouse' },
    // { id: 'bankrec', label: 'Bank Recon', icon: 'fas fa-wallet' },
    // { id: 'chartsofaccounts', label: 'Chart Of Accounts', icon: 'fas fa-chart-bar' },
    // { id: 'financialreports', label: 'Financial Reports', icon: 'fas fa-file' },
    // { id: 'manualjournal', label: 'Manual Journal', icon: 'fas fa-file' },
    // { id: 'expensesinvoicing', label: 'Expenses Invoicing', icon: 'fas fa-file' },
    { id: 'operations', label: 'Operations', icon: 'fas fa-file' },
    // { id: 'settings', label: 'Settings', icon: 'fas fa-cog' }
  ];

  return (
    <aside className={`
      fixed top-0 left-0 h-screen z-50
      bg-white border-r border-gray-200
      flex flex-col items-center py-0
      shadow-lg
      transition-all duration-300 ease-in-out
      ${collapsed ? 'w-[60px]' : 'w-[80px]'}
    `}>
      
      {/* Logo Container */}
      <div className={`
        flex flex-col items-center gap-2
        py-3 border-b border-gray-200
        w-full h-auto justify-center
        transition-all duration-300
      `}>
                <img 
          src={logo}
          alt="Meray Logo"
          className={`
            transition-all duration-300 
            ${collapsed ? 'w-8 h-8' : 'w-10 h-10'}
          `}
        />
        
        {/* {!collapsed && (
  <img
    src={logoTxt}
    alt="Meray Text Logo"
    className="w-16 object-contain transition-all duration-300"
  />
)} */}
      </div>

      {/* Navigation Items */}
      <div className={`
        flex flex-col items-center gap-3 w-full
        flex-1 pt-5 px-2 overflow-y-auto
      `}>
        {navItems.map((item) => (
          <div 
            key={item.id}
            className={`
              flex flex-col items-center gap-1.5 w-full
              py-2 cursor-pointer transition-all duration-200
              relative rounded-lg group
              hover:bg-blue-50
              ${currentPage === item.id ? 'bg-blue-50' : ''}
            `}
            onClick={() => setCurrentPage(item.id)}
            title={collapsed ? item.label : ''}
          >
            {/* Active Indicator */}
            {currentPage === item.id && (
              <div className="
                absolute left-0 top-0 h-full w-1
              " />
            )}

            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              text-gray-600 text-lg transition-all duration-200
              ${currentPage === item.id ? 
                'bg-gradient-to-br from-blue2 to-blue2 text-white shadow-md' : 
                ''
              }
              group-hover:text-gray
            `}>
              <i className={item.icon} />
            </div>
            
            {!collapsed && (
              <div className={`
                text-xs text-gray-600 font-medium
                text-center max-w-[70px] leading-tight
                transition-all duration-300
                ${currentPage === item.id ? 'text-blue2 font-semibold' : ''}
                group-hover:text-blue2 group-hover:font-semibold
              `}>
                {item.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Profile Section with Logout */}
      <div className={`
        mt-auto pt-4 border-t border-gray-200
        w-full flex flex-col items-center pb-4 px-2
        transition-all duration-300
      `}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue2 to-blue2 mb-2 flex items-center justify-center text-white text-xs font-semibold">
          A
        </div>
        
        {!collapsed && (
          <>
            <div className="text-xs text-gray-600 font-medium text-center mb-2">
              Admin
            </div>
            <button
              onClick={onLogout}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors w-full justify-center py-1 rounded hover:bg-red-50"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={onLogout}
            className="text-xs text-red-600 hover:text-red-700"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;