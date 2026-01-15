import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './Layout'

// Pages
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Departments from './pages/Departments'
import Stores from './pages/Stores'
import Payroll from './pages/Payroll'
import PayrollConfig from './pages/PayrollConfig'
import OvertimeManagement from './pages/OvertimeManagement'
import CashBreaks from './pages/CashBreaks'
import CashBreakReports from './pages/CashBreakReports'
import Absences from './pages/Absences'
import Reports from './pages/Reports'
import Vacations from './pages/Vacations'
import HRConfig from './pages/HRConfig'
import CeasaSuppliers from './pages/CeasaSuppliers'
import CeasaPurchases from './pages/CeasaPurchases'
import CeasaReports from './pages/CeasaReports'
import AbsenceReports from './pages/AbsenceReports'

const queryClient = new QueryClient()

function AppContent() {
  try {
    const location = useLocation()
    
    const renderPage = () => {
      const pathname = location.pathname
      switch(pathname) {
        case '/': return <Dashboard />
        case '/employees': return <Employees />
        case '/departments': return <Departments />
        case '/stores': return <Stores />
        case '/payroll': return <Payroll />
        case '/payroll-config': return <PayrollConfig />
        case '/overtime': return <OvertimeManagement />
        case '/cash-breaks': return <CashBreaks />
        case '/cash-break-reports': return <CashBreakReports />
        case '/absences': return <Absences />
        case '/reports': return <Reports />
        case '/vacations': return <Vacations />
        case '/hr-config': return <HRConfig />
        case '/ceasa-suppliers': return <CeasaSuppliers />
        case '/ceasa-purchases': return <CeasaPurchases />
        case '/ceasa-reports': return <CeasaReports />
        case '/absence-reports': return <AbsenceReports />
        default: return <Dashboard />
      }
    }

    return (
      <Layout currentPageName={location.pathname === '/' ? 'Dashboard' : location.pathname}>
        <div className="p-8">
          {renderPage()}
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('AppContent error:', error)
    return <div style={{color: 'white'}}>Erro: {error.message}</div>
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  )
}

export default App
