// pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import api from "../api/api";
import GaugeChart from "../components/charts/GaugeChart";
import ReceivablesCard from "../components/dashboard/ReceivablesCard";

const Dashboard = ({ sidebarCollapsed }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    setLoading(true);
    api.get("/dashboard/")
      .then(res => setData(res.data))
      .catch(err => console.error("Dashboard error:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-AE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      draft: "bg-amber-100 text-amber-700 border-amber-200",
      posted: "bg-blue-100 text-blue-700 border-blue-200",
      paid: "bg-green-100 text-green-700 border-green-200",
      overdue: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f6f4]">
        <PageHeader
          title="Dashboard"
          description="Quick overview of your business"
          icon="fas fa-chart-pie"
          collapsed={sidebarCollapsed}
        />
        <div className={`mt-6 px-6 ${sidebarCollapsed ? "ml-[60px]" : "ml-[140px]"}`}>
          <div className="flex items-center justify-center h-96">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue2/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue2 border-t-transparent rounded-full animate-spin"></div>
              <i className="fas fa-chart-pie absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue2 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f6f6f4]">
        <PageHeader
          title="Dashboard"
          description="Quick overview of your business"
          icon="fas fa-chart-pie"
          collapsed={sidebarCollapsed}
        />
        <div className={`mt-6 px-6 ${sidebarCollapsed ? "ml-[60px]" : "ml-[140px]"}`}>
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-3xl text-rose-500"></i>
            </div>
            <h2 className="text-xl font-semibold text-[#1f221f] mb-2">
              Failed to load dashboard
            </h2>
            <p className="text-[#8b8f8c] mb-4">Please try again later</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue2 text-white rounded-lg hover:bg-[#4a636e] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const s = data.summary;

    const grossMargin =
  s.total_revenue > 0
    ? ((s.gross_profit / s.total_revenue) * 100).toFixed(1)
    : 0;

const netMargin =
  s.total_revenue > 0
    ? ((s.net_profit / s.total_revenue) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-[#f6f6f4] pb-10">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue2/5 to-[#a9c0c9]/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-500/5 to-transparent rounded-full -ml-20 -mb-20"></div>
      </div>

      <PageHeader
        title="Dashboard"
        description="Quick overview of your business"
        icon="fas fa-chart-pie"
        collapsed={sidebarCollapsed}
      />

   <div className={`relative mt-6 px-8 transition-all duration-300 ${
  sidebarCollapsed ? "ml-[80px] mr-6" : "ml-[110px] mr-7"
}`}>
        
        {/* KPI Cards - All with consistent gradient styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Leads" 
            value={s.total_leads} 
            icon="fas fa-user-plus" 
            gradient="from-blue2/20 to-[#a9c0c9]/30"
            iconColor="text-blue2"
          />
          <StatCard 
            title="Customers" 
            value={s.total_customers} 
            icon="fas fa-users" 
            gradient="from-blue2/20 to-[#a9c0c9]/30"
            iconColor="text-blue2"
          />
          <StatCard 
            title="Invoices" 
            value={s.total_invoices} 
            icon="fas fa-file-invoice" 
            gradient="from-blue2/20 to-[#a9c0c9]/30"
            iconColor="text-blue2"
          />
          <StatCard 
            title="Gross Profit (AED)" 
            value={s.gross_profit} 
            icon="fas fa-box" 
            gradient="from-blue2/20 to-[#a9c0c9]/30"
            iconColor="text-blue2"
          />
          <StatCard 
            title="Revenue (AED)" 
            value={s.total_revenue} 
            icon="fas fa-coins" 
            gradient="from-blue2/20 to-[#a9c0c9]/30"
            iconColor="text-blue2"
          />
          <StatCard 
            title="Net Profit (AED)" 
            value={s.net_profit} 
            icon="fas fa-hourglass-half" 
            gradient="from-blue2/20 to-[#a9c0c9]/30"
            iconColor="text-blue2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        <GaugeChart
    value={parseFloat(grossMargin)}
    title="Gross Profit Margin"
  />
  <GaugeChart
    value={parseFloat(netMargin)}
    title="Net Profit Margin"
  />

  
</div>

<div className="grid grid-cols-1  gap-6 mb-8">
  <ReceivablesCard data={data.receivables} />
</div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue2/30 transition-all">
            <div className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue2/5 to-[#a9c0c9]/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2/20 to-[#a9c0c9]/30 flex items-center justify-center">
                      <i className="fas fa-file-invoice text-blue2"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1f221f]">Recent Invoices</h3>
                  </div>
                  {/* <button className="text-sm text-blue2 hover:text-[#4a636e] flex items-center gap-1">
                    View All <i className="fas fa-arrow-right text-xs"></i>
                  </button> */}
                </div>

                {data.recent_invoices.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#f6f6f4] flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-file-invoice text-2xl text-[#8b8f8c]"></i>
                    </div>
                    <p className="text-sm text-[#8b8f8c]">No invoices yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.recent_invoices.map(inv => (
                      <div key={inv.id} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue2/0 via-blue2/5 to-blue2/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                        <div className="relative flex items-center justify-between p-3 bg-[#f6f6f4]/50 rounded-lg border border-gray-200 hover:border-blue2/30 transition-all">
                          <div className="flex-1">
                            <p className="font-medium text-[#1f221f]">{inv.number}</p>
                            <p className="text-xs text-[#8b8f8c] mt-0.5">{inv.customer || 'Walk-in Customer'}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-[#1f221f]">{formatCurrency(inv.total)}</p>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${getStatusColor(inv.status)}`}>
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue2/30 transition-all">
            <div className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br bg-[#f6f6f4]/50 rounded-full -mr-10 -mt-10"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                  

                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2/20 to-[#a9c0c9]/30 flex items-center justify-center">
                      <i className="fas fa-user-plus text-blue2"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1f221f]">Recent Leads</h3>
                  </div>
                  {/* <button className="text-sm text-blue2 hover:text-[#4a636e] flex items-center gap-1">
                    View All <i className="fas fa-arrow-right text-xs"></i>
                  </button> */}
                </div>

                {data.recent_leads.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#f6f6f4] flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-user-plus text-2xl text-[#8b8f8c]"></i>
                    </div>
                    <p className="text-sm text-[#8b8f8c]">No leads yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.recent_leads.map(lead => (
                      <div key={lead.id} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                        <div className="relative flex items-center justify-between p-3 bg-[#f6f6f4]/50 rounded-lg border border-gray-200 hover:border-amber-500/30 transition-all">
                          <div className="flex-1">
                            <p className="font-medium text-[#1f221f]">{lead.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-[#8b8f8c]">{lead.company || 'No company'}</p>
                              {lead.email && (
                                <>
                                  <span className="text-xs text-[#8b8f8c]">•</span>
                                  <p className="text-xs text-[#8b8f8c]">{lead.email}</p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            {lead.status && (
                              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                {lead.status}
                              </span>
                            )}
                            {lead.created_at && (
                              <p className="text-xs text-[#8b8f8c] mt-1">{formatDate(lead.created_at)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

   
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, gradient, iconColor }) => (
  <div className="group relative">
    <div className="absolute inset-0 bg-gradient-to-r from-blue2/0 via-blue2/5 to-blue2/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
    <div className="relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue2/30 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#8b8f8c] uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#1f221f]">
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <i className={`${icon} ${iconColor} text-xl`}></i>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue2/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform"></div>
    </div>
  </div>
);

const QuickActionButton = ({ icon, label, color, iconColor, onClick }) => (
  <button
    onClick={onClick}
    className="group relative overflow-hidden bg-white rounded-xl border border-gray-200 p-4 hover:border-blue2/30 hover:shadow-lg transition-all"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    <div className="relative flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
        <i className={`${icon} ${iconColor}`}></i>
      </div>
      <span className="text-sm font-medium text-[#1f221f]">{label}</span>
    </div>
  </button>
);

export default Dashboard;