import React, { useState } from 'react';
import { X, Plus, Check, XCircle, HelpCircle, Clock, Calendar, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateDayStatus, addAppointment, deleteAppointment, editAppointment } from '../services/firestore';
import AppointmentForm from './AppointmentForm';

export default function DayCard({ date, group, appointments = [], onClose }) {
  const { currentUser } = useAuth();
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [userStatus, setUserStatus] = useState('unknown');
  const [editingAppointment, setEditingAppointment] = useState(null);
  // Remove appointments state - we'll use props from parent

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStatusChange = async (status) => {
    try {
      const dateKey = date.toISOString().split('T')[0];
      console.log('Updating status:', { groupId: group.id, date: dateKey, userId: currentUser.uid, status });
      await updateDayStatus(group.id, dateKey, currentUser.uid, status);
      setUserStatus(status);
      console.log('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const handleAddAppointment = async (appointmentData) => {
    try {
      const dateKey = date.toISOString().split('T')[0];
      await addAppointment(group.id, dateKey, currentUser.uid, appointmentData);
      setShowAppointmentForm(false);
      // The real-time listener will update the appointments
    } catch (error) {
      console.error('Error adding appointment:', error);
      alert('Failed to add appointment. Please try again.');
    }
  };

  const statusOptions = [
    { value: 'free', label: 'Free', icon: Check, color: 'text-green-600 bg-green-100' },
    { value: 'busy', label: 'Busy', icon: XCircle, color: 'text-red-600 bg-red-100' },
    { value: 'unknown', label: 'Unknown', icon: HelpCircle, color: 'text-gray-600 bg-gray-100' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {formatDate(date)}
            </h3>
            <p className="text-sm text-gray-300">{group.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass-card rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Status Selection */}
        <div className="p-6 border-b border-white/10">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Your Status</h4>
          <div className="grid grid-cols-3 gap-3">
            {statusOptions.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 ${
                  userStatus === value
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/20 glass-card hover:bg-white/10'
                }`}
              >
                <div className={`p-2 rounded-full mb-2 ${
                  value === 'free' ? 'bg-green-500/20 text-green-400' :
                  value === 'busy' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-white">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Appointments */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-300">Appointments</h4>
            <button
              onClick={() => setShowAppointmentForm(true)}
              className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </button>
          </div>
          
          {!appointments || appointments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No appointments for this day yet
            </p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment, index) => {
                // Convert Firestore Timestamp to JS Date if needed
                const startTime = appointment.startTime?.toDate?.() || appointment.startTime;
                const endTime = appointment.endTime?.toDate?.() || appointment.endTime;
                const isOwner = appointment.createdBy === currentUser.uid;
                
                return (
                  <div key={appointment.id || index} className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">
                        {appointment.title}
                      </h5>
                      {isOwner && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingAppointment(appointment)}
                            className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                          >
                            <Edit3 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this appointment?')) {
                                try {
                                  await deleteAppointment(group.id, formatDateKey(date), currentUser.uid, appointment.id);
                                } catch (error) {
                                  console.error('Error deleting appointment:', error);
                                  alert(error.message);
                                }
                              }
                            }}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                    {appointment.description && (
                      <p className="text-sm text-gray-300 mb-2">
                        {appointment.description}
                      </p>
                    )}
                    {startTime && (
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {startTime instanceof Date ? startTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Invalid time'}
                        {endTime && endTime instanceof Date && (
                          <>
                            <span className="mx-1">-</span>
                            {endTime.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Group Members Status */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Group Status</h4>
          <div className="space-y-2">
            {group.members?.map((memberId, index) => (
              <div key={memberId} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-white">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300">
                    Member {index + 1}
                    {memberId === currentUser.uid && ' (You)'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">Unknown</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      {(showAppointmentForm || editingAppointment) && (
        <AppointmentForm
          onSubmit={async (appointmentData) => {
            try {
              if (editingAppointment) {
                await editAppointment(
                  group.id,
                  formatDateKey(date),
                  currentUser.uid,
                  editingAppointment.id,
                  appointmentData
                );
                setEditingAppointment(null);
              } else {
                await handleAddAppointment(appointmentData);
                setShowAppointmentForm(false);
              }
            } catch (error) {
              console.error('Error saving appointment:', error);
              alert(error.message);
            }
          }}
          onCancel={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(null);
          }}
          initialData={editingAppointment}
          date={date}
          isEditing={!!editingAppointment}
        />
      )}
    </div>
  );
}
