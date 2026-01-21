import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from '../Layout.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import Departments from './pages/Departments.jsx';
import Absences from './pages/Absences.jsx';
import OvertimeManagement from './pages/OvertimeManagement.jsx';
import Vacations from './pages/Vacations.jsx';
import Payroll from './pages/Payroll.jsx';
import PayrollConfig from './pages/PayrollConfig.jsx';
import HRConfig from './pages/HRConfig.jsx';
import Reports from './pages/Reports.jsx';
import CashBreaks from './pages/CashBreaks.jsx';
import CashBreakReports from './pages/CashBreakReports.jsx';
import CeasaSuppliers from './pages/CeasaSuppliers.jsx';
import CeasaPurchases from './pages/CeasaPurchases.jsx';
import CeasaReports from './pages/CeasaReports.jsx';
import Stores from './pages/Stores.jsx';
import SystemSettings from './pages/SystemSettings.jsx';
import AbsenceReports from './pages/AbsenceReports.jsx';

const pagesMap = {
  Dashboard,
  Employees,
  Departments,
  Absences,
  OvertimeManagement,
  Vacations,
  Payroll,
  PayrollConfig,
  HRConfig,
  Reports,
  CashBreaks,
  CashBreakReports,
  CeasaSuppliers,
  CeasaPurchases,
  CeasaReports,
  Stores,
  SystemSettings,
  AbsenceReports,
};

function PageRenderer() {
  const { page } = useParams();
  const Component = pagesMap[page] || Dashboard;
  return (
    <Layout currentPageName={page || 'Dashboard'}>
      <Component />
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout currentPageName={'Dashboard'}><Dashboard /></Layout>} />
      <Route path=":page" element={<PageRenderer />} />
      <Route path="*" element={<Navigate to="/Dashboard" replace />} />
    </Routes>
  );
}
