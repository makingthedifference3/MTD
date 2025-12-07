import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { FilterProvider } from './context/FilterContext';
import { ProjectProvider } from './context/ProjectContext';
import { NotificationProvider } from './context/NotificationContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import PMDashboard from './pages/PMDashboard';
import ToDoList from './pages/ToDoList';
import ProjectExpensesWrapper from './wrappers/ProjectExpensesWrapper';
import AdminExpensesPage from './pages/AdminExpensesPage';
import AccountantExpensesPage from './pages/AccountantExpensesPage';
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
import DailyReportPage from './pages/DailyReportPage';
import DashboardFormsPage from './pages/DashboardFormsPage';
import UpcomingExpensesPage from './pages/UpcomingExpensesPage';
import ManageUpcomingExpensesPage from './pages/ManageUpcomingExpensesPage';
import CSRPartnersPage from './pages/CSRPartnersPage';
import ProjectsPage from './pages/ProjectsPage';
import UserAssignmentPage from './pages/UserAssignmentPage';
import UserManagementPage from './pages/UserManagementPage';
import UtilizationCertificatePage from './pages/UtilizationCertificatePage';
import ProjectsDashboardPage from './pages/ProjectsDashboardPage';
import TollManagementPage from './pages/TollManagementPage';
import ResultAnalysisPage from './pages/ResultAnalysisPage';
import ProjectTimelinePage from './pages/ProjectTimelinePage';
import DataManagerDashboard from './pages/DataManagerDashboard';
import MyTasks from './pages/MyTasks';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/admin-dashboard" element={<ProtectedRoute><Sidebar currentPage="dashboard" onNavigate={() => {}}><AdminDashboard /></Sidebar></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><Sidebar currentPage="user-management" onNavigate={() => {}}><UserManagementPage /></Sidebar></ProtectedRoute>} />
      <Route path="/data-manager" element={<ProtectedRoute><DataManagerDashboard /></ProtectedRoute>} />
      <Route path="/accountant-dashboard" element={<ProtectedRoute><Sidebar currentPage="dashboard" onNavigate={() => {}}><AccountantDashboard /></Sidebar></ProtectedRoute>} />
      <Route path="/pm-dashboard" element={<ProtectedRoute><Sidebar currentPage="dashboard" onNavigate={() => {}}><PMDashboard /></Sidebar></ProtectedRoute>} />
      <Route path="/team-member-dashboard" element={<ProtectedRoute><Sidebar currentPage="dashboard" onNavigate={() => {}}><TeamMemberDashboard /></Sidebar></ProtectedRoute>} />
      <Route path="/projects-dashboard" element={<ProtectedRoute><ProjectsDashboardPage /></ProtectedRoute>} />
      <Route path="/csr-partners" element={<ProtectedRoute><Sidebar currentPage="csr-partners" onNavigate={() => {}}><CSRPartnersPage /></Sidebar></ProtectedRoute>} />
      <Route path="/csr-partners/:partnerId/tolls" element={<ProtectedRoute><Sidebar currentPage="csr-partners" onNavigate={() => {}}><TollManagementPage /></Sidebar></ProtectedRoute>} />
      <Route path="/utilization-certificate" element={<ProtectedRoute><Sidebar currentPage="utilization-certificate" onNavigate={() => {}}><UtilizationCertificatePage /></Sidebar></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Sidebar currentPage="projects" onNavigate={() => {}}><ProjectsPage /></Sidebar></ProtectedRoute>} />
      <Route path="/project-timeline" element={<ProtectedRoute><Sidebar currentPage="project-timeline" onNavigate={() => {}}><ProjectTimelinePage /></Sidebar></ProtectedRoute>} />
      <Route path="/todo" element={<ProtectedRoute><Sidebar currentPage="todo" onNavigate={() => {}}><ToDoList /></Sidebar></ProtectedRoute>} />
      <Route path="/real-time-update" element={<ProtectedRoute><Sidebar currentPage="real-time-update" onNavigate={() => {}}><RealTimeUpdate /></Sidebar></ProtectedRoute>} />
      <Route path="/media" element={<ProtectedRoute><Sidebar currentPage="media" onNavigate={() => {}}><MediaPage /></Sidebar></ProtectedRoute>} />
      <Route path="/article" element={<ProtectedRoute><Sidebar currentPage="article" onNavigate={() => {}}><ArticlePage /></Sidebar></ProtectedRoute>} />
      <Route path="/team-members" element={<ProtectedRoute><Sidebar currentPage="team-members" onNavigate={() => {}}><TeamMembersPage /></Sidebar></ProtectedRoute>} />
      <Route path="/dashboard-forms" element={<ProtectedRoute><Sidebar currentPage="dashboard-forms" onNavigate={() => {}}><DashboardFormsPage /></Sidebar></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Sidebar currentPage="calendar" onNavigate={() => {}}><CalendarPage /></Sidebar></ProtectedRoute>} />
      <Route path="/project-expenses" element={<ProtectedRoute><ProjectExpensesWrapper /></ProtectedRoute>} />
      <Route path="/admin-expenses" element={<ProtectedRoute><Sidebar currentPage="admin-expenses" onNavigate={() => {}}><AdminExpensesPage /></Sidebar></ProtectedRoute>} />
      <Route path="/acc-expense" element={<ProtectedRoute><Sidebar currentPage="acc-expense" onNavigate={() => {}}><AccountantExpensesPage /></Sidebar></ProtectedRoute>} />
      <Route path="/daily-report" element={<ProtectedRoute><Sidebar currentPage="daily-report" onNavigate={() => {}}><DailyReportPage /></Sidebar></ProtectedRoute>} />
      <Route path="/data-entry" element={<ProtectedRoute><Sidebar currentPage="data-entry" onNavigate={() => {}}><DataEntryPage /></Sidebar></ProtectedRoute>} />
      <Route path="/csr-budget" element={<ProtectedRoute><Sidebar currentPage="csr-budget" onNavigate={() => {}}><CSRBudgetPage /></Sidebar></ProtectedRoute>} />
      <Route path="/upcoming-expenses" element={<ProtectedRoute><Sidebar currentPage="upcoming-expenses" onNavigate={() => {}}><UpcomingExpensesPage /></Sidebar></ProtectedRoute>} />
      <Route path="/acc-upcoming-expenses" element={<ProtectedRoute><Sidebar currentPage="acc-upcoming-expenses" onNavigate={() => {}}><ManageUpcomingExpensesPage /></Sidebar></ProtectedRoute>} />
      <Route path="/bills" element={<ProtectedRoute><Sidebar currentPage="bills" onNavigate={() => {}}><Bills /></Sidebar></ProtectedRoute>} />
      <Route path="/analysis-report" element={<ProtectedRoute><Sidebar currentPage="analysis-report" onNavigate={() => {}}><AnalysisReport /></Sidebar></ProtectedRoute>} />
      <Route
        path="/result-analysis"
        element={
          <ProtectedRoute>
            <Sidebar currentPage="result-analysis" onNavigate={() => {}}>
              <ResultAnalysisPage />
            </Sidebar>
          </ProtectedRoute>
        }
      />
      <Route path="/tasks" element={<ProtectedRoute><Sidebar currentPage="tasks" onNavigate={() => {}}><UserAssignmentPage /></Sidebar></ProtectedRoute>} />
      <Route path="/my-tasks" element={<ProtectedRoute><Sidebar currentPage="my-tasks" onNavigate={() => {}}><MyTasks /></Sidebar></ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/admin-dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <FilterProvider>
            <ProjectProvider>
              <AppRoutes />
            </ProjectProvider>
          </FilterProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;