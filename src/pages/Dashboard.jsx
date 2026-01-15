import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Users, Building2, Wallet, TrendingUp, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function Dashboard() {
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.entities.Employee.list()
  });

  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.entities.Department.list()
  });

  const isLoading = loadingEmployees || loadingDepartments;

  const activeEmployees = employees.filter(e => e.status === 'active');
  const totalSalary = activeEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const avgSalary = activeEmployees.length > 0 ? totalSalary / activeEmployees.length : 0;
  const activeDepartments = departments.filter(d => d.status === 'active').length;

  // Dados para gráficos
  const departmentData = departments.map(dept => ({
    name: dept.name,
    value: employees.filter(e => e.department_id === dept.id).length
  })).filter(d => d.value > 0);

  const salaryByDept = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department_id === dept.id);
    const total = deptEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
    return { name: dept.name, value: total };
  }).filter(d => d.value > 0);

  const COLORS = ['#5b7fff', '#4169e1', '#3b5bdb', '#364fc7'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1729] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1729] text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Visão geral do sistema de gestão</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Funcionários */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3444]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">TOTAL FUNCIONÁRIOS</p>
              <p className="text-4xl font-bold text-white">{activeEmployees.length}</p>
              <p className="text-gray-500 text-sm mt-2">{activeEmployees.length} ativos</p>
            </div>
            <div className="bg-[#4169e1] bg-opacity-20 p-3 rounded-xl">
              <Users className="w-6 h-6 text-[#5b7fff]" />
            </div>
          </div>
        </div>

        {/* Departamentos */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3444]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">DEPARTAMENTOS</p>
              <p className="text-4xl font-bold text-white">{activeDepartments}</p>
              <p className="text-gray-500 text-sm mt-2">{activeDepartments} ativos</p>
            </div>
            <div className="bg-[#4169e1] bg-opacity-20 p-3 rounded-xl">
              <Building2 className="w-6 h-6 text-[#5b7fff]" />
            </div>
          </div>
        </div>

        {/* Folha Mensal */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3444]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">FOLHA MENSAL</p>
              <p className="text-4xl font-bold text-white">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalSalary)}
              </p>
            </div>
            <div className="bg-[#4169e1] bg-opacity-20 p-3 rounded-xl">
              <Wallet className="w-6 h-6 text-[#5b7fff]" />
            </div>
          </div>
        </div>

        {/* Média Salarial */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3444]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">MÉDIA SALARIAL</p>
              <p className="text-4xl font-bold text-white">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(avgSalary)}
              </p>
            </div>
            <div className="bg-[#4169e1] bg-opacity-20 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-[#5b7fff]" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funcionários por Departamento */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3444]">
          <h3 className="text-xl font-semibold text-white mb-6">Funcionários por Departamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3444', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {departmentData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Folha por Departamento */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3444]">
          <h3 className="text-xl font-semibold text-white mb-6">Folha por Departamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3444" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3444', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}
              />
              <Bar dataKey="value" fill="#5b7fff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
