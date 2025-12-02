import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ResultAnalysisPage from './ResultAnalysisPage';

export default function DataManagerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to result analysis page
    navigate('/result-analysis', { replace: true });
  }, [navigate]);

  return (
    <Sidebar currentPage="result-analysis" onNavigate={() => {}}>
      <ResultAnalysisPage />
    </Sidebar>
  );
}
