import { useState } from "react";
import { base44 } from "@/api/base44SupabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeFilters from "@/components/employees/EmployeeFilters";
import EmployeeForm from "@/components/employees/EmployeeForm";
import EmployeeDetails from "@/components/employees/EmployeeDetails";

export default function Employees() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    store: "all",
    status: "all",
    contract_type: "all"
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list()
  });

  const { data: stores = [], isLoading: loadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list()
  });

  const isLoading = loadingEmployees || loadingDepartments || loadingStores;

  const filteredEmployees = employees.filter(employee => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = !filters.search || 
      employee.full_name?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.position?.toLowerCase().includes(searchLower);

    const matchesStore = filters.store === "all" || String(employee.store_id) === String(filters.store);
    const matchesStatus = filters.status === "all" || employee.status === filters.status;
    const matchesContract = filters.contract_type === "all" || employee.contract_type === filters.contract_type;

    return matchesSearch && matchesStore && matchesStatus && matchesContract;
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
      store: "all",
      status: "all",
      contract_type: "all"
    });
  };


  // Exibe loading sobre a tabela se estiver recarregando após cadastro
  const showTableLoading = loadingEmployees;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Funcionários</h1>
            <p className="text-slate-400 mt-1">Gerencie todos os colaboradores da empresa</p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Funcionário
          </Button>
        </div>

        {/* Filters */}
        <EmployeeFilters 
          filters={filters}
          onChange={setFilters}
          stores={stores}
          onClear={handleClearFilters}
        />

        {/* Results count */}
        <p className="text-slate-400 text-sm">
          {filteredEmployees.length} funcionário(s) encontrado(s)
        </p>

        {/* Table */}

        <div className="relative">
          <EmployeeTable 
            employees={filteredEmployees}
            onEdit={handleOpenForm}
            onView={setViewingEmployee}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['employees'] })}
          />
          {showTableLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          )}
        </div>

        {/* Form Modal */}
        <EmployeeForm 
          open={showForm}
          onClose={handleCloseForm}
          employee={editingEmployee}
          departments={departments}
          stores={stores}
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