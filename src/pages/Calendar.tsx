import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'event';
  project: string;
  attendees: number;
}

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState('2024-06');
  
  const [events] = useState<Event[]>([
    { id: 'E001', title: 'Project Review Meeting', date: '2024-06-20', time: '10:00 AM', type: 'meeting', project: 'Community Center', attendees: 8 },
    { id: 'E002', title: 'Budget Submission Deadline', date: '2024-06-22', time: '05:00 PM', type: 'deadline', project: 'Education Drive', attendees: 0 },
    { id: 'E003', title: 'Health Camp Event', date: '2024-06-25', time: '09:00 AM', type: 'event', project: 'Health Camp', attendees: 45 },
    { id: 'E004', title: 'Stakeholder Presentation', date: '2024-06-28', time: '02:00 PM', type: 'meeting', project: 'Clean Water', attendees: 12 },
  ]);

  const stats = [
    { label: 'Total Events', value: events.length },
    { label: 'Meetings', value: events.filter(e => e.type === 'meeting').length },
    { label: 'Deadlines', value: events.filter(e => e.type === 'deadline').length },
    { label: 'Events', value: events.filter(e => e.type === 'event').length },
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'border-l-4 border-l-emerald-500 bg-emerald-50';
      case 'deadline': return 'border-l-4 border-l-red-500 bg-red-50';
      case 'event': return 'border-l-4 border-l-blue-500 bg-blue-50';
      default: return 'border-l-4 border-l-gray-500 bg-gray-50';
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
        {stats.map((stat, index) => (
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

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className={`bg-white rounded-2xl p-6 shadow-sm ${getEventColor(event.type)} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <CalendarIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.type === 'meeting' ? 'bg-emerald-100 text-emerald-700' :
                      event.type === 'deadline' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {event.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Project: {event.project}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    {event.attendees > 0 && (
                      <>
                        <span>•</span>
                        <span>{event.attendees} attendees</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-4 py-2 rounded-lg transition-colors">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
