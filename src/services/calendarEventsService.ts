import { supabase } from './supabaseClient';

/**
 * Calendar Events Service
 * Provides CRUD operations for managing calendar events, meetings, and deadlines
 * Data source: calendar_events table
 */

export interface CalendarEvent {
  id: string;
  event_code: string;
  project_id?: string;
  task_id?: string;
  title: string;
  description?: string;
  event_type?: 'Meeting' | 'Training' | 'Workshop' | 'Review' | 'Field Visit';
  category?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  is_all_day?: boolean;
  location?: string;
  venue?: string;
  meeting_link?: string;
  latitude?: number;
  longitude?: number;
  organizer_id?: string;
  assigned_to?: string[];
  participants?: Record<string, unknown>;
  expected_attendees?: number;
  actual_attendees?: number;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_end_date?: string;
  reminders?: Record<string, unknown>;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  action_items?: Record<string, unknown>;
  documents?: Record<string, unknown>;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface EventStats {
  total: number;
  meetings: number;
  trainings: number;
  workshops: number;
  reviews: number;
  fieldVisits: number;
  scheduled: number;
  ongoing: number;
  completed: number;
  cancelled: number;
}

// Get all calendar events with optional filtering
export const getAllCalendarEvents = async (
  eventType?: string
): Promise<CalendarEvent[]> => {
  try {
    let query = supabase
      .from('calendar_events')
      .select(
        'id, event_code, project_id, task_id, title, description, event_type, category, event_date, start_time, end_time, duration_minutes, is_all_day, location, venue, meeting_link, latitude, longitude, organizer_id, assigned_to, participants, expected_attendees, actual_attendees, is_recurring, recurrence_pattern, recurrence_end_date, reminders, status, action_items, documents, notes, metadata, created_at, updated_at, created_by, updated_by'
      );

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query.order('event_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    throw err;
  }
};

// Get calendar event by ID
export const getCalendarEventById = async (id: string): Promise<CalendarEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    console.error('Error fetching calendar event:', err);
    throw err;
  }
};

// Get events by project
export const getEventsByProject = async (projectId: string): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('project_id', projectId)
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching project events:', err);
    throw err;
  }
};

// Get events by date range
export const getEventsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching events by date range:', err);
    throw err;
  }
};

// Create a new calendar event
export const createCalendarEvent = async (
  eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>
): Promise<CalendarEvent> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating calendar event:', err);
    throw err;
  }
};

// Update a calendar event
export const updateCalendarEvent = async (
  id: string,
  eventData: Partial<CalendarEvent>
): Promise<CalendarEvent> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({ ...eventData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating calendar event:', err);
    throw err;
  }
};

// Update event status
export const updateEventStatus = async (
  id: string,
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
): Promise<CalendarEvent> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating event status:', err);
    throw err;
  }
};

// Delete a calendar event
export const deleteCalendarEvent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting calendar event:', err);
    throw err;
  }
};

// Get event statistics
export const getEventStats = async (): Promise<EventStats> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('event_type, status');

    if (error) throw error;

    const stats: EventStats = {
      total: data?.length || 0,
      meetings: data?.filter((e) => e.event_type === 'Meeting').length || 0,
      trainings: data?.filter((e) => e.event_type === 'Training').length || 0,
      workshops: data?.filter((e) => e.event_type === 'Workshop').length || 0,
      reviews: data?.filter((e) => e.event_type === 'Review').length || 0,
      fieldVisits: data?.filter((e) => e.event_type === 'Field Visit').length || 0,
      scheduled: data?.filter((e) => e.status === 'scheduled').length || 0,
      ongoing: data?.filter((e) => e.status === 'ongoing').length || 0,
      completed: data?.filter((e) => e.status === 'completed').length || 0,
      cancelled: data?.filter((e) => e.status === 'cancelled').length || 0,
    };

    return stats;
  } catch (err) {
    console.error('Error fetching event stats:', err);
    throw err;
  }
};

// Get upcoming events
export const getUpcomingEvents = async (days: number = 30): Promise<CalendarEvent[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('event_date', today)
      .lte('event_date', futureDate)
      .eq('status', 'scheduled')
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching upcoming events:', err);
    throw err;
  }
};
