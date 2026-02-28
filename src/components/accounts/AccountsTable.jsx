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

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/accounts/list/");
      const accounts = res.data.accounts || [];

      setRows(accounts);
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
        title="Chart of Accounts"
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