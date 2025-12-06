import React from 'react';
import ReportHeader from './ReportHeader';
import ReportFooter from './ReportFooter';

interface ReportPageLayoutProps {
  children: React.ReactNode;
}

const ReportPageLayout: React.FC<ReportPageLayoutProps> = ({ children }) => {
  return (
    <div 
      className="report-page w-[210mm] h-[296mm] bg-white shadow-2xl print:shadow-none relative flex flex-col px-10 py-8 box-border mx-auto overflow-hidden page-break"
    >
      {/* Standard Header with high Z-index to stay on top */}
      <div className="relative z-50">
        <ReportHeader />
      </div>

      {/* Main Content Area - Strictly clipped to prevent footer overlap */}
      <main className="flex-grow flex flex-col gap-4 min-h-0 relative z-0 overflow-hidden">
        {children}
      </main>

      {/* Standard Footer - Pushed to bottom with high Z-index */}
      <div className="relative z-50 mt-auto">
        <ReportFooter />
      </div>
    </div>
  );
};

export default ReportPageLayout;