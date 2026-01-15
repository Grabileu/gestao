import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/api/apiClient";
import { Loader2, User, Briefcase, MapPin, Phone, Building2 } from "lucide-react";

const contractTypes = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "temporary", label: "Temporário" },
  { value: "intern", label: "Estagiário" }
];

const statusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "on_leave", label: "Afastado" },
  { value: "terminated", label: "Desligado" }
];

export default function EmployeeForm({ open, onClose, employee, departments, onSave }) {
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

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee, salary: employee.salary?.toString() || "" });
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
  }, [employee, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "department_id") {
      const dept = departments.find(d => d.id === value);
      if (dept) {
        setFormData(prev => ({ ...prev, department_id: value, department_name: dept.name }));
      }
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    const data = {
      ...formData,
      salary: formData.salary ? parseFloat(formData.salary) : null
    };
    
    if (employee?.id) {
      await api.entities.Employee.update(employee.id, data);
    } else {
      await api.entities.Employee.create(data);
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

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="personal" className="data-[state=active]:bg-blue-500">
              <User className="w-4 h-4 mr-2" />
              Pessoal
            </TabsTrigger>
            <TabsTrigger value="professional" className="data-[state=active]:bg-blue-500">
              <Briefcase className="w-4 h-4 mr-2" />
              Profissional
            </TabsTrigger>
            <TabsTrigger value="address" className="data-[state=active]:bg-blue-500">
              <MapPin className="w-4 h-4 mr-2" />
              Endereço
            </TabsTrigger>
            <TabsTrigger value="banking" className="data-[state=active]:bg-blue-500">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Departamento *</Label>
                <Select value={formData.department_id} onValueChange={(v) => handleChange("department_id", v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id} className="text-white hover:bg-slate-700">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Cargo *</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Ex: Analista, Gerente..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de Contrato</Label>
                <Select value={formData.contract_type} onValueChange={(v) => handleChange("contract_type", v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {contractTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Salário</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="0.00"
                />
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
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value} className="text-white hover:bg-slate-700">
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
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {employee ? "Salvar Alterações" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}