import { supabase } from './supabaseClient';

export interface CalendarEvent {
  id: string;
  event_code: string;
  project_id: string;
  title: string;
  description: string;
  event_type: 'Meeting' | 'Training' | 'Workshop' | 'Review';
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  organizer_id: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const calendarService = {
  async getAllEvents(): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  },

  async getEventsByProject(projectId: string): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('project_id', projectId)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  async createEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent | null> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([event])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  },

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  },
};
