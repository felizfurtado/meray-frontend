import React, { useState, useEffect } from "react";
import Table from "../components/layout/Table";
import api from "../api/api";

const ExpensePage = ({ sidebarCollapsed = false, refreshKey }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  // Fetch expenses data
  useEffect(() => {
    fetchExpenses();
  }, [refreshKey]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Mock API response - replace with actual API call
      const response = await api.get('/expenses/');
      setExpenses(response.data.expenses || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      // For demo purposes, use mock data
      setExpenses(getMockExpenses());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const getMockExpenses = () => [
    {
      id: "EXP-1001",
      expense_number: "EXP-1001",
      date: "2024-01-15",
      vendor_name: "Office Supplies Co.",
      vendor_email: "supplies@officeco.com",
      currency: "AED",
      amount: 270.00,
      status: "POSTED",
      notes: "Monthly office supplies including printer paper, ink cartridges, and stationery",
      category: "Office Supplies"
    },
    {
      id: "EXP-1002",
      expense_number: "EXP-1002",
      date: "2024-01-18",
      vendor_name: "ABC Stationery",
      vendor_email: "orders@abcstationery.com",
      currency: "AED",
      amount: 185.50,
      status: "APPROVED",
      notes: "Whiteboard markers, notebooks, and pens for team",
      category: "Stationery"
    },
    {
      id: "EXP-1003",
      expense_number: "EXP-1003",
      date: "2024-01-20",
      vendor_name: "Tech Solutions LLC",
      vendor_email: "billing@techsolutions.ae",
      currency: "AED",
      amount: 1200.00,
      status: "DRAFT",
      notes: "Annual software license renewal for accounting software",
      category: "Software"
    },
    {
      id: "EXP-1004",
      expense_number: "EXP-1004",
      date: "2024-01-22",
      vendor_name: "Cloud Hosting Inc.",
      vendor_email: "support@cloudhosting.com",
      currency: "AED",
      amount: 499.99,
      status: "POSTED",
      notes: "Monthly cloud hosting fees for company website",
      category: "Hosting"
    },
    {
      id: "EXP-1005",
      expense_number: "EXP-1005",
      date: "2024-01-25",
      vendor_name: "Digital Marketing Agency",
      vendor_email: "accounts@digitalmarketing.ae",
      currency: "AED",
      amount: 2500.00,
      status: "APPROVED",
      notes: "Q1 social media marketing campaign",
      category: "Marketing"
    },
    {
      id: "EXP-1006",
      expense_number: "EXP-1006",
      date: "2024-01-28",
      vendor_name: "Office Cleaners",
      vendor_email: "admin@officecleaners.ae",
      currency: "AED",
      amount: 800.00,
      status: "PAID",
      notes: "Monthly office cleaning service - January",
      category: "Cleaning"
    },
    {
      id: "EXP-1007",
      expense_number: "EXP-1007",
      date: "2024-01-30",
      vendor_name: "Internet Provider",
      vendor_email: "billing@internetprovider.ae",
      currency: "AED",
      amount: 450.00,
      status: "POSTED",
      notes: "Monthly internet subscription fee",
      category: "Utilities"
    },
    {
      id: "EXP-1008",
      expense_number: "EXP-1008",
      date: "2024-02-01",
      vendor_name: "Coffee Supplies",
      vendor_email: "orders@coffeesupplies.com",
      currency: "AED",
      amount: 320.00,
      status: "DRAFT",
      notes: "Monthly office coffee and snacks",
      category: "Refreshments"
    },
    {
      id: "EXP-1009",
      expense_number: "EXP-1009",
      date: "2024-02-03",
      vendor_name: "Printing Services",
      vendor_email: "print@printingservices.ae",
      currency: "AED",
      amount: 175.00,
      status: "REJECTED",
      notes: "Marketing brochures printing - requires approval",
      category: "Printing"
    },
    {
      id: "EXP-1010",
      expense_number: "EXP-1010",
      date: "2024-02-05",
      vendor_name: "Security Services",
      vendor_email: "accounts@securityservices.ae",
      currency: "AED",
      amount: 1200.00,
      status: "APPROVED",
      notes: "Monthly security services contract",
      category: "Security"
    },
    {
      id: "EXP-1011",
      expense_number: "EXP-1011",
      date: "2024-02-08",
      vendor_name: "Travel Agency",
      vendor_email: "corporate@travelagency.ae",
      currency: "AED",
      amount: 3500.00,
      status: "POSTED",
      notes: "Business travel - Sales team conference",
      category: "Travel"
    },
    {
      id: "EXP-1012",
      expense_number: "EXP-1012",
      date: "2024-02-10",
      vendor_name: "Legal Services",
      vendor_email: "billing@legalservices.ae",
      currency: "AED",
      amount: 2000.00,
      status: "APPROVED",
      notes: "Monthly retainer for legal consultation",
      category: "Legal"
    },
  ];

  // Filter expenses based on search query
  const filteredExpenses = expenses.filter(expense => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      expense.expense_number.toLowerCase().includes(searchLower) ||
      expense.vendor_name.toLowerCase().includes(searchLower) ||
      expense.notes.toLowerCase().includes(searchLower) ||
      expense.category.toLowerCase().includes(searchLower)
    );
  });

  // Format currency
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        border: "border-gray-200",
        icon: "fas fa-file-alt",
        label: "Draft"
      },
      POSTED: {
        bg: "bg-blue-50",
        text: "text-blue2",
        border: "border-blue-200",
        icon: "fas fa-paper-plane",
        label: "Posted"
      },
      APPROVED: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
        icon: "fas fa-check-circle",
        label: "Approved"
      },
      REJECTED: {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
        icon: "fas fa-times-circle",
        label: "Rejected"
      },
      PAID: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
        icon: "fas fa-money-check-alt",
        label: "Paid"
      }
    };

    const config = statusConfig[status] || statusConfig.DRAFT;

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${config.border} ${config.bg}`}>
        <i className={`${config.icon} ${config.text} text-xs`}></i>
        <span className={`text-xs font-medium ${config.text}`}>
          {config.label}
        </span>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Table columns
  const columns = [
    {
      field: "expense_number",
      header: "Expense #",
      sortable: true,
      width: "120px",
      render: (value) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-semibold text-blue2">
            {value}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            Reference
          </span>
        </div>
      ),
    },
    {
      field: "date",
      header: "Date",
      sortable: true,
      width: "110px",
      render: (value) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {formatDate(value)}
          </span>
          <span className="text-xs text-gray-500">
            Expense Date
          </span>
        </div>
      ),
    },
    {
      field: "vendor_name",
      header: "Vendor",
      sortable: true,
      width: "220px",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm font-semibold flex items-center justify-center">
              {value?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="font-medium text-gray-900 text-sm truncate">
              {value}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {row.vendor_email || "No email"}
            </div>
          </div>
        </div>
      ),
    },
   
    {
      field: "amount",
      header: "Amount",
      sortable: true,
      width: "140px",
      render: (value, row) => {
        const amount = parseFloat(value);
        const isLargeAmount = amount > 1000;
        
        return (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
              isLargeAmount ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
            }`}>
              <i className="fas fa-money-bill-wave text-sm"></i>
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-bold ${isLargeAmount ? 'text-amber-600' : 'text-green-600'}`}>
                {formatCurrency(amount, row.currency)}
              </span>
              <span className="text-xs text-gray-500">
                {row.currency}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      width: "120px",
      render: (value) => getStatusBadge(value),
    },
    {
      field: "notes",
      header: "Notes",
      sortable: false,
      width: "250px",
      render: (value) => (
        <div className="flex flex-col">
          <p className="text-sm text-gray-900 line-clamp-2">
            {value || "No description"}
          </p>
          <span className="text-xs text-gray-500 mt-0.5">
            Description
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      field: "actions",
      type: "actions",
      width: "160px",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {/* View Button */}
          <button
            className="w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue2 hover:border-blue2 flex items-center justify-center transition-colors"
            title="View Expense"
            onClick={(e) => {
              e.stopPropagation();
              // Add view functionality
              console.log("View expense:", row.expense_number);
            }}
          >
            <i className="fas fa-eye text-xs"></i>
          </button>
          
          {/* Edit Button */}
          <button
            className="w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue2 hover:border-blue2 flex items-center justify-center transition-colors"
            title="Edit Expense"
            onClick={(e) => {
              e.stopPropagation();
              // Add edit functionality
              console.log("Edit expense:", row.expense_number);
            }}
          >
            <i className="fas fa-edit text-xs"></i>
          </button>
          
   
          
          {/* Delete Button */}
          <button
            className="w-9 h-9 rounded-md border border-gray-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-colors"
            title="Delete Expense"
            onClick={(e) => {
              e.stopPropagation();
              // Add delete functionality
              if (window.confirm(`Are you sure you want to delete ${row.expense_number}?`)) {
                console.log("Delete expense:", row.expense_number);
              }
            }}
          >
            <i className="fas fa-trash text-xs"></i>
          </button>
        </div>
      ),
    },
  ];

  // Handle expense selection
  const handleSelectExpense = (expenseId) => {
    if (selectedExpenses.includes(expenseId)) {
      setSelectedExpenses(selectedExpenses.filter(id => id !== expenseId));
    } else {
      setSelectedExpenses([...selectedExpenses, expenseId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedExpenses.length === filteredExpenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(filteredExpenses.map(expense => expense.id));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Table Section */}
      <div className="flex-1">
        <Table
          title="Expenses"
          icon="🧾"
          columns={columns}
          data={filteredExpenses}
          loading={loading}
          sidebarCollapsed={sidebarCollapsed}
          searchPlaceholder="Search by expense #, vendor, notes..."
          pageSize={10}
          defaultSort={{
            field: "date",
            direction: "desc",
          }}
          emptyMessage={
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <i className="fas fa-receipt text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Expenses Found</h3>
              <p className="text-gray-600">Add your first expense to get started.</p>
            </div>
          }
          containerClassName="flex-1 flex flex-col h-full"
          tableContainerClassName="flex-1"
          tableWrapperClassName="min-w-full"
        />
      </div>
    </div>
  );
};

export default ExpensePage;