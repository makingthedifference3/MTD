import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Clock } from 'lucide-react';
import { getAllCalendarEvents, getEventStats, type CalendarEvent, type EventStats } from '@/services/calendarEventsService';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState('2024-06');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch calendar events and stats on component mount and when date changes
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all events
        const allEvents = await getAllCalendarEvents();
        
        // Filter events by selected month and year
        const [year, month] = selectedDate.split('-');
        const filteredEvents = allEvents.filter((event) => {
          const eventDate = new Date(event.event_date || '');
          return (
            eventDate.getFullYear() === parseInt(year) &&
            eventDate.getMonth() === parseInt(month) - 1
          );
        });

        setEvents(filteredEvents);

        // Get event statistics
        const eventStats = await getEventStats();
        setStats(eventStats);
      } catch (err) {
        console.error('Error fetching calendar data:', err);
        setError('Failed to load calendar events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [selectedDate]);

  const statsDisplay = [
    { label: 'Total Events', value: stats?.total || 0 },
    { label: 'Meetings', value: stats?.meetings || 0 },
    { label: 'Scheduled', value: stats?.scheduled || 0 },
    { label: 'Completed', value: stats?.completed || 0 },
  ];


  // Map event type to color scheme
  const getEventTypeColor = (eventType?: string) => {
    switch (eventType?.toLowerCase()) {
      case 'meeting':
        return 'border-l-4 border-l-emerald-500 bg-emerald-50';
      case 'training':
        return 'border-l-4 border-l-blue-500 bg-blue-50';
      case 'workshop':
        return 'border-l-4 border-l-purple-500 bg-purple-50';
      case 'review':
        return 'border-l-4 border-l-orange-500 bg-orange-50';
      case 'field visit':
        return 'border-l-4 border-l-green-500 bg-green-50';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50';
    }
  };

  // Map event type to badge color
  const getEventTypeBadgeColor = (eventType?: string) => {
    switch (eventType?.toLowerCase()) {
      case 'meeting':
        return 'bg-emerald-100 text-emerald-700';
      case 'training':
        return 'bg-blue-100 text-blue-700';
      case 'workshop':
        return 'bg-purple-100 text-purple-700';
      case 'review':
        return 'bg-orange-100 text-orange-700';
      case 'field visit':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format time from 24-hour format HH:MM to 12-hour format
  const formatTime = (time?: string): string => {
    if (!time) return 'N/A';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-2">Manage events, meetings, and deadlines</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statsDisplay.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Month Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
      >
        <input
          type="month"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <p className="text-gray-600 mt-4">Loading calendar events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Events List */}
      {!loading && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-gray-600">No events scheduled for this month</p>
            </div>
          ) : (
            events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className={`bg-white rounded-2xl p-6 shadow-sm ${getEventTypeColor(event.event_type)} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <CalendarIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                        {event.event_type && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeBadgeColor(event.event_type)}`}>
                            {event.event_type.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{event.event_date || 'N/A'}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {event.start_time ? formatTime(event.start_time) : 'N/A'}
                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                          </span>
                        </div>
                        {event.expected_attendees && event.expected_attendees > 0 && (
                          <>
                            <span>•</span>
                            <span>{event.expected_attendees} expected attendees</span>
                          </>
                        )}
                        {event.status && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-gray-700">
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </>
                        )}
                      </div>
                      {event.location && (
                        <p className="text-sm text-gray-600 mt-2">Location: {event.location}</p>
                      )}
                    </div>
                  </div>
                  <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-4 py-2 rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;
