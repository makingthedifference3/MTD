import { supabase } from './supabaseClient';

export interface DataEntryForm {
  id: string;
  form_code: string;
  project_id: string;
  form_name: string;
  form_type: 'Survey' | 'Assessment' | 'Feedback' | 'Registration';
  template_id: string | null;
  date: string;
  location: string;
  school_name: string;
  institution_name: string;
  pre_form_data: Record<string, unknown>;
  post_form_data: Record<string, unknown>;
  responses: Record<string, unknown>;
  respondent_name: string;
  respondent_type: string;
  respondent_count: number;
  filled_form_drive_link: string;
  scanned_form_drive_link: string;
  submitted_by: string;
  verified_by: string | null;
  status: 'draft' | 'submitted' | 'verified';
  notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface DocumentForm {
  id: string;
  documentHeading: string;
  updateNumber: string;
  date: string;
  format: string;
  schoolName: string;
  address: string;
  description: string;
  documentNumber: string;
  images: string[];
  client: string;
  admin: string;
}

export interface BeneficiaryData {
  id: string;
  project_id: string;
  current_count: number;
  target_count: number;
  location: string;
  date: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all data entry forms
 */
export const getAllDataEntryForms = async (): Promise<DataEntryForm[]> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching data entry forms:', error);
    return [];
  }
};

/**
 * Get data entry form by ID
 */
export const getDataEntryFormById = async (id: string): Promise<DataEntryForm | null> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching data entry form:', error);
    return null;
  }
};

/**
 * Get data entry forms by project
 */
export const getDataEntryFormsByProject = async (projectId: string): Promise<DataEntryForm[]> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching data entry forms by project:', error);
    return [];
  }
};

/**
 * Get data entry forms by status
 */
export const getDataEntryFormsByStatus = async (status: 'draft' | 'submitted' | 'verified'): Promise<DataEntryForm[]> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching data entry forms by status:', error);
    return [];
  }
};

/**
 * Get data entry forms by form type
 */
export const getDataEntryFormsByType = async (formType: 'Survey' | 'Assessment' | 'Feedback' | 'Registration'): Promise<DataEntryForm[]> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .select('*')
      .eq('form_type', formType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching data entry forms by type:', error);
    return [];
  }
};

/**
 * Get data entry forms by date range
 */
export const getDataEntryFormsByDateRange = async (startDate: string, endDate: string): Promise<DataEntryForm[]> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching data entry forms by date range:', error);
    return [];
  }
};

/**
 * Create new data entry form
 */
export const createDataEntryForm = async (
  data: Omit<DataEntryForm, 'id' | 'created_at' | 'updated_at'>
): Promise<DataEntryForm | null> => {
  try {
    const { data: result, error } = await supabase
      .from('data_entry_forms')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating data entry form:', error);
    return null;
  }
};

/**
 * Update data entry form
 */
export const updateDataEntryForm = async (id: string, updates: Partial<DataEntryForm>): Promise<DataEntryForm | null> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating data entry form:', error);
    return null;
  }
};

/**
 * Delete data entry form
 */
export const deleteDataEntryForm = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('data_entry_forms')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting data entry form:', error);
    return false;
  }
};

/**
 * Verify data entry form
 */
export const verifyDataEntryForm = async (id: string, verifiedBy: string): Promise<DataEntryForm | null> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .update({
        status: 'verified' as const,
        verified_by: verifiedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error verifying data entry form:', error);
    return null;
  }
};

/**
 * Submit data entry form
 */
export const submitDataEntryForm = async (id: string, submittedBy: string): Promise<DataEntryForm | null> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .update({
        status: 'submitted' as const,
        submitted_by: submittedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting data entry form:', error);
    return null;
  }
};

/**
 * Get form statistics
 */
export const getDataEntryFormStats = async (): Promise<{
  totalForms: number;
  draftForms: number;
  submittedForms: number;
  verifiedForms: number;
}> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .select('status');

    if (error) throw error;

    const forms = (data || []) as Array<{ status: string }>;

    return {
      totalForms: forms.length,
      draftForms: forms.filter((f) => f.status === 'draft').length,
      submittedForms: forms.filter((f) => f.status === 'submitted').length,
      verifiedForms: forms.filter((f) => f.status === 'verified').length,
    };
  } catch (error) {
    console.error('Error fetching data entry form stats:', error);
    return {
      totalForms: 0,
      draftForms: 0,
      submittedForms: 0,
      verifiedForms: 0,
    };
  }
};

/**
 * Get data entry forms with details (JOIN with users and projects)
 */
export const getDataEntryFormsWithDetails = async (): Promise<DocumentForm[]> => {
  try {
    interface FormWithUsers {
      id: string;
      form_name: string;
      date: string;
      location: string;
      school_name: string;
      form_type: string;
      filled_form_drive_link: string;
      scanned_form_drive_link: string;
      users: Array<{ full_name: string }>;
      projects: Array<{ id: string }>;
    }

    const { data, error } = await supabase
      .from('data_entry_forms')
      .select(
        `
        id,
        form_name,
        date,
        location,
        school_name,
        form_type,
        filled_form_drive_link,
        scanned_form_drive_link,
        users:submitted_by(full_name),
        projects:project_id(id)
      `
      )
      .order('date', { ascending: false });

    if (error) throw error;

    // Transform to DocumentForm display format
    const documentForms = ((data as unknown as FormWithUsers[]) || []).map((form) => ({
      id: form.id as string,
      documentHeading: form.form_name || 'Form',
      updateNumber: form.form_type || '',
      date: form.date as string,
      format: 'PDF',
      schoolName: form.school_name || form.location || 'N/A',
      address: form.location || 'N/A',
      description: form.location || '',
      documentNumber: form.id as string,
      images: form.filled_form_drive_link ? [form.filled_form_drive_link] : [],
      client: 'System',
      admin: form.users?.[0]?.full_name || 'System Admin',
    })) as DocumentForm[];

    return documentForms;
  } catch (error) {
    console.error('Error fetching data entry forms with details:', error);
    return [];
  }
};

/**
 * Get pending forms (awaiting verification)
 */
export const getPendingDataEntryForms = async (): Promise<DataEntryForm[]> => {
  try {
    const { data, error } = await supabase
      .from('data_entry_forms')
      .select('*')
      .eq('status', 'submitted')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending data entry forms:', error);
    return [];
  }
};

/**
 * Export data entry forms (for CSV/PDF export)
 */
export const exportDataEntryForms = async (dateRange?: { start: string; end: string }): Promise<DataEntryForm[]> => {
  try {
    let query = supabase.from('data_entry_forms').select('*');

    if (dateRange) {
      query = query
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error exporting data entry forms:', error);
    return [];
  }
};
