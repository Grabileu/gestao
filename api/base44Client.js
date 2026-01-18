const API_BASE = '/api';

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error('Fetch error:', e);
    // Fallback para listas vazias em endpoints não implementados
    if (options?.method === undefined) return [];
    return { error: true, message: e.message };
  }
}

function entity(route) {
  const baseUrl = `${API_BASE}/${route}`;
  return {
    async list(order) { return safeFetch(baseUrl); },
    async create(data) {
      return safeFetch(baseUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
    },
    async update(id, data) {
      return safeFetch(`${baseUrl}/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
    },
    async delete(id) {
      return safeFetch(`${baseUrl}/${id}`, { method: 'DELETE' });
    }
  };
}

const routes = {
  Absence: 'absences',
  CashBreak: 'cashbreaks',
  CeasaPurchase: 'ceasa-purchases',
  Employee: 'employees',
  Store: 'stores',
  Cashier: 'cashiers',
  Department: 'departments',
  HRConfig: 'hr-config',
  Payroll: 'payroll',
  PayrollConfig: 'payroll-config',
  Vacation: 'vacations',
  SystemConfig: 'system-config',
  CeasaSupplier: 'ceasa-suppliers',
  CeasaProduct: 'ceasa-products',
  Overtime: 'overtime',
};

const entities = Object.fromEntries(
  Object.entries(routes).map(([name, route]) => [name, entity(route)])
);

export const base44 = {
  entities,
  auth: {
    logout() { console.log('Logout called'); }
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        // Stub de upload
        return { file_url: URL.createObjectURL(file) };
      }
    }
  }
};
