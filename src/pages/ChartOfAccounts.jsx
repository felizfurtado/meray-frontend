import React, { useRef } from "react";
import AccountsTable from "../components/accounts/AccountsTable";
import PageHeader from "../components/layout/PageHeader";

const ChartOfAccounts = ({ sidebarCollapsed = false }) => {
  const tableRef = useRef();

  return (
    <>
      <PageHeader
        title="Chart of Accounts"
        description="Manage your company ledger structure"
        icon="fas fa-sitemap"
        collapsed={sidebarCollapsed}
        buttonText="Add Account"
        onButtonClick={() => tableRef.current?.openAddModal()}
      />

      <div className="p-6">
        <AccountsTable ref={tableRef} />
      </div>
    </>
  );
};

export default ChartOfAccounts;
