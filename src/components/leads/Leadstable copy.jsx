import React, { useState } from "react";
import Table from "../layout/Table";
import LeadsViewEditModal from "./LeadsViewEditModal";
import LeadsEditModal from "./LeadsEditModal";
import api from "../../api/api";

const LeadsTable = ({
  leads = [],
  loading = false,
  sidebarCollapsed = false,
  schema = null,
  refetchLeads,
}) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const openLeadEdit = (row) => {
    if (!row?.id) return;
    setSelectedLead(row.id);
    setEditOpen(true);
  };

  const openLeadView = (row) => {
    if (!row?.id) return;
    setSelectedLead(row.id);
    setOpen(true);
  };

  const handleDeleteLead = async (row) => {
  if (!row?.id) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete "${row.name}"? This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    // Use the new delete endpoint
    await api.delete(`/leads/${row.id}/delete/`);
    
    // Close any open modals
    setOpen(false);
    setEditOpen(false);
    setSelectedLead(null);

    // Show success message
    alert(`Lead "${row.name}" deleted successfully`);
    
    // Refresh the leads list
    if (refetchLeads) {
      refetchLeads();
    }
  } catch (err) {
    console.error("Delete failed", err);
    
    // Show appropriate error message
    if (err.response?.status === 404) {
      alert("Lead not found. It may have already been deleted.");
    } else if (err.response?.status === 403) {
      alert("You don't have permission to delete this lead.");
    } else {
      alert("Failed to delete lead: " + (err.response?.data?.error || err.message));
    }
    
    // Refresh anyway in case of 404 (lead already deleted)
    if (err.response?.status === 404 && refetchLeads) {
      refetchLeads();
    }
  }
};

  // Get field config from schema
  const getFieldConfig = (field) => {
    if (schema?.field_configs?.[field]) {
      return schema.field_configs[field];
    }
    
    if (schema?.custom_fields?.[field]) {
      return schema.custom_fields[field];
    }
    
    // Default config for core fields
    const defaultConfigs = {
      "name": { type: "string", label: "Full Name", required: true },
      "email": { type: "email", label: "Email", required: true },
      "phone": { type: "phone", label: "Phone", required: true },
      "company": { type: "string", label: "Company", required: true },
      "status": { type: "select", label: "Status", required: true },
      "industry": { type: "select", label: "Industry", required: false },
      "source": { type: "select", label: "Source", required: true },
      "assigned_to": { type: "user", label: "Assigned To", required: false },
      "probability": { type: "number", label: "Probability", required: false },
      "value": { type: "currency", label: "Deal Value", required: false },
    };
    
    return defaultConfigs[field] || { type: "string", label: field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) };
  };

  // Get table columns from response
  const getTableColumns = () => {
    // Priority: response.columns > schema.table_columns > default columns
    if (schema?.columns && schema.columns.length > 0) {
      return schema.columns;
    }
    
    if (schema?.table_columns && schema.table_columns.length > 0) {
      return schema.table_columns;
    }
    
    // Default columns in your order
    return ["name", "contact", "assigned_to", "status", "probability", "actions"];
  };

  const getColumns = () => {
  const tableColumns = getTableColumns();
  
  if (!tableColumns || tableColumns.length === 0) {
    return getDefaultColumns();
  }

  console.log("Building columns from:", tableColumns);
  
  const columns = [];

  // 1. NAME column (just name with avatar)
  columns.push({
    field: "name",
    header: "Name",
    sortable: true,
    width: "200px",
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
          {value?.charAt(0)?.toUpperCase() || row?.email?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="font-semibold text-text text-sm truncate">
            {value || "-"}
          </div>
          {row.source && (
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-muted-blue/20 text-blue2 border border-muted-blue/30">
                <i className="fas fa-tag text-xs"></i>
                {row.source}
              </span>
            </div>
          )}
        </div>
      </div>
    ),
  });

  // 2. COMPANY column (company + industry)
  columns.push({
    field: "company",
    header: "Company",
    sortable: true,
    width: "220px",
    render: (value, row) => (
      <div className="flex flex-col gap-1.5">
        {/* Company Name */}
        {value ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-panel text-blue2 flex items-center justify-center flex-shrink-0 border border-border">
              <i className="fas fa-building text-sm"></i>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-text text-sm">
                {value}
              </span>
              {row.industry && (
                <span className="text-xs text-muted mt-0.5">
                  {row.industry}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted">
            <div className="w-8 h-8 rounded-full bg-panel text-muted flex items-center justify-center flex-shrink-0 border border-border">
              <i className="fas fa-building text-sm"></i>
            </div>
            <span className="text-sm">No company</span>
          </div>
        )}
        
        {/* Extra info */}
        {row.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
            <i className="fas fa-map-marker-alt text-xs"></i>
            <span>{row.location}</span>
          </div>
        )}
      </div>
    ),
  });

  // 3. CONTACT column (email + phone)
  columns.push({
    field: "contact",
    header: "Contact",
    sortable: false,
    width: "220px",
    render: (value, row) => (
      <div className="flex flex-col gap-2">
        {/* Email */}
        {row.email ? (
          <div className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue2 flex items-center justify-center flex-shrink-0 border border-muted-blue/30">
              <i className="fas fa-envelope text-xs"></i>
            </div>
            <a 
              href={`mailto:${row.email}`}
              className="text-blue2 hover:text-blue1 hover:underline text-sm truncate"
              onClick={(e) => e.stopPropagation()}
              title={row.email}
            >
              {row.email}
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted">
            <div className="w-7 h-7 rounded-full bg-panel flex items-center justify-center flex-shrink-0 border border-border">
              <i className="fas fa-envelope text-xs"></i>
            </div>
            <span className="text-sm">No email</span>
          </div>
        )}

        {/* Phone */}
        {row.phone ? (
          <div className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full  bg-blue-50 text-blue2 flex items-center justify-center flex-shrink-0 border border-border">
              <i className="fas fa-phone text-xs"></i>
            </div>
            <a 
              href={`tel:${row.phone}`}
              className="text-text hover:text-success hover:underline text-sm truncate"
              onClick={(e) => e.stopPropagation()}
              title={row.phone}
            >
              {row.phone}
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted">
            <div className="w-7 h-7 rounded-full bg-panel flex items-center justify-center flex-shrink-0 border border-border">
              <i className="fas fa-phone text-xs"></i>
            </div>
            <span className="text-sm">No phone</span>
          </div>
        )}
      </div>
    ),
  });

  // 4. ASSIGNED TO column
  columns.push({
    field: "assigned_to",
    header: "Assigned To",
    sortable: true,
    width: "160px",
    render: (value) => (
      value ? (
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-blue2 text-white text-xs font-semibold flex items-center justify-center">
              {value?.charAt(0)?.toUpperCase()}
            </div>
            {/* <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white"></div> */}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-text text-sm">
              {value}
            </span>
            <span className="text-xs text-muted">Assigned</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-panel text-muted flex items-center justify-center border border-border">
            <i className="fas fa-user-plus text-sm"></i>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-muted text-sm">
              Unassigned
            </span>
            <span className="text-xs text-muted">Click to assign</span>
          </div>
        </div>
      )
    ),
  });

  // 5. STATUS column - Using theme colors
  columns.push({
    field: "status",
    header: "Status",
    sortable: true,
    width: "140px",
    render: (value) => {
      const statusColors = {
        new: { 
          bg: "bg-blue-50", 
          text: "text-blue2", 
          border: "border-muted-blue/30", 
          icon: "fas fa-plus-circle" 
        },
        contacted: { 
          bg: "bg-amber-50", 
          text: "text-warning", 
          border: "border-amber-200", 
          icon: "fas fa-phone" 
        },
        qualified: { 
          bg: "bg-green-50", 
          text: "text-success", 
          border: "border-green-200", 
          icon: "fas fa-check-circle" 
        },
        proposal: { 
          bg: "bg-purple-50", 
          text: "text-purple-600", 
          border: "border-purple-200", 
          icon: "fas fa-file-contract" 
        },
        won: { 
          bg: "bg-emerald-50", 
          text: "text-success", 
          border: "border-emerald-200", 
          icon: "fas fa-trophy" 
        },
        lost: { 
          bg: "bg-red-50", 
          text: "text-danger", 
          border: "border-red-200", 
          icon: "fas fa-times-circle" 
        },
      };

      const status = statusColors[value?.toLowerCase()] || { 
        bg: "bg-panel", 
        text: "text-muted", 
        border: "border-border", 
        icon: "fas fa-circle" 
      };
      const statusText = value?.charAt(0)?.toUpperCase() + value?.slice(1) || "-";

      return (
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${status.bg} ${status.border}`}>
          <i className={`${status.icon} ${status.text} text-sm`}></i>
          <span className={`font-semibold text-sm ${status.text}`}>
            {statusText}
          </span>
        </div>
      );
    },
  });

  // 6. ACTIONS column (always last)
  columns.push({
    header: "Actions",
    field: "actions",
    type: "actions",
    width: "140px",
    render: (value, row) => (
      <div className="flex items-center justify-center gap-2">
        <button
          className="w-9 h-9 rounded-lg border border-border bg-card text-text hover:bg-panel hover:text-blue2 hover:border-blue2 flex items-center justify-center transition-all duration-200 hover:scale-105"
          title="View Details"
          onClick={(e) => {
            e.stopPropagation();
            openLeadView(row);
          }}
        >
          <i className="fas fa-eye text-sm"></i>
        </button>
        <button
          className="w-9 h-9 rounded-lg border border-muted-blue/40 bg-blue-50 text-blue2 hover:bg-blue2 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
          title="Edit Lead"
          onClick={(e) => {
            e.stopPropagation();
            openLeadEdit(row);
          }}
        >
          <i className="fas fa-edit text-sm"></i>
        </button>
        <button
          className="w-9 h-9 rounded-lg border border-red-200 bg-red-50 text-danger hover:bg-danger hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
          title="Delete Lead"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteLead(row);
          }}
        >
          <i className="fas fa-trash text-sm"></i>
        </button>
      </div>
    ),
  });

  return columns;
};

  // Helper functions
  const getFieldLabel = (field) => {
    const config = getFieldConfig(field);
    return config.label || field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (field, value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const fieldConfig = getFieldConfig(field);
    const fieldType = fieldConfig.type || "string";

    switch (fieldType) {
      case "currency":
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Number(value));
      
      case "number":
        return new Intl.NumberFormat().format(Number(value));
      
      case "date":
        return new Date(value).toLocaleDateString();
      
      default:
        return value;
    }
  };

  // Fallback columns if no schema
  const getDefaultColumns = () => {
    const defaultColumns = [
      {
        field: "name",
        header: "Lead",
        width: "280px",
        render: (value, row) => (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
              {value?.charAt(0)?.toUpperCase() || row?.email?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">
                {value || "-"}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {row.company && (
                  <span className="inline-flex items-center gap-1">
                    <i className="fas fa-building text-gray-400 text-xs"></i>
                    <span>{row.company}</span>
                  </span>
                )}
                {row.industry && (
                  <>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="inline-flex items-center gap-1">
                      <i className="fas fa-industry text-gray-400 text-xs"></i>
                      <span>{row.industry}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        field: "contact",
        header: "Contact",
        sortable: false,
        width: "220px",
        render: (value, row) => (
          <div className="flex flex-col gap-1">
            {row.email ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-envelope text-xs"></i>
                </div>
                <a 
                  href={`mailto:${row.email}`}
                  className="text-blue-600 hover:underline text-sm truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {row.email}
                </a>
              </div>
            ) : null}
            {row.phone ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-phone text-xs"></i>
                </div>
                <a 
                  href={`tel:${row.phone}`}
                  className="text-gray-700 hover:underline text-sm truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {row.phone}
                </a>
              </div>
            ) : null}
          </div>
        ),
      },
      {
        field: "assigned_to",
        header: "Assigned To",
        width: "160px",
        render: (value) => (
          value ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white text-xs font-semibold flex items-center justify-center">
                {value?.charAt(0)?.toUpperCase()}
              </div>
              <span className="font-medium text-gray-900 text-sm">
                {value}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 italic text-sm">Unassigned</span>
          )
        ),
      },
      {
        field: "status",
        header: "Status",
        width: "140px",
        render: (value) => {
          const statusColors = {
            new: "bg-blue-50 text-blue-700 border-blue-200",
            contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
            qualified: "bg-green-50 text-green-700 border-green-200",
            proposal: "bg-purple-50 text-purple-700 border-purple-200",
            won: "bg-emerald-50 text-emerald-700 border-emerald-200",
            lost: "bg-red-50 text-red-700 border-red-200",
          };

          const cls = statusColors[value?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";

          return (
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
            >
              {value || "-"}
            </span>
          );
        },
      },
    ];

    // Add Actions column
    defaultColumns.push({
      header: "Actions",
      field: "actions",
      type: "actions",
      width: "140px",
      actions: [
        {
          icon: "fas fa-eye",
          title: "View",
          onClick: (row) => openLeadView(row),
        },
        {
          icon: "fas fa-edit",
          title: "Edit",
          type: "primary",
          onClick: (row) => openLeadEdit(row),
        },
        {
          icon: "fas fa-trash",
          title: "Delete",
          type: "danger",
          onClick: (row) => handleDeleteLead(row),
        },
      ],
    });

    return defaultColumns;
  };

  return (
    <>
      <Table
        title={schema?.name || "Leads"}
        icon={schema?.icon || "👤"}
        columns={getColumns()}
        data={leads}
        loading={loading}
        sidebarCollapsed={sidebarCollapsed}
        onRowClick={(row) => openLeadView(row)}
        searchPlaceholder="Search leads..."
        pageSize={schema?.page_size || 10}
        defaultSort={
          schema?.default_sort || {
            field: "created_at",
            direction: "desc",
          }
        }
        emptyMessage="No leads found. Create your first lead."
      />

      <LeadsViewEditModal
        open={open}
        leadId={selectedLead}
        onClose={() => setOpen(false)}
        schema={schema}
        refetchLeads={refetchLeads}
      />

      <LeadsEditModal
        open={editOpen}
        leadId={selectedLead}
        onClose={() => setEditOpen(false)}
        schema={schema}
        refetchLeads={refetchLeads}
      />
    </>
  );
};

export default LeadsTable;