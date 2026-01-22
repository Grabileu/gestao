import { supabase } from "../lib/supabaseClient";

function entity(table) {
  return {
    async list() {
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw error;
      return data;
    },
    async create(data) {
      const { data: result, error } = await supabase.from(table).insert([data]).select();
      if (error) throw error;
      return result?.[0] || null;
    },
    async update(id, data) {
      const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select();
      if (error) throw error;
      return result?.[0] || null;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return true;
    }
  };
}

const entities = {
  Absence: entity("absence"),
  CashBreak: entity("cashbreak"),
  CeasaPurchase: entity("ceasa_purchase"),
  Employee: entity("employee"),
  Store: entity("store"),
  Cashier: entity("cashier"),
  Department: entity("department"),
  HRConfig: entity("hr_config"),
  Payroll: entity("payroll"),
  PayrollConfig: entity("payroll_config"),
  Vacation: entity("vacation"),
  SystemConfig: entity("system_config"),
  CeasaSupplier: entity("ceasa_supplier"),
  CeasaProduct: entity("ceasa_product"),
  Overtime: entity("overtime")
};

export const base44 = {
  entities
};
