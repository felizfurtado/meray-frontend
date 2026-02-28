import React, { useState, useEffect } from "react";
import api from "../../api/api";

const InventoryDashboard = ({ inventoryData = [], refreshKey, onRefresh }) => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    averageMargin: 0,
    totalCategories: 0,
    averageStockLevel: 0,
    highValueItems: 0
  });

  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [stockStatusDistribution, setStockStatusDistribution] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");

  // Calculate dashboard stats
  useEffect(() => {
    if (!inventoryData.length) return;

    calculateStats();
  }, [inventoryData, refreshKey]);

  const calculateStats = () => {
    setLoading(true);
    
    // Calculate basic stats
    const totalItems = inventoryData.length;
    const totalValue = inventoryData.reduce((sum, item) => 
      sum + (item.cost_price * item.current_quantity), 0
    );
    
    const lowStockItems = inventoryData.filter(item => 
      item.status === "low_stock"
    ).length;
    
    const outOfStockItems = inventoryData.filter(item => 
      item.status === "out_of_stock"
    ).length;
    
    // Calculate average margin for items with selling price
    const itemsWithPrice = inventoryData.filter(item => 
      item.selling_price && item.cost_price
    );
    const averageMargin = itemsWithPrice.length > 0
      ? itemsWithPrice.reduce((sum, item) => 
          sum + ((item.selling_price - item.cost_price) / item.cost_price * 100), 0
        ) / itemsWithPrice.length
      : 0;
    
    // Calculate unique categories
    const uniqueCategories = [...new Set(inventoryData.map(item => item.category))];
    
    // Calculate average stock level
    const averageStockLevel = totalItems > 0
      ? inventoryData.reduce((sum, item) => sum + item.current_quantity, 0) / totalItems
      : 0;
    
    // Count high value items (cost * quantity > 5000)
    const highValueItems = inventoryData.filter(item => 
      (item.cost_price * item.current_quantity) > 5000
    ).length;

    setStats({
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      averageMargin,
      totalCategories: uniqueCategories.length,
      averageStockLevel,
      highValueItems
    });

    // Calculate category distribution
    const categoryData = {};
    inventoryData.forEach(item => {
      categoryData[item.category] = (categoryData[item.category] || 0) + 1;
    });
    const categoryArray = Object.entries(categoryData).map(([name, count]) => ({
      name,
      count,
      percentage: (count / totalItems * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
    setCategoryDistribution(categoryArray);

    // Calculate stock status distribution
    const statusData = {
      "In Stock": inventoryData.filter(item => item.status === "in_stock").length,
      "Low Stock": lowStockItems,
      "Out of Stock": outOfStockItems,
      "On Order": inventoryData.filter(item => item.status === "on_order").length
    };
    const statusArray = Object.entries(statusData)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalItems * 100).toFixed(1)
      }));
    setStockStatusDistribution(statusArray);

    // Get top 5 items by value
    const itemsWithValue = inventoryData
      .map(item => ({
        ...item,
        totalValue: item.cost_price * item.current_quantity
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
    setTopItems(itemsWithValue);

    // Mock recent movements (in a real app, this would come from an API)
    setRecentMovements([
      {
        id: 1,
        item_name: "Ball Bearings",
        type: "in",
        quantity: 50,
        reference: "PO-2024-001",
        date: "2024-05-20",
        user: "John Doe"
      },
      {
        id: 2,
        item_name: "Circuit Breakers",
        type: "out",
        quantity: 10,
        reference: "SO-2024-045",
        date: "2024-05-19",
        user: "Jane Smith"
      },
      {
        id: 3,
        item_name: "Steel Sheets",
        type: "in",
        quantity: 25,
        reference: "PO-2024-002",
        date: "2024-05-18",
        user: "John Doe"
      },
      {
        id: 4,
        item_name: "Lubricating Oil",
        type: "out",
        quantity: 20,
        reference: "SO-2024-046",
        date: "2024-05-17",
        user: "Mike Johnson"
      },
      {
        id: 5,
        item_name: "Drill Machine",
        type: "in",
        quantity: 5,
        reference: "PO-2024-003",
        date: "2024-05-16",
        user: "Sarah Williams"
      }
    ]);

    setLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const StatCard = ({ title, value, icon, color, subtext, trend }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                trend.startsWith('+') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {trend}
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ percentage, color = "bg-blue2", label, value }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue2 mb-4"></div>
          <p className="text-gray-600">Loading inventory dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inventory Analytics</h2>
          <p className="text-gray-600">Overview of your inventory performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last quarter</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gradient-to-r from-blue1 to-blue2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(stats.totalValue)}
          icon="fas fa-money-bill-wave"
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtext={`${stats.totalItems} items`}
          trend="+5.2%"
        />

        <StatCard
          title="Average Stock Level"
          value={stats.averageStockLevel.toFixed(0)}
          icon="fas fa-boxes"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtext="Per item average"
          trend="+2.1%"
        />

        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon="fas fa-exclamation-triangle"
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          subtext="Needs attention"
          trend={`${stats.lowStockItems > 0 ? `↑ ${stats.lowStockItems}` : "All good"}`}
        />

        <StatCard
          title="Average Margin"
          value={`${stats.averageMargin.toFixed(1)}%`}
          icon="fas fa-chart-line"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subtext="Gross profit margin"
          trend="+1.8%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Category Distribution */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
                <p className="text-sm text-gray-600">Items spread across {stats.totalCategories} categories</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{inventoryData.length} total items</span>
              </div>
            </div>

            <div className="space-y-4">
              {categoryDistribution.map((category, index) => {
                const colors = [
                  "bg-blue2",
                  "bg-green-500",
                  "bg-purple-500",
                  "bg-amber-500",
                  "bg-red-500",
                  "bg-cyan-500"
                ];
                const color = colors[index % colors.length];
                
                return (
                  <ProgressBar
                    key={category.name}
                    label={category.name}
                    value={`${category.count} items (${category.percentage}%)`}
                    percentage={parseFloat(category.percentage)}
                    color={color}
                  />
                );
              })}
            </div>

            {categoryDistribution.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-chart-pie text-3xl text-gray-300 mb-2"></i>
                <p>No category data available</p>
              </div>
            )}
          </div>

          {/* Top Items by Value */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Items by Value</h3>
            
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <span className="text-blue2 font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item.item_name}</div>
                      <div className="text-xs text-gray-500">{item.item_code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatCurrency(item.totalValue)}</div>
                    <div className="text-xs text-gray-500">
                      {item.current_quantity} {item.unit_of_measure}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {topItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-chart-bar text-3xl text-gray-300 mb-2"></i>
                <p>No items data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Stock Status Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Status Overview</h3>
            
            <div className="space-y-4">
              {stockStatusDistribution.map(status => {
                let color, icon;
                switch(status.name) {
                  case "In Stock":
                    color = "bg-green-100 text-green-700";
                    icon = "fas fa-check-circle";
                    break;
                  case "Low Stock":
                    color = "bg-amber-100 text-amber-700";
                    icon = "fas fa-exclamation-circle";
                    break;
                  case "Out of Stock":
                    color = "bg-red-100 text-red-700";
                    icon = "fas fa-times-circle";
                    break;
                  case "On Order":
                    color = "bg-blue-100 text-blue2";
                    icon = "fas fa-clock";
                    break;
                  default:
                    color = "bg-gray-100 text-gray-700";
                    icon = "fas fa-circle";
                }

                return (
                  <div key={status.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${color.split(' ')[0]} flex items-center justify-center`}>
                        <i className={`${icon} ${color.split(' ')[1]} text-sm`}></i>
                      </div>
                      <span className="font-medium text-gray-900">{status.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{status.count}</div>
                      <div className="text-xs text-gray-500">{status.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {stockStatusDistribution.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-box text-3xl text-gray-300 mb-2"></i>
                <p>No stock status data</p>
              </div>
            )}
          </div>

          {/* Recent Stock Movements */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Stock Movements</h3>
              <button className="text-sm text-blue2 hover:text-blue1 font-medium">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentMovements.map(movement => (
                <div key={movement.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    movement.type === 'in' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    <i className={`fas fa-${movement.type === 'in' ? 'arrow-down' : 'arrow-up'} text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {movement.item_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ref: {movement.reference}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(movement.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recentMovements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-exchange-alt text-3xl text-gray-300 mb-2"></i>
                <p>No recent movements</p>
              </div>
            )}
          </div>

          {/* Quick Insights */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue2 text-white flex items-center justify-center">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Insights</h3>
            </div>
            
            <div className="space-y-3">
              {stats.lowStockItems > 0 && (
                <div className="flex items-start gap-2">
                  <i className="fas fa-exclamation-circle text-amber-500 mt-0.5"></i>
                  <p className="text-sm text-gray-700">
                    {stats.lowStockItems} item{stats.lowStockItems !== 1 ? 's' : ''} need{stats.lowStockItems === 1 ? 's' : ''} reordering
                  </p>
                </div>
              )}
              
              {stats.outOfStockItems > 0 && (
                <div className="flex items-start gap-2">
                  <i className="fas fa-times-circle text-red-500 mt-0.5"></i>
                  <p className="text-sm text-gray-700">
                    {stats.outOfStockItems} item{stats.outOfStockItems !== 1 ? 's are' : ' is'} out of stock
                  </p>
                </div>
              )}
              
              {stats.highValueItems > 0 && (
                <div className="flex items-start gap-2">
                  <i className="fas fa-star text-blue2 mt-0.5"></i>
                  <p className="text-sm text-gray-700">
                    {stats.highValueItems} high-value item{stats.highValueItems !== 1 ? 's' : ''} in inventory
                  </p>
                </div>
              )}
              
              <div className="flex items-start gap-2">
                <i className="fas fa-chart-line text-green-500 mt-0.5"></i>
                <p className="text-sm text-gray-700">
                  Average margin of {stats.averageMargin.toFixed(1)}% across products
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Inventory Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3">
            <div className="text-2xl font-bold text-gray-900">{stats.totalCategories}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl font-bold text-gray-900">{stats.highValueItems}</div>
            <div className="text-sm text-gray-600">High-Value Items</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalValue / Math.max(stats.totalItems, 1))}
            </div>
            <div className="text-sm text-gray-600">Avg. Item Value</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl font-bold text-gray-900">
              {(inventoryData.filter(item => item.selling_price).length / Math.max(inventoryData.length, 1) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Priced Items</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;