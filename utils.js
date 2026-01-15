// Utility functions for Layout

export const createPageUrl = (href) => {
  const pathMap = {
    'Dashboard': '/',
    'Employees': '/employees',
    'Departments': '/departments',
    'Absences': '/absences',
    'OvertimeManagement': '/overtime',
    'Vacations': '/vacations',
    'Payroll': '/payroll',
    'HRConfig': '/hr-config',
    'Stores': '/stores',
    'CashBreaks': '/cash-breaks',
    'CeasaSuppliers': '/ceasa-suppliers',
    'CeasaPurchases': '/ceasa-purchases',
    'Reports': '/reports',
    'AbsenceReports': '/absence-reports',
    'CeasaReports': '/ceasa-reports',
    'CashBreakReports': '/cash-break-reports'
  }
  return pathMap[href] || '/'
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
