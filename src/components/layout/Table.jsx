import React, { useState, useMemo } from 'react';

const Table = ({
  columns = [],
  data = [],
  defaultSort = { field: '', direction: 'asc' },
  onRowClick = () => {},
  showCheckbox = true,
  onSelectionChange = () => {},
  pageSize = 10,
  showPagination = true,
  emptyMessage = "No data found",
  loading = false,
  sidebarCollapsed = false,
  // New generic props
  title = "Data",
  searchPlaceholder = "Search...",
  filterPills = [],
  showFilters = true,
  showHeaderBar = true,
  showBulkActions = true,
  bulkActions = [],
  onSearch = null,
  onExport = () => console.log('Export clicked'),
  onFilter = () => console.log('Filter clicked'),
  onColumns = () => console.log('Columns clicked')
}) => {
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const sidebarWidth = sidebarCollapsed ? 60 : 80;

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.field) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    
    if (onSearch) {
      return onSearch(sortedData, searchTerm);
    }
    
    // Default search
    return sortedData.filter(row => {
      return columns.some(column => {
        const cellValue = row[column.field];
        return cellValue && 
               cellValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [sortedData, searchTerm, columns, onSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedData.map(row => row.id);
      setSelectedRows(new Set(allIds));
      onSelectionChange(allIds);
    } else {
      setSelectedRows(new Set());
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (rowId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  // Sort handler
  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setCurrentPage(1);
  };

  // Status badge colors mapping
  const statusColors = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    qualified: 'bg-green-50 text-green-700 border-green-200',
    proposal: 'bg-purple-50 text-purple-700 border-purple-200',
    won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    lost: 'bg-red-50 text-red-700 border-red-200',
    active: 'bg-green-50 text-green-700 border-green-200',
    inactive: 'bg-gray-50 text-gray-700 border-gray-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200'
  };

  // Render cell content based on column type - COMPLETE FUNCTION
  const renderCellContent = (row, column) => {
    const value = row[column.field];
    
    // Check if field is in custom_data (for dynamic fields)
    const actualValue = value !== undefined ? value : (row.custom_data && row.custom_data[column.field]);
    
    if (column.render) {
      return column.render(actualValue, row);
    }

    switch (column.type) {
      case 'status':
        const statusClass = statusColors[actualValue?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusClass}`}>
            {actualValue?.charAt(0).toUpperCase() + actualValue?.slice(1) || '-'}
          </span>
        );
      
      case 'avatar':
        return (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white text-sm font-semibold flex items-center justify-center">
              {actualValue?.charAt(0) || '?'}
            </div>
          </div>
        );
      
      case 'badge':
      case 'select':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            {actualValue || '-'}
          </span>
        );
      
      case 'probability':
        const width = Math.min(Math.max(actualValue || 0, 0), 100);
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue2 min-w-10 text-right">{actualValue || 0}%</span>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue2 to-blue1 rounded-full"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      
      case 'actions':
        return (
          <div className="flex items-center justify-center gap-1">
            {column.actions?.map((action, index) => (
              <button
                key={index}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                  action.type === 'danger' 
                    ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300' 
                    : action.type === 'primary'
                    ? 'border-blue-200 bg-blue-50 text-blue2 hover:bg-blue-100 hover:border-blue2'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                }`}
                title={action.title}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row);
                }}
              >
                <i className={`${action.icon} text-xs`}></i>
              </button>
            ))}
          </div>
        );
      
      case 'user':
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white text-sm font-semibold flex items-center justify-center">
              {row.name?.charAt(0) || row.email?.charAt(0) || '?'}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{row.name || '-'}</div>
              <div className="text-xs text-gray-500">{row.role || row.email || 'No info'}</div>
            </div>
          </div>
        );
      
      case 'company':
        return (
          <div>
            <div className="font-semibold text-gray-900 text-sm">{actualValue || '-'}</div>
            <div className="text-xs text-gray-500">{row.industry || row.sector || 'No industry'}</div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="space-y-1">
            <div className="text-blue2 font-medium text-sm hover:underline cursor-pointer">{row.email || '-'}</div>
            <div className="text-xs text-gray-500">{row.phone || row.contact || '-'}</div>
          </div>
        );
      
      case 'date':
        return (
          <div className="text-sm text-gray-900">
            {actualValue ? new Date(actualValue).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : '-'}
          </div>
        );
      
      case 'currency':
        return (
          <div className="font-semibold text-gray-900 text-sm">
            {actualValue ? `$${typeof actualValue === 'number' ? actualValue.toLocaleString() : actualValue}` : '-'}
          </div>
        );
      
      case 'number':
        return (
          <div className="font-semibold text-gray-900 text-sm">
            {typeof actualValue === 'number' ? actualValue.toLocaleString() : actualValue || '-'}
          </div>
        );
      
      case 'link':
        return actualValue ? (
          <a 
            href={actualValue} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue2 hover:underline text-sm flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fas fa-external-link-alt text-xs"></i>
            Visit
          </a>
        ) : '-';
      
      case 'text':
      default:
        return <span className="text-gray-900 text-sm">{actualValue || '-'}</span>;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-5">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Default bulk actions
  const defaultBulkActions = [
    { label: 'Email Selected', icon: 'fas fa-envelope' },
    { label: 'Change Status', icon: 'fas fa-tag' },
    { label: 'Assign to', icon: 'fas fa-user-plus' },
    { label: 'Delete', icon: 'fas fa-trash', type: 'danger' }
  ];

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      style={{
        marginLeft: `${sidebarWidth + 60}px`,
        marginRight: '60px',
        marginTop: '30px',
        marginBottom: '30px'
      }}
    >
      {/* 1. Table Controls Bar */}
      {showFilters && (
        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-b border-gray-200">
          {/* Search Box */}
          <div className="relative mb-4 md:mb-0 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {/* Filter Pills - Custom or default */}
          {filterPills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filterPills.map((filter, index) => (
                <button
                  key={filter.id || filter.label || index}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter.active
                      ? 'bg-blue2 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={filter.onClick}
                >
                  {filter.icon && <i className={`${filter.icon} text-xs`} />}
                  {filter.label}
                  {filter.count !== undefined && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      filter.active ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Table Header Bar */}
      {showHeaderBar && (
        <div className="flex flex-col md:flex-row md:items-center justify-between px-5 py-3.5 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-semibold text-blue2">{filteredData.length}</span> {title}
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              Sort by <strong className="text-gray-900">Date</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 md:mt-0 text-sm text-gray-600">
            <button className="flex items-center gap-1.5 hover:text-blue2 transition-colors" onClick={onExport}>
              <i className="fas fa-download text-blue2 text-xs"></i>
              Export
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue2 transition-colors" onClick={onFilter}>
              <i className="fas fa-filter text-blue2 text-xs"></i>
              Filter
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue2 transition-colors" onClick={onColumns}>
              <i className="fas fa-columns text-blue2 text-xs"></i>
              Columns
            </button>
          </div>
        </div>
      )}

      {/* 3. Bulk Actions Bar */}
      {showBulkActions && selectedRows.size > 0 && (
        <div className="bg-white mx-5 mt-3 mb-3 p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center gap-3 animate-slideDown">
          <div className="flex items-center gap-2 font-semibold text-blue2 text-sm">
            <i className="fas fa-check-circle text-blue2"></i>
            <span>{selectedRows.size} selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(bulkActions.length > 0 ? bulkActions : defaultBulkActions).map((action, index) => (
              <button
                key={index}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  action.type === 'danger'
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
                onClick={action.onClick}
              >
                {action.icon && <i className={`${action.icon} text-xs`}></i>}
                {action.label}
              </button>
            ))}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors"
              onClick={() => {
                setSelectedRows(new Set());
                onSelectionChange([]);
              }}>
              <i className="fas fa-times text-xs"></i>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 4. Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue2">
            <tr>
              {showCheckbox && (
                <th className="w-12 px-4 py-3.5">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue2 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
              )}
              
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3.5 text-left ${column.sortable ? 'cursor-pointer hover:bg-blue1/20' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.field)}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white uppercase tracking-wider">
                    {column.header}
                    {column.sortable && (
                      <i className={`fas fa-sort text-xs opacity-70 ${
                        sortConfig.field === column.field ? (sortConfig.direction === 'asc' ? 'rotate-180' : '') : ''
                      }`}></i>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row)}
                  className={`bg-white hover:bg-blue-50/30 transition-colors cursor-pointer ${
                    selectedRows.has(row.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  {showCheckbox && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue2 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          checked={selectedRows.has(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </td>
                  )}
                  
                  {columns.map((column, index) => (
                    <td key={index} className="px-4 py-3">
                      {renderCellContent(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (showCheckbox ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-4 opacity-50"></i>
                    <p className="text-lg font-medium mb-2">No data found</p>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Pagination */}
      {showPagination && filteredData.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 mb-3 md:mb-0">
            Showing <span className="font-semibold text-blue2">{(currentPage - 1) * pageSize + 1}</span>-
            <span className="font-semibold text-blue2">{Math.min(currentPage * pageSize, filteredData.length)}</span> of
            <span className="font-semibold text-blue2"> {filteredData.length}</span> results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 flex items-center justify-center border border-gray-300 bg-white rounded-lg text-gray-600 hover:border-blue2 hover:text-blue2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                      currentPage === pageNum 
                        ? 'bg-blue2 text-white' 
                        : 'border border-gray-300 bg-white text-gray-700 hover:border-blue2 hover:text-blue2'
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              className="w-8 h-8 flex items-center justify-center border border-gray-300 bg-white rounded-lg text-gray-600 hover:border-blue2 hover:text-blue2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
            
            <select
              className="ml-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;