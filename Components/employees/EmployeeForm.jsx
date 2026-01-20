import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { Loader2, User, Briefcase, MapPin, Phone, Building2, AlertCircle } from "lucide-react";

const contractTypes = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "temporary", label: "Temporário" },
  { value: "intern", label: "Estagiário" },
  { value: "casual", label: "Avulso" }
];

const statusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "on_leave", label: "Afastado" },
  { value: "terminated", label: "Desligado" }
];

export default function EmployeeForm({ open, onClose, employee, departments, stores = [], onSave }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    cpf: "",
    birth_date: "",
    hire_date: "",
    termination_date: "",
    department_id: "",
    department_name: "",
    position: "",
    salary: "",
    contract_type: "clt",
    status: "active",
    store_id: "",
    store_name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    emergency_contact: "",
    emergency_phone: "",
    bank_name: "",
    bank_agency: "",
    bank_account: "",
    notes: "",
    photo_url: ""
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [salaryFocused, setSalaryFocused] = useState(false);

  const formatCpf = (value) => {
    const digits = (value || "").replace(/\D/g, "").slice(0, 11);
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 9);
    const p4 = digits.slice(9, 11);
    let out = p1;
    if (p2) out += `.${p2}`;
    if (p3) out += `.${p3}`;
    if (p4) out += `-${p4}`;
    return out;
  };

  const formatPhone = (value) => {
    const digits = (value || "").replace(/\D/g, "").slice(0, 11);
    const ddd = digits.slice(0, 2);
    const p1 = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
    const p2 = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);
    let out = ddd ? `(${ddd}` : "";
    if (ddd && ddd.length === 2) out += ") ";
    if (p1) out += p1;
    if (p2) out += `-${p2}`;
    return out;
  };

  const formatSalary = (value) => {
    if (!value) return "";
    const numValue = parseFloat(value) || 0;
    return numValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    if (employee) {
      // Preservar datas exatamente como estão no banco
      setFormData({ 
        ...employee,
        department_id: String(employee.department_id || ""),
        store_id: String(employee.store_id || ""),
        salary: employee.salary?.toString() || "",
        birth_date: employee.birth_date ? employee.birth_date.split('T')[0] : "",
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : "",
        termination_date: employee.termination_date ? employee.termination_date.split('T')[0] : ""
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        cpf: "",
        birth_date: "",
        hire_date: "",
        termination_date: "",
        department_id: "",
        department_name: "",
        position: "",
        salary: "",
        contract_type: "clt",
        status: "active",
        store_id: "",
        store_name: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        emergency_contact: "",
        emergency_phone: "",
        bank_name: "",
        bank_agency: "",
        bank_account: "",
        notes: "",
        photo_url: ""
      });
    }
    setValidationError("");
  }, [employee, open]);

  const handleChange = (field, value) => {
    let next = value;
    if (field === "cpf") next = formatCpf(value);
    if (field === "phone" || field === "emergency_phone") next = formatPhone(value);
    setFormData(prev => ({ ...prev, [field]: next }));
    
    if (field === "department_id") {
      const dept = departments.find(d => String(d.id) === String(value));
      if (dept) {
        setFormData(prev => ({ ...prev, department_id: value, department_name: dept.name }));
      }
    }
    
    if (field === "store_id") {
      const store = stores.find(s => String(s.id) === String(value));
      if (store) {
        setFormData(prev => ({ ...prev, store_id: value, store_name: store.name }));
      }
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = async () => {
    // Validação dos campos obrigatórios
    if (!formData.full_name.trim()) {
      setValidationError("Nome Completo é obrigatório");
      return;
    }
    if (!formData.email.trim()) {
      setValidationError("Email é obrigatório");
      return;
    }
    if (!formData.department_id) {
      setValidationError("Departamento é obrigatório");
      return;
    }
    if (!formData.store_id) {
      setValidationError("Loja é obrigatória");
      return;
    }
    if (!formData.position.trim()) {
      setValidationError("Cargo é obrigatório");
      return;
    }
    if (!formData.hire_date) {
      setValidationError("Data de Admissão é obrigatória");
      return;
    }
    
    setValidationError("");
    setSaving(true);
    const data = {
      ...formData,
      salary: formData.salary ? parseFloat(formData.salary) : null
    };

    let employeeId = employee?.id;
    if (employeeId) {
      await base44.entities.Employee.update(employeeId, data);
    } else {
      const created = await base44.entities.Employee.create(data);
      employeeId = created.id;
    }

    // Integração automática: se for operador de caixa, cria/atualiza registro em cashiers
    if (data.position === "Operador(a) de caixa") {
      const cashierData = {
        name: data.full_name,
        code: data.cpf || String(employeeId),
        store_id: data.store_id,
        store_name: data.store_name,
        status: data.status || "active"
      };
      // Busca se já existe caixa para esse funcionário
      const allCashiers = await base44.entities.Cashier.list();
      const existing = allCashiers.find(c => c.code === cashierData.code);
      if (existing) {
        await base44.entities.Cashier.update(existing.id, cashierData);
      } else {
        await base44.entities.Cashier.create(cashierData);
      }
    }

    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {employee ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
        </DialogHeader>

        {validationError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 font-medium">{validationError}</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="personal" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-blue-600">
              <User className="w-4 h-4 mr-2" />
              Pessoal
            </TabsTrigger>
            <TabsTrigger value="professional" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-blue-600">
              <Briefcase className="w-4 h-4 mr-2" />
              Profissional
            </TabsTrigger>
            <TabsTrigger value="address" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-blue-600">
              <MapPin className="w-4 h-4 mr-2" />
              Endereço
            </TabsTrigger>
            <TabsTrigger value="banking" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-blue-600">
              <Building2 className="w-4 h-4 mr-2" />
              Bancário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-600 overflow-hidden">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-slate-300">Nome Completo *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Nome do funcionário"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">CPF</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => handleChange("cpf", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Data de Nascimento</Label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange("birth_date", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Loja *</Label>
                <Select value={formData.store_id} onValueChange={(v) => handleChange("store_id", v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    {stores && stores.length > 0 ? stores.map(store => (
                      <SelectItem key={store.id} value={String(store.id)} className="text-white hover:bg-slate-700 cursor-pointer">
                        {store.name}
                      </SelectItem>
                    )) : null}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Contato de Emergência</Label>
                <Input
                  value={formData.emergency_contact}
                  onChange={(e) => handleChange("emergency_contact", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Nome do contato"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Telefone de Emergência</Label>
                <Input
                  value={formData.emergency_phone}
                  onChange={(e) => handleChange("emergency_phone", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Departamento *</Label>
                <Select value={formData.department_id} onValueChange={(v) => handleChange("department_id", v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={String(dept.id)} className="text-white hover:bg-slate-700 cursor-pointer">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Cargo *</Label>
                <Select value={formData.position} onValueChange={(v) => handleChange("position", v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    {formData.department_id && departments.find(d => String(d.id) === String(formData.department_id))?.positions?.length > 0 ? (
                      departments.find(d => String(d.id) === String(formData.department_id))?.positions.map((pos, idx) => (
                        <SelectItem key={idx} value={pos} className="text-white hover:bg-slate-700 cursor-pointer">
                          {pos}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="text-slate-500">
                        {formData.department_id ? "Nenhum cargo cadastrado" : "Selecione um departamento"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de Contrato</Label>
                <Select value={formData.contract_type} onValueChange={(v) => handleChange("contract_type", v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    {contractTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700 cursor-pointer">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Salário</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={salaryFocused ? formData.salary : formatSalary(formData.salary)}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Aceita apenas números
                      value = value.replace(/[^\d]/g, "");
                      handleChange("salary", value);
                    }}
                    onFocus={() => setSalaryFocused(true)}
                    onBlur={() => setSalaryFocused(false)}
                    className="w-full h-9 rounded-md border border-slate-600 bg-slate-800 text-white px-3 py-1 pl-10 text-base placeholder:text-slate-600 focus-visible:outline-none"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Data de Admissão *</Label>
                <Input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleChange("hire_date", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" className="bg-slate-800 border-slate-600 text-white z-50">
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value} className="text-white hover:bg-slate-700 cursor-pointer">
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.status === "terminated" && (
              <div className="space-y-2">
                <Label className="text-slate-300">Data de Desligamento</Label>
                <Input
                  type="date"
                  value={formData.termination_date}
                  onChange={(e) => handleChange("termination_date", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-300">Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white min-h-24"
                placeholder="Anotações sobre o funcionário..."
              />
            </div>
          </TabsContent>

          <TabsContent value="address" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Endereço</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Rua, número, complemento"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Cidade</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Estado</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="UF"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">CEP</Label>
                <Input
                  value={formData.zip_code}
                  onChange={(e) => handleChange("zip_code", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="00000-000"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="banking" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Banco</Label>
                <Input
                  value={formData.bank_name}
                  onChange={(e) => handleChange("bank_name", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Nome do banco"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Agência</Label>
                <Input
                  value={formData.bank_agency}
                  onChange={(e) => handleChange("bank_agency", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="0000"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Conta</Label>
                <Input
                  value={formData.bank_account}
                  onChange={(e) => handleChange("bank_account", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="00000-0"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {employee ? "Salvar Alterações" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}