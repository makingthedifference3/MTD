import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { tasks } from '../mockData';

interface TaskWithDueDate {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  assignedBy: string;
  dueDay: number;
}

const CalendarPage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth] = useState('November 2025');

  // Convert tasks to include due day
  const tasksWithDueDates: TaskWithDueDate[] = tasks.map(task => ({
    ...task,
    dueDay: new Date(task.dueDate).getDate()
  }));

  // Highlighted due dates from wireframe
  const highlightedDueDates = [10, 12];

  // Get tasks for a specific day
  const getTasksForDay = (day: number) => {
    return tasksWithDueDates.filter(task => task.dueDay === day);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500 text-white';
      case 'In Progress': return 'bg-amber-500 text-white';
      case 'Not Started': return 'bg-cyan-500 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500 text-white';
      case 'In Progress': return 'bg-amber-500 text-white';
      case 'Not Started': return 'bg-cyan-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-2">Track tasks and deadlines</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'calendar' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Task List</h2>
          <div className="space-y-4">
            {tasksWithDueDates.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-3">{task.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white">
                        DUE DATE: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                        {task.status.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700">
                        ASSIGN BY: {task.assignedBy}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Task List Above Calendar */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
              Upcoming Tasks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasksWithDueDates.slice(0, 4).map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">{task.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white">
                      DUE DATE
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                      {task.status === 'In Progress' ? 'INPROGRESS' : task.status.replace(' ', '').toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700">
                      ASSIGN BY
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {new Date(task.dueDate).toLocaleDateString()} • {task.assignedBy}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h3 className="text-2xl font-bold text-gray-900">{currentMonth}</h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-bold text-gray-700 py-3 text-sm">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const dayTasks = getTasksForDay(day);
                const isHighlighted = highlightedDueDates.includes(day);
                
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: day * 0.01 }}
                    className={`aspect-square border-2 rounded-xl p-2 hover:shadow-md cursor-pointer transition-all ${
                      isHighlighted 
                        ? 'border-red-500 bg-red-50' 
                        : dayTasks.length > 0 
                          ? 'border-emerald-300 bg-emerald-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {/* Day Number with Red Circle for Highlighted Dates */}
                    <div className="flex items-center justify-center mb-1">
                      {isHighlighted ? (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{day}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">{day}</span>
                      )}
                    </div>

                    {/* Task Indicators */}
                    {dayTasks.length > 0 && (
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div 
                            key={task.id}
                            className={`text-xs px-1 py-0.5 rounded text-center font-medium ${getStatusColor(task.status)}`}
                            title={task.title}
                          >
                            {task.status === 'In Progress' ? 'IP' : task.status === 'Completed' ? 'C' : 'NS'}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-emerald-600 font-medium text-center">
                            +{dayTasks.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Due Date Highlighted (10, 12)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-emerald-500 rounded-sm mr-2"></div>
                <span className="text-gray-700">Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-amber-500 rounded-sm mr-2"></div>
                <span className="text-gray-700">In Progress</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-cyan-500 rounded-sm mr-2"></div>
                <span className="text-gray-700">Not Started</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
