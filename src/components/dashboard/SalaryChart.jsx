import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SalaryChart({ employees, departments }) {
  const data = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department_id === dept.id && e.status === 'active');
    const totalSalary = deptEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
    return {
      name: dept.name?.substring(0, 10) || 'N/A',
      total: totalSalary,
      count: deptEmployees.length
    };
  }).filter(d => d.total > 0);

  if (data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-lg">Folha por Departamento</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-slate-500">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white text-lg">Folha por Departamento</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Total']}
            />
            <Bar dataKey="total" fill="#4361ee" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}