import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { subscribeToGroupDays } from '../services/firestore';
import DayCard from './DayCard';

export default function CalendarView({ group, onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysData, setDaysData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (!group?.id) return;
    const unsubscribe = subscribeToGroupDays(group.id, (days) => {
      setDaysData(days);
    });
    return unsubscribe;
  }, [group?.id]);

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        No group selected
      </div>
    );
  }

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
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const formatDateKey = (date) => date.toISOString().split('T')[0];

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => date?.toDateString() === new Date().toDateString();

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

      {/* Today Status Box */}
      <div className="max-w-3xl mx-auto p-4 mb-6 glass-card rounded-xl shadow-lg">
        <h2 className="text-white font-semibold text-lg mb-2">
          Today: {new Date().toDateString()}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(group.members || []).map((memberId, idx) => {
            const memberName = group?.memberNames?.[memberId] || `M${idx + 1}`;
            const memberData = daysData[formatDateKey(new Date())]?.[memberId] || {};
            const status = memberData?.status || 'unknown';
            const appointments = memberData?.appointments || [];

            const statusColor =
              status === 'free' ? 'bg-green-500' :
              status === 'busy' ? 'bg-red-500' :
              'bg-gray-400';

            return (
              <div key={memberId} className="flex items-center justify-between p-2 bg-white/5 rounded-md">
                <span className="text-white font-medium truncate max-w-[70px]">{memberName}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor}`} title={status}></div>
                  {appointments.length > 0 && (
                    <span className="text-xs text-gray-300">
                      {appointments.length} appt{appointments.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
            {days.map((day, idx) => {
              if (!day) return <div key={idx} className="h-24 border-r border-b border-white/10"></div>;

              const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
              const dayData = daysData[formatDateKey(day)] || {};

              // Determine highlight color
              const statuses = Object.values(dayData).map(d => d?.status).filter(Boolean);
              let dayHighlight = '';
              if (statuses.length > 0) {
                const allFree = statuses.every(s => s === 'free');
                const allBusy = statuses.every(s => s === 'busy');
                if (allFree) dayHighlight = 'bg-green-500/10';
                else if (allBusy) dayHighlight = 'bg-red-500/10';
                else dayHighlight = 'bg-yellow-500/10'; // contrast/mixed
              }

              return (
                <div
                  key={day.toISOString()}
                  className={`h-24 border-r border-b border-white/10 cursor-pointer calendar-day ${
                    isSelected ? 'bg-blue-500/20' : isToday(day) ? 'bg-blue-500/10' : dayHighlight ? dayHighlight : 'hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="p-2">
                    <div className="text-gray-300 font-medium">{day.getDate()}</div>
                    <div className="mt-1">
                      {Object.entries(dayData).map(([memberId, data]) =>
                        (data?.appointments || []).map((apt, i) => (
                          <div key={`${memberId}-${i}`} className="text-xs text-gray-400 truncate">
                            {apt?.title || 'Appointment'}
                          </div>
                        ))
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
          appointments={Object.values(daysData[formatDateKey(selectedDate)] || {})
            .flatMap(item => item?.appointments || [])}
          dayData={daysData[formatDateKey(selectedDate)] || {}}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
