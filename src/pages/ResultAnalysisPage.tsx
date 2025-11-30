import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, FolderOpen, BarChart3, Check, X, AlertCircle,
  Download, ChevronRight, ChevronLeft, Loader2, TrendingUp,
  TrendingDown, Minus, CheckCircle, XCircle, RefreshCw, ChevronDown, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import * as geminiService from '../services/geminiService';
import * as resultAnalysisService from '../services/resultAnalysisService';
import type { StudentAnswerSheet, CampaignResult } from '../services/resultAnalysisService';

// ==================== TYPES ====================

type Step = 1 | 2 | 3 | 4 | 5;

interface UploadedPaper {
  file: File;
  extractedData?: {
    questions: geminiService.ExtractedQuestion[];
    totalMarks: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

// ==================== MAIN COMPONENT ====================

const ResultAnalysisPage = () => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Step 1: Pre-Campaign Question Paper
  const [preQuestionPaper, setPreQuestionPaper] = useState<UploadedPaper | null>(null);
  const [preQuestionPaperId, setPreQuestionPaperId] = useState<string>('');

  // Step 2: Pre-Campaign Student Responses
  const [preStudentFiles, setPreStudentFiles] = useState<File[]>([]);
  const [preStudentSheets, setPreStudentSheets] = useState<StudentAnswerSheet[]>([]);
  const [preProcessingStatus, setPreProcessingStatus] = useState<{
    total: number;
    processed: number;
    currentStudent?: string;
    status: 'idle' | 'processing' | 'completed' | 'error';
    error?: string;
  }>({ total: 0, processed: 0, status: 'idle' });

  // Step 3: Post-Campaign Question Paper
  const [postQuestionPaper, setPostQuestionPaper] = useState<UploadedPaper | null>(null);
  const [postQuestionPaperId, setPostQuestionPaperId] = useState<string>('');

  // Step 4: Post-Campaign Student Responses
  const [postStudentFiles, setPostStudentFiles] = useState<File[]>([]);
  const [postStudentSheets, setPostStudentSheets] = useState<StudentAnswerSheet[]>([]);
  const [postProcessingStatus, setPostProcessingStatus] = useState<{
    total: number;
    processed: number;
    currentStudent?: string;
    status: 'idle' | 'processing' | 'completed' | 'error';
    error?: string;
  }>({ total: 0, processed: 0, status: 'idle' });

  // Step 5: Analysis Results
  const [campaignResults, setCampaignResults] = useState<CampaignResult[]>([]);
  const [resultsSummary, setResultsSummary] = useState<{
    totalStudents: number;
    studentsImproved: number;
    studentsDeclined: number;
    studentsSame: number;
    studentsIncomplete: number;
    averagePrePercentage: number;
    averagePostPercentage: number;
    averageImprovement: number;
  } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'improved' | 'declined' | 'same'>('all');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== STEP 1: PRE-CAMPAIGN QUESTION PAPER ====================

  const handlePreQuestionPaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreQuestionPaper({
      file,
      status: 'pending',
    });

    setError(null);
  };

