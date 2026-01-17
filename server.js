import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Armazenamento em memória
const db = {
  employees: [],
  departments: [],
  stores: [],
  cashiers: [],
  absences: [],
  cashbreaks: [],
  ceasaPurchases: [],
  vacations: [],
  overtime: [],
  payroll: [],
  payrollConfig: [],
  hrConfig: [],
  systemConfig: [],
  ceasaSuppliers: [],
  ceasaProducts: []
};

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rotas de API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rotas de Absences
app.get('/api/absences', (req, res) => {
  res.json([]);
});

app.post('/api/absences', (req, res) => {
  res.status(201).json({ message: 'Ausência criada', data: req.body });
});

app.put('/api/absences/:id', (req, res) => {
  res.json({ message: 'Ausência atualizada', id: req.params.id, data: req.body });
});

app.delete('/api/absences/:id', (req, res) => {
  res.json({ message: 'Ausência excluída', id: req.params.id });
});

// Rotas de Cash Breaks
app.get('/api/cashbreaks', (req, res) => {
  res.json([]);
});

app.post('/api/cashbreaks', (req, res) => {
  res.status(201).json({ message: 'Cash break criado', data: req.body });
});

app.put('/api/cashbreaks/:id', (req, res) => {
  res.json({ message: 'Cash break atualizado', id: req.params.id, data: req.body });
});

app.delete('/api/cashbreaks/:id', (req, res) => {
  res.json({ message: 'Cash break excluído', id: req.params.id });
});

// Rotas de Ceasa Purchases
app.get('/api/ceasa-purchases', (req, res) => {
  res.json([]);
});

app.post('/api/ceasa-purchases', (req, res) => {
  res.status(201).json({ message: 'Compra Ceasa criada', data: req.body });
});

app.put('/api/ceasa-purchases/:id', (req, res) => {
  res.json({ message: 'Compra Ceasa atualizada', id: req.params.id, data: req.body });
});

app.delete('/api/ceasa-purchases/:id', (req, res) => {
  res.json({ message: 'Compra Ceasa excluída', id: req.params.id });
});

// Rotas de Employees
app.get('/api/employees', (req, res) => {
  res.json(db.employees);
});

