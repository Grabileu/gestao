import { useState, useEffect } from "react";
import { base44 } from "@/api/base44SupabaseClient";
import { supabase } from "@/lib/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Receipt, Plus, Loader2 } from "lucide-react";
import CashBreakTable from "@/components/cashbreaks/CashBreakTable";
import CashBreakFilters from "@/components/cashbreaks/CashBreakFilters";
import CashBreakStats from "@/components/cashbreaks/CashBreakStats";
import CashBreakForm from "@/components/cashbreaks/CashBreakForm";

export default function CashBreaks() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({
    store: "all",
    cashier: "all",
    type: "all",
    status: "all",
    date_from: "",
    date_to: ""
  });

  const { data: cashBreaks = [], isLoading: loadingBreaks } = useQuery({
    queryKey: ['cashBreaks'],
    queryFn: () => base44.entities.CashBreak.list('-date')
  });

  const { data: stores = [], isLoading: loadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list()
  });

  // Busca operadores de caixa ativos do departamento CAIXAS
  const [cashiers, setCashiers] = useState([]);
  const [loadingCashiers, setLoadingCashiers] = useState(true);

  useEffect(() => {
    async function fetchCashiers() {
      setLoadingCashiers(true);
      // Busca departamento CAIXAS
      let deptId = null;
      const { data: depts } = await supabase.from("department").select("id, name");
      const dept = depts?.find(d => d.name && d.name.toLowerCase() === "caixas");
      if (dept) deptId = dept.id;
      if (!deptId) {
        setCashiers([]);
        setLoadingCashiers(false);
        return;
      }
      // Busca funcionários ativos do departamento CAIXAS
      let { data: employees } = await supabase
        .from("employee")
        .select("id, full_name, status, department_id")
        .eq("department_id", deptId)
        .eq("status", "active");
      employees = employees || [];
      setCashiers(
        employees.map(e => ({ id: e.id, name: e.full_name }))
      );
      setLoadingCashiers(false);
    }
    fetchCashiers();
  }, []);

  const isLoading = loadingBreaks || loadingStores || loadingCashiers;

  const filteredBreaks = cashBreaks.filter(item => {
    const matchesStore = filters.store === "all" || item.store_id === filters.store;
    // Corrigir: comparar cashier_id do filtro com employee_id OU cashier_id do registro
    const matchesCashier = filters.cashier === "all" || String(item.employee_id || item.cashier_id) === String(filters.cashier);
    const matchesType = filters.type === "all" || item.type === filters.type;
    const matchesStatus = filters.status === "all" || item.voucher_status === filters.status;
    
    const matchesDateFrom = !filters.date_from || 
      (item.date && new Date(item.date) >= new Date(filters.date_from));
    
    const matchesDateTo = !filters.date_to || 
      (item.date && new Date(item.date) <= new Date(filters.date_to));

    return matchesStore && matchesCashier && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const handleOpenForm = (item = null) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['cashBreaks'] });
    handleCloseForm();
  };

  const handleClearFilters = () => {
    setFilters({
      store: "all",
      cashier: "all",
      type: "all",
      status: "all",
      date_from: "",
      date_to: ""
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
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30">
              <Receipt className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Quebras de Caixa</h1>
              <p className="text-slate-400 mt-1">Controle de vales e quebras de caixa</p>
            </div>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Quebra
          </Button>
        </div>


        {/* Filters */}
        {cashiers.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-900/80 border-l-4 border-yellow-500 text-yellow-200 rounded">
            <strong>Atenção:</strong> Nenhum operador de caixa encontrado no departamento "CAIXAS". Verifique se há funcionários ativos cadastrados corretamente.
          </div>
        )}
        <CashBreakFilters 
          filters={filters}
          onChange={setFilters}
          stores={stores}
          cashiers={cashiers}
          onClear={handleClearFilters}
        />

        {/* Stats - contagens de faltas, sobras, etc */}
        <CashBreakStats cashBreaks={filteredBreaks} />

        {/* Results count */}
        <p className="text-slate-400 text-sm">
          {filteredBreaks.length} registro(s) encontrado(s)
        </p>

        {/* Table */}
        <CashBreakTable 
          cashBreaks={filteredBreaks}
          onEdit={handleOpenForm}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['cashBreaks'] })}
        />

        {/* Form Modal */}
        <CashBreakForm 
          open={showForm}
          onClose={handleCloseForm}
          cashBreak={editingItem}
          stores={stores}
          cashiers={cashiers}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}