import { supabase } from './supabaseClient';

export interface FileUploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

export interface SupportingFile {
  id: string;
  name: string;
  bucket_path: string;
  file_type: string;
  file_size_mb: number;
  uploaded_at: string;
  uploaded_by_id: string;
  public_url: string;
}

// Bucket names
const EXPENSE_BUCKET = 'expense-documents';
const CERTIFICATE_BUCKET = 'utilization_certificates';
const MAX_FILE_SIZE_MB = 50;

// Expense file upload (existing)
export const uploadReceiptFile = async (
  file: File,
  expenseId: string,
  userId: string
): Promise<string | null> => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type (images and PDFs only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and PDF files are allowed');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `receipts/${userId}/${expenseId}_${timestamp}.${fileExtension}`;

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from(EXPENSE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL for the uploaded file
    const { data: publicData } = supabase.storage
      .from(EXPENSE_BUCKET)
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return null;
  }
};

export const deleteReceiptFile = async (filePath: string): Promise<boolean> => {
  try {
    if (!filePath) {
      return false;
    }

    // Extract the file path from the URL if needed
    let path = filePath;
    if (filePath.includes('/storage/v1/object/public/expense-documents/')) {
      path = filePath.split('/storage/v1/object/public/expense-documents/')[1];
    }

    const { error } = await supabase.storage
      .from('expense-documents')
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return false;
  }
};

// Certificate file uploads (new)
export const certificateFileService = {
  /**
   * Upload certificate file to Supabase Storage
   */
  async uploadCertificateFile(
    file: File,
    certificateCode: string,
    fileType: 'certificate' | 'annexure'
  ): Promise<FileUploadResult> {
    try {
      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        return {
          success: false,
          error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size (${MAX_FILE_SIZE_MB}MB)`,
        };
      }

      // Generate unique file path
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${certificateCode}_${fileType}_${timestamp}.${fileExtension}`;
      const filePath = `certificates/${certificateCode}/${fileName}`;

      // Upload file to Supabase Storage
      const { error } = await supabase.storage
        .from(CERTIFICATE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return {
          success: false,
          error: `Upload failed: ${error.message}`,
        };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(CERTIFICATE_BUCKET)
        .getPublicUrl(filePath);

      return {
        success: true,
        path: filePath,
        publicUrl: publicUrlData.publicUrl,
        fileName: file.name,
        fileSize: fileSizeMB,
      };
    } catch (error) {
      return {
        success: false,
        error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },

  /**
   * Upload multiple supporting files
   */
  async uploadSupportingFiles(
    files: File[],
    certificateCode: string
  ): Promise<SupportingFile[]> {
    const uploadedFiles: SupportingFile[] = [];

    for (const file of files) {
      try {
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${certificateCode}_support_${timestamp}.${fileExtension}`;
        const filePath = `certificates/${certificateCode}/${fileName}`;

        const { error } = await supabase.storage
          .from(CERTIFICATE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!error) {
          const { data: publicUrlData } = supabase.storage
            .from(CERTIFICATE_BUCKET)
            .getPublicUrl(filePath);

          const supportingFile: SupportingFile = {
            id: `${timestamp}`,
            name: file.name,
            bucket_path: filePath,
            file_type: file.type,
            file_size_mb: file.size / (1024 * 1024),
            uploaded_at: new Date().toISOString(),
            uploaded_by_id: 'unknown',
            public_url: publicUrlData.publicUrl,
          };

          uploadedFiles.push(supportingFile);
        }
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
      }
    }

    return uploadedFiles;
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(CERTIFICATE_BUCKET)
      .getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Delete file from bucket
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(CERTIFICATE_BUCKET)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  },

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(filePaths: string[]): Promise<boolean> {
    try {
      if (filePaths.length === 0) return true;

      const { error } = await supabase.storage
        .from(CERTIFICATE_BUCKET)
        .remove(filePaths);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  },

  /**
   * List all files in a certificate folder
   */
  async listCertificateFiles(certificateCode: string): Promise<(Record<string, unknown> | unknown)[]> {
    try {
      const { data, error } = await supabase.storage
        .from(CERTIFICATE_BUCKET)
        .list(`certificates/${certificateCode}`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error('List error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('List failed:', error);
      return [];
    }
  },
};

export const uploadMultipleFiles = async (
  files: File[],
  expenseId: string,
  userId: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadReceiptFile(file, expenseId, userId)
    );

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    return [];
  }
};
