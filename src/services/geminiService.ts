/**
 * Gemini AI Service - Optimized Version with Correct Models
 * 
 * Improvements:
 * - Smarter rate limiting with token bucket algorithm
 * - Parallel processing with concurrency control
 * - Better OCR accuracy with improved prompts
 * - Correct model names for current Gemini API
 * - Caching for repeated extractions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key from environment
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ============================================================================
// RATE LIMITING - Token Bucket Algorithm
// ============================================================================
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(requestsPerMinute: number) {
    this.maxTokens = requestsPerMinute;
    this.tokens = requestsPerMinute;
    this.lastRefill = Date.now();
    // Refill rate: distribute tokens evenly across the minute
    this.refillRate = requestsPerMinute / 60000; // per millisecond
  }

  async acquireToken(): Promise<void> {
    // Refill tokens based on time passed
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;

    // If we have tokens, use one
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Otherwise, wait until we have a token
    const waitTime = (1 - this.tokens) / this.refillRate;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    this.tokens = 0;
    this.lastRefill = Date.now();
  }
}

// For free tier: 15 RPM, for paid tier: increase this
const rateLimiter = new RateLimiter(15);

// ============================================================================
// CACHING
// ============================================================================
const extractionCache = new Map<string, any>();

async function getCacheKey(file: File): Promise<string> {
  // Create a simple cache key from file name, size, and last modified
  return `${file.name}-${file.size}-${file.lastModified}`;
}

// ============================================================================
// IMAGE PROCESSING
// ============================================================================
/**
 * Convert image file to base64 data URI
 */
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// INTERFACES
// ============================================================================
export interface ExtractedQuestion {
  questionNumber: number;
  questionText: string;
  correctAnswer: string;
  marks?: number;
}

export interface ExtractedAnswer {
  questionNumber: number;
  answer: string;
}

export interface ExtractedStudentInfo {
  studentName: string;
  studentRollNumber?: string;
  studentClass?: string;
  schoolName?: string;
}

export interface GradedAnswer extends ExtractedAnswer {
  isCorrect: boolean;
  marksObtained: number;
  correctAnswer: string;
}

// ============================================================================
// EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract questions and answers from solved question paper
 * Uses caching to avoid re-processing the same file
 */
export async function extractQuestionPaper(
  file: File
): Promise<{ questions: ExtractedQuestion[]; totalMarks: number }> {
  try {
    // Check cache
    const cacheKey = await getCacheKey(file);
    if (extractionCache.has(cacheKey)) {
      console.log('Using cached question paper extraction');
      return extractionCache.get(cacheKey);
    }

    await rateLimiter.acquireToken();

    // Use the correct model name - gemini-2.0-flash-exp or gemini-1.5-pro
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash', // Fast experimental model
      generationConfig: {
        temperature: 0.1, // Lower temperature for more consistent extraction
        maxOutputTokens: 8192,
      }
    });
    
    const imagePart = await fileToGenerativePart(file);

    const prompt = `Extract all questions and correct answers from this solved question paper.

CRITICAL RULES:
1. Extract EVERY question visible
2. Be PRECISE with numbers and text
3. Return ONLY valid JSON (no markdown, no extra text)
4. Use this EXACT structure:

{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "exact question text",
      "correctAnswer": "exact correct answer",
      "marks": 2
    }
  ],
  "totalMarks": 100
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const parsed = parseJsonResponse(text);
    const result_data = {
      questions: parsed.questions || [],
      totalMarks: parsed.totalMarks || parsed.questions.reduce((sum: number, q: ExtractedQuestion) => sum + (q.marks || 0), 0),
    };

    // Cache the result
    extractionCache.set(cacheKey, result_data);

    return result_data;
  } catch (error) {
    console.error('Error extracting question paper:', error);
    throw new Error(`Failed to extract question paper: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract student name and answers from answer sheet
 * IMPROVED: Better prompting for name accuracy
 */
export async function extractStudentAnswerSheet(
  file: File
): Promise<{ studentInfo: ExtractedStudentInfo; answers: ExtractedAnswer[] }> {
  try {
    // Check cache
    const cacheKey = await getCacheKey(file);
    if (extractionCache.has(cacheKey)) {
      console.log('Using cached answer sheet extraction');
      return extractionCache.get(cacheKey);
    }

    await rateLimiter.acquireToken();

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash', // Using same model for consistency
      generationConfig: {
        temperature: 0.1, // Very low temperature for consistent name extraction
        maxOutputTokens: 8192,
      }
    });
    
    const imagePart = await fileToGenerativePart(file);

    const prompt = `Extract student information and answers from this answer sheet.

CRITICAL RULES FOR NAME EXTRACTION:
1. Student names are usually at the TOP of the sheet
2. Read handwriting CAREFULLY - common mistakes:
   - "Harsh" not "Horsh"
   - "Chitaliya" not "Chitalijan"
   - Look for common Indian names and spell them correctly
3. If name is unclear, make your BEST attempt at the correct spelling
4. Extract ALL answers with their question numbers
5. Return ONLY valid JSON (no markdown, no extra text)

Use this EXACT structure:
{
  "studentInfo": {
    "studentName": "Full Name (spelled correctly)",
    "studentRollNumber": "roll number or empty string",
    "studentClass": "class or empty string",
    "schoolName": "school name or empty string"
  },
  "answers": [
    {
      "questionNumber": 1,
      "answer": "student's exact answer"
    }
  ]
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const parsed = parseJsonResponse(text);
    const result_data = {
      studentInfo: parsed.studentInfo || { studentName: 'Unknown Student' },
      answers: parsed.answers || [],
    };

    // Cache the result
    extractionCache.set(cacheKey, result_data);

    return result_data;
  } catch (error) {
    console.error('Error extracting student answer sheet:', error);
    throw new Error(`Failed to extract answer sheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper to parse JSON from Gemini response (handles markdown code blocks)
 */
