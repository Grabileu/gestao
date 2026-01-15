import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dados em memória (inicializados dos arquivos JSON)
let employees = [];
let departments = [];
let stores = [];
let cashiers = [];
let payrollConfig = [];
let payrolls = [];
let absences = [];
let cashBreaks = [];
let vacations = [];
let hrConfig = [];
let systemConfig = [];
let ceasaSuppliers = [];
let ceasaProducts = [];
let ceasaPurchases = [];

// Função para carregar dados dos arquivos JSON
function loadData() {
  try {
    const entitiesDir = path.join(__dirname, 'Entities');
    
    // Carregar Employee (prefere Employee.data.json quando existir)
    const employeeDataPath = path.join(entitiesDir, 'Employee.data.json');
    const employeePath = path.join(entitiesDir, 'Employee.json');
    if (fs.existsSync(employeeDataPath)) {
      const data = JSON.parse(fs.readFileSync(employeeDataPath, 'utf8'));
      employees = Array.isArray(data) ? data : data.records || [];
    } else if (fs.existsSync(employeePath)) {
      const data = JSON.parse(fs.readFileSync(employeePath, 'utf8'));
      employees = Array.isArray(data) ? data : data.records || [];
    }
    
    // Carregar Department (prefere Department.data.json quando existir)
    const departmentDataPath = path.join(entitiesDir, 'Department.data.json');
    const departmentPath = path.join(entitiesDir, 'Department.json');
    if (fs.existsSync(departmentDataPath)) {
      const data = JSON.parse(fs.readFileSync(departmentDataPath, 'utf8'));
      departments = Array.isArray(data) ? data : data.records || [];
    } else if (fs.existsSync(departmentPath)) {
      const data = JSON.parse(fs.readFileSync(departmentPath, 'utf8'));
      departments = Array.isArray(data) ? data : data.records || [];
    }
    
    // Carregar Store (prefere Store.data.json quando existir)
    const storeDataPath = path.join(entitiesDir, 'Store.data.json');
    const storePath = path.join(entitiesDir, 'Store.json');
    if (fs.existsSync(storeDataPath)) {
      const data = JSON.parse(fs.readFileSync(storeDataPath, 'utf8'));
      stores = Array.isArray(data) ? data : data.records || [];
    } else if (fs.existsSync(storePath)) {
      const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      stores = Array.isArray(data) ? data : data.records || [];
    }

    // Carregar Cashier (prefere Cashier.data.json quando existir)
    const cashierDataPath = path.join(entitiesDir, 'Cashier.data.json');
    const cashierPath = path.join(entitiesDir, 'Cashier.json');
    if (fs.existsSync(cashierDataPath)) {
      const data = JSON.parse(fs.readFileSync(cashierDataPath, 'utf8'));
      cashiers = Array.isArray(data) ? data : data.records || [];
    } else if (fs.existsSync(cashierPath)) {
      const data = JSON.parse(fs.readFileSync(cashierPath, 'utf8'));
      cashiers = Array.isArray(data) ? data : data.records || [];
    }

    // Carregar CeasaSupplier (prefere CeasaSupplier.data.json quando existir)
    const ceasaSupplierDataPath = path.join(entitiesDir, 'CeasaSupplier.data.json');
    const ceasaSupplierPath = path.join(entitiesDir, 'CeasaSupplier.json');
    if (fs.existsSync(ceasaSupplierDataPath)) {
      const data = JSON.parse(fs.readFileSync(ceasaSupplierDataPath, 'utf8'));
      ceasaSuppliers = Array.isArray(data) ? data : data.records || [];
    } else if (fs.existsSync(ceasaSupplierPath)) {
      const data = JSON.parse(fs.readFileSync(ceasaSupplierPath, 'utf8'));
      ceasaSuppliers = Array.isArray(data) ? data : data.records || [];
    }

    // Carregar CeasaProduct (prefere CeasaProduct.data.json quando existir)
    const ceasaProductDataPath = path.join(entitiesDir, 'CeasaProduct.data.json');
    const ceasaProductPath = path.join(entitiesDir, 'CeasaProduct.json');
    if (fs.existsSync(ceasaProductDataPath)) {
      const data = JSON.parse(fs.readFileSync(ceasaProductDataPath, 'utf8'));
      ceasaProducts = Array.isArray(data) ? data : data.records || [];
    } else if (fs.existsSync(ceasaProductPath)) {
      const data = JSON.parse(fs.readFileSync(ceasaProductPath, 'utf8'));
      ceasaProducts = Array.isArray(data) ? data : data.records || [];
    }

    // Carregar CeasaPurchase (prefere CeasaPurchase.data.json quando existir)
    const ceasaPurchaseDataPath = path.join(entitiesDir, 'CeasaPurchase.data.json');
    const ceasaPurchasePath = path.join(entitiesDir, 'CeasaPurchase.json');
    if (fs.existsSync(ceasaPurchaseDataPath)) {
      const data = JSON.parse(fs.readFileSync(ceasaPurchaseDataPath, 'utf8'));
      ceasaPurchases = Array.isArray(data) ? data : data.records || [];
    } else if (fs.existsSync(ceasaPurchasePath)) {
      const data = JSON.parse(fs.readFileSync(ceasaPurchasePath, 'utf8'));
      ceasaPurchases = Array.isArray(data) ? data : data.records || [];
    }

    // Carregar Payrolls (prefere Payroll.data.json quando existir)
    const payrollDataPath = path.join(entitiesDir, 'Payroll.data.json');
    const payrollPath = path.join(entitiesDir, 'Payroll.json');
    if (fs.existsSync(payrollDataPath)) {
      const data = JSON.parse(fs.readFileSync(payrollDataPath, 'utf8'));
      payrolls = Array.isArray(data) ? data : data.records || [];
    } else if (fs.existsSync(payrollPath)) {
      const data = JSON.parse(fs.readFileSync(payrollPath, 'utf8'));
      payrolls = Array.isArray(data) ? data : data.records || [];
    }

    // Carregar SystemConfig (prefere SystemConfig.data.json quando existir)
    const systemConfigDataPath = path.join(entitiesDir, 'SystemConfig.data.json');
    const systemConfigPath = path.join(entitiesDir, 'SystemConfig.json');
    if (fs.existsSync(systemConfigDataPath)) {
      const data = JSON.parse(fs.readFileSync(systemConfigDataPath, 'utf8'));
      systemConfig = Array.isArray(data) ? data : data.records || [];
    } else if (fs.existsSync(systemConfigPath)) {
      const data = JSON.parse(fs.readFileSync(systemConfigPath, 'utf8'));
      systemConfig = Array.isArray(data) ? data : data.records || [];
    }

    // Carregar HRConfig (prefere HRConfig.data.json quando existir)
    const hrConfigDataPath = path.join(entitiesDir, 'HRConfig.data.json');
    const hrConfigPath = path.join(entitiesDir, 'HRConfig.json');
    if (fs.existsSync(hrConfigDataPath)) {
      const data = JSON.parse(fs.readFileSync(hrConfigDataPath, 'utf8'));
      hrConfig = Array.isArray(data) ? data : data.records || [];
    } else if (fs.existsSync(hrConfigPath)) {
      const data = JSON.parse(fs.readFileSync(hrConfigPath, 'utf8'));
      hrConfig = Array.isArray(data) ? data : data.records || [];
    }
    
    console.log('✓ Dados carregados com sucesso');
    console.log(`  - ${employees.length} funcionários`);
    console.log(`  - ${departments.length} departamentos`);
    console.log(`  - ${stores.length} lojas`);
  } catch (error) {
    console.error('Erro ao carregar dados:', error.message);
  }
}

