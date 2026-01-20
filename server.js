import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = join(__dirname, 'data.json');

// Armazenamento em memória
let db = {
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

// Carregar dados do arquivo
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(data);
      console.log('📂 Dados carregados do arquivo');
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

// Salvar dados no arquivo
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
}

// Carregar dados ao iniciar
loadData();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Middleware para salvar dados após POST, PUT, DELETE
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      console.log(`💾 Middleware: Salvando após ${req.method} em ${req.path}`);
      saveData();
    }
    return originalJson.call(this, data);
  };
  next();
});

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
  res.json(db.absences);
});

app.post('/api/absences', (req, res) => {
  const newAbsence = { id: Date.now(), ...req.body };
  db.absences.push(newAbsence);
  console.log('POST /api/absences', newAbsence);
  res.status(201).json(newAbsence);
});

app.put('/api/absences/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.absences.findIndex(a => a.id === id);
  if (index !== -1) {
    db.absences[index] = { ...db.absences[index], ...req.body, id };
    console.log('PUT /api/absences/:id', db.absences[index]);
    res.json(db.absences[index]);
  } else {
    res.status(404).json({ error: 'Ausência não encontrada' });
  }
});

app.delete('/api/absences/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.absences.findIndex(a => a.id === id);
  if (index !== -1) {
    db.absences.splice(index, 1);
    console.log('DELETE /api/absences/:id', id);
    res.json({ message: 'Ausência excluída', id });
  } else {
    res.status(404).json({ error: 'Ausência não encontrada' });
  }
});

// Rotas de Cash Breaks
app.get('/api/cashbreaks', (req, res) => {
  res.json(db.cashbreaks);
});

app.post('/api/cashbreaks', (req, res) => {
  const newBreak = { id: Date.now(), ...req.body };
  db.cashbreaks.push(newBreak);
  console.log('POST /api/cashbreaks', newBreak);
  saveData();
  res.status(201).json(newBreak);
});

app.put('/api/cashbreaks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.cashbreaks.findIndex(b => b.id === id);
  if (index !== -1) {
    db.cashbreaks[index] = { ...db.cashbreaks[index], ...req.body, id };
    console.log('PUT /api/cashbreaks/:id', db.cashbreaks[index]);
    saveData();
    res.json(db.cashbreaks[index]);
  } else {
    res.status(404).json({ error: 'Quebra de caixa não encontrada' });
  }
});

app.delete('/api/cashbreaks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.cashbreaks.findIndex(b => b.id === id);
  if (index !== -1) {
    db.cashbreaks.splice(index, 1);
    console.log('DELETE /api/cashbreaks/:id', id);
    saveData();
    res.json({ message: 'Quebra de caixa excluída', id });
  } else {
    res.status(404).json({ error: 'Quebra de caixa não encontrada' });
  }
});

// Rotas de Ceasa Purchases
app.get('/api/ceasa-purchases', (req, res) => {
  try {
    const sorted = [...db.ceasaPurchases].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    res.json(sorted);
  } catch (error) {
    console.error('❌ ERRO GET /api/ceasa-purchases:', error.message);
    res.status(500).json({ error: 'Erro ao listar compras', message: error.message });
  }
});

app.post('/api/ceasa-purchases', (req, res) => {
  try {
    const newPurchase = { id: Date.now(), ...req.body };
    db.ceasaPurchases.push(newPurchase);
    console.log('✅ POST /api/ceasa-purchases sucesso', newPurchase);
    res.status(201).json(newPurchase);
  } catch (error) {
    console.error('❌ ERRO POST /api/ceasa-purchases:', error.message);
    res.status(500).json({ error: 'Erro ao criar compra', message: error.message });
  }
});

app.put('/api/ceasa-purchases/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.ceasaPurchases.findIndex(p => p.id === id);
    if (index !== -1) {
      db.ceasaPurchases[index] = { ...db.ceasaPurchases[index], ...req.body, id };
      console.log('✅ PUT /api/ceasa-purchases/:id sucesso', db.ceasaPurchases[index]);
      res.json(db.ceasaPurchases[index]);
    } else {
      res.status(404).json({ error: 'Compra não encontrada' });
    }
  } catch (error) {
    console.error('❌ ERRO PUT /api/ceasa-purchases/:id:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar compra', message: error.message });
  }
});