  const processPreQuestionPaper = async () => {
    if (!preQuestionPaper || !selectedProjectId || selectedProjectId.trim() === '') {
      setError('Please select a valid project first');
      return;
    }

    try {
      setPreQuestionPaper({ ...preQuestionPaper, status: 'processing' });
      setIsLoading(true);

      console.log('Starting question paper extraction...');
      console.log('Project ID:', selectedProjectId, 'Type:', typeof selectedProjectId);
      console.log('User ID:', currentUser?.id, 'Type:', typeof currentUser?.id);
      console.log('File:', preQuestionPaper.file.name);

      // Extract questions using Gemini
      const extractedData = await geminiService.extractQuestionPaper(preQuestionPaper.file);
      console.log('Extraction successful:', extractedData);

      setPreQuestionPaper({
        ...preQuestionPaper,
        extractedData,
        status: 'completed',
      });

      // Save to database
      const savedPaper = await resultAnalysisService.createQuestionPaper(
        {
          project_id: selectedProjectId,
          campaign_type: 'pre',
          title: `Pre-Campaign Question Paper - ${new Date().toLocaleDateString()}`,
          upload_file_name: preQuestionPaper.file.name,
          upload_file_size_mb: preQuestionPaper.file.size / (1024 * 1024),
          questions: extractedData.questions as never[],
          total_questions: extractedData.questions.length,
          total_marks: extractedData.totalMarks,
          extraction_status: 'completed',
          is_verified: false,
        },
        currentUser?.id
      );

      setPreQuestionPaperId(savedPaper.id);
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing pre-question paper:', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      const errorMsg = err instanceof Error ? err.message : 'Failed to process question paper';
      setError(`Failed to process: ${errorMsg}`);
      setPreQuestionPaper({
        ...preQuestionPaper,
        status: 'error',
        error: errorMsg,
      });
      setIsLoading(false);
    }
  };

  // ==================== STEP 2: PRE-CAMPAIGN STUDENT RESPONSES ====================

  const processPreStudentSheets = async () => {
    if (preStudentFiles.length === 0 || !preQuestionPaperId || !preQuestionPaper?.extractedData) return;

    try {
      setPreProcessingStatus({ total: preStudentFiles.length, processed: 0, status: 'processing' });
      setIsLoading(true);
      setError(null);

      // Process each sheet with Gemini
      const processedSheets: Partial<StudentAnswerSheet>[] = [];

      for (let i = 0; i < preStudentFiles.length; i++) {
        try {
          // Extract student info and answers
          const { studentInfo, answers } = await geminiService.extractStudentAnswerSheet(preStudentFiles[i]);

          // Grade the answers
          if (!preQuestionPaper?.extractedData?.questions) {
            throw new Error('Pre-campaign question paper not properly extracted');
          }
          
          const { gradedAnswers, score, totalMarks, percentage } = await geminiService.gradeStudentAnswers(
            answers,
            preQuestionPaper.extractedData.questions
          );

          // Calculate grade
          let grade = 'F';
          if (percentage >= 90) grade = 'A+';
          else if (percentage >= 80) grade = 'A';
          else if (percentage >= 70) grade = 'B';
          else if (percentage >= 60) grade = 'C';
          else if (percentage >= 50) grade = 'D';

          processedSheets.push({
            question_paper_id: preQuestionPaperId,
            project_id: selectedProjectId,
            student_name: studentInfo.studentName,
            student_roll_number: studentInfo.studentRollNumber,
            student_class: studentInfo.studentClass,
            school_name: studentInfo.schoolName,
            campaign_type: 'pre',
            upload_drive_link: 'direct-upload',
            upload_file_name: preStudentFiles[i].name,
            upload_file_size_mb: preStudentFiles[i].size / (1024 * 1024),
            answers: gradedAnswers,
            total_questions_attempted: answers.length,
            score,
            total_marks: totalMarks,
            percentage,
            grade,
            extraction_status: 'completed',
            grading_status: 'completed',
            is_verified: false,
          });

          setPreProcessingStatus(prev => ({
            ...prev,
            processed: i + 1,
            currentStudent: studentInfo.studentName,
          }));
        } catch (err) {
          console.error(`Error processing sheet ${i + 1}:`, err);
          // Continue with next sheet even if one fails
        }
      }

      // Save all sheets to database
      if (processedSheets.length > 0) {
        console.log('Attempting to save sheets:', processedSheets.length);
        console.log('Sample sheet data:', JSON.stringify(processedSheets[0], null, 2));
        
        const savedSheets = await resultAnalysisService.batchCreateStudentAnswerSheets(
          processedSheets,
          currentUser?.id
        );
        setPreStudentSheets(savedSheets);
      } else {
        console.warn('No sheets were successfully processed');
      }

      setPreProcessingStatus(prev => ({ ...prev, status: 'completed' }));
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing pre-student sheets:', err);
      setError(err instanceof Error ? err.message : 'Failed to process student sheets');
      setPreProcessingStatus(prev => ({ 
        ...prev, 
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      }));
      setIsLoading(false);
    }
  };

