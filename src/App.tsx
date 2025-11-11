import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import PMDashboard from './pages/PMDashboard';
import ToDoList from './pages/ToDoList';
import ProjectExpenses from './pages/ProjectExpenses';
import Bills from './pages/Bills';
import AnalysisReport from './pages/AnalysisReport';
import AccountantDashboard from './pages/AccountantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeamMemberDashboard from './pages/TeamMemberDashboard';
import RealTimeUpdate from './pages/RealTimeUpdate';
import MediaPage from './pages/MediaPage';
import ArticlePage from './pages/ArticlePage';
import TeamMembersPage from './pages/TeamMembersPage';
import CalendarPage from './pages/CalendarPage';
import DataEntryPage from './pages/DataEntryPage';
import CSRBudgetPage from './pages/CSRBudgetPage';
import ExpenseClaimPage from './pages/ExpenseClaimPage';
import UtilizationCertificatePage from './pages/UtilizationCertificatePage';
import DailyReportPage from './pages/DailyReportPage';
import DashboardFormsPage from './pages/DashboardFormsPage';
import UpcomingExpensesPage from './pages/UpcomingExpensesPage';
import CSRPartnersPage from './pages/CSRPartnersPage';
import ProjectsPage from './pages/ProjectsPage';
import UserAssignmentPage from './pages/UserAssignmentPage';
import SwitchUsersPage from './pages/SwitchUsersPage';

function AppContent() {
  const { currentRole, login } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!currentRole) {
    return <LoginPage onLogin={login} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (currentRole === 'accountant') return <AccountantDashboard />;
        if (currentRole === 'admin') return <AdminDashboard />;
        if (currentRole === 'team-member') return <TeamMemberDashboard />;
        return <PMDashboard />;
      case 'csr-partners':
        return <CSRPartnersPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'real-time-update':
        return <RealTimeUpdate />;
      case 'media':
        return <MediaPage />;
      case 'article':
        return <ArticlePage />;
      case 'team-members':
        return <TeamMembersPage />;
      case 'dashboard-forms':
        return <DashboardFormsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'csr-budget':
        return <CSRBudgetPage />;
      case 'expense-claim':
        return <ExpenseClaimPage />;
      case 'utilization-certificate':
        return <UtilizationCertificatePage />;
      case 'daily-report':
        return <DailyReportPage />;
      case 'data-entry':
        return <DataEntryPage />;
      case 'upcoming-expenses':
        return <UpcomingExpensesPage />;
      case 'user-assignment':
        return <UserAssignmentPage />;
      case 'switch-users':
        return <SwitchUsersPage />;
      case 'todo':
        return <ToDoList />;
      case 'analysis-report':
        return <AnalysisReport />;
      case 'project-expenses':
        return <ProjectExpenses />;
      case 'bills':
        return <Bills />;
      default:
        return <div className="p-6 bg-white rounded-2xl shadow">Page not implemented yet.</div>;
    }
  };

  return (
    <Sidebar currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Sidebar>
  );
}

function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <AppContent />
      </FilterProvider>
    </AuthProvider>
  );
}

export default App;