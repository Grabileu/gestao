import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  Home,
  Users,
  Store,
  Receipt,
  Clock,
  Calendar,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Building2,
  UserCog,
  Banknote,
  Umbrella,
  AlertCircle,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Dashboard", icon: Home, page: "Home" },
  {
    name: "RH",
    icon: Users,
    submenu: [
      { name: "Funcionários", icon: Users, page: "Employees" },
      { name: "Departamentos", icon: Building2, page: "Departments" },
      { name: "Horas Extras", icon: Clock, page: "Overtime" },
      { name: "Faltas/Atestados", icon: AlertCircle, page: "Absences" },
      { name: "Férias", icon: Umbrella, page: "Vacations" },
      { name: "Folha de Pagamento", icon: Banknote, page: "Payroll" },
    ]
  },
  {
    name: "Caixa",
    icon: Receipt,
    submenu: [
      { name: "Quebra de Caixa", icon: Receipt, page: "CashBreakManagement" },
      { name: "Relatório", icon: FileText, page: "CashBreakReport" },
    ]
  },
  {
    name: "CEASA",
    icon: Store,
    submenu: [
      { name: "Fornecedores", icon: Users, page: "CeasaSuppliers" },
      { name: "Produtos", icon: FileText, page: "CeasaProducts" },
      { name: "Compras", icon: Receipt, page: "CeasaPurchases" },
    ]
  },
  {
    name: "Configurações",
    icon: Settings,
    submenu: [
      { name: "Geral", icon: Settings, page: "Settings" },
      { name: "Quebra de Caixa", icon: Receipt, page: "CashBreakSettings" },
      { name: "Faltas/Benefícios", icon: AlertCircle, page: "AbsenceSettings" },
      { name: "Férias", icon: Umbrella, page: "VacationSettings" },
      { name: "Cesta Bonificação", icon: Gift, page: "BasketBonusSettings" },
    ]
  },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(["RH", "Caixa"]);

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  const isActive = (page) => currentPageName === page;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {sidebarOpen && (
            <span className="text-xl font-bold text-white">GUF System</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors ${!sidebarOpen && "justify-center"}`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.name}</span>
                        {expandedMenus.includes(item.name) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                  {sidebarOpen && expandedMenus.includes(item.name) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.page}
                          to={createPageUrl(sub.page)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive(sub.page)
                              ? "bg-blue-600 text-white"
                              : "text-slate-400 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          <sub.icon className="h-4 w-4" />
                          <span className="text-sm">{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${!sidebarOpen && "justify-center"} ${
                    isActive(item.page)
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}