app.delete('/api/ceasa-purchases/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.ceasaPurchases.findIndex(p => p.id === id);
    if (index !== -1) {
      db.ceasaPurchases.splice(index, 1);
      console.log('✅ DELETE /api/ceasa-purchases/:id sucesso', id);
      res.json({ message: 'Compra excluída', id });
    } else {
      res.status(404).json({ error: 'Compra não encontrada' });
    }
  } catch (error) {
    console.error('❌ ERRO DELETE /api/ceasa-purchases/:id:', error.message);
    res.status(500).json({ error: 'Erro ao deletar compra', message: error.message });
  }
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
  res.json(db.departments);
});

app.post('/api/departments', (req, res) => {
  const newDepartment = { id: Date.now(), ...req.body };
  db.departments.push(newDepartment);
  console.log('POST /api/departments', newDepartment);
  res.status(201).json(newDepartment);
});

app.put('/api/departments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.departments.findIndex(d => d.id === id);
  if (index !== -1) {
    db.departments[index] = { ...db.departments[index], ...req.body, id };
    console.log('PUT /api/departments/:id', db.departments[index]);
    res.json(db.departments[index]);
  } else {
    res.status(404).json({ error: 'Departamento não encontrado' });
  }
});

app.delete('/api/departments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.departments.findIndex(d => d.id === id);
  if (index !== -1) {
    db.departments.splice(index, 1);
    console.log('DELETE /api/departments/:id', id);
    res.json({ message: 'Departamento excluído', id });
  } else {
    res.status(404).json({ error: 'Departamento não encontrado' });
  }
});

// Rotas de Stores
app.get('/api/stores', (req, res) => {
  res.json(db.stores);
});

app.post('/api/stores', (req, res) => {
  try {
    const newStore = { id: Date.now(), ...req.body };
    db.stores.push(newStore);
    console.log('✅ POST /api/stores sucesso', newStore);
    res.status(201).json(newStore);
  } catch (error) {
    console.error('❌ ERRO POST /api/stores:', error.message);
    res.status(500).json({ error: 'Erro ao criar loja', message: error.message });
  }
});

app.put('/api/stores/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.stores.findIndex(s => s.id === id);
    if (index !== -1) {
      db.stores[index] = { ...db.stores[index], ...req.body, id };
      console.log('✅ PUT /api/stores/:id sucesso', db.stores[index]);
      res.json(db.stores[index]);
    } else {
      res.status(404).json({ error: 'Loja não encontrada' });
    }
  } catch (error) {
    console.error('❌ ERRO PUT /api/stores/:id:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar loja', message: error.message });
  }
});

app.delete('/api/stores/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.stores.findIndex(s => s.id === id);
    if (index !== -1) {
      db.stores.splice(index, 1);
      console.log('✅ DELETE /api/stores/:id sucesso', id);
      res.json({ message: 'Loja excluída', id });
    } else {
      res.status(404).json({ error: 'Loja não encontrada' });
    }
  } catch (error) {
    console.error('❌ ERRO DELETE /api/stores/:id:', error.message);
    res.status(500).json({ error: 'Erro ao deletar loja', message: error.message });
  }
});

// Rotas de Cashiers
app.get('/api/cashiers', (req, res) => {
  res.json(db.cashiers);
});

app.post('/api/cashiers', (req, res) => {
  try {
    const newCashier = { id: Date.now(), ...req.body };
    db.cashiers.push(newCashier);
    console.log('✅ POST /api/cashiers sucesso', newCashier);
    res.status(201).json(newCashier);
  } catch (error) {
    console.error('❌ ERRO POST /api/cashiers:', error.message);
    res.status(500).json({ error: 'Erro ao criar caixa', message: error.message });
  }
});

app.put('/api/cashiers/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.cashiers.findIndex(c => c.id === id);
    if (index !== -1) {
      db.cashiers[index] = { ...db.cashiers[index], ...req.body, id };
      console.log('✅ PUT /api/cashiers/:id sucesso', db.cashiers[index]);
      res.json(db.cashiers[index]);
    } else {
      res.status(404).json({ error: 'Caixa não encontrado' });
    }
  } catch (error) {
    console.error('❌ ERRO PUT /api/cashiers/:id:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar caixa', message: error.message });
  }
});