// Endpoints
app.get('/api/employees', (req, res) => {
  res.json(employees);
});

app.post('/api/employees', (req, res) => {
  const newEmployee = { id: Date.now(), ...req.body };
  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

app.put('/api/employees/:id', (req, res) => {
  const index = employees.findIndex(e => e.id == req.params.id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...req.body };
    res.json(employees[index]);
  } else {
    res.status(404).json({ error: 'Funcionário não encontrado' });
  }
});

app.delete('/api/employees/:id', (req, res) => {
  const index = employees.findIndex(e => e.id == req.params.id);
  if (index !== -1) {
    const deleted = employees.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Funcionário não encontrado' });
  }
});

// Departamentos
app.get('/api/departments', (req, res) => {
  res.json(departments);
});

app.post('/api/departments', (req, res) => {
  const newDept = { id: Date.now(), ...req.body };
  departments.push(newDept);
  res.status(201).json(newDept);
});

app.put('/api/departments/:id', (req, res) => {
  const index = departments.findIndex(d => d.id == req.params.id);
  if (index !== -1) {
    departments[index] = { ...departments[index], ...req.body };
    res.json(departments[index]);
  } else {
    res.status(404).json({ error: 'Departamento não encontrado' });
  }
});

app.delete('/api/departments/:id', (req, res) => {
  const index = departments.findIndex(d => d.id == req.params.id);
  if (index !== -1) {
    const deleted = departments.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Departamento não encontrado' });
  }
});

// Lojas
app.get('/api/stores', (req, res) => {
  res.json(stores);
});

app.post('/api/stores', (req, res) => {
  const newStore = { id: Date.now(), ...req.body };
  stores.push(newStore);
  res.status(201).json(newStore);
});

app.put('/api/stores/:id', (req, res) => {
  const index = stores.findIndex(s => s.id == req.params.id);
  if (index !== -1) {
    stores[index] = { ...stores[index], ...req.body };
    res.json(stores[index]);
  } else {
    res.status(404).json({ error: 'Loja não encontrada' });
  }
});

app.delete('/api/stores/:id', (req, res) => {
  const index = stores.findIndex(s => s.id == req.params.id);
  if (index !== -1) {
    const deleted = stores.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Loja não encontrada' });
  }
});

// Cashiers (operadores de caixa)
app.get('/api/cashiers', (req, res) => {
  res.json(cashiers);
});

app.post('/api/cashiers', (req, res) => {
  const newItem = { id: Date.now().toString(), ...req.body };
  cashiers.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/cashiers/:id', (req, res) => {
  const index = cashiers.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    cashiers[index] = { ...cashiers[index], ...req.body };
    res.json(cashiers[index]);
  } else {
    res.status(404).json({ error: 'Cashier not found' });
  }
});

