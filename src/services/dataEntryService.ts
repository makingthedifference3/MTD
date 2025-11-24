import { supabase } from './supabaseClient';

export interface DataEntryForm {
  id: string;
  form_code: string;
  project_id: string;
  form_name: string;
  form_type: 'Survey' | 'Assessment' | 'Feedback' | 'Registration';
  date: string;
  location: string;
  respondent_name: string;
  respondent_count: number;
  responses: Record<string, unknown>;
  status: 'draft' | 'submitted' | 'verified';
  submitted_by: string;
  created_at: string;
  updated_at: string;
}

export const dataEntryService = {
  async getAllForms(): Promise<DataEntryForm[]> {
    try {
      const { data, error } = await supabase
        .from('data_entry_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching forms:', error);
      return [];
    }
  },

  async getFormsByProject(projectId: string): Promise<DataEntryForm[]> {
    try {
      const { data, error } = await supabase
        .from('data_entry_forms')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching forms:', error);
      return [];
    }
  },

  async createForm(form: Omit<DataEntryForm, 'id' | 'created_at' | 'updated_at'>): Promise<DataEntryForm | null> {
    try {
      const { data, error } = await supabase
        .from('data_entry_forms')
        .insert([form])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating form:', error);
      return null;
    }
  },

  async updateForm(formId: string, updates: Partial<DataEntryForm>): Promise<DataEntryForm | null> {
    try {
      const { data, error } = await supabase
        .from('data_entry_forms')
        .update(updates)
        .eq('id', formId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating form:', error);
      return null;
    }
  },
};
