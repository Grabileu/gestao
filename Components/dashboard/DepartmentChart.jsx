import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#4361ee', '#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#ffbe0b', '#06d6a0', '#118ab2'];

export default function DepartmentChart({ employees, departments }) {
  const data = departments.map(dept => ({
    name: dept.name,
    value: employees.filter(e => String(e.department_id) === String(dept.id)).length
  })).filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-lg">Funcionários por Departamento</CardTitle>
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
        <CardTitle className="text-white text-lg">Funcionários por Departamento</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend 
              formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}