app.delete('/api/cashiers/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.cashiers.findIndex(c => c.id === id);
    if (index !== -1) {
      db.cashiers.splice(index, 1);
      console.log('✅ DELETE /api/cashiers/:id sucesso', id);
      res.json({ message: 'Caixa excluído', id });
    } else {
      res.status(404).json({ error: 'Caixa não encontrado' });
    }
  } catch (error) {
    console.error('❌ ERRO DELETE /api/cashiers/:id:', error.message);
    res.status(500).json({ error: 'Erro ao deletar caixa', message: error.message });
  }
});

// Rotas de Vacations
app.get('/api/vacations', (req, res) => {
  res.json(db.vacations);
});

app.post('/api/vacations', (req, res) => {
  try {
    console.log('📝 POST /api/vacations recebido:', JSON.stringify(req.body));
    
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Body inválido' });
    }
    
    const newVacation = { id: Date.now(), ...req.body };
    console.log('💾 Salvando férias:', JSON.stringify(newVacation));
    db.vacations.push(newVacation);
    console.log('✅ POST /api/vacations sucesso', newVacation);
    res.status(201).json(newVacation);
  } catch (error) {
    console.error('❌ ERRO POST /api/vacations:', error.message, error.stack);
    res.status(500).json({ error: 'Erro ao salvar férias', message: error.message });
  }
});

app.put('/api/vacations/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.vacations.findIndex(v => v.id === id);
    if (index !== -1) {
      db.vacations[index] = { ...db.vacations[index], ...req.body, id };
      console.log('✅ PUT /api/vacations/:id sucesso', db.vacations[index]);
      res.json(db.vacations[index]);
    } else {
      res.status(404).json({ error: 'Férias não encontrada' });
    }
  } catch (error) {
    console.error('❌ ERRO PUT /api/vacations/:id:', error.message, error.stack);
    res.status(500).json({ error: 'Erro ao atualizar férias', message: error.message });
  }
});

app.delete('/api/vacations/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.vacations.findIndex(v => v.id === id);
    if (index !== -1) {
      db.vacations.splice(index, 1);
      console.log('✅ DELETE /api/vacations/:id sucesso', id);
      res.json({ message: 'Férias excluída', id });
    } else {
      res.status(404).json({ error: 'Férias não encontrada' });
    }
  } catch (error) {
    console.error('❌ ERRO DELETE /api/vacations/:id:', error.message, error.stack);
    res.status(500).json({ error: 'Erro ao deletar férias', message: error.message });
  }
});

// Rotas de Overtime
app.get('/api/overtime', (req, res) => {
  res.json(db.overtime);
});

app.post('/api/overtime', (req, res) => {
  const newOvertime = { id: Date.now(), ...req.body };
  db.overtime.push(newOvertime);
  console.log('POST /api/overtime', newOvertime);
  res.status(201).json(newOvertime);
});

app.put('/api/overtime/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.overtime.findIndex(o => o.id === id);
  if (index !== -1) {
    db.overtime[index] = { ...db.overtime[index], ...req.body, id };
    console.log('PUT /api/overtime/:id', db.overtime[index]);
    res.json(db.overtime[index]);
  } else {
    res.status(404).json({ error: 'Hora extra não encontrada' });
  }
});

app.delete('/api/overtime/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.overtime.findIndex(o => o.id === id);
  if (index !== -1) {
    db.overtime.splice(index, 1);
    console.log('DELETE /api/overtime/:id', id);
    res.json({ message: 'Hora extra excluída', id });
  } else {
    res.status(404).json({ error: 'Hora extra não encontrada' });
  }
});

// Rotas de Payroll
app.get('/api/payroll', (req, res) => {
  res.json(db.payroll);
});

app.post('/api/payroll', (req, res) => {
  console.log('POST /api/payroll', req.body);
  const newPayroll = { id: Date.now().toString(), ...req.body };
  db.payroll.push(newPayroll);
  saveData();
  res.status(201).json(newPayroll);
});

app.delete('/api/payroll/:id', (req, res) => {
  console.log('DELETE /api/payroll/:id', req.params.id);
  db.payroll = db.payroll.filter(p => String(p.id) !== String(req.params.id));
  saveData();
  res.json({ message: 'Folha excluída', id: req.params.id });
});

// Rotas de PayrollConfig
app.get('/api/payroll-config', (req, res) => {
  res.json(db.payrollConfig);
});

app.post('/api/payroll-config', (req, res) => {
  console.log('POST /api/payroll-config', req.body);
  const newConfig = { id: Date.now().toString(), ...req.body };
  db.payrollConfig.push(newConfig);
  saveData();
  res.status(201).json(newConfig);
});

