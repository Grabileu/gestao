// Cliente API Genérico (renomeado de base44Client)
// Configure sua própria URL base e chaves de API aqui

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const API_KEY = process.env.REACT_APP_API_KEY || '';

class APIClient {
  constructor(entityName) {
    this.entityName = entityName;
    this.endpoint = `${API_BASE_URL}/${entityName}`;
  }

  async list(sort = '') {
    try {
      const url = sort ? `${this.endpoint}?sort=${sort}` : this.endpoint;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
        }
      });
      
      if (!response.ok) throw new Error(`Erro ao buscar ${this.entityName}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar ${this.entityName}:`, error);
      return [];
    }
  }

  async create(data) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error(`Erro ao criar ${this.entityName}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro ao criar ${this.entityName}:`, error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await fetch(`${this.endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error(`Erro ao atualizar ${this.entityName}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro ao atualizar ${this.entityName}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${this.endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
        }
      });
      
      if (!response.ok) throw new Error(`Erro ao deletar ${this.entityName}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro ao deletar ${this.entityName}:`, error);
      throw error;
    }
  }

  async filter(filterObj) {
    try {
      const queryParams = new URLSearchParams(filterObj).toString();
      const url = queryParams ? `${this.endpoint}?${queryParams}` : this.endpoint;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
        }
      });
      
      if (!response.ok) throw new Error(`Erro ao filtrar ${this.entityName}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro ao filtrar ${this.entityName}:`, error);
      return [];
    }
  }
}

export const api = {
  entities: {
    Employee: new APIClient('employees'),
    Department: new APIClient('departments'),
    Store: new APIClient('stores'),
    Cashier: new APIClient('cashiers'),
    CashBreak: new APIClient('cash-breaks'),
    Absence: new APIClient('absences'),
    Overtime: new APIClient('overtimes'),
    Payroll: new APIClient('payrolls'),
    PayrollConfig: new APIClient('payroll-config'),
    Vacation: new APIClient('vacations'),
    HRConfig: new APIClient('hr-config'),
    CeasaSupplier: new APIClient('ceasa-suppliers'),
    CeasaProduct: new APIClient('ceasa-products'),
    CeasaPurchase: new APIClient('ceasa-purchases'),
    AbsenceReport: new APIClient('absence-reports'),
    CeasaReport: new APIClient('ceasa-reports'),
    SystemConfig: new APIClient('system-config')
  }
};

export const API_CONFIG = {
  API_BASE_URL,
  API_KEY
};
