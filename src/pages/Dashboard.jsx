import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Wallet, TrendingUp, Loader2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import DepartmentChart from "@/components/dashboard/DepartmentChart";
import SalaryChart from "@/components/dashboard/SalaryChart";
import RecentEmployees from "@/components/dashboard/RecentEmployees";

export default function Dashboard() {
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list()
  });

  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list()
  });

  const isLoading = loadingEmployees || loadingDepartments;

  const activeEmployees = employees.filter(e => e.status === 'active');
  const totalSalary = activeEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const avgSalary = activeEmployees.length > 0 ? totalSalary / activeEmployees.length : 0;
  const activeDepartments = departments.filter(d => d.status === 'active').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Visão geral do sistema de gestão</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Funcionários"
            value={employees.length}
            icon={Users}
            bgColor="bg-blue-500"
            subtitle={`${activeEmployees.length} ativos`}
          />
          <StatCard
            title="Departamentos"
            value={departments.length}
            icon={Building2}
            bgColor="bg-purple-500"
            subtitle={`${activeDepartments} ativos`}
          />
          <StatCard
            title="Folha Mensal"
            value={`R$ ${totalSalary.toLocaleString('pt-BR')}`}
            icon={Wallet}
            bgColor="bg-emerald-500"
          />
          <StatCard
            title="Média Salarial"
            value={`R$ ${avgSalary.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
            icon={TrendingUp}
            bgColor="bg-amber-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepartmentChart employees={employees} departments={departments} />
          <SalaryChart employees={employees} departments={departments} />
        </div>

        {/* Recent Employees */}
        <RecentEmployees employees={employees} />
      </div>
    </div>
  );
}