app.delete('/api/cashiers/:id', (req, res) => {
  const index = cashiers.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    const deleted = cashiers.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Cashier not found' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando!' });
});

// Payrolls
app.get('/api/payrolls', (req, res) => {
  res.json(payrolls);
});

app.post('/api/payrolls', (req, res) => {
  const newItem = { id: Date.now().toString(), ...req.body };
  payrolls.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/payrolls/:id', (req, res) => {
  const index = payrolls.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    payrolls[index] = { ...payrolls[index], ...req.body };
    res.json(payrolls[index]);
  } else {
    res.status(404).json({ error: 'Payroll not found' });
  }
});

app.delete('/api/payrolls/:id', (req, res) => {
  const index = payrolls.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    const deleted = payrolls.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Payroll not found' });
  }
});

// System Config
app.get('/api/system-config', (req, res) => {
  res.json(systemConfig);
});

app.post('/api/system-config', (req, res) => {
  const newItem = { id: Date.now().toString(), ...req.body };
  systemConfig.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/system-config/:id', (req, res) => {
  const index = systemConfig.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    systemConfig[index] = { ...systemConfig[index], ...req.body };
    res.json(systemConfig[index]);
  } else {
    res.status(404).json({ error: 'SystemConfig not found' });
  }
});

app.delete('/api/system-config/:id', (req, res) => {
  const index = systemConfig.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    const deleted = systemConfig.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'SystemConfig not found' });
  }
});

// Ceasa Suppliers
app.get('/api/ceasa-suppliers', (req, res) => {
  res.json(ceasaSuppliers);
});

app.post('/api/ceasa-suppliers', (req, res) => {
  const newItem = { id: Date.now().toString(), ...req.body };
  ceasaSuppliers.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/ceasa-suppliers/:id', (req, res) => {
  const index = ceasaSuppliers.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    ceasaSuppliers[index] = { ...ceasaSuppliers[index], ...req.body };
    res.json(ceasaSuppliers[index]);
  } else {
    res.status(404).json({ error: 'Ceasa supplier not found' });
  }
});

app.delete('/api/ceasa-suppliers/:id', (req, res) => {
  const index = ceasaSuppliers.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    const deleted = ceasaSuppliers.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Ceasa supplier not found' });
  }
});

