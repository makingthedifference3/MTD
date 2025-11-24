import { supabase } from './supabaseClient';

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
      .from('expense-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL for the uploaded file
    const { data: publicData } = supabase.storage
      .from('expense-documents')
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