function parseJsonResponse(text: string): any {
  let jsonText = text.trim();
  
  // Remove markdown code blocks
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return JSON.parse(jsonText);
}

// ============================================================================
// GRADING
// ============================================================================
export async function gradeStudentAnswers(
  studentAnswers: ExtractedAnswer[],
  correctAnswers: ExtractedQuestion[]
): Promise<{ gradedAnswers: GradedAnswer[]; score: number; totalMarks: number; percentage: number }> {
  try {
    const correctAnswersMap = new Map<number, ExtractedQuestion>();
    correctAnswers.forEach(q => correctAnswersMap.set(q.questionNumber, q));

    const gradedAnswers: GradedAnswer[] = [];
    let totalScore = 0;
    let totalMarks = 0;

    for (const studentAnswer of studentAnswers) {
      const correctQ = correctAnswersMap.get(studentAnswer.questionNumber);
      
      if (!correctQ) {
        gradedAnswers.push({
          ...studentAnswer,
          isCorrect: false,
          marksObtained: 0,
          correctAnswer: 'N/A',
        });
        continue;
      }

      totalMarks += correctQ.marks || 1;

      // Improved fuzzy matching
      const isCorrect = compareAnswers(studentAnswer.answer, correctQ.correctAnswer);
      const marksObtained = isCorrect ? (correctQ.marks || 1) : 0;
      totalScore += marksObtained;
      
      gradedAnswers.push({
        ...studentAnswer,
        isCorrect,
        marksObtained,
        correctAnswer: correctQ.correctAnswer,
      });
    }

    const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

    return {
      gradedAnswers,
      score: totalScore,
      totalMarks,
      percentage: Math.round(percentage * 100) / 100,
    };
  } catch (error) {
    console.error('Error grading student answers:', error);
    throw new Error(`Failed to grade answers: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Improved answer comparison with better fuzzy matching
 */
function compareAnswers(studentAnswer: string, correctAnswer: string): boolean {
  const normalize = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
  
  const studentNorm = normalize(studentAnswer);
  const correctNorm = normalize(correctAnswer);
  
  // Exact match
  if (studentNorm === correctNorm) return true;
  
  // One contains the other (for longer answers)
  if (studentNorm.length > 5 && correctNorm.includes(studentNorm)) return true;
  if (correctNorm.length > 5 && studentNorm.includes(correctNorm)) return true;
  
  // Calculate similarity ratio (simple Levenshtein-like check)
  const similarity = calculateSimilarity(studentNorm, correctNorm);
  return similarity > 0.8; // 80% similarity threshold
}

/**
 * Calculate simple similarity between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance
 */
function getEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// ============================================================================
// BATCH PROCESSING WITH PARALLEL EXECUTION
// ============================================================================
/**
 * Batch process multiple images with PARALLEL processing and progress tracking
 * This is MUCH faster than sequential processing
 */
export async function batchProcessStudentSheets(
  files: File[],
  onProgress?: (current: number, total: number, studentName?: string) => void
): Promise<Array<{ studentInfo: ExtractedStudentInfo; answers: ExtractedAnswer[]; fileName: string; error?: string }>> {
  
  const results: Array<{ studentInfo: ExtractedStudentInfo; answers: ExtractedAnswer[]; fileName: string; error?: string }> = 
    new Array(files.length);
  
  let completed = 0;

  // Process with concurrency limit (process 3 at a time to respect rate limits)
  const CONCURRENCY = 3;
  
  const processFile = async (file: File, index: number) => {
    try {
      const result = await extractStudentAnswerSheet(file);
      results[index] = { ...result, fileName: file.name };
      
      completed++;
      if (onProgress) {
        onProgress(completed, files.length, result.studentInfo.studentName);
      }
    } catch (error) {
      console.error(`Error processing sheet ${index + 1}:`, error);
      results[index] = {
        studentInfo: { studentName: `Error - ${file.name}` },
        answers: [],
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      completed++;
      if (onProgress) {
        onProgress(completed, files.length);
      }
    }
  };

  // Process files in batches
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    const promises = batch.map((file, batchIndex) => 
      processFile(file, i + batchIndex)
    );
    await Promise.all(promises);
  }

  return results;
}

/**
 * Clear the extraction cache (useful for freeing memory)
 */
export function clearCache(): void {
  extractionCache.clear();
}

export default {
  extractQuestionPaper,
  extractStudentAnswerSheet,
  gradeStudentAnswers,
  batchProcessStudentSheets,
  clearCache,
};