// Ceasa Products
app.get('/api/ceasa-products', (req, res) => {
  res.json(ceasaProducts);
});

app.post('/api/ceasa-products', (req, res) => {
  const newItem = { id: Date.now().toString(), ...req.body };
  ceasaProducts.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/ceasa-products/:id', (req, res) => {
  const index = ceasaProducts.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    ceasaProducts[index] = { ...ceasaProducts[index], ...req.body };
    res.json(ceasaProducts[index]);
  } else {
    res.status(404).json({ error: 'Ceasa product not found' });
  }
});

app.delete('/api/ceasa-products/:id', (req, res) => {
  const index = ceasaProducts.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    const deleted = ceasaProducts.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Ceasa product not found' });
  }
});

// Ceasa Purchases
app.get('/api/ceasa-purchases', (req, res) => {
  res.json(ceasaPurchases);
});

app.post('/api/ceasa-purchases', (req, res) => {
  const newItem = { id: Date.now().toString(), ...req.body };
  ceasaPurchases.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/ceasa-purchases/:id', (req, res) => {
  const index = ceasaPurchases.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    ceasaPurchases[index] = { ...ceasaPurchases[index], ...req.body };
    res.json(ceasaPurchases[index]);
  } else {
    res.status(404).json({ error: 'Ceasa purchase not found' });
  }
});

app.delete('/api/ceasa-purchases/:id', (req, res) => {
  const index = ceasaPurchases.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    const deleted = ceasaPurchases.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Ceasa purchase not found' });
  }
});

// Absences (faltas e atestados)
app.get('/api/absences', (req, res) => {
  res.json(absences);
});

app.post('/api/absences', (req, res) => {
  const newItem = { id: Date.now().toString(), ...req.body };
  absences.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/absences/:id', (req, res) => {
  const index = absences.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    absences[index] = { ...absences[index], ...req.body };
    res.json(absences[index]);
  } else {
    res.status(404).json({ error: 'Absence not found' });
  }
});

app.delete('/api/absences/:id', (req, res) => {
  const index = absences.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    const deleted = absences.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Absence not found' });
  }
});

// Vacations
app.get('/api/vacations', (req, res) => {
  res.json(vacations);
});

app.post('/api/vacations', (req, res) => {
  const newItem = { id: Date.now().toString(), ...req.body };
  vacations.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/vacations/:id', (req, res) => {
  const index = vacations.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    vacations[index] = { ...vacations[index], ...req.body };
    res.json(vacations[index]);
  } else {
    res.status(404).json({ error: 'Vacation not found' });
  }
});

app.delete('/api/vacations/:id', (req, res) => {
  const index = vacations.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    const deleted = vacations.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Vacation not found' });
  }
});

// Payroll Config
app.get('/api/payroll-config', (req, res) => {
  res.json(payrollConfig);
});

app.post('/api/payroll-config', (req, res) => {
  const newItem = { id: Date.now().toString(), ...req.body };
  payrollConfig.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/payroll-config/:id', (req, res) => {
  const index = payrollConfig.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    payrollConfig[index] = { ...payrollConfig[index], ...req.body };
    res.json(payrollConfig[index]);
  } else {
    res.status(404).json({ error: 'Payroll config not found' });
  }
});

app.delete('/api/payroll-config/:id', (req, res) => {
  const index = payrollConfig.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    const deleted = payrollConfig.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Payroll config not found' });
  }
});

// HR Config
app.get('/api/hr-config', (req, res) => {
  res.json(hrConfig);
});

app.post('/api/hr-config', (req, res) => {
  const newItem = { id: Date.now().toString(), ...req.body };
  hrConfig.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/hr-config/:id', (req, res) => {
  const index = hrConfig.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    hrConfig[index] = { ...hrConfig[index], ...req.body };
    res.json(hrConfig[index]);
  } else {
    res.status(404).json({ error: 'HR config not found' });
  }
});

app.delete('/api/hr-config/:id', (req, res) => {
  const index = hrConfig.findIndex(i => i.id == req.params.id);
  if (index !== -1) {
    const deleted = hrConfig.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'HR config not found' });
  }
});

// Iniciar servidor
loadData();
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor backend rodando em http://localhost:${PORT}`);
  console.log(`📍 API disponível em http://localhost:${PORT}/api\n`);
});
