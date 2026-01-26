import { useState } from "react";
import { base44 } from "@/api/base44SupabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileSpreadsheet } from "lucide-react";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportSummary from "@/components/reports/ReportSummary";
import ReportTable from "@/components/reports/ReportTable";

export default function Reports() {
  const [filters, setFilters] = useState({
    department: "all",
    status: "all",
    contract_type: "all",
    store: "all",
    hire_date_from: "",
    hire_date_to: "",
    salary_min: "",
    salary_max: ""
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
    const matchesDepartment = filters.department === "all" || employee.department_id === filters.department;
    const matchesStatus = filters.status === "all" || employee.status === filters.status;
    const matchesContract = filters.contract_type === "all" || employee.contract_type === filters.contract_type;
    const matchesStore = filters.store === "all" || String(employee.store_id) === String(filters.store);
    const matchesHireDateFrom = !filters.hire_date_from || 
      (employee.hire_date && new Date(employee.hire_date) >= new Date(filters.hire_date_from));
    const matchesHireDateTo = !filters.hire_date_to || 
      (employee.hire_date && new Date(employee.hire_date) <= new Date(filters.hire_date_to));
    const matchesSalaryMin = !filters.salary_min || 
      (employee.salary && employee.salary >= parseFloat(filters.salary_min));
    const matchesSalaryMax = !filters.salary_max || 
      (employee.salary && employee.salary <= parseFloat(filters.salary_max));
    return matchesDepartment && matchesStatus && matchesContract && matchesStore && matchesHireDateFrom && matchesHireDateTo && matchesSalaryMin && matchesSalaryMax;
  });

  const handleClearFilters = () => {
    setFilters({
      department: "all",
      status: "all",
      contract_type: "all",
      store: "all",
      hire_date_from: "",
      hire_date_to: "",
      salary_min: "",
      salary_max: ""
    });
  };

  const handleExport = () => {
    const headers = [
      "Nome", "Email", "Telefone", "CPF", "Departamento", "Cargo", 
      "Contrato", "Admissão", "Salário", "Status", "Cidade", "Estado"
    ];

    const statusLabels = {
      active: "Ativo",
      inactive: "Inativo",
      on_leave: "Afastado",
      terminated: "Desligado"
    };

    const contractLabels = {
      clt: "CLT",
      pj: "PJ",
      temporary: "Temporário",
      intern: "Estagiário"
    };

    const rows = filteredEmployees.map(e => [
      e.full_name || "",
      e.email || "",
      e.phone || "",
      e.cpf || "",
      e.department_name || "",
      e.position || "",
      contractLabels[e.contract_type] || e.contract_type || "",
      e.hire_date || "",
      e.salary || "",
      statusLabels[e.status] || e.status || "",
      e.city || "",
      e.state || ""
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_funcionarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Relatórios</h1>
            <p className="text-slate-400 mt-1">Gere relatórios personalizados com filtros avançados</p>
          </div>
        </div>

        {/* Filters */}
        <ReportFilters 
          filters={filters}
          onChange={setFilters}
          departments={departments}
          stores={stores}
          onClear={handleClearFilters}
          onExport={handleExport}
        />

        {/* Summary */}
        <ReportSummary employees={filteredEmployees} />

        {/* Results count */}
        <p className="text-slate-400 text-sm">
          {filteredEmployees.length} registro(s) encontrado(s)
        </p>

        {/* Table */}
        <ReportTable employees={filteredEmployees} />
      </div>
    </div>
  );
}