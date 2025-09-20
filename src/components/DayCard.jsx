import React, { useState, useEffect } from 'react';
import { X, Plus, Check, XCircle, HelpCircle, Clock, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateDayStatus, addAppointment, deleteAppointment, editAppointment, setMemberName } from '../services/firestore';
import AppointmentForm from './AppointmentForm';

export default function DayCard({ date, group, appointments = [], dayData = {}, onClose }) {
  const { currentUser } = useAuth();

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [userStatus, setUserStatus] = useState('unknown');
  const [editingAppointment, setEditingAppointment] = useState(null);

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatDateKey = (date) => date.toISOString().split('T')[0];

  const handleStatusChange = async (status) => {
    try {
      const dateKey = formatDateKey(date);
      if (!group?.id || !currentUser?.uid) return;
      await updateDayStatus(group.id, dateKey, currentUser.uid, status);
      setUserStatus(status);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const handleAddAppointment = async (appointmentData) => {
    try {
      const dateKey = formatDateKey(date);
      if (!group?.id || !currentUser?.uid) return;
      await addAppointment(group.id, dateKey, currentUser.uid, appointmentData);
      setShowAppointmentForm(false);
    } catch (error) {
      console.error('Error adding appointment:', error);
      alert('Failed to add appointment. Please try again.');
    }
  };

  const statusOptions = [
    { value: 'free', label: 'Free', icon: Check },
    { value: 'busy', label: 'Busy', icon: XCircle },
    { value: 'unknown', label: 'Unknown', icon: HelpCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white">{formatDate(date)}</h3>
            <p className="text-sm text-gray-300">{group?.name || 'Unknown Group'}</p>
          </div>
          <button onClick={onClose} className="p-2 glass-card rounded-xl hover:bg-white/20 transition-all duration-300">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Status Selection */}
        <div className="p-6 border-b border-white/10">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Your Status</h4>
          <div className="grid grid-cols-3 gap-3">
            {statusOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 ${
                  userStatus === value ? 'border-blue-500 bg-blue-500/20' : 'border-white/20 glass-card hover:bg-white/10'
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

          {!appointments?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">No appointments for this day yet</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment, index) => {
                const startTime = appointment.startTime?.toDate?.() || appointment.startTime;
                const endTime = appointment.endTime?.toDate?.() || appointment.endTime;
                const isOwner = appointment.createdBy === currentUser?.uid;

                return (
                  <div key={appointment.id || index} className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">{appointment.title}</h5>
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
                                if (!group?.id || !currentUser?.uid) return;
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
                      <p className="text-sm text-gray-300 mb-2">{appointment.description}</p>
                    )}
                    {startTime && (
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {startTime instanceof Date ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Invalid time'}
                        {endTime && endTime instanceof Date && (
                          <>
                            <span className="mx-1">-</span>
                            {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            {(group?.members || []).map((memberId, index) => {
              const memberStatus = dayData?.[memberId]?.status || 'unknown';
              let statusColor = 'bg-gray-500';
              let statusLabel = 'Unknown';
              if (memberStatus === 'free') {
                statusColor = 'bg-green-500';
                statusLabel = 'Free';
              } else if (memberStatus === 'busy') {
                statusColor = 'bg-red-500';
                statusLabel = 'Busy';
              }

              const isCurrentUser = memberId === currentUser?.uid;

              return (
                <div key={memberId} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-white">{index + 1}</span>
                    </div>

                    {isCurrentUser ? (
                      <MemberNameEditor
                        groupId={group.id}
                        currentName={group?.memberNames?.[memberId] || ''}
                      />
                    ) : (
                      <span className="text-sm text-gray-300">{group?.memberNames?.[memberId] || `Member ${index + 1}`}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                    <span className="text-xs text-gray-400">{statusLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      {(showAppointmentForm || editingAppointment) && (
        <AppointmentForm
          onSubmit={async (appointmentData) => {
            try {
              if (editingAppointment) {
                if (!group?.id || !currentUser?.uid) return;
                await editAppointment(group.id, formatDateKey(date), currentUser.uid, editingAppointment.id, appointmentData);
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

// ---------------------
// Member Name Inline Editor
// ---------------------
function MemberNameEditor({ groupId, currentName }) {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(currentName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNameInput(currentName);
  }, [currentName]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!groupId || !currentUser?.uid) return;
    const trimmedName = nameInput.trim();
    if (!trimmedName) return;

    setSaving(true);
    try {
      await setMemberName(groupId, currentUser.uid, trimmedName);
      setEditing(false);
    } catch (err) {
      alert('Failed to update name: ' + err.message);
    }
    setSaving(false);
  };

  if (editing) {
    return (
      <form className="ml-2 flex items-center" onSubmit={handleSave}>
        <input
          type="text"
          className="px-2 py-1 text-xs rounded border border-gray-300 mr-2"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          disabled={saving}
          maxLength={32}
          required
        />
        <button
          type="submit"
          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 mr-1"
          disabled={saving}
        >
          Save
        </button>
        <button
          type="button"
          className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
          onClick={() => setEditing(false)}
          disabled={saving}
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <span className="text-sm text-gray-300">
      {currentName} (You)
      <button
        className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setEditing(true)}
      >
        Edit
      </button>
    </span>
  );
}
