import React, { useState, useEffect } from "react";
import PageHeader from "../components/layout/PageHeader";
import Table from "../components/layout/Table";
import InventoryAddModal from "../components/inventory/InventoryAddModal";
import InventoryViewModal from "../components/inventory/InventoryViewModal";
import InventoryDashboard from "../components/inventory/InventoryDashboard";
import api from "../api/api";

// Demo data for fallback
const demoInventoryItems = [
  {
    id: 1,
    item_code: "SP-001",
    item_name: "Ball Bearings",
    category: "Spare Parts",
    description: "High precision ball bearings for industrial machines",
    unit_of_measure: "pcs",
    cost_price: 45.00,
    selling_price: 75.00,
    tax_category: "VAT-15%",
    opening_quantity: 120,
    current_quantity: 45,
    minimum_quantity: 20,
    warehouse: "Warehouse A",
    supplier_name: "Precision Parts Ltd.",
    supplier_code: "PP-001",
    status: "low_stock",
    last_updated: "2024-05-15",
    created_at: "2024-01-10"
  },
  {
    id: 2,
    item_code: "CON-005",
    item_name: "Lubricating Oil",
    category: "Consumables",
    description: "Industrial grade lubricating oil 5L cans",
    unit_of_measure: "cans",
    cost_price: 28.50,
    selling_price: 45.00,
    tax_category: "VAT-15%",
    opening_quantity: 200,
    current_quantity: 180,
    minimum_quantity: 50,
    warehouse: "Warehouse B",
    supplier_name: "OilCo Industries",
    supplier_code: "OC-002",
    status: "in_stock",
    last_updated: "2024-05-18",
    created_at: "2024-02-15"
  },
  {
    id: 3,
    item_code: "ELC-012",
    item_name: "Circuit Breakers",
    category: "Electrical",
    description: "32A Circuit breakers with safety features",
    unit_of_measure: "pcs",
    cost_price: 120.00,
    selling_price: 195.00,
    tax_category: "VAT-15%",
    opening_quantity: 75,
    current_quantity: 12,
    minimum_quantity: 15,
    warehouse: "Warehouse A",
    supplier_name: "ElectroTech Solutions",
    supplier_code: "ET-003",
    status: "low_stock",
    last_updated: "2024-05-20",
    created_at: "2024-03-05"
  },
  {
    id: 4,
    item_code: "SAF-008",
    item_name: "Safety Helmets",
    category: "Safety Equipment",
    description: "Industrial safety helmets with chin strap",
    unit_of_measure: "pcs",
    cost_price: 35.00,
    selling_price: 65.00,
    tax_category: "VAT-15%",
    opening_quantity: 150,
    current_quantity: 85,
    minimum_quantity: 30,
    warehouse: "Warehouse C",
    supplier_name: "SafetyFirst Corp",
    supplier_code: "SF-004",
    status: "in_stock",
    last_updated: "2024-05-12",
    created_at: "2024-01-25"
  },
  {
    id: 5,
    item_code: "TOOL-003",
    item_name: "Drill Machine",
    category: "Tools",
    description: "Heavy duty industrial drill machine",
    unit_of_measure: "pcs",
    cost_price: 450.00,
    selling_price: 750.00,
    tax_category: "VAT-15%",
    opening_quantity: 25,
    current_quantity: 0,
    minimum_quantity: 5,
    warehouse: "Warehouse B",
    supplier_name: "ToolMaster Inc.",
    supplier_code: "TM-005",
    status: "out_of_stock",
    last_updated: "2024-05-22",
    created_at: "2024-02-28"
  },
  {
    id: 6,
    item_code: "PACK-002",
    item_name: "Packaging Boxes",
    category: "Packaging",
    description: "Corrugated cardboard boxes 30x30x30 cm",
    unit_of_measure: "boxes",
    cost_price: 8.50,
    selling_price: 15.00,
    tax_category: "VAT-15%",
    opening_quantity: 500,
    current_quantity: 320,
    minimum_quantity: 100,
    warehouse: "Warehouse C",
    supplier_name: "Packaging Plus",
    supplier_code: "PP-006",
    status: "in_stock",
    last_updated: "2024-05-14",
    created_at: "2024-03-10"
  },
  {
    id: 7,
    item_code: "RAW-001",
    item_name: "Steel Sheets",
    category: "Raw Materials",
    description: "2mm thickness steel sheets 4x8 feet",
    unit_of_measure: "sheets",
    cost_price: 280.00,
    selling_price: 420.00,
    tax_category: "VAT-15%",
    opening_quantity: 80,
    current_quantity: 18,
    minimum_quantity: 25,
    warehouse: "Warehouse A",
    supplier_name: "SteelWorks Ltd.",
    supplier_code: "SW-007",
    status: "low_stock",
    last_updated: "2024-05-19",
    created_at: "2024-01-15"
  },
  {
    id: 8,
    item_code: "CHEM-004",
    item_name: "Industrial Cleaner",
    category: "Chemicals",
    description: "Heavy duty industrial surface cleaner 20L",
    unit_of_measure: "cans",
    cost_price: 95.00,
    selling_price: 150.00,
    tax_category: "VAT-15%",
    opening_quantity: 60,
    current_quantity: 65,
    minimum_quantity: 20,
    warehouse: "Warehouse B",
    supplier_name: "ChemTech Solutions",
    supplier_code: "CT-008",
    status: "in_stock",
    last_updated: "2024-05-16",
    created_at: "2024-03-20"
  }
];

