import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

export default function AppointmentForm({ onSubmit, onCancel, date, initialData = null, isEditing = false }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startTime, setStartTime] = useState(() => {
    if (initialData?.startTime) {
      const time = initialData.startTime instanceof Date ? initialData.startTime : initialData.startTime.toDate();
      return time.toTimeString().slice(0, 5);
    }
    return '';
  });
  const [endTime, setEndTime] = useState(() => {
    if (initialData?.endTime) {
      const time = initialData.endTime instanceof Date ? initialData.endTime : initialData.endTime.toDate();
      return time.toTimeString().slice(0, 5);
    }
    return '';
  });
  const [allDay, setAllDay] = useState(initialData?.allDay || false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title for the appointment');
      return;
    }

    const appointmentData = {
      title: title.trim(),
      description: description.trim() || null,
      allDay: allDay,
      startTime: allDay ? null : (startTime ? new Date(`${date.toISOString().split('T')[0]}T${startTime}`) : null),
      endTime: allDay ? null : (endTime ? new Date(`${date.toISOString().split('T')[0]}T${endTime}`) : null),
      createdAt: new Date()
    };

    onSubmit(appointmentData);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              {isEditing ? 'Edit Appointment' : 'Add Appointment'}
            </h3>
            <p className="text-sm text-gray-300 flex items-center mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(date)}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 glass-card rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-2 text-white placeholder-gray-400"
              placeholder="Enter appointment title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-2 text-white placeholder-gray-400"
              placeholder="Enter description or notes"
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 rounded bg-transparent"
            />
            <label htmlFor="allDay" className="ml-2 block text-sm text-gray-300">
              All day
            </label>
          </div>

          {/* Time Selection */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-2 text-white"
                  />
                  <Clock className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  End Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-2 text-white"
                  />
                  <Clock className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              {isEditing ? 'Save Changes' : 'Add Appointment'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 glass-card text-white py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
