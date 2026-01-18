import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileSpreadsheet,
  Menu,
  X,
  LogOut,
  Receipt,
  Store,
  BarChart3,
  Calendar,
  Clock,
  Settings,
  Wallet,
  Apple,
  ShoppingCart,
  Truck,
  ChevronDown,
  ChevronRight,
  Umbrella
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";

const navigation = [
  { name: "Dashboard", href: "Dashboard", icon: LayoutDashboard },
  { 
    name: "RH", 
    icon: Users,
    submenu: [
      { name: "Funcionários", href: "Employees", icon: Users },
      { name: "Departamentos", href: "Departments", icon: Building2 },
      { name: "Faltas e Atestados", href: "Absences", icon: Calendar },
      { name: "Horas Extras", href: "OvertimeManagement", icon: Clock },
      { name: "Férias", href: "Vacations", icon: Umbrella },
      { name: "Folha de Pagamento", href: "Payroll", icon: Wallet },
    ]
  },
  { 
    name: "CEASA", 
    icon: Apple,
    submenu: [
      { name: "Fornecedores", href: "CeasaSuppliers", icon: Truck },
      { name: "Compras", href: "CeasaPurchases", icon: ShoppingCart },
    ]
  },
  { 
    name: "Quebras de Caixa", 
    icon: Receipt,
    submenu: [
      { name: "Quebras", href: "CashBreaks", icon: Receipt },
    ]
  },
  { 
    name: "Relatórios", 
    icon: BarChart3,
    submenu: [
      { name: "Relatório RH", href: "Reports", icon: FileSpreadsheet },
      { name: "Faltas e Atestados", href: "AbsenceReports", icon: Calendar },
      { name: "Relatório CEASA", href: "CeasaReports", icon: Apple },
      { name: "Quebras de Caixa", href: "CashBreakReports", icon: Receipt },
    ]
  },
  { 
    name: "Configurações", 
    icon: Settings,
    submenu: [
      { name: "Lojas", href: "Stores", icon: Store },
      { name: "Configurações RH", href: "HRConfig", icon: Users },
      { name: "Sistema", href: "SystemSettings", icon: Settings },
    ]
  },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(["RH", "CEASA", "Quebras de Caixa", "Relatórios", "Configurações"]);

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
  <>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-slate-900/95 border-r border-slate-700/50 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Sistema GUF</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (item.submenu) {
                const isExpanded = expandedMenus.includes(item.name);
                const hasActiveChild = item.submenu.some(sub => currentPageName === sub.href);
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200",
                        hasActiveChild
                          ? "bg-blue-500/10 text-blue-400"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isActive = currentPageName === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              to={createPageUrl(subItem.href)}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                                isActive
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                              )}
                            >
                              <subItem.icon className="w-4 h-4" />
                              <span>{subItem.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700/50">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 lg:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <span className="ml-4 text-lg font-semibold text-white">Sistema GUF</span>
        </header>

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
    <Toaster />
  </>
  );
}