app.put('/api/payroll-config/:id', (req, res) => {
  console.log('PUT /api/payroll-config/:id', req.params.id, req.body);
  const index = db.payrollConfig.findIndex(c => String(c.id) === String(req.params.id));
  if (index !== -1) {
    db.payrollConfig[index] = { ...db.payrollConfig[index], ...req.body };
  } else {
    db.payrollConfig.push({ id: req.params.id, ...req.body });
  }
  saveData();
  res.json(db.payrollConfig[index !== -1 ? index : db.payrollConfig.length - 1]);
});

// Rotas de HRConfig
app.get('/api/hr-config', (req, res) => {
  res.json(db.hrConfig);
});

app.post('/api/hr-config', (req, res) => {
  console.log('POST /api/hr-config', req.body);
  const config = { id: Date.now(), ...req.body };
  db.hrConfig.push(config);
  saveData();
  res.status(201).json(config);
});

app.put('/api/hr-config/:id', (req, res) => {
  console.log('PUT /api/hr-config/:id', req.params.id, req.body);
  const index = db.hrConfig.findIndex(c => c.id == req.params.id);
  if (index !== -1) {
    db.hrConfig[index] = { id: req.params.id, ...req.body };
    saveData();
  }
  res.json(db.hrConfig[index !== -1 ? index : db.hrConfig.length - 1]);
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
  res.json(db.ceasaSuppliers);
});

app.post('/api/ceasa-suppliers', (req, res) => {
  try {
    const newSupplier = { id: Date.now(), ...req.body };
    db.ceasaSuppliers.push(newSupplier);
    console.log('✅ POST /api/ceasa-suppliers sucesso', newSupplier);
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error('❌ ERRO POST /api/ceasa-suppliers:', error.message);
    res.status(500).json({ error: 'Erro ao criar fornecedor', message: error.message });
  }
});

app.put('/api/ceasa-suppliers/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.ceasaSuppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      db.ceasaSuppliers[index] = { ...db.ceasaSuppliers[index], ...req.body, id };
      console.log('✅ PUT /api/ceasa-suppliers/:id sucesso', db.ceasaSuppliers[index]);
      res.json(db.ceasaSuppliers[index]);
    } else {
      res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
  } catch (error) {
    console.error('❌ ERRO PUT /api/ceasa-suppliers/:id:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar fornecedor', message: error.message });
  }
});

app.delete('/api/ceasa-suppliers/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.ceasaSuppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      db.ceasaSuppliers.splice(index, 1);
      console.log('✅ DELETE /api/ceasa-suppliers/:id sucesso', id);
      res.json({ message: 'Fornecedor excluído', id });
    } else {
      res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
  } catch (error) {
    console.error('❌ ERRO DELETE /api/ceasa-suppliers/:id:', error.message);
    res.status(500).json({ error: 'Erro ao deletar fornecedor', message: error.message });
  }
});

// Rotas de CeasaProducts
app.get('/api/ceasa-products', (req, res) => {
  res.json(db.ceasaProducts);
});

app.post('/api/ceasa-products', (req, res) => {
  try {
    const newProduct = { id: Date.now(), ...req.body };
    db.ceasaProducts.push(newProduct);
    console.log('✅ POST /api/ceasa-products sucesso', newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('❌ ERRO POST /api/ceasa-products:', error.message);
    res.status(500).json({ error: 'Erro ao criar produto', message: error.message });
  }
});

app.put('/api/ceasa-products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.ceasaProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      db.ceasaProducts[index] = { ...db.ceasaProducts[index], ...req.body, id };
      console.log('✅ PUT /api/ceasa-products/:id sucesso', db.ceasaProducts[index]);
      res.json(db.ceasaProducts[index]);
    } else {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    console.error('❌ ERRO PUT /api/ceasa-products/:id:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar produto', message: error.message });
  }
});

app.delete('/api/ceasa-products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.ceasaProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      db.ceasaProducts.splice(index, 1);
      console.log('✅ DELETE /api/ceasa-products/:id sucesso', id);
      res.json({ message: 'Produto excluído', id });
    } else {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    console.error('❌ ERRO DELETE /api/ceasa-products/:id:', error.message);
    res.status(500).json({ error: 'Erro ao deletar produto', message: error.message });
  }
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
