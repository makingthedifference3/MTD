import React from 'react';
import Sidebar from '../components/Sidebar';
import ProjectExpenses from '../pages/ProjectExpenses';

const ProjectExpensesWrapper: React.FC = () => {
  return (
    <Sidebar 
      currentPage="project-expenses" 
      onNavigate={() => {}}
    >
      <ProjectExpenses />
    </Sidebar>
  );
};

export default ProjectExpensesWrapper;