app.post('/api/employees', (req, res) => {
  console.log('POST /api/employees', req.body);
  const newEmployee = { id: Date.now(), ...req.body };
  db.employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

app.put('/api/employees/:id', (req, res) => {
  console.log('PUT /api/employees/:id', req.params.id, req.body);
  const index = db.employees.findIndex(e => e.id == req.params.id);
  if (index !== -1) {
    db.employees[index] = { id: req.params.id, ...req.body };
    res.json(db.employees[index]);
  } else {
    res.status(404).json({ error: 'Funcionário não encontrado' });
  }
});

app.delete('/api/employees/:id', (req, res) => {
  console.log('DELETE /api/employees/:id', req.params.id);
  db.employees = db.employees.filter(e => e.id != req.params.id);
  res.json({ message: 'Funcionário excluído', id: req.params.id });
});

// Rotas de Departments
app.get('/api/departments', (req, res) => {
  res.json([]);
});

app.post('/api/departments', (req, res) => {
  console.log('POST /api/departments', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.put('/api/departments/:id', (req, res) => {
  console.log('PUT /api/departments/:id', req.params.id, req.body);
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/departments/:id', (req, res) => {
  console.log('DELETE /api/departments/:id', req.params.id);
  res.json({ message: 'Departamento excluído', id: req.params.id });
});

// Rotas de Stores
app.get('/api/stores', (req, res) => {
  res.json([]);
});

app.post('/api/stores', (req, res) => {
  console.log('POST /api/stores', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.put('/api/stores/:id', (req, res) => {
  console.log('PUT /api/stores/:id', req.params.id, req.body);
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/stores/:id', (req, res) => {
  console.log('DELETE /api/stores/:id', req.params.id);
  res.json({ message: 'Loja excluída', id: req.params.id });
});

// Rotas de Cashiers
app.get('/api/cashiers', (req, res) => {
  res.json([]);
});

app.post('/api/cashiers', (req, res) => {
  console.log('POST /api/cashiers', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.put('/api/cashiers/:id', (req, res) => {
  console.log('PUT /api/cashiers/:id', req.params.id, req.body);
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/cashiers/:id', (req, res) => {
  console.log('DELETE /api/cashiers/:id', req.params.id);
  res.json({ message: 'Caixa excluído', id: req.params.id });
});

// Rotas de Vacations
app.get('/api/vacations', (req, res) => {
  res.json([]);
});

app.post('/api/vacations', (req, res) => {
  console.log('POST /api/vacations', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.delete('/api/vacations/:id', (req, res) => {
  console.log('DELETE /api/vacations/:id', req.params.id);
  res.json({ message: 'Férias excluída', id: req.params.id });
});

// Rotas de Overtime
app.get('/api/overtime', (req, res) => {
  res.json([]);
});

app.post('/api/overtime', (req, res) => {
  console.log('POST /api/overtime', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.put('/api/overtime/:id', (req, res) => {
  console.log('PUT /api/overtime/:id', req.params.id, req.body);
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/overtime/:id', (req, res) => {
  console.log('DELETE /api/overtime/:id', req.params.id);
  res.json({ message: 'Hora extra excluída', id: req.params.id });
});

// Rotas de Payroll
app.get('/api/payroll', (req, res) => {
  res.json([]);
});

app.post('/api/payroll', (req, res) => {
  console.log('POST /api/payroll', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.delete('/api/payroll/:id', (req, res) => {
  console.log('DELETE /api/payroll/:id', req.params.id);
  res.json({ message: 'Folha excluída', id: req.params.id });
});

// Rotas de PayrollConfig
app.get('/api/payroll-config', (req, res) => {
  res.json([]);
});

app.post('/api/payroll-config', (req, res) => {
  console.log('POST /api/payroll-config', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.put('/api/payroll-config/:id', (req, res) => {
  console.log('PUT /api/payroll-config/:id', req.params.id, req.body);
  res.json({ id: req.params.id, ...req.body });
});

// Rotas de HRConfig
app.get('/api/hr-config', (req, res) => {
  res.json([]);
});

app.post('/api/hr-config', (req, res) => {
  console.log('POST /api/hr-config', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.put('/api/hr-config/:id', (req, res) => {
  console.log('PUT /api/hr-config/:id', req.params.id, req.body);
  res.json({ id: req.params.id, ...req.body });
});

// Rotas de SystemConfig
app.get('/api/system-config', (req, res) => {
  res.json([]);
});

app.post('/api/system-config', (req, res) => {
  console.log('POST /api/system-config', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.put('/api/system-config/:id', (req, res) => {
  console.log('PUT /api/system-config/:id', req.params.id, req.body);
  res.json({ id: req.params.id, ...req.body });
});

// Rotas de CeasaSuppliers
app.get('/api/ceasa-suppliers', (req, res) => {
  res.json([]);
});

app.post('/api/ceasa-suppliers', (req, res) => {
  console.log('POST /api/ceasa-suppliers', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.put('/api/ceasa-suppliers/:id', (req, res) => {
  console.log('PUT /api/ceasa-suppliers/:id', req.params.id, req.body);
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/ceasa-suppliers/:id', (req, res) => {
  console.log('DELETE /api/ceasa-suppliers/:id', req.params.id);
  res.json({ message: 'Fornecedor excluído', id: req.params.id });
});

// Rotas de CeasaProducts
app.get('/api/ceasa-products', (req, res) => {
  res.json([]);
});

app.post('/api/ceasa-products', (req, res) => {
  console.log('POST /api/ceasa-products', req.body);
  res.status(201).json({ id: Date.now(), ...req.body });
});

app.put('/api/ceasa-products/:id', (req, res) => {
  console.log('PUT /api/ceasa-products/:id', req.params.id, req.body);
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/ceasa-products/:id', (req, res) => {
  console.log('DELETE /api/ceasa-products/:id', req.params.id);
  res.json({ message: 'Produto excluído', id: req.params.id });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
