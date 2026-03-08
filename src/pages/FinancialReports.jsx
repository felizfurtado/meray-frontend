import React from "react";
import PageHeader from "../components/layout/PageHeader";
import ProfitLossCard from "../components/reports/ProfitLossCard";
import BalanceSheetCard from "../components/reports/BalanceSheetCard";
import StatementOfAccountModal from "../components/reports/StatementOfAccountModal";
import StatementOfAccountCard from "../components/reports/StatementOfAccountCard";
import VendorStatementCard from "../components/reports/VendorStatementCard";
import CashFlowReportCard from "../components/reports/CashFlowReportCard";

export default function FinancialReports({ collapsed }) {

  const stats = [
    { value: "2", label: "Financial Reports", color: "bg-green-400" },
    // { value: "1", label: "Operational Reports", color: "bg-blue-400" }
  ];

  return (
    <div>

      {/* Header */}

      <PageHeader
        title="Reports"
        description="Generate financial and operational reports for your business"
        icon="fas fa-chart-line"
        collapsed={collapsed}
        stats={stats}
      />

      {/* Reports Grid */}

      <div
        className={`${
          collapsed ? "ml-[60px]" : "ml-[140px]"
        } mr-14 mt-6 transition-all duration-300`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BalanceSheetCard />

          <ProfitLossCard />
          <StatementOfAccountCard/>
          <VendorStatementCard/>
          <CashFlowReportCard/>

        </div>
      </div>

    </div>
  );
}