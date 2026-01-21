// Exemplo de consulta Supabase
import { supabase } from "../lib/supabaseClient";

export async function getEmployees() {
  const { data, error } = await supabase
    .from("employee")
    .select("*");
  if (error) throw error;
  return data;
}

// Para testar, chame getEmployees() em algum componente ou useEffect
