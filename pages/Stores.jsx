import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Store, Plus, MoreVertical, Pencil, Trash2, Users, Loader2, MapPin, User, Landmark } from "lucide-react";
import StoreForm from "@/components/stores/StoreForm";

export default function Stores() {
  const queryClient = useQueryClient();
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [deleteStore, setDeleteStore] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: stores = [], isLoading: loadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list()
  });

  const { data: cashiers = [] } = useQuery({
    queryKey: ['cashiers'],
    queryFn: () => base44.entities.Cashier.list()
  });

  const isLoading = loadingStores;

  const handleDeleteStore = async () => {
    setDeleting(true);
    await base44.entities.Store.delete(deleteStore);
    setDeleteStore(null);
    setDeleting(false);
    queryClient.invalidateQueries({ queryKey: ['stores'] });
  };

  const handleSaveStore = () => {
    queryClient.invalidateQueries({ queryKey: ['stores'] });
    setShowStoreForm(false);
    setEditingStore(null);
  };

  const getCashierCount = (storeId) => {
    return cashiers.filter(c => c.store_id === storeId && c.status === 'active').length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <Store className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Lojas</h1>
            <p className="text-slate-400 mt-1">Gerencie as lojas</p>
          </div>
        </div>

        <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingStore(null); setShowStoreForm(true); }} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Loja
              </Button>
            </div>

            {stores.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="py-16 text-center">
                  <Store className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhuma loja cadastrada</h3>
                  <p className="text-slate-400 mb-6">Comece cadastrando a primeira loja.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map(store => (
                  <Card key={store.id} className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                            <Store className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{store.code} - {store.name}</CardTitle>
                            <Badge className={store.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}>
                              {store.status === 'active' ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem onClick={() => { setEditingStore(store); setShowStoreForm(true); }} className="text-slate-300 hover:bg-slate-700 cursor-pointer">
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteStore(store.id)} className="text-rose-400 hover:bg-slate-700 cursor-pointer">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {store.manager && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <User className="w-4 h-4" />
                          <span>{store.manager}</span>
                        </div>
                      )}
                      {store.city && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span>{store.city}{store.state ? ` - ${store.state}` : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Landmark className="w-4 h-4" />
                        <span>CNPJ: {store.cnpj || "Não informado"}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-semibold">{getCashierCount(store.id)}</span>
                        <span className="text-slate-400 text-sm">operador(es)</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </div>

        {/* Store Form */}
        <StoreForm 
          open={showStoreForm}
          onClose={() => { setShowStoreForm(false); setEditingStore(null); }}
          store={editingStore}
          onSave={handleSaveStore}
        />

        {/* Delete Store Dialog */}
        <AlertDialog open={!!deleteStore} onOpenChange={() => setDeleteStore(null)}>
          <AlertDialogContent className="bg-slate-900 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Excluir Loja</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Tem certeza que deseja excluir esta loja? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStore} disabled={deleting} className="bg-rose-600 hover:bg-rose-700">
                {deleting ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}