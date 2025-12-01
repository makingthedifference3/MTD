/**
 * Result Analysis Service
 * 
 * Handles all database operations for the Result Analysis feature
 * Including question papers, student answer sheets, and comparative analysis
 */

import { supabase } from './supabaseClient';
import type { ExtractedQuestion, GradedAnswer } from './geminiService';

// ==================== TYPES ====================

export interface CSRPartner {
  id: string;
  name: string;
  company_name?: string;
  primary_color?: string;
  is_active: boolean;
}

export interface Project {
  id: string;
  project_code: string;
  name: string;
  description?: string;
  csr_partner_id: string;
  status: string;
  display_color?: string;
  display_icon?: string;
  is_active: boolean;
  csr_partners?: CSRPartner;
}

export interface QuestionPaper {
  id: string;
  paper_code: string;
  project_id?: string;
  campaign_type: 'pre' | 'post';
  title: string;
  description?: string;
  upload_drive_link?: string;
  upload_file_name?: string;
  upload_file_size_mb?: number;
  questions: ExtractedQuestion[];
  total_questions: number;
  total_marks: number;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  extraction_error?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface StudentAnswerSheet {
  id: string;
  sheet_code: string;
  question_paper_id: string;
  project_id?: string;
  student_name: string;
  student_roll_number?: string;
  student_class?: string;
  school_name?: string;
  campaign_type: 'pre' | 'post';
  upload_drive_link?: string;
  upload_file_name?: string;
  upload_file_size_mb?: number;
  answers: GradedAnswer[];
  total_questions_attempted: number;
  score: number;
  total_marks: number;
  percentage: number;
  grade?: string;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  extraction_error?: string;
  grading_status: 'pending' | 'processing' | 'completed' | 'failed';
  grading_error?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  processing_time_seconds?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CampaignResult {
  id: string;
  result_code: string;
  project_id: string;
  student_name: string;
  student_roll_number?: string;
  pre_answer_sheet_id?: string;
  post_answer_sheet_id?: string;
  pre_score: number;
  pre_percentage: number;
  pre_grade?: string;
  post_score: number;
  post_percentage: number;
  post_grade?: string;
  improvement_points: number;
  improvement_percentage: number;
  status: 'improved' | 'declined' | 'same' | 'incomplete';
  questions_improved: number;
  questions_declined: number;
  detailed_comparison?: Array<{
    questionNumber: number;
    preAnswer?: string;
    postAnswer?: string;
    improvement: boolean;
  }>;
  recommendations?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// ==================== CSR PARTNERS & PROJECTS ====================

/**
 * Get all active CSR Partners
 */
export async function getAllCSRPartners(): Promise<CSRPartner[]> {
  try {
    const { data, error } = await supabase
      .from('csr_partners')
      .select('id, name, company_name, primary_color, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching CSR partners:', error);
    return [];
  }
}

/**
 * Get all active projects with their CSR partner information
 */
export async function getAllProjectsWithPartners(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        project_code,
        name,
        description,
        csr_partner_id,
        status,
        display_color,
        display_icon,
        is_active,
        csr_partners (
          id,
          name,
          company_name,
          primary_color
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Get all projects for a CSR Partner
 */
export async function getProjectsByCSRPartner(csrPartnerId: string): Promise<Project[]> {
  try {
    const { data, error} = await supabase
      .from('projects')
      .select(`
        id,
        project_code,
        name,
        description,
        csr_partner_id,
        status,
        display_color,
        display_icon,
        is_active,
        csr_partners (
          id,
          name,
          company_name,
          primary_color
        )
      `)
      .eq('csr_partner_id', csrPartnerId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Get project by ID with CSR Partner details
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        project_code,
        name,
        description,
        csr_partner_id,
        status,
        display_color,
        display_icon,
        is_active,
        csr_partners (
          id,
          name,
          company_name,
          primary_color
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data as any;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

/**
 * Check if a project has existing result analysis data
 */
export async function checkProjectHasResults(projectId: string): Promise<{
  hasResults: boolean;
  hasPreQuestionPaper: boolean;
  hasPostQuestionPaper: boolean;
  hasPreAnswerSheets: boolean;
  hasPostAnswerSheets: boolean;
  hasCampaignResults: boolean;
  preQuestionPaper?: QuestionPaper;
  postQuestionPaper?: QuestionPaper;
  totalPreSheets: number;
  totalPostSheets: number;
  totalResults: number;
}> {
  try {
    // Check for question papers
    const [preQuestionPapers, postQuestionPapers] = await Promise.all([
      getQuestionPapersByProject(projectId, 'pre'),
      getQuestionPapersByProject(projectId, 'post'),
    ]);

    // Check for answer sheets
    const [preSheets, postSheets] = await Promise.all([
      getAnswerSheetsByProject(projectId, 'pre'),
      getAnswerSheetsByProject(projectId, 'post'),
    ]);

    // Check for campaign results
    const results = await getCampaignResultsByProject(projectId);

    return {
      hasResults: results.length > 0 || preSheets.length > 0 || postSheets.length > 0,
      hasPreQuestionPaper: preQuestionPapers.length > 0,
      hasPostQuestionPaper: postQuestionPapers.length > 0,
      hasPreAnswerSheets: preSheets.length > 0,
      hasPostAnswerSheets: postSheets.length > 0,
      hasCampaignResults: results.length > 0,
      preQuestionPaper: preQuestionPapers[0],
      postQuestionPaper: postQuestionPapers[0],
      totalPreSheets: preSheets.length,
      totalPostSheets: postSheets.length,
      totalResults: results.length,
    };
  } catch (error) {
    console.error('Error checking project results:', error);
    return {
      hasResults: false,
      hasPreQuestionPaper: false,
      hasPostQuestionPaper: false,
      hasPreAnswerSheets: false,
      hasPostAnswerSheets: false,
      hasCampaignResults: false,
      totalPreSheets: 0,
      totalPostSheets: 0,
      totalResults: 0,
    };
  }
}

// ==================== QUESTION PAPERS ====================

/**
 * Create a new question paper
 */
export async function createQuestionPaper(data: Partial<QuestionPaper>, userId?: string, csrPartnerId?: string): Promise<QuestionPaper> {
  try {
    const insertData: Record<string, unknown> = {};
    
    // UUID regex pattern for validation
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    // Copy only valid fields, sanitizing UUID fields
    for (const [key, value] of Object.entries(data)) {
      // For UUID fields, validate UUID format
      if (['project_id', 'verified_by', 'created_by', 'updated_by', 'csr_partner_id'].includes(key)) {
        if (value && typeof value === 'string' && value.trim() !== '' && uuidPattern.test(value.trim())) {
          insertData[key] = value.trim();
        }
        // Skip if not a valid UUID
      } else if (value !== undefined && value !== null) {
        insertData[key] = value;
      }
    }
    
    // Only include created_by and updated_by if userId is a valid UUID
    if (userId && userId.trim() !== '' && uuidPattern.test(userId.trim())) {
      insertData.created_by = userId.trim();
      insertData.updated_by = userId.trim();
    }
    
    // Add CSR partner ID if provided
    if (csrPartnerId && csrPartnerId.trim() !== '' && uuidPattern.test(csrPartnerId.trim())) {
      insertData.csr_partner_id = csrPartnerId.trim();
    }
    
    console.log('Insert data being sent to Supabase:', JSON.stringify(insertData, null, 2));
    
    const { data: result, error } = await supabase
      .from('campaign_question_papers')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }
    return result;
  } catch (error) {
    console.error('Error creating question paper:', error);
    if (error && typeof error === 'object' && 'message' in error) {
      console.error('Error message:', (error as { message: string }).message);
    }
    throw error;
  }
}

/**
 * Update question paper
 */
export async function updateQuestionPaper(id: string, data: Partial<QuestionPaper>, userId?: string): Promise<QuestionPaper> {
  try {
    const updateData: Record<string, unknown> = { ...data };
    
    // Only include updated_by if userId is valid
    if (userId && userId.trim() !== '') {
      updateData.updated_by = userId;
    }
    
    const { data: result, error } = await supabase
      .from('campaign_question_papers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error updating question paper:', error);
    throw error;
  }
}

/**
 * Get question paper by ID
 */
export async function getQuestionPaperById(id: string): Promise<QuestionPaper | null> {
  try {
    const { data, error } = await supabase
      .from('campaign_question_papers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching question paper:', error);
    return null;
  }
}

/**
 * Get all question papers for a project
 */
export async function getQuestionPapersByProject(projectId: string, campaignType?: 'pre' | 'post'): Promise<QuestionPaper[]> {
  try {
    let query = supabase
      .from('campaign_question_papers')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (campaignType) {
      query = query.eq('campaign_type', campaignType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching question papers:', error);
    return [];
  }
}

/**
 * Get all question papers
 */
export async function getAllQuestionPapers(): Promise<QuestionPaper[]> {
  try {
    const { data, error } = await supabase
      .from('campaign_question_papers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all question papers:', error);
    return [];
  }
}

/**
 * Delete question paper
 */
export async function deleteQuestionPaper(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('campaign_question_papers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting question paper:', error);
    return false;
  }
}

// ==================== STUDENT ANSWER SHEETS ====================

/**
 * Create student answer sheet
 */
export async function createStudentAnswerSheet(data: Partial<StudentAnswerSheet>, userId?: string): Promise<StudentAnswerSheet> {
  try {
    const insertData: Record<string, unknown> = { ...data };
    if (userId && userId.trim() !== '') {
      insertData.created_by = userId;
      insertData.updated_by = userId;
    }
    
    const { data: result, error } = await supabase
      .from('student_answer_sheets')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating student answer sheet:', error);
    throw error;
  }
}

/**
 * Update student answer sheet
 */
export async function updateStudentAnswerSheet(id: string, data: Partial<StudentAnswerSheet>, userId?: string): Promise<StudentAnswerSheet> {
  try {
    const updateData: Record<string, unknown> = { ...data };
    if (userId && userId.trim() !== '') {
      updateData.updated_by = userId;
    }
    
    const { data: result, error } = await supabase
      .from('student_answer_sheets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error updating student answer sheet:', error);
    throw error;
  }
}

/**
 * Get student answer sheet by ID
 */
export async function getStudentAnswerSheetById(id: string): Promise<StudentAnswerSheet | null> {
  try {
    const { data, error } = await supabase
      .from('student_answer_sheets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching student answer sheet:', error);
    return null;
  }
}

/**
 * Get all answer sheets for a question paper
 */
export async function getAnswerSheetsByQuestionPaper(questionPaperId: string): Promise<StudentAnswerSheet[]> {
  try {
    const { data, error } = await supabase
      .from('student_answer_sheets')
      .select('*')
      .eq('question_paper_id', questionPaperId)
      .order('student_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching answer sheets:', error);
    return [];
  }
}

/**
 * Get all answer sheets for a project
 */
export async function getAnswerSheetsByProject(projectId: string, campaignType?: 'pre' | 'post'): Promise<StudentAnswerSheet[]> {
  try {
    let query = supabase
      .from('student_answer_sheets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (campaignType) {
      query = query.eq('campaign_type', campaignType);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching ${campaignType || 'all'} answer sheets for project ${projectId}:`, error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} ${campaignType || 'all'} answer sheets for project ${projectId}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching answer sheets:', error);
    throw error;
  }
}

/**
 * Update answer sheets to have the correct project_id and csr_partner_id
 * This fixes any sheets that were created before migration or without proper IDs
 */
export async function updateAnswerSheetsProjectId(
  preQuestionPaperId: string,
  postQuestionPaperId: string,
  projectId: string,
  csrPartnerId?: string
): Promise<void> {
  try {
    console.log('Updating answer sheets with project_id:', projectId);
    
    // Update pre-campaign sheets
    const { error: preError } = await supabase
      .from('student_answer_sheets')
      .update({
        project_id: projectId,
        csr_partner_id: csrPartnerId || null
      })
      .eq('question_paper_id', preQuestionPaperId);

    if (preError) {
      console.error('Error updating pre-campaign sheets:', preError);
    } else {
      console.log('✅ Updated pre-campaign sheets');
    }

    // Update post-campaign sheets
    const { error: postError } = await supabase
      .from('student_answer_sheets')
      .update({
        project_id: projectId,
        csr_partner_id: csrPartnerId || null
      })
      .eq('question_paper_id', postQuestionPaperId);

    if (postError) {
      console.error('Error updating post-campaign sheets:', postError);
    } else {
      console.log('✅ Updated post-campaign sheets');
    }

    // Also update question papers
    await supabase
      .from('campaign_question_papers')
      .update({
        project_id: projectId,
        csr_partner_id: csrPartnerId || null
      })
      .in('id', [preQuestionPaperId, postQuestionPaperId]);

    console.log('✅ All answer sheets updated with project_id');
  } catch (error) {
    console.error('Error updating answer sheets:', error);
    // Don't throw - just log the error and continue
  }
}

/**
 * Batch create student answer sheets
 */
export async function batchCreateStudentAnswerSheets(sheets: Partial<StudentAnswerSheet>[], userId?: string, csrPartnerId?: string): Promise<StudentAnswerSheet[]> {
  try {
    const sheetsWithUser = sheets.map(sheet => {
      const sheetData: Record<string, unknown> = { ...sheet };
      if (userId && userId.trim() !== '') {
        sheetData.created_by = userId;
        sheetData.updated_by = userId;
      }
      
      // Add CSR partner ID if provided
      if (csrPartnerId && csrPartnerId.trim() !== '') {
        sheetData.csr_partner_id = csrPartnerId;
      }
      
      // Remove undefined fields to avoid Supabase errors
      Object.keys(sheetData).forEach(key => {
        if (sheetData[key] === undefined) {
          delete sheetData[key];
        }
      });
      
      return sheetData;
    });

    console.log('Cleaned sheets being sent to Supabase:', JSON.stringify(sheetsWithUser, null, 2));

    const { data, error } = await supabase
      .from('student_answer_sheets')
      .insert(sheetsWithUser)
      .select();

    if (error) {
      console.error('Supabase insert error details:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error batch creating answer sheets:', error);
    throw error;
  }
}

/**
 * Delete student answer sheet
 */
export async function deleteStudentAnswerSheet(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('student_answer_sheets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting answer sheet:', error);
    return false;
  }
}

// ==================== CAMPAIGN RESULTS ====================

/**
 * Create campaign result
 */
export async function createCampaignResult(data: Partial<CampaignResult>, userId?: string): Promise<CampaignResult> {
  try {
    const insertData: Record<string, unknown> = { ...data };
    if (userId && userId.trim() !== '') {
      insertData.created_by = userId;
      insertData.updated_by = userId;
    }
    
    const { data: result, error } = await supabase
      .from('campaign_results')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating campaign result:', error);
    throw error;
  }
}

/**
 * Update campaign result
 */
export async function updateCampaignResult(id: string, data: Partial<CampaignResult>, userId?: string): Promise<CampaignResult> {
  try {
    const updateData: Record<string, unknown> = { ...data };
    if (userId && userId.trim() !== '') {
      updateData.updated_by = userId;
    }
    
    const { data: result, error } = await supabase
      .from('campaign_results')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error updating campaign result:', error);
    throw error;
  }
}

/**
 * Get campaign result by ID
 */
export async function getCampaignResultById(id: string): Promise<CampaignResult | null> {
  try {
    const { data, error } = await supabase
      .from('campaign_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching campaign result:', error);
    return null;
  }
}

/**
 * Get all campaign results for a project
 */
export async function getCampaignResultsByProject(projectId: string): Promise<CampaignResult[]> {
  try {
    const { data, error } = await supabase
      .from('campaign_results')
      .select('*')
      .eq('project_id', projectId)
      .order('improvement_percentage', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching campaign results:', error);
    return [];
  }
}

/**
 * Generate campaign results by comparing pre and post answer sheets
 */
export async function generateCampaignResults(projectId: string, userId?: string, csrPartnerId?: string): Promise<CampaignResult[]> {
  try {
    console.log('Generating campaign results for project:', projectId);
    
    // Get pre and post answer sheets
    const preSheets = await getAnswerSheetsByProject(projectId, 'pre');
    const postSheets = await getAnswerSheetsByProject(projectId, 'post');
    
    console.log(`Found ${preSheets.length} pre-campaign sheets and ${postSheets.length} post-campaign sheets`);
    
    if (preSheets.length === 0) {
      throw new Error('No pre-campaign answer sheets found for this project. Please ensure you have completed Step 4 (Pre-Campaign Student Responses) and that the data was saved with the correct project ID.');
    }
    if (postSheets.length === 0) {
      throw new Error('No post-campaign answer sheets found for this project. Please ensure you have completed Step 6 (Post-Campaign Student Responses) and that the data was saved with the correct project ID.');
    }

    // Helper function to calculate string similarity (Levenshtein distance ratio)
    const calculateSimilarity = (str1: string, str2: string): number => {
      const s1 = str1.toLowerCase().trim();
      const s2 = str2.toLowerCase().trim();
      
      if (s1 === s2) return 1.0;
      
      const len1 = s1.length;
      const len2 = s2.length;
      const maxLen = Math.max(len1, len2);
      
      if (maxLen === 0) return 1.0;
      
      // Levenshtein distance
      const matrix: number[][] = [];
      for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
      }
      
      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }
      
      const distance = matrix[len1][len2];
      return 1 - (distance / maxLen);
    };

    // Find best match for a student (with fuzzy matching)
    const findBestMatch = (preSheet: StudentAnswerSheet, postSheets: StudentAnswerSheet[]): StudentAnswerSheet | null => {
      // Priority 1: Exact roll number match
      if (preSheet.student_roll_number && preSheet.student_roll_number.trim() !== '') {
        const exactRollMatch = postSheets.find(
          post => post.student_roll_number && 
                  post.student_roll_number.toLowerCase().trim() === preSheet.student_roll_number!.toLowerCase().trim()
        );
        if (exactRollMatch) {
          console.log(`✅ Roll number match: ${preSheet.student_name} <-> ${exactRollMatch.student_name}`);
          return exactRollMatch;
        }
      }
      
      // Priority 2: Exact name match
      const exactNameMatch = postSheets.find(
        post => post.student_name.toLowerCase().trim() === preSheet.student_name.toLowerCase().trim()
      );
      if (exactNameMatch) {
        console.log(`✅ Exact name match: ${preSheet.student_name}`);
        return exactNameMatch;
      }
      
      // Priority 3: Fuzzy name match (80% similarity threshold)
      let bestMatch: StudentAnswerSheet | null = null;
      let bestSimilarity = 0;
      
      for (const postSheet of postSheets) {
        const similarity = calculateSimilarity(preSheet.student_name, postSheet.student_name);
        if (similarity >= 0.80 && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = postSheet;
        }
      }
      
      if (bestMatch) {
        console.log(`✅ Fuzzy match (${(bestSimilarity * 100).toFixed(1)}%): ${preSheet.student_name} <-> ${bestMatch.student_name}`);
        return bestMatch;
      }
      
      console.log(`❌ No match found for: ${preSheet.student_name}`);
      return null;
    };

    console.log(`Matching criteria: Roll Number > Exact Name > Fuzzy Name (80% similarity)`);
    console.log(`Pre-campaign sheets: ${preSheets.length}`);
    console.log(`Post-campaign sheets: ${postSheets.length}`);

    // Track which post sheets have been matched
    const matchedPostSheetIds = new Set<string>();

    // Generate results
    const results: Partial<CampaignResult>[] = [];

    for (const preSheet of preSheets) {
      // Find best match from remaining post sheets
      const remainingPostSheets = postSheets.filter(sheet => !matchedPostSheetIds.has(sheet.id));
      const postSheet = findBestMatch(preSheet, remainingPostSheets);

      if (!postSheet) {
        // Student only has pre-campaign data
        results.push({
          project_id: projectId,
          student_name: preSheet.student_name,
          student_roll_number: preSheet.student_roll_number,
          pre_answer_sheet_id: preSheet.id,
          pre_score: preSheet.score,
          pre_percentage: preSheet.percentage,
          pre_grade: preSheet.grade,
          post_score: 0,
          post_percentage: 0,
          improvement_points: 0,
          improvement_percentage: 0,
          status: 'incomplete',
          questions_improved: 0,
          questions_declined: 0,
        });
        continue;
      }

      // Calculate improvement
      const improvementPoints = postSheet.score - preSheet.score;
      const improvementPercentage = postSheet.percentage - preSheet.percentage;
      
      let status: 'improved' | 'declined' | 'same' = 'same';
      if (improvementPercentage > 0) status = 'improved';
      else if (improvementPercentage < 0) status = 'declined';

      // Compare individual questions
      const detailedComparison: Array<{
        questionNumber: number;
        preAnswer?: string;
        postAnswer?: string;
        improvement: boolean;
      }> = [];

      let questionsImproved = 0;
      let questionsDeclined = 0;

      const preAnswersMap = new Map<number, GradedAnswer>();
      preSheet.answers.forEach(ans => preAnswersMap.set(ans.questionNumber, ans));

      postSheet.answers.forEach(postAns => {
        const preAns = preAnswersMap.get(postAns.questionNumber);
        if (preAns) {
          const improved = postAns.isCorrect && !preAns.isCorrect;
          const declined = !postAns.isCorrect && preAns.isCorrect;
          
          if (improved) questionsImproved++;
          if (declined) questionsDeclined++;

          detailedComparison.push({
            questionNumber: postAns.questionNumber,
            preAnswer: preAns.answer,
            postAnswer: postAns.answer,
            improvement: improved,
          });
        }
      });

      results.push({
        project_id: projectId,
        student_name: preSheet.student_name,
        student_roll_number: preSheet.student_roll_number,
        pre_answer_sheet_id: preSheet.id,
        post_answer_sheet_id: postSheet.id,
        pre_score: preSheet.score,
        pre_percentage: preSheet.percentage,
        pre_grade: preSheet.grade,
        post_score: postSheet.score,
        post_percentage: postSheet.percentage,
        post_grade: postSheet.grade,
        improvement_points: improvementPoints,
        improvement_percentage: improvementPercentage,
        status,
        questions_improved: questionsImproved,
        questions_declined: questionsDeclined,
        detailed_comparison: detailedComparison,
      });

      // Mark this post sheet as matched
      matchedPostSheetIds.add(postSheet.id);
    }

    // Add students who only have post-campaign data (unmatched)
    postSheets.forEach(postSheet => {
      if (!matchedPostSheetIds.has(postSheet.id)) {
        results.push({
          project_id: projectId,
          student_name: postSheet.student_name,
          student_roll_number: postSheet.student_roll_number,
          post_answer_sheet_id: postSheet.id,
          pre_score: 0,
          pre_percentage: 0,
          post_score: postSheet.score,
          post_percentage: postSheet.percentage,
          post_grade: postSheet.grade,
          improvement_points: postSheet.score,
          improvement_percentage: postSheet.percentage,
          status: 'incomplete',
          questions_improved: 0,
          questions_declined: 0,
        });
      }
    });

    // Delete existing results for this project
    await supabase
      .from('campaign_results')
      .delete()
      .eq('project_id', projectId);

    // Insert new results
    if (results.length > 0) {
      const resultsWithUser = results.map(result => {
        const resultData: Record<string, unknown> = { ...result };
        
        // Remove fields that might cause issues or are backup columns
        delete resultData.detailed_comparison;
        delete resultData.project_id_old;
        
        if (userId && userId.trim() !== '') {
          resultData.created_by = userId;
          resultData.updated_by = userId;
        }
        if (csrPartnerId && csrPartnerId.trim() !== '') {
          resultData.csr_partner_id = csrPartnerId;
        }
        
        return resultData;
      });

      console.log('Inserting results:', resultsWithUser.length, 'records');
      console.log('Sample result:', JSON.stringify(resultsWithUser[0], null, 2));

      const { data, error } = await supabase
        .from('campaign_results')
        .insert(resultsWithUser)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Failed to save results: ${error.message}`);
      }
      
      console.log('✅ Successfully inserted', data?.length || 0, 'results');
      return data || [];
    }

    return [];
  } catch (error) {
    console.error('Error generating campaign results:', error);
    throw error;
  }
}

/**
 * Delete campaign result
 */
export async function deleteCampaignResult(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('campaign_results')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting campaign result:', error);
    return false;
  }
}

/**
 * Get summary statistics for campaign results
 */
export async function getCampaignResultsSummary(projectId: string): Promise<{
  totalStudents: number;
  studentsImproved: number;
  studentsDeclined: number;
  studentsSame: number;
  studentsIncomplete: number;
  averagePrePercentage: number;
  averagePostPercentage: number;
  averageImprovement: number;
}> {
  try {
    const results = await getCampaignResultsByProject(projectId);

    const summary = {
      totalStudents: results.length,
      studentsImproved: results.filter(r => r.status === 'improved').length,
      studentsDeclined: results.filter(r => r.status === 'declined').length,
      studentsSame: results.filter(r => r.status === 'same').length,
      studentsIncomplete: results.filter(r => r.status === 'incomplete').length,
      averagePrePercentage: 0,
      averagePostPercentage: 0,
      averageImprovement: 0,
    };

    if (results.length > 0) {
      const completeResults = results.filter(r => r.status !== 'incomplete');
      if (completeResults.length > 0) {
        summary.averagePrePercentage = completeResults.reduce((sum, r) => sum + r.pre_percentage, 0) / completeResults.length;
        summary.averagePostPercentage = completeResults.reduce((sum, r) => sum + r.post_percentage, 0) / completeResults.length;
        summary.averageImprovement = completeResults.reduce((sum, r) => sum + r.improvement_percentage, 0) / completeResults.length;
      }
    }

    return summary;
  } catch (error) {
    console.error('Error getting campaign results summary:', error);
    return {
      totalStudents: 0,
      studentsImproved: 0,
      studentsDeclined: 0,
      studentsSame: 0,
      studentsIncomplete: 0,
      averagePrePercentage: 0,
      averagePostPercentage: 0,
      averageImprovement: 0,
    };
  }
}

export default {
  // CSR Partners & Projects
  getAllCSRPartners,
  getAllProjectsWithPartners,
  getProjectsByCSRPartner,
  getProjectById,
  checkProjectHasResults,
  
  // Question Papers
  createQuestionPaper,
  updateQuestionPaper,
  getQuestionPaperById,
  getQuestionPapersByProject,
  getAllQuestionPapers,
  deleteQuestionPaper,
  
  // Student Answer Sheets
  createStudentAnswerSheet,
  updateStudentAnswerSheet,
  getStudentAnswerSheetById,
  getAnswerSheetsByQuestionPaper,
  getAnswerSheetsByProject,
  batchCreateStudentAnswerSheets,
  deleteStudentAnswerSheet,
  
  // Campaign Results
  createCampaignResult,
  updateCampaignResult,
  getCampaignResultById,
  getCampaignResultsByProject,
  generateCampaignResults,
  deleteCampaignResult,
  getCampaignResultsSummary,
};
