import React, { useEffect, useState } from "react";
import Table from "../layout/Table";
import LeadsViewEditModal from "./LeadsViewModal";
import LeadsEditModal from "./LeadsEditModal";
import api from "../../api/api";
import TableFieldRenderer from "./LeadTableFieldRenderer"; 
import LeadsAddModal from "./LeadsAddModal";

const LeadsTable = ({ sidebarCollapsed = false, onSchemaLoad }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedLead, setSelectedLead] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const [schemaRes, listRes] = await Promise.all([
        api.get("/schema/leads/"),
        api.get("/leads/list/")
      ]);

      setSchema(schemaRes.data.schema);
      onSchemaLoad?.(schemaRes.data.schema);
      setRows(listRes.data.rows);
      setColumns(buildColumns(schemaRes.data.schema, listRes.data.columns));
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const openView = (row) => {
    setSelectedLead(row.id);
    setViewOpen(true);
  };

  const openEdit = (row) => {
    setSelectedLead(row.id);
    setEditOpen(true);
  };

  const deleteLead = async (row) => {
    if (!window.confirm(`Delete "${row.name}"?`)) return;

    try {
      await api.delete(`/leads/${row.id}/delete/`);
      fetchLeads();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete lead");
    }
  };

  function buildColumns(schema, columnKeys) {
    if (!schema || !columnKeys?.length) return [];

    const fieldMap = {};
    schema.fields?.forEach((f) => {
      fieldMap[f.key] = f;
    });

    const cols = columnKeys.map((key) => {
      const field = fieldMap[key] || {};

      // ❌ HIDE industry column (will be shown under name)
      if (key === "industry") {
        return null;
      }

      // ❌ HIDE phone column (will be shown in contact)
      if (key === "phone") {
        return null;
      }

      // ❌ HIDE email column (will be shown in contact)
      if (key === "email") {
        return null;
      }

      // ✅ CONTACT FIELD (phone + email)
      if (key === "contact") {
        return {
          field: "contact",
          header: "Contact",
          sortable: false,
          render: (_, row) => {
            const email = row.email;
            const phone = row.phone;
            
            if (!email && !phone) return <span className="text-gray-400 text-sm">—</span>;
            
            return (
              <div className="flex flex-col gap-1.5">
                {phone && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-phone text-blue2 text-xs"></i>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-envelope text-blue2 text-xs"></i>
                    </div>
                    <span className="text-sm text-gray-600 truncate max-w-[200px]">{email}</span>
                  </div>
                )}
              </div>
            );
          },
        };
      }

      // ✅ NAME + INDUSTRY MERGE
      if (key === "name") {
        return {
          field: "name",
          header: field.label || "Name",
          sortable: true,
          render: (value, row) => {
            const industry = row.industry;
            return (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                    {value?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 text-sm">
                    {value || "—"}
                  </span>
                  {industry && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-4 h-4 rounded-full bg-purple-50 flex items-center justify-center">
                        <i className="fas fa-industry text-purple-600 text-[10px]"></i>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {industry}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          },
        };
      }

      // ✅ DEFAULT FIELD - Use TableFieldRenderer
      return {
        field: key,
        header: field.label || prettify(key),
        sortable: true,
        render: (value, row) => (
          <TableFieldRenderer field={field} value={value} row={row} />
        ),
      };
    });

    // Remove all null columns
    let filteredCols = cols.filter(Boolean);
    
    // Check if contact column already exists, if not add it
    const hasContact = filteredCols.some(col => col.field === 'contact');
    const hasEmailOrPhone = columnKeys.some(key => key === 'email' || key === 'phone');
    
    if (!hasContact && hasEmailOrPhone) {
      filteredCols.splice(2, 0, {
        field: "contact",
        header: "Contact",
        sortable: false,
        render: (_, row) => {
          const email = row.email;
          const phone = row.phone;
          
          if (!email && !phone) return <span className="text-gray-400 text-sm">—</span>;
          
          return (
            <div className="flex flex-col gap-1.5">
              {phone && (
                <div className="flex items-center gap-2 px-1">
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-phone text-blue2 text-xs"></i>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{phone}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2 px-1">
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-envelope text-blue2 text-xs"></i>
                  </div>
                  <span className="text-sm text-gray-600 truncate max-w-[200px]">{email}</span>
                </div>
              )}
            </div>
          );
        },
      });
    }

    // ACTIONS column with styled buttons
    filteredCols.push({
      field: "actions",
      header: "Actions",
      width: "140px",
      headerClassName: "text-center",
      render: (_, row) => (
        <div className="flex gap-2 justify-center items-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              openView(row);
            }} 
            className="relative group w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 flex items-center justify-center text-blue2 hover:from-blue-100 hover:to-indigo-100 hover:border-blue2/50 transition-all duration-200 shadow-sm hover:shadow"
            title="View Details"
          >
            <i className="fas fa-eye text-sm group-hover:scale-110 transition-transform duration-200"></i>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              View
            </span>
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }} 
            className="relative group w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-400/50 transition-all duration-200 shadow-sm hover:shadow"
            title="Edit Lead"
          >
            <i className="fas fa-edit text-sm group-hover:scale-110 transition-transform duration-200"></i>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Edit
            </span>
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              deleteLead(row);
            }} 
            className="relative group w-9 h-9 rounded-lg bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200/60 flex items-center justify-center text-rose-600 hover:from-rose-100 hover:to-red-100 hover:border-rose-400/50 transition-all duration-200 shadow-sm hover:shadow"
            title="Delete Lead"
          >
            <i className="fas fa-trash-alt text-sm group-hover:scale-110 transition-transform duration-200"></i>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Delete
            </span>
          </button>
        </div>
      ),
    });

    return filteredCols;
  }

  function prettify(text) {
    return text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <Table
          title={null}
          icon=""
          columns={columns}
          data={rows}
          loading={loading}
          sidebarCollapsed={sidebarCollapsed}
          onRowClick={openView}
          searchPlaceholder="Search leads by name, email, phone..."
          pageSize={schema?.page_size || 10}
          defaultSort={schema?.default_sort}
          emptyMessage={
            <div className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first lead</p>
            </div>
          }
        />
      </div>

      {/* View Modal */}
      <LeadsViewEditModal
        open={viewOpen}
        leadId={selectedLead}
        onClose={() => setViewOpen(false)}
        schema={schema}
        refetchLeads={fetchLeads}
      />

      {/* Edit Modal */}
      <LeadsEditModal
        open={editOpen}
        leadId={selectedLead}
        onClose={() => setEditOpen(false)}
        schema={schema}
        refetchLeads={fetchLeads}
      />
    </>
  );
};

export default LeadsTable;