  // ==================== STEP 3: POST-CAMPAIGN QUESTION PAPER ====================

  const handlePostQuestionPaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPostQuestionPaper({
      file,
      status: 'pending',
    });

    setError(null);
  };

  const processPostQuestionPaper = async () => {
    if (!postQuestionPaper || !selectedProjectId) return;

    try {
      setPostQuestionPaper({ ...postQuestionPaper, status: 'processing' });
      setIsLoading(true);

      // Extract questions using Gemini
      const extractedData = await geminiService.extractQuestionPaper(postQuestionPaper.file);

      setPostQuestionPaper({
        ...postQuestionPaper,
        extractedData,
        status: 'completed',
      });

      // Save to database
      const savedPaper = await resultAnalysisService.createQuestionPaper(
        {
          project_id: selectedProjectId,
          campaign_type: 'post',
          title: `Post-Campaign Question Paper - ${new Date().toLocaleDateString()}`,
          upload_file_name: postQuestionPaper.file.name,
          upload_file_size_mb: postQuestionPaper.file.size / (1024 * 1024),
          questions: extractedData.questions as never[],
          total_questions: extractedData.questions.length,
          total_marks: extractedData.totalMarks,
          extraction_status: 'completed',
          is_verified: false,
        },
        currentUser?.id
      );

      setPostQuestionPaperId(savedPaper.id);
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing post-question paper:', err);
      setError(err instanceof Error ? err.message : 'Failed to process question paper');
      setPostQuestionPaper({
        ...postQuestionPaper,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      setIsLoading(false);
    }
  };

  // ==================== STEP 4: POST-CAMPAIGN STUDENT RESPONSES ====================

  const processPostStudentSheets = async () => {
    console.log('processPostStudentSheets called');
    console.log('postStudentFiles:', postStudentFiles.length);
    console.log('postQuestionPaperId:', postQuestionPaperId);
    console.log('postQuestionPaper?.extractedData:', postQuestionPaper?.extractedData);
    
    if (postStudentFiles.length === 0 || !postQuestionPaperId || !postQuestionPaper?.extractedData) {
      console.error('Cannot process: missing required data');
      return;
    }

    try {
      setPostProcessingStatus({ total: postStudentFiles.length, processed: 0, status: 'processing' });
      setIsLoading(true);
      setError(null);

      // Process each sheet with Gemini
      const processedSheets: Partial<StudentAnswerSheet>[] = [];

      for (let i = 0; i < postStudentFiles.length; i++) {
        try {
          // Extract student info and answers
          const { studentInfo, answers } = await geminiService.extractStudentAnswerSheet(postStudentFiles[i]);

          // Grade the answers
          if (!postQuestionPaper?.extractedData?.questions) {
            throw new Error('Post-campaign question paper not properly extracted');
          }
          
          const { gradedAnswers, score, totalMarks, percentage } = await geminiService.gradeStudentAnswers(
            answers,
            postQuestionPaper.extractedData.questions
          );

          // Calculate grade
          let grade = 'F';
          if (percentage >= 90) grade = 'A+';
          else if (percentage >= 80) grade = 'A';
          else if (percentage >= 70) grade = 'B';
          else if (percentage >= 60) grade = 'C';
          else if (percentage >= 50) grade = 'D';

          processedSheets.push({
            question_paper_id: postQuestionPaperId,
            project_id: selectedProjectId,
            student_name: studentInfo.studentName,
            student_roll_number: studentInfo.studentRollNumber,
            student_class: studentInfo.studentClass,
            school_name: studentInfo.schoolName,
            campaign_type: 'post',
            upload_drive_link: 'direct-upload',
            upload_file_name: postStudentFiles[i].name,
            upload_file_size_mb: postStudentFiles[i].size / (1024 * 1024),
            answers: gradedAnswers,
            total_questions_attempted: answers.length,
            score,
            total_marks: totalMarks,
            percentage,
            grade,
            extraction_status: 'completed',
            grading_status: 'completed',
            is_verified: false,
          });

          setPostProcessingStatus(prev => ({
            ...prev,
            processed: i + 1,
            currentStudent: studentInfo.studentName,
          }));
        } catch (err) {
          console.error(`Error processing sheet ${i + 1}:`, err);
          // Continue with next sheet even if one fails
        }
      }

      // Save all sheets to database
      if (processedSheets.length > 0) {
        console.log('Attempting to save post-campaign sheets:', processedSheets.length);
        console.log('Sample post sheet data:', JSON.stringify(processedSheets[0], null, 2));
        
        const savedSheets = await resultAnalysisService.batchCreateStudentAnswerSheets(
          processedSheets,
          currentUser?.id
        );
        setPostStudentSheets(savedSheets);
        console.log('Post-campaign sheets saved successfully:', savedSheets.length);
      } else {
        console.warn('No post-campaign sheets were successfully processed');
      }

      setPostProcessingStatus(prev => ({ ...prev, status: 'completed' }));
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing post-student sheets:', err);
      setError(err instanceof Error ? err.message : 'Failed to process student sheets');
      setPostProcessingStatus(prev => ({ 
        ...prev, 
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      }));
      setIsLoading(false);
    }
  };

  // ==================== STEP 5: GENERATE AND VIEW ANALYSIS ====================

  const generateAnalysis = async () => {
    if (!selectedProjectId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Generate campaign results
      const results = await resultAnalysisService.generateCampaignResults(
        selectedProjectId,
        currentUser?.id
      );

      // Get summary statistics
      const summary = await resultAnalysisService.getCampaignResultsSummary(selectedProjectId);

      setCampaignResults(results);
      setResultsSummary(summary);
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
      setIsLoading(false);
    }
  };

  // Load existing data on mount if needed
  useEffect(() => {
    if (selectedProjectId && currentStep === 5) {
      loadExistingResults();
    }
  }, [selectedProjectId, currentStep]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };

    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDownloadMenu]);

  const loadExistingResults = async () => {
    try {
      const results = await resultAnalysisService.getCampaignResultsByProject(selectedProjectId);
      if (results.length > 0) {
        setCampaignResults(results);
        const summary = await resultAnalysisService.getCampaignResultsSummary(selectedProjectId);
        setResultsSummary(summary);
      }
    } catch (err) {
      console.error('Error loading existing results:', err);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const filteredResults = filterStatus === 'all' 
      ? campaignResults 
      : campaignResults.filter(r => r.status === filterStatus);

    const headers = [
      'Student Name',
      'Roll Number',
      'Pre Score',
      'Pre Percentage',
      'Pre Grade',
      'Post Score',
      'Post Percentage',
      'Post Grade',
      'Improvement (%)',
      'Status',
      'Questions Improved',
      'Questions Declined'
    ];

    const rows = filteredResults.map(r => [
      r.student_name,
      r.student_roll_number || '',
      r.pre_score,
      r.pre_percentage.toFixed(2),
      r.pre_grade || '',
      r.post_score,
      r.post_percentage.toFixed(2),
      r.post_grade || '',
      r.improvement_percentage.toFixed(2),
      r.status,
      r.questions_improved,
      r.questions_declined
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = () => {
    const filteredResults = filterStatus === 'all' 
      ? campaignResults 
      : campaignResults.filter(r => r.status === filterStatus);

    // Create PDF content
    let pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Campaign Results Analysis</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #059669; margin-bottom: 10px; }
    .date { color: #6b7280; margin-bottom: 30px; }
    .summary { margin-bottom: 30px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .summary-card { padding: 20px; border-radius: 8px; }
    .summary-card.blue { background: #eff6ff; border: 1px solid #bfdbfe; }
    .summary-card.green { background: #d1fae5; border: 1px solid #a7f3d0; }
    .summary-card.red { background: #fee2e2; border: 1px solid #fecaca; }
    .summary-card.purple { background: #f3e8ff; border: 1px solid #e9d5ff; }
    .summary-label { font-size: 12px; font-weight: 600; margin-bottom: 5px; }
    .summary-value { font-size: 32px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f9fafb; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    tr:hover { background: #f9fafb; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .status-improved { background: #d1fae5; color: #065f46; }
    .status-declined { background: #fee2e2; color: #991b1b; }
    .status-same { background: #f3f4f6; color: #374151; }
    .status-incomplete { background: #fef3c7; color: #92400e; }
    .improvement-positive { color: #059669; font-weight: 600; }
    .improvement-negative { color: #dc2626; font-weight: 600; }
    .improvement-neutral { color: #6b7280; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Campaign Results Analysis</h1>
  <div class="date">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  
  ${resultsSummary ? `
  <div class="summary-grid">
    <div class="summary-card blue">
      <div class="summary-label" style="color: #2563eb;">Total Students</div>
      <div class="summary-value" style="color: #1e3a8a;">${resultsSummary.totalStudents}</div>
    </div>
    <div class="summary-card green">
      <div class="summary-label" style="color: #059669;">Improved</div>
      <div class="summary-value" style="color: #065f46;">${resultsSummary.studentsImproved}</div>
    </div>
    <div class="summary-card red">
      <div class="summary-label" style="color: #dc2626;">Declined</div>
      <div class="summary-value" style="color: #991b1b;">${resultsSummary.studentsDeclined}</div>
    </div>
    <div class="summary-card purple">
      <div class="summary-label" style="color: #9333ea;">Avg Improvement</div>
      <div class="summary-value" style="color: #6b21a8;">${resultsSummary.averageImprovement.toFixed(2)}%</div>
    </div>
  </div>
  ` : ''}
  
  <table>
    <thead>
      <tr>
        <th>Student Name</th>
        <th>Roll Number</th>
        <th style="text-align: center;">Pre Score</th>
        <th style="text-align: center;">Pre %</th>
        <th style="text-align: center;">Post Score</th>
        <th style="text-align: center;">Post %</th>
        <th style="text-align: center;">Improvement</th>
        <th style="text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${filteredResults.map(r => `
        <tr>
          <td>${r.student_name}</td>
          <td>${r.student_roll_number || '-'}</td>
          <td style="text-align: center;">${r.pre_score}</td>
          <td style="text-align: center;">${r.pre_percentage.toFixed(1)}%</td>
          <td style="text-align: center;">${r.post_score}</td>
          <td style="text-align: center;">${r.post_percentage.toFixed(1)}%</td>
          <td style="text-align: center;" class="${r.improvement_percentage > 0 ? 'improvement-positive' : r.improvement_percentage < 0 ? 'improvement-negative' : 'improvement-neutral'}">
            ${r.improvement_percentage > 0 ? '+' : ''}${r.improvement_percentage.toFixed(1)}%
          </td>
          <td style="text-align: center;">
            <span class="status-badge status-${r.status}">${r.status}</span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  // ==================== RENDER ====================

  const steps = [
    { number: 1, title: 'Pre-Campaign Q&A', icon: FileText },
    { number: 2, title: 'Pre-Campaign Students', icon: FolderOpen },
    { number: 3, title: 'Post-Campaign Q&A', icon: FileText },
    { number: 4, title: 'Post-Campaign Students', icon: FolderOpen },
    { number: 5, title: 'Analysis Results', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-emerald-50/20 to-gray-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Result Analysis</h1>
          <p className="text-gray-600">
            Upload question papers and student answer sheets for automated grading and performance analysis
          </p>
        </div>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </motion.div>
                    <p
                      className={`mt-2 text-sm font-medium text-center ${
                        isActive ? 'text-emerald-600' : 'text-gray-600'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 transition-all ${
                        isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
        >
          {/* Step 1: Pre-Campaign Question Paper */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Pre-Campaign Question Paper Upload
              </h2>
              
              {/* Project Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter Project ID or leave blank"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Solved Question Paper (Image/PDF)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-emerald-600 font-medium hover:text-emerald-700">
                      Choose file
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePreQuestionPaperUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    or drag and drop (jpg, png, pdf)
                  </p>
                </div>
              </div>

              {/* Uploaded File Info */}
              {preQuestionPaper && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="font-medium text-gray-900">{preQuestionPaper.file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(preQuestionPaper.file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    {preQuestionPaper.status === 'completed' && (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    )}
                    {preQuestionPaper.status === 'processing' && (
                      <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    )}
                    {preQuestionPaper.status === 'error' && (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>

                  {preQuestionPaper.status === 'error' && preQuestionPaper.error && (
                    <p className="mt-2 text-sm text-red-600">{preQuestionPaper.error}</p>
                  )}

                  {preQuestionPaper.status === 'completed' && preQuestionPaper.extractedData && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        ✓ Extracted {preQuestionPaper.extractedData.questions.length} questions
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Marks: {preQuestionPaper.extractedData.totalMarks}
                      </p>
                      
                      {/* Preview Questions */}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium text-emerald-600 hover:text-emerald-700">
                          View Extracted Questions
                        </summary>
                        <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                          {preQuestionPaper.extractedData.questions.slice(0, 5).map((q, idx) => (
                            <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                              <p className="font-medium text-gray-900">
                                Q{q.questionNumber}: {q.questionText.substring(0, 100)}
                                {q.questionText.length > 100 && '...'}
                              </p>
                              <p className="text-sm text-emerald-600 mt-1">
                                Answer: {q.correctAnswer}
                              </p>
                              {q.marks && (
                                <p className="text-xs text-gray-500 mt-1">Marks: {q.marks}</p>
                              )}
                            </div>
                          ))}
                          {preQuestionPaper.extractedData.questions.length > 5 && (
                            <p className="text-sm text-gray-500 text-center">
                              ... and {preQuestionPaper.extractedData.questions.length - 5} more questions
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              )}

              {/* Process Button */}
              {preQuestionPaper && preQuestionPaper.status === 'pending' && (
                <button
                  onClick={processPreQuestionPaper}
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Extract Questions & Answers
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Step 2: Pre-Campaign Student Responses */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Pre-Campaign Student Answer Sheets
              </h2>

              {/* Multiple File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Student Answer Sheets (Images)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                  <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-emerald-600 font-medium hover:text-emerald-700">
                      Choose files
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setPreStudentFiles(files);
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Select multiple student answer sheet images (jpg, png)
                  </p>
                  {preStudentFiles.length > 0 && (
                    <p className="text-sm text-emerald-600 mt-2 font-medium">
                      {preStudentFiles.length} files selected
                    </p>
                  )}
                </div>
              </div>

              {/* Warning if no pre question paper */}
              {preStudentFiles.length > 0 && !preQuestionPaperId && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Please upload and process the Pre-Campaign Question Paper (Step 1) first before processing student sheets.
                    </p>
                  </div>
                </div>
              )}

              {/* Process Button */}
              {preStudentFiles.length > 0 && preProcessingStatus.status === 'idle' && (
                <button
                  onClick={processPreStudentSheets}
                  disabled={isLoading || !preQuestionPaperId}
                  className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Process Student Sheets
                    </>
                  )}
                </button>
              )}

              {/* Processing Status */}
              {preProcessingStatus.status === 'processing' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <div>
                      <p className="font-medium text-blue-900">Processing Student Sheets...</p>
                      <p className="text-sm text-blue-600">
                        {preProcessingStatus.processed} of {preProcessingStatus.total} completed
                      </p>
                      {preProcessingStatus.currentStudent && (
                        <p className="text-sm text-blue-500">
                          Current: {preProcessingStatus.currentStudent}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(preProcessingStatus.processed / preProcessingStatus.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Error Status */}
              {preProcessingStatus.status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <p className="font-medium text-red-900">Processing Failed</p>
                        {preProcessingStatus.error && (
                          <p className="text-sm text-red-600">{preProcessingStatus.error}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setPreProcessingStatus({ total: 0, processed: 0, status: 'idle' })}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Completed Results */}
              {preProcessingStatus.status === 'completed' && preStudentSheets.length > 0 && (
                <div className="mb-6">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-900">
                          Successfully processed {preStudentSheets.length} student sheets
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Student Name
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Score
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Percentage
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {preStudentSheets.slice(0, 10).map((sheet, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{sheet.student_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {sheet.score}/{sheet.total_marks}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {sheet.percentage.toFixed(2)}%
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                                {sheet.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preStudentSheets.length > 10 && (
                      <p className="text-sm text-gray-500 text-center mt-4">
                        ... and {preStudentSheets.length - 10} more students
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Post-Campaign Question Paper */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Post-Campaign Question Paper Upload
              </h2>
              
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Solved Question Paper (Image/PDF)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-emerald-600 font-medium hover:text-emerald-700">
                      Choose file
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePostQuestionPaperUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    or drag and drop (jpg, png, pdf)
                  </p>
                </div>
              </div>

              {/* Uploaded File Info */}
              {postQuestionPaper && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="font-medium text-gray-900">{postQuestionPaper.file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(postQuestionPaper.file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    {postQuestionPaper.status === 'completed' && (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    )}
                    {postQuestionPaper.status === 'processing' && (
                      <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    )}
                    {postQuestionPaper.status === 'error' && (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>

                  {postQuestionPaper.status === 'error' && postQuestionPaper.error && (
                    <p className="mt-2 text-sm text-red-600">{postQuestionPaper.error}</p>
                  )}

                  {postQuestionPaper.status === 'completed' && postQuestionPaper.extractedData && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        ✓ Extracted {postQuestionPaper.extractedData.questions.length} questions
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Marks: {postQuestionPaper.extractedData.totalMarks}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Process Button */}
              {postQuestionPaper && postQuestionPaper.status === 'pending' && (
                <button
                  onClick={processPostQuestionPaper}
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Extract Questions & Answers
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Step 4: Post-Campaign Student Responses */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Post-Campaign Student Answer Sheets
              </h2>

              {/* Multiple File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Student Answer Sheets (Images)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                  <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-emerald-600 font-medium hover:text-emerald-700">
                      Choose files
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setPostStudentFiles(files);
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Select multiple student answer sheet images (jpg, png)
                  </p>
                  {postStudentFiles.length > 0 && (
                    <p className="text-sm text-emerald-600 mt-2 font-medium">
                      {postStudentFiles.length} files selected
                    </p>
                  )}
                </div>
              </div>

              {/* Warning if no post question paper */}
              {postStudentFiles.length > 0 && !postQuestionPaperId && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Please upload and process the Post-Campaign Question Paper (Step 3) first before processing student sheets.
                    </p>
                  </div>
                </div>
              )}

              {/* Process Button */}
              {postStudentFiles.length > 0 && postProcessingStatus.status === 'idle' && (
                <button
                  onClick={processPostStudentSheets}
                  disabled={isLoading || !postQuestionPaperId}
                  className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Process Student Sheets
                    </>
                  )}
                </button>
              )}

              {/* Processing Status */}
              {postProcessingStatus.status === 'processing' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <div>
                      <p className="font-medium text-blue-900">Processing Student Sheets...</p>
                      <p className="text-sm text-blue-600">
                        {postProcessingStatus.processed} of {postProcessingStatus.total} completed
                      </p>
                      {postProcessingStatus.currentStudent && (
                        <p className="text-sm text-blue-500">
                          Current: {postProcessingStatus.currentStudent}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(postProcessingStatus.processed / postProcessingStatus.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Error Status */}
              {postProcessingStatus.status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <p className="font-medium text-red-900">Processing Failed</p>
                        {postProcessingStatus.error && (
                          <p className="text-sm text-red-600">{postProcessingStatus.error}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setPostProcessingStatus({ total: 0, processed: 0, status: 'idle' })}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Completed Results */}
              {postProcessingStatus.status === 'completed' && postStudentSheets.length > 0 && (
                <div className="mb-6">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-900">
                          Successfully processed {postStudentSheets.length} student sheets
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Student Name
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Score
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Percentage
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {postStudentSheets.slice(0, 10).map((sheet, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{sheet.student_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {sheet.score}/{sheet.total_marks}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {sheet.percentage.toFixed(2)}%
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                                {sheet.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {postStudentSheets.length > 10 && (
                      <p className="text-sm text-gray-500 text-center mt-4">
                        ... and {postStudentSheets.length - 10} more students
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Analysis Results */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Performance Analysis & Comparison
              </h2>

              {/* Generate Analysis Button */}
              {campaignResults.length === 0 && (
                <button
                  onClick={generateAnalysis}
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Analysis...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      Generate Comparative Analysis
                    </>
                  )}
                </button>
              )}

              {/* Summary Statistics */}
              {resultsSummary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Total Students</p>
                    <p className="text-3xl font-bold text-blue-900">{resultsSummary.totalStudents}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-600 font-medium">Improved</p>
                    <p className="text-3xl font-bold text-emerald-900">{resultsSummary.studentsImproved}</p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Declined</p>
                    <p className="text-3xl font-bold text-red-900">{resultsSummary.studentsDeclined}</p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Avg Improvement</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {resultsSummary.averageImprovement.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Filter and Export */}
              {campaignResults.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Filter:</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="all">All Students</option>
                      <option value="improved">Improved Only</option>
                      <option value="declined">Declined Only</option>
                      <option value="same">No Change</option>
                    </select>
                  </div>
                  
                  {/* Download Dropdown */}
                  <div className="relative" ref={downloadMenuRef}>
                    <button
                      onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                    >
                      <Download className="w-4 h-4" />
                      Download Results
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showDownloadMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10"
                        >
                          <button
                            onClick={() => {
                              exportToPDF();
                              setShowDownloadMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span>Download as PDF</span>
                          </button>
                          <button
                            onClick={() => {
                              exportToCSV();
                              setShowDownloadMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-emerald-50 transition-colors border-t border-gray-100"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>Download as CSV</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Results Table */}
              {campaignResults.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Student Name
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Pre Score
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Post Score
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Improvement
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {campaignResults
                        .filter(r => filterStatus === 'all' || r.status === filterStatus)
                        .map((result, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {result.student_name}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="text-sm text-gray-900">
                                {result.pre_percentage.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">{result.pre_grade}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="text-sm text-gray-900">
                                {result.post_percentage.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">{result.post_grade}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {result.status === 'improved' && (
                                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                                )}
                                {result.status === 'declined' && (
                                  <TrendingDown className="w-4 h-4 text-red-600" />
                                )}
                                {result.status === 'same' && (
                                  <Minus className="w-4 h-4 text-gray-600" />
                                )}
                                <span
                                  className={`text-sm font-medium ${
                                    result.status === 'improved'
                                      ? 'text-emerald-600'
                                      : result.status === 'declined'
                                      ? 'text-red-600'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {result.improvement_percentage > 0 ? '+' : ''}
                                  {result.improvement_percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  result.status === 'improved'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : result.status === 'declined'
                                    ? 'bg-red-100 text-red-700'
                                    : result.status === 'same'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {result.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as Step)}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            
            {currentStep < 5 && (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1) as Step)}
                disabled={
                  (currentStep === 1 && !preQuestionPaper) ||
                  (currentStep === 1 && preQuestionPaper && preQuestionPaper.status !== 'completed') ||
                  (currentStep === 2 && preProcessingStatus.status !== 'completed') ||
                  (currentStep === 3 && !postQuestionPaper) ||
                  (currentStep === 3 && postQuestionPaper && postQuestionPaper.status !== 'completed') ||
                  (currentStep === 4 && postProcessingStatus.status !== 'completed')
                }
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResultAnalysisPage;