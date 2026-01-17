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
  res.json([]);
});

// Rotas de Stores
app.get('/api/stores', (req, res) => {
  res.json([]);
});

// Rotas de Cashiers
app.get('/api/cashiers', (req, res) => {
  res.json([]);
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
