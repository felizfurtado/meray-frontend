import React, { useState, useEffect } from "react";
import Table from "../components/layout/Table";
import PageHeader from "../components/layout/PageHeader";

import api from "../api/api";

const VendorPage = ({ sidebarCollapsed = false, refreshKey }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendors, setSelectedVendors] = useState([]);

  // Fetch vendors data
  useEffect(() => {
    fetchVendors();
  }, [refreshKey]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      // Mock API response - replace with actual API call
      const response = await api.get('/vendors/');
      setVendors(response.data.vendors || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      // For demo purposes, use mock data
      setVendors(getMockVendors());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const getMockVendors = () => [
    {
      id: "VN-0001",
      vendor_name: "John Doe",
      company: "Doe Supplies",
      email: "john@doe.com",
      phone: "+971 50 123 4567",
      total_bills: 5,
      total_amount: 1200,
      category: "Electronics",
      last_purchase: "2024-01-15",
      rating: 4.5
    },
    {
      id: "VN-0002",
      vendor_name: "Sarah Smith",
      company: "Smith Industries",
      email: "sarah@smith.com",
      phone: "+971 55 987 6543",
      total_bills: 12,
      total_amount: 8500,
      category: "Construction",
      last_purchase: "2024-01-20",
      rating: 4.8
    },
    {
      id: "VN-0003",
      vendor_name: "Mohammed Ali",
      company: "Ali Trading",
      email: "mohammed@alitrading.com",
      phone: "+971 52 456 7890",
      total_bills: 3,
      total_amount: 3200,
      category: "Office Supplies",
      last_purchase: "2024-01-10",
      rating: 4.2
    },
    {
      id: "VN-0004",
      vendor_name: "Emma Wilson",
      company: "Wilson Solutions",
      email: "emma@wilson.com",
      phone: "+971 56 789 0123",
      total_bills: 8,
      total_amount: 6500,
      category: "IT Services",
      last_purchase: "2024-01-18",
      rating: 4.7
    },
    {
      id: "VN-0005",
      vendor_name: "David Chen",
      company: "Chen Manufacturing",
      email: "david@chen.com",
      phone: "+971 54 321 0987",
      total_bills: 15,
      total_amount: 12500,
      category: "Manufacturing",
      last_purchase: "2024-01-22",
      rating: 4.9
    },
    {
      id: "VN-0005",
      vendor_name: "David Chen",
      company: "Chen Manufacturing",
      email: "david@chen.com",
      phone: "+971 54 321 0987",
      total_bills: 15,
      total_amount: 12500,
      category: "Manufacturing",
      last_purchase: "2024-01-22",
      rating: 4.9
    },
  
  ];

  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      vendor.vendor_name.toLowerCase().includes(searchLower) ||
      vendor.company.toLowerCase().includes(searchLower) ||
      vendor.email.toLowerCase().includes(searchLower) ||
      vendor.id.toLowerCase().includes(searchLower)
    );
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Table columns (removed category, status, last_purchase)
  const columns = [
    {
      field: "vendor_name",
      header: "Vendor",
      sortable: true,
      width: "220px",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue1 to-blue2 text-white text-sm font-semibold flex items-center justify-center">
              {row.company?.charAt(0)?.toUpperCase() || "?"}
            </div>
            {/* Removed star badge */}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="font-medium text-gray-900 text-sm truncate">
              {value}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {row.company}
            </div>
          </div>
        </div>
      ),
    },
    {
      field: "id",
      header: "Vendor ID",
      sortable: true,
      width: "110px",
      render: (value) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-semibold text-blue2">
            {value}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">
            Unique ID
          </span>
        </div>
      ),
    },
    {
      field: "contact_info",
      header: "Contact Info",
      sortable: false,
      width: "180px",
      render: (value, row) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <i className="fas fa-envelope text-xs text-gray-400 w-4"></i>
            <a 
              href={`mailto:${row.email}`}
              className="text-xs text-blue2 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
              title={row.email}
            >
              {row.email}
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="fas fa-phone text-xs text-gray-400 w-4"></i>
            <a 
              href={`tel:${row.phone}`}
              className="text-xs text-gray-700 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
              title={row.phone}
            >
              {row.phone}
            </a>
          </div>
        </div>
      ),
    },
    {
      field: "total_bills",
      header: "Total Bills",
      sortable: true,
      width: "120px",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center">
            <i className="fas fa-file-invoice text-sm"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">{value}</span>
            <span className="text-xs text-gray-500">Bills</span>
          </div>
        </div>
      ),
    },
    {
      field: "total_amount",
      header: "Total Amount",
      sortable: true,
      width: "150px",
      render: (value) => {
        const amount = parseFloat(value);
        const isHighValue = amount > 5000;
        
        return (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
              isHighValue ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <i className="fas fa-money-bill-wave text-sm"></i>
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-bold ${isHighValue ? 'text-green-600' : 'text-amber-600'}`}>
                {formatCurrency(amount)}
              </span>
              <span className="text-xs text-gray-500">
                {isHighValue ? 'High Value' : 'Standard'}
              </span>
            </div>
          </div>
        );
      },
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
            title="View Vendor"
            onClick={(e) => {
              e.stopPropagation();
              // Add view functionality
              console.log("View vendor:", row.id);
            }}
          >
            <i className="fas fa-eye text-xs"></i>
          </button>
          
          {/* Edit Button */}
          <button
            className="w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue2 hover:border-blue2 flex items-center justify-center transition-colors"
            title="Edit Vendor"
            onClick={(e) => {
              e.stopPropagation();
              // Add edit functionality
              console.log("Edit vendor:", row.id);
            }}
          >
            <i className="fas fa-edit text-xs"></i>
          </button>
          
  
          
          {/* Delete Button */}
          <button
            className="w-9 h-9 rounded-md border border-gray-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-colors"
            title="Delete Vendor"
            onClick={(e) => {
              e.stopPropagation();
              // Add delete functionality
              if (window.confirm(`Are you sure you want to delete ${row.vendor_name}?`)) {
                console.log("Delete vendor:", row.id);
              }
            }}
          >
            <i className="fas fa-trash text-xs"></i>
          </button>
        </div>
      ),
    },
  ];

  // Handle vendor selection
  const handleSelectVendor = (vendorId) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedVendors.length === filteredVendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(filteredVendors.map(vendor => vendor.id));
    }
  };

  return (
    <div className="h-full flex flex-col">
    <PageHeader
        title="Vendor Managemnt"
        description="Manage all your vendors in one place"
        icon="fas fa-tasks"
        buttonText="Add Task"
     
        collapsed={sidebarCollapsed}
      />
      {/* Table Section */}
      <div className="flex-1">
        <Table
          title="Vendors"
          icon="🏢"
          columns={columns}
          data={filteredVendors}
          loading={loading}
          sidebarCollapsed={sidebarCollapsed}
          searchPlaceholder="Search by vendor name, company, email..."
          pageSize={10}
          defaultSort={{
            field: "vendor_name",
            direction: "asc",
          }}
          emptyMessage={
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <i className="fas fa-truck text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vendors Found</h3>
              <p className="text-gray-600">Add your first vendor to get started.</p>
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

export default VendorPage;