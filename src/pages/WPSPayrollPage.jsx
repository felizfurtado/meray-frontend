import React, { useState, useEffect } from "react";
import Table from "../components/layout/Table";
import api from "../api/api";

const WPSPayrollPage = ({ sidebarCollapsed = false, refreshKey }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Initialize with current month
  useEffect(() => {
    fetchEmployees();
  }, [refreshKey]);

  // Fetch employees data
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Mock employees data
      const mockEmployees = [
        {
          id: "EMP-001",
          employee_id: "001",
          employee_name: "Ahmed Hassan",
          personal_number: "123456789012345",
          bank_swift: "NBDBAEAD",
          bank_account: "AE000300001111111111111",
          basic_salary: 5000,
          housing_allowance: 2000,
          transport_allowance: 500,
          other_allowance: 300,
          deductions: 0,
          days_worked: 30,
          status: "active",
          last_payment: "2024-01-15"
        },
        {
          id: "EMP-002",
          employee_id: "002",
          employee_name: "Sarah Johnson",
          personal_number: "234567890123456",
          bank_swift: "HSBCAEAD",
          bank_account: "AE000300002222222222222",
          basic_salary: 8000,
          housing_allowance: 3000,
          transport_allowance: 800,
          other_allowance: 500,
          deductions: 500,
          days_worked: 30,
          status: "active",
          last_payment: "2024-01-15"
        },
        {
          id: "EMP-003",
          employee_id: "003",
          employee_name: "Mohammed Ali",
          personal_number: "345678901234567",
          bank_swift: "ADCBADAD",
          bank_account: "AE000300003333333333333",
          basic_salary: 4000,
          housing_allowance: 1500,
          transport_allowance: 400,
          other_allowance: 200,
          deductions: 200,
          days_worked: 25,
          status: "active",
          last_payment: "2024-01-15"
        },
        {
          id: "EMP-004",
          employee_id: "004",
          employee_name: "Fatima Ahmed",
          personal_number: "456789012345678",
          bank_swift: "FGBMAEAD",
          bank_account: "AE000300004444444444444",
          basic_salary: 6000,
          housing_allowance: 2500,
          transport_allowance: 600,
          other_allowance: 400,
          deductions: 0,
          days_worked: 30,
          status: "active",
          last_payment: "2024-01-15"
        },
      ];
      setEmployees(mockEmployees);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate gross salary
  const calculateGrossSalary = (employee) => {
    return (employee.basic_salary || 0) + 
           (employee.housing_allowance || 0) + 
           (employee.transport_allowance || 0) + 
           (employee.other_allowance || 0);
  };

  // Calculate net salary
  const calculateNetSalary = (employee) => {
    const gross = calculateGrossSalary(employee);
    const deductions = employee.deductions || 0;
    return Math.max(0, gross - deductions);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get month name
  const getMonthName = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Table columns
  const columns = [
    {
      field: "employee_id",
      header: "Employee ID",
      sortable: true,
      width: "100px",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-semibold text-blue2">
            {value}
          </span>
          <span className="text-xs text-gray-500">
            System Generated
          </span>
        </div>
      ),
    },
    {
      field: "employee_name",
      header: "Employee Name",
      sortable: true,
      width: "180px",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue1 to-blue2 text-white text-xs font-semibold flex items-center justify-center">
            {value?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex flex-col">
            <div className="font-medium text-gray-900 text-sm">
              {value}
            </div>
            <div className={`text-xs ${row.status === "active" ? "text-green-600" : "text-gray-500"}`}>
              {row.status === "active" ? "✓ Active" : "Inactive"}
            </div>
          </div>
        </div>
      ),
    },
    {
      field: "personal_number",
      header: "Personal Number",
      sortable: true,
      width: "160px",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm text-gray-900">
            {value || "Not Provided"}
          </span>
          <span className="text-xs text-gray-500">
            Labour Card
          </span>
        </div>
      ),
    },
    {
      field: "basic_salary",
      header: "Basic Salary",
      sortable: true,
      width: "130px",
      render: (value, row) => (
        <div className="flex flex-col">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(value)}
          </div>
          <span className="text-xs text-gray-500">
            As per contract
          </span>
        </div>
      ),
    },
    {
      field: "gross_salary",
      header: "Gross Salary",
      sortable: true,
      width: "130px",
      render: (value, row) => {
        const gross = calculateGrossSalary(row);
        return (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(gross)}
            </span>
            <span className="text-xs text-gray-500">
              Basic + Allowances
            </span>
          </div>
        );
      },
    },
    {
      field: "net_salary",
      header: "Net Pay",
      sortable: true,
      width: "130px",
      render: (value, row) => {
        const net = calculateNetSalary(row);
        return (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-blue2">
              {formatCurrency(net)}
            </span>
            <span className="text-xs text-gray-500">
              Gross - Deductions
            </span>
          </div>
        );
      },
    },
    {
      field: "days_worked",
      header: "Days Worked",
      sortable: true,
      width: "110px",
      render: (value, row) => (
        <div className="flex flex-col">
          <div className="text-lg font-bold text-gray-900 text-center">
            {row.days_worked || 0}
          </div>
          <span className="text-xs text-gray-500 text-center">
            of 30 days
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      field: "actions",
      type: "actions",
      width: "100px",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {/* View Button */}
          <button
            className="w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue2 hover:border-blue2 flex items-center justify-center transition-colors"
            title="View Employee"
            onClick={(e) => {
              e.stopPropagation();
              // Add view functionality
              console.log("View employee:", row.employee_id);
            }}
          >
            <i className="fas fa-eye text-xs"></i>
          </button>
          
          {/* Edit Button */}
          <button
            className="w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue2 hover:border-blue2 flex items-center justify-center transition-colors"
            title="Edit Employee"
            onClick={(e) => {
              e.stopPropagation();
              // Add edit functionality
              console.log("Edit employee:", row.employee_id);
            }}
          >
            <i className="fas fa-edit text-xs"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl border border-blue-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue1 to-blue2 text-white flex items-center justify-center">
              <i className="fas fa-users"></i>
            </div>
            WPS Payroll
          </h1>
          <p className="text-gray-600 mt-1">
            Manage employee payroll information for WPS processing
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
              Payroll Month
            </label>
            <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium">
              {getMonthName(selectedMonth)}
            </div>
          </div>
          <button
            onClick={fetchEmployees}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue1 to-blue2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <i className="fas fa-redo"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue2 flex items-center justify-center">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{employees.length}</div>
              <div className="text-sm text-gray-600">Total Employees</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {employees.filter(e => e.status === "active").length}
              </div>
              <div className="text-sm text-gray-600">Active Employees</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{getMonthName(selectedMonth)}</div>
              <div className="text-sm text-gray-600">Current Month</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(employees.reduce((sum, emp) => sum + calculateNetSalary(emp), 0))}
              </div>
              <div className="text-sm text-gray-600">Total Net Pay</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <Table
          title="Employee Payroll"
          icon="👥"
          columns={columns}
          data={employees}
          loading={loading}
          sidebarCollapsed={sidebarCollapsed}
          searchPlaceholder="Search by employee name or ID..."
          pageSize={8}
          defaultSort={{
            field: "employee_name",
            direction: "asc",
          }}
          emptyMessage={
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <i className="fas fa-users text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Employees Found</h3>
              <p className="text-gray-600">Add employees to process payroll</p>
            </div>
          }
          containerClassName="flex-1 flex flex-col h-full"
          tableContainerClassName="flex-1"
          tableWrapperClassName="min-w-full"
        />
      </div>
    </div>
  );
};

export default WPSPayrollPage;