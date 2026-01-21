import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SystemSettings() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Settings className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white">Configurações do Sistema</CardTitle>
              <CardDescription className="text-slate-400">Gerencie parâmetros gerais do sistema, integrações e preferências globais.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-slate-300 py-4">
            Em breve você poderá configurar integrações, temas, notificações e outros parâmetros do sistema por aqui.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