const InventoryManagement = ({ sidebarCollapsed = false }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("table"); // "dashboard" or "table"

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventory/items/");
      setInventoryItems(res.data?.items || res.data || []);
    } catch (err) {
      console.error("Failed to fetch inventory data. Using demo data.", err);
      setInventoryItems(demoInventoryItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleItemCreate = async () => {
    await fetchInventoryData();
  };

  const handleItemDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.item_name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/inventory/items/${item.id}/delete/`);
      alert(`Item "${item.item_name}" deleted successfully`);
      fetchInventoryData();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete item: " + (err.response?.data?.error || err.message));
    }
  };

  const openItemView = (item) => {
    setSelectedItem(item);
    setViewModalOpen(true);
  };

  // Calculate inventory stats
  const inventoryStats = [
    {
      label: "Total Items",
      value: inventoryItems.length,
      color: "bg-blue2",
      icon: "fas fa-boxes"
    },
    {
      label: "Out of Stock",
      value: inventoryItems.filter(item => item.status === "out_of_stock").length,
      color: "bg-red-500",
      icon: "fas fa-exclamation-triangle"
    },
    {
      label: "Low Stock",
      value: inventoryItems.filter(item => item.status === "low_stock").length,
      color: "bg-amber-500",
      icon: "fas fa-exclamation-circle"
    },
    {
      label: "In Stock",
      value: inventoryItems.filter(item => item.status === "in_stock").length,
      color: "bg-green-500",
      icon: "fas fa-check-circle"
    }
  ];

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  // Get columns for table
  const getColumns = () => {
    const columns = [
      // Item Information Column
      {
        field: "item_code",
        header: "Item",
        sortable: true,
        width: "240px",
        render: (value, row) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <i className="fas fa-box text-blue2 text-sm"></i>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">
                {row.item_name}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                  {value}
                </span>
                <span className="text-xs text-blue2 bg-blue-50 px-2 py-0.5 rounded">
                  {row.category}
                </span>
              </div>
            </div>
          </div>
        ),
      },

      // Stock Information Column
      {
        field: "current_quantity",
        header: "Stock",
        sortable: true,
        width: "140px",
        render: (value, row) => (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              row.status === "out_of_stock" ? "bg-red-50 text-red-600" :
              row.status === "low_stock" ? "bg-amber-50 text-amber-600" :
              "bg-green-50 text-green-600"
            }`}>
              <i className={`fas ${
                row.status === "out_of_stock" ? "fa-times-circle" :
                row.status === "low_stock" ? "fa-exclamation-circle" :
                "fa-check-circle"
              } text-sm`}></i>
            </div>
            <div className="flex flex-col">
              <span className={`text-base font-bold ${
                row.status === "out_of_stock" ? "text-red-600" :
                row.status === "low_stock" ? "text-amber-600" :
                "text-gray-900"
              }`}>
                {value}
              </span>
              <span className="text-xs text-gray-500">
                {row.unit_of_measure}
              </span>
              {row.status === "low_stock" && (
                <span className="text-xs text-amber-600 mt-0.5">
                  Min: {row.minimum_quantity}
                </span>
              )}
            </div>
          </div>
        ),
      },

      // Cost & Price Column
      {
        field: "cost_price",
        header: "Cost & Price",
        sortable: true,
        width: "160px",
        render: (value, row) => (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Cost:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Sell:</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(row.selling_price)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Margin:</span>
              <span className={`text-xs font-medium ${
                row.selling_price > row.cost_price ? "text-green-600" : "text-red-600"
              }`}>
                {row.selling_price && row.cost_price 
                  ? `${((row.selling_price - row.cost_price) / row.cost_price * 100).toFixed(1)}%`
                  : "-"
                }
              </span>
            </div>
          </div>
        ),
      },

      // Warehouse & Supplier Column
      {
        field: "warehouse",
        header: "Location & Supplier",
        sortable: true,
        width: "180px",
        render: (value, row) => (
          <div className="space-y-2">
            {value && (
              <div className="flex items-center gap-2">
                <i className="fas fa-warehouse text-xs text-gray-400"></i>
                <span className="text-sm text-gray-900 truncate">{value}</span>
              </div>
            )}
            {row.supplier_name && (
              <div className="flex items-center gap-2">
                <i className="fas fa-truck text-xs text-gray-400"></i>
                <span className="text-sm text-gray-700 truncate">{row.supplier_name}</span>
              </div>
            )}
          </div>
        ),
      },

      // Tax Category Column
      {
        field: "tax_category",
        header: "Tax",
        sortable: true,
        width: "100px",
        render: (value) => (
          <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-100">
            {value}
          </span>
        ),
      },

      // Status Column
      {
        field: "status",
        header: "Status",
        sortable: true,
        width: "120px",
        render: (value) => {
          const statusConfig = {
            "in_stock": {
              bg: "bg-green-50",
              text: "text-green-700",
              border: "border-green-200",
              icon: "fa-check-circle",
              label: "In Stock"
            },
            "low_stock": {
              bg: "bg-amber-50",
              text: "text-amber-700",
              border: "border-amber-200",
              icon: "fa-exclamation-circle",
              label: "Low Stock"
            },
            "out_of_stock": {
              bg: "bg-red-50",
              text: "text-red-700",
              border: "border-red-200",
              icon: "fa-times-circle",
              label: "Out of Stock"
            },
            "on_order": {
              bg: "bg-blue-50",
              text: "text-blue2",
              border: "border-blue-200",
              icon: "fa-clock",
              label: "On Order"
            }
          };

          const config = statusConfig[value] || {
            bg: "bg-gray-100",
            text: "text-gray-700",
            border: "border-gray-200",
            icon: "fa-circle",
            label: "Unknown"
          };

          return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.border} ${config.bg}`}>
              <i className={`fas ${config.icon} ${config.text} text-xs`}></i>
              <span className={`font-medium text-xs ${config.text}`}>
                {config.label}
              </span>
            </div>
          );
        },
      },

      // Actions Column
      {
        header: "Actions",
        field: "actions",
        type: "actions",
        width: "140px",
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue2 hover:border-blue2 flex items-center justify-center transition-all duration-200"
              title="View Details"
              onClick={(e) => {
                e.stopPropagation();
                openItemView(row);
              }}
            >
              <i className="fas fa-eye text-sm"></i>
            </button>
            
            <button
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200 flex items-center justify-center transition-all duration-200"
              title="Edit Item"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(row);
                setAddModalOpen(true);
              }}
            >
              <i className="fas fa-edit text-sm"></i>
            </button>
            
            <button
              className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center transition-all duration-200"
              title="Delete Item"
              onClick={(e) => {
                e.stopPropagation();
                handleItemDelete(row);
              }}
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          </div>
        ),
      },
    ];

    return columns;
  };

  const leftMargin = sidebarCollapsed ? 'ml-[60px]' : 'ml-[140px]';

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Inventory Management"
        description="Manage your inventory items, stock levels, and suppliers"
        icon="fas fa-boxes"
        buttonText="Add New Item"
        onButtonClick={() => {
          setSelectedItem(null);
          setAddModalOpen(true);
        }}
        stats={inventoryStats}
        collapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div >
        <div >
          {/* Tab Navigation */}
          <div className={`${leftMargin} mr-14 mt-4 transition-all duration-300`}>
            <nav className="-mb-px flex space-x-8">
            <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "dashboard"
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-chart-pie mr-2"></i>
                Analytics Dashboard
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "table"
                    ? 'border-blue2 text-blue2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-table mr-2"></i>
                Inventory Items
              </button>
              
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-4">
            {activeTab === "table" ? (
              <div className=" rounded-lg border border-gray-200">
                <div className="flex flex-col ">
                  <Table
                    title="Inventory Items"
                    icon="fas fa-box"
                    columns={getColumns()}
                    data={inventoryItems}
                    loading={loading}
                    sidebarCollapsed={sidebarCollapsed}
                    onRowClick={(row) => openItemView(row)}
                    searchPlaceholder="Search by item code, name, category..."
                    pageSize={20}
                    defaultSort={{ field: "item_code", direction: "asc" }}
                    emptyMessage={
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <i className="fas fa-boxes text-2xl text-blue-600"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Inventory Items</h3>
                        <p className="text-gray-600">Add your first inventory item to get started.</p>
                      </div>
                    }
                    className="flex-1"
                    containerClassName="h-full flex flex-col"
                    tableContainerClassName="flex-1 overflow-auto"
                    tableWrapperClassName="min-w-full"
                    tableClassName="w-full divide-y divide-gray-200"
                  />
                </div>
              </div>
            ) : (

                <div className={`${leftMargin} mr-14 mt-4 `}>

              <InventoryDashboard 
                inventoryData={inventoryItems}
                refreshKey={inventoryItems.length}
                onRefresh={fetchInventoryData}
              />
              <br></br>
              <br></br>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <InventoryAddModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setSelectedItem(null);
        }}
        onSuccess={handleItemCreate}
        item={selectedItem}
      />

      {/* View Modal */}
      <InventoryViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </div>
  );
};

export default InventoryManagement;