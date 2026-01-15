import { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import EmployeeTable from "@/Components/employees/EmployeeTable";
import EmployeeFilters from "@/Components/employees/EmployeeFilters";
import EmployeeForm from "@/Components/employees/EmployeeForm";
import EmployeeDetails from "@/Components/employees/EmployeeDetails";

export default function Employees() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "all",
    status: "all",
    contract_type: "all"
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.entities.Employee.list()
  });

  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.entities.Department.list()
  });

  const isLoading = loadingEmployees || loadingDepartments;

  const filteredEmployees = employees.filter(employee => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = !filters.search || 
      employee.full_name?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.position?.toLowerCase().includes(searchLower);
    
    const matchesDepartment = filters.department === "all" || employee.department_id === filters.department;
    const matchesStatus = filters.status === "all" || employee.status === filters.status;
    const matchesContract = filters.contract_type === "all" || employee.contract_type === filters.contract_type;

    return matchesSearch && matchesDepartment && matchesStatus && matchesContract;
  });

  const handleOpenForm = (employee = null) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    handleCloseForm();
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      department: "all",
      status: "all",
      contract_type: "all"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Funcionários</h1>
            <p className="text-slate-400 mt-1">Gerencie todos os colaboradores da empresa</p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Funcionário
          </Button>
        </div>

        {/* Filters */}
        <EmployeeFilters 
          filters={filters}
          onChange={setFilters}
          departments={departments}
          onClear={handleClearFilters}
        />

        {/* Results count */}
        <p className="text-slate-400 text-sm">
          {filteredEmployees.length} funcionário(s) encontrado(s)
        </p>

        {/* Table */}
        <EmployeeTable 
          employees={filteredEmployees}
          onEdit={handleOpenForm}
          onView={setViewingEmployee}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['employees'] })}
        />

        {/* Form Modal */}
        <EmployeeForm 
          open={showForm}
          onClose={handleCloseForm}
          employee={editingEmployee}
          departments={departments}
          onSave={handleSave}
        />

        {/* Details Modal */}
        <EmployeeDetails 
          employee={viewingEmployee}
          open={!!viewingEmployee}
          onClose={() => setViewingEmployee(null)}
        />
      </div>
    </div>
  );
}
