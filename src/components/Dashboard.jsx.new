import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserGroups, createGroup, joinGroup, subscribeToUserGroups, deleteGroup } from '../services/firestore';
import CalendarView from './CalendarView';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserGroups(currentUser.uid, (userGroups) => {
        setGroups(userGroups);
      });
      
      return unsubscribe;
    }
  }, [currentUser]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    setLoading(true);
    try {
      console.log('Creating group:', { name: newGroupName.trim(), userId: currentUser.uid });
      
      // Check if user is authenticated
      if (!currentUser || !currentUser.uid) {
        throw new Error('User not authenticated');
      }
      
      const groupId = await createGroup(newGroupName.trim(), currentUser.uid);
      console.log('Group created successfully:', groupId);
      
      setNewGroupName('');
      setShowCreateGroup(false);
      // The real-time listener will automatically update the groups list
    } catch (error) {
      console.error('Error creating group:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to create group. ';
      
      if (error.code === 'permission-denied') {
        errorMessage += 'Permission denied. Please check your Firebase security rules.';
      } else if (error.code === 'unavailable') {
        errorMessage += 'Firebase service is unavailable. Please check your connection.';
      } else if (error.message.includes('not authenticated')) {
        errorMessage += 'Please sign in again.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
    setLoading(false);
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinGroupId.trim()) return;
    
    setLoading(true);
    try {
      const success = await joinGroup(joinGroupId.trim(), currentUser.uid);
      if (success) {
        setJoinGroupId('');
        setShowJoinGroup(false);
        // The real-time listener will automatically update the groups list
      } else {
        alert('Group not found. Please check the group ID.');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleDeleteGroup = async (groupId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteGroup(groupId, currentUser.uid);
      // No need to update state, the real-time listener will handle it
    } catch (error) {
      console.error('Error deleting group:', error);
      alert(error.message);
    }
  };

  if (selectedGroup) {
    return (
      <CalendarView 
        group={selectedGroup} 
        onBack={() => setSelectedGroup(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen dark-gradient-bg">
      {/* Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SyncDays
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Welcome, {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white glass-card rounded-lg transition-all duration-300 hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Your Groups</h2>
          
          {/* Action Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Group
            </button>
            <button
              onClick={() => setShowJoinGroup(true)}
              className="flex items-center px-6 py-3 glass-card text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-white/20"
            >
              <Users className="w-5 h-5 mr-2" />
              Join Group
            </button>
          </div>
        </div>

        {/* Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="glass-card rounded-2xl shadow-xl p-6 glass-card-hover transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center mb-3">
                <div 
                  className="flex-1 flex items-center cursor-pointer"
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                </div>
                {group.createdBy === currentUser.uid && (
                  <button
                    onClick={(e) => handleDeleteGroup(group.id, e)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-red-400" />
                  </button>
                )}
              </div>
              <div 
                className="cursor-pointer"
                onClick={() => setSelectedGroup(group)}
              >
                <p className="text-sm text-gray-300 mb-3">
                  {group.members?.length || 0} member(s)
                </p>
                <p className="text-xs text-gray-400">
                  Created by {group.createdBy === currentUser.uid ? 'you' : 'another member'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No groups yet</h3>
            <p className="text-gray-300 mb-4">
              Create your first group or join an existing one to get started
            </p>
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-2 text-white placeholder-gray-400"
                  placeholder="Enter group name"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl disabled:opacity-50 transition-all duration-300"
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 glass-card text-white py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinGroup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Join Existing Group</h3>
            <form onSubmit={handleJoinGroup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group ID
                </label>
                <input
                  type="text"
                  value={joinGroupId}
                  onChange={(e) => setJoinGroupId(e.target.value)}
                  className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-2 text-white placeholder-gray-400"
                  placeholder="Enter group ID"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Ask a group member for the group ID
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl disabled:opacity-50 transition-all duration-300"
                >
                  {loading ? 'Joining...' : 'Join Group'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinGroup(false)}
                  className="flex-1 glass-card text-white py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}