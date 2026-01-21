import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from '../Layout.jsx';

import Dashboard from '../pages/Dashboard.jsx';
import Employees from '../Pages/Employees.jsx';
import Departments from '../Pages/Departments.jsx';
import Absences from '../Pages/Absences.jsx';
import OvertimeManagement from '../Pages/OvertimeManagement.jsx';
import Vacations from '../Pages/Vacations.jsx';
import Payroll from '../Pages/Payroll.jsx';
import PayrollConfig from '../Pages/PayrollConfig.jsx';
import HRConfig from '../Pages/HRConfig.jsx';
import Reports from '../Pages/Reports.jsx';
import CashBreaks from '../Pages/CashBreaks.jsx';
import CashBreakReports from '../Pages/CashBreakReports.jsx';
import CeasaSuppliers from '../Pages/CeasaSuppliers.jsx';
import CeasaPurchases from '../Pages/CeasaPurchases.jsx';
import CeasaReports from '../Pages/CeasaReports.jsx';
import Stores from '../Pages/Stores.jsx';
import SystemSettings from '../Pages/SystemSettings.jsx';
import AbsenceReports from '../Pages/AbsenceReports.jsx';

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
