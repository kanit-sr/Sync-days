import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { subscribeToGroupDays } from '../services/firestore';
import DayCard from './DayCard';

export default function CalendarView({ group, onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysData, setDaysData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToGroupDays(group.id, (days) => {
      setDaysData(days);
    });
    
    return unsubscribe;
  }, [group.id]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayStatus = (date) => {
    const dateKey = formatDateKey(date);
    const dayData = daysData[dateKey];
    
    if (!dayData) return 'unknown';
    
    // For demo purposes, we'll show the current user's status
    // In a real app, you'd want to show statuses for all group members
    const userStatuses = Object.entries(dayData)
      .filter(([key, item]) => {
        // Skip non-user fields like lastUpdated
        if (key === 'lastUpdated') return false;
        // Ensure item is a valid object with a status
        return typeof item === 'object' && item !== null && typeof item.status === 'string';
      })
      .map(([_, item]) => item.status);
    
    if (userStatuses.length === 0) return 'unknown';
    
    // Return the most common status or a summary
    const freeCount = userStatuses.filter(s => s === 'free').length;
    const busyCount = userStatuses.filter(s => s === 'busy').length;
    
    console.debug('getDayStatus:', {
      dateKey,
      userStatuses,
      freeCount,
      busyCount
    });
    
    if (freeCount > busyCount) return 'free';
    if (busyCount > freeCount) return 'busy';
    return 'mixed';
  };

  const getAppointmentsForDay = (date) => {
    const dateKey = formatDateKey(date);
    const dayData = daysData[dateKey];
    
    if (!dayData) return [];
    
    const appointments = [];
    Object.entries(dayData).forEach(([userId, item]) => {
      // Skip lastUpdated and other non-user fields
      if (userId === 'lastUpdated') return;
      
      // Ensure item is an object with appointments array
      if (typeof item === 'object' && item !== null && Array.isArray(item.appointments)) {
        appointments.push(...item.appointments);
      } else if (typeof item === 'object' && item !== null && item.appointments) {
        // Handle case where appointments might be a single object
        appointments.push(item.appointments);
      }
    });
    
    console.debug('getAppointmentsForDay:', {
      dateKey,
      dayData,
      appointments
    });
    
    return appointments;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen dark-gradient-bg">
      {/* Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-300 hover:text-white mr-4 glass-card px-4 py-2 rounded-xl transition-all duration-300 hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Groups
              </button>
              <h1 className="text-2xl font-bold text-white">{group.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-3 glass-card rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-lg font-semibold text-white min-w-[150px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-3 glass-card rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {dayNames.map(day => (
              <div key={day} className="p-4 text-center font-semibold text-gray-300 bg-white/5">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-24 border-r border-b border-white/10"></div>;
              }
              
              const status = getDayStatus(day);
              const appointments = getAppointmentsForDay(day);
              const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
              
              return (
                <div
                  key={day.toISOString()}
                  className={`h-24 border-r border-b border-white/10 cursor-pointer calendar-day ${
                    isSelected ? 'bg-blue-500/20' : 'hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="p-2 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        isToday(day) ? 'text-blue-400 font-bold' : 'text-white'
                      }`}>
                        {day.getDate()}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'free' ? 'bg-green-500' :
                        status === 'busy' ? 'bg-red-500' :
                        status === 'mixed' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {appointments.length > 0 && (
                        <div className="text-xs text-gray-400">
                          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayCard
          date={selectedDate}
          group={group}
          appointments={getAppointmentsForDay(selectedDate) || []}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
