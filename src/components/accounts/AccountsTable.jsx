import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Table from "../layout/Table";
import AccountsAddModal from "./AccountsAddModal";
import AccountsEditModal from "./AccountsEditModal";
import AccountFieldRenderer from "./AccountFieldRenderer";
import api from "../../api/api";

const AccountsTable = forwardRef((props, ref) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Define the custom type order
  const typeOrder = {
    "Asset": 1,
    "Liability": 2, 
    "Equity": 3,
    "Revenue": 4,
    "Expense": 5
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/accounts/list/");
      const accounts = res.data.accounts || [];

      // Sort accounts: first by type (custom order), then by code
      const sortedAccounts = [...accounts].sort((a, b) => {
        // First sort by type using custom order
        const typeCompare = (typeOrder[a.type] || 999) - (typeOrder[b.type] || 999);
        
        // If types are different, return type comparison
        if (typeCompare !== 0) return typeCompare;
        
        // If same type, sort by code (as number if possible, otherwise as string)
        const codeA = a.code;
        const codeB = b.code;
        
        // Try to compare as numbers if both are numeric
        if (!isNaN(codeA) && !isNaN(codeB)) {
          return parseInt(codeA) - parseInt(codeB);
        }
        
        // Otherwise compare as strings
        return codeA.localeCompare(codeB);
      });

      setRows(sortedAccounts);
      setColumns(buildColumns());
    } catch (err) {
      console.error("Failed to load accounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useImperativeHandle(ref, () => ({
    openAddModal() {
      setAddOpen(true);
    },
  }));

  const deleteAccount = async (row) => {
    if (!window.confirm(`Delete account "${row.code} - ${row.name}"?`)) return;

    await api.delete(`/accounts/${row.id}/delete/`);
    fetchAccounts();
  };

  function buildColumns() {
    return [
      {
        field: "code",
        header: "Code",
        sortable: true,
        render: (value) => (
          <span className="font-mono text-xs bg-[#a9c0c9]/20 px-2 py-1.5 rounded-md text-blue2 border border-blue2/20">
            {value}
          </span>
        ),
      },
      {
        field: "name",
        header: "Name",
        sortable: true,
        render: (value) => (
          <span className="font-medium text-[#1f221f]">
            {value}
          </span>
        ),
      },
      {
        field: "type",
        header: "Type",
        render: (value) => (
          <AccountFieldRenderer field="type" value={value} />
        ),
      },
      {
        field: "vat_applicable",
        header: "VAT",
        render: (value) => (
          <AccountFieldRenderer field="vat_applicable" value={value} />
        ),
      },
      {
        field: "parent",
        header: "Parent",
        render: (value) => value ? (
          <span className="text-sm text-[#4a636e]">
            {value}
          </span>
        ) : (
          <span className="text-sm text-[#8b8f8c]">—</span>
        ),
      },
      {
        field: "actions",
        header: "Actions",
        width: "120px",
        render: (_, row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAccount(row);
                setEditOpen(true);
              }}
              className="p-2 text-[#8b8f8c] hover:text-[#4a9b68] hover:bg-[#4a9b68]/10 rounded-lg transition-all"
              title="Edit"
            >
              <i className="fas fa-edit text-sm"></i>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteAccount(row);
              }}
              className="p-2 text-[#8b8f8c] hover:text-[#d95a4a] hover:bg-[#d95a4a]/10 rounded-lg transition-all"
              title="Delete"
            >
              <i className="fas fa-trash-alt text-sm"></i>
            </button>
          </div>
        ),
      },
    ];
  }

  return (
    <>
      <Table
         title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue2 to-[#4a636e] flex items-center justify-center shadow-lg shadow-blue2/30">
                  <span className="text-white text-lg">
  <i className="fas fa-sitemap"></i>
</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1f221f]">{"Chart of Accounts"}</h2>
                  <p className="text-xs text-[#8b8f8c]">Track and manage journal entries</p>
                </div>
              </div>
            }
        icon="📘"
        columns={columns}
        data={rows}
        loading={loading}
        searchPlaceholder="Search by code, name, type..."
        emptyMessage="No accounts found"
        defaultSort="code"
      />

      <AccountsAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        refetch={fetchAccounts}
      />

      <AccountsEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        account={selectedAccount}
        refetch={fetchAccounts}
      />
    </>
  );
});

export default AccountsTable;