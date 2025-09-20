import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, LogOut, X, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserGroups, createGroup, joinGroup, deleteGroup } from '../services/firestore';
import CalendarView from './CalendarView';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserGroups(currentUser.uid, setGroups);
      return unsubscribe;
    }
  }, [currentUser]);

  useEffect(() => {
    const seen = localStorage.getItem('seenInstructions');
    if (seen) setShowInstructions(false);
  }, []);

  const closeInstructions = () => {
    localStorage.setItem('seenInstructions', 'true');
    setShowInstructions(false);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setLoading(true);
    try {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      await createGroup(newGroupName.trim(), currentUser.uid);
      setNewGroupName('');
      setShowCreateGroup(false);
    } catch (error) {
      alert(`Failed to create group: ${error.message}`);
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
      }
    } catch (error) {
      alert(error.message || 'Failed to join group');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGroup = async (groupId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await deleteGroup(groupId, currentUser.uid);
    } catch (error) {
      alert(error.message);
    }
  };

  if (selectedGroup) return <CalendarView group={selectedGroup} onBack={() => setSelectedGroup(null)} />;

  return (
    <div className="min-h-screen bg-gray-950 relative text-gray-200">
      {/* Header */}
      <header className="glass-card backdrop-blur-xl shadow-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              SyncDays
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              Welcome, {currentUser.displayName || currentUser.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-white/20 transition duration-300"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Pop-up Instructions */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 rounded-3xl shadow-2xl max-w-lg relative">
            <button
              onClick={closeInstructions}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
              <Info className="w-5 h-5" /> Welcome / คู่มือสำหรับผู้เริ่มต้น
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
              <li>🟢 Free / ว่าง = You can meet this person / คุณสามารถนัดสมาชิกนี้ได้</li>
              <li>🔴 Busy / ไม่ว่าง = This person is busy / สมาชิกนี้ไม่ว่าง</li>
              <li>🟡 Mixed / ผสม = Some members are free, some are busy / สมาชิกบางคนว่าง บางคนไม่ว่าง</li>
              <li>Click on a group to open its calendar / คลิกที่กลุ่มเพื่อดูปฏิทิน</li>
              <li>Hover over a day to see events / เลื่อนเมาส์บนวันเพื่อดูนัดหมาย</li>
              <li>Click on a day to see details / คลิกที่วันเพื่อดูรายละเอียด</li>
              <li>Use the buttons above to create or join a group / ใช้ปุ่มด้านบนเพื่อสร้างหรือเข้าร่วมกลุ่ม</li>
            </ul>
            <button
              onClick={closeInstructions}
              className="mt-6 w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 transition"
            >
              Got it / เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      {/* Persistent Intro Box */}
      <div className="max-w-3xl mx-auto p-5 mb-6 bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-3">How to Use SyncDays / วิธีใช้ SyncDays</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
          <li>🟢 Green = Member is <span className="text-green-400 font-medium">free</span> / สมาชิกว่าง</li>
          <li>🔴 Red = Member is <span className="text-red-400 font-medium">busy</span> / สมาชิกไม่ว่าง</li>
          <li>🟡 Yellow = Mixed statuses (some free, some busy) / บางคนว่าง บางคนไม่ว่าง</li>
          <li>Click a group to open its calendar / คลิกที่กลุ่มเพื่อเปิดปฏิทิน</li>
          <li>Hover over a day to see events / เลื่อนเมาส์บนวันเพื่อดูนัดหมาย</li>
          <li>Click a day to see details / คลิกที่วันเพื่อดูรายละเอียด</li>
          <li>Use the buttons above to create or join a group / ใช้ปุ่มด้านบนเพื่อสร้างหรือเข้าร่วมกลุ่ม</li>
        </ul>
      </div>

      {/* Main Content */}
  <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Your Groups / กลุ่มของคุณ</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-700 shadow-lg hover:scale-105 transform transition"
            >
              <Plus className="w-5 h-5" /> Create / สร้าง
            </button>
            <button
              onClick={() => setShowJoinGroup(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-700/60 backdrop-blur-md shadow-lg hover:scale-105 transform transition"
            >
              <Users className="w-5 h-5" /> Join / เข้าร่วม
            </button>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className="bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl shadow-xl cursor-pointer hover:scale-105 transform transition border border-white/10 group-card"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-lg text-white">{group.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(group.id);
                    }}
                    title="Copy Group ID"
                    className="p-2 bg-blue-700/20 hover:bg-blue-700/40 rounded-lg transition text-blue-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" stroke="currentColor" fill="none"/><rect x="3" y="3" width="13" height="13" rx="2" strokeWidth="2" stroke="currentColor" fill="none"/></svg>
                  </button>
                  {group.createdBy === currentUser.uid && (
                    <button
                      onClick={(e) => handleDeleteGroup(group.id, e)}
                      className="p-2 hover:bg-red-500/30 rounded-lg transition"
                    >
                      <X className="w-5 h-5 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-300 text-sm"><Users className="inline w-4 h-4 mr-1" /> {group.members?.length || 0} member(s) / สมาชิก</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Group ID: <span className="font-mono text-blue-300">{group.id}</span></span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Create New Group / สร้างกลุ่มใหม่</h3>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full mb-4 px-4 py-3 rounded-xl bg-gray-800/50 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
                placeholder="Enter group name / ใส่ชื่อกลุ่ม"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 transition"
                >
                  {loading ? 'Creating...' : 'Create Group / สร้าง'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-700/50 hover:bg-gray-700/70 transition"
                >
                  Cancel / ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinGroup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Join Existing Group / เข้าร่วมกลุ่ม</h3>
            <form onSubmit={handleJoinGroup}>
              <input
                type="text"
                value={joinGroupId}
                onChange={(e) => setJoinGroupId(e.target.value)}
                className="w-full mb-4 px-4 py-3 rounded-xl bg-gray-800/50 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
                placeholder="Enter group ID / ใส่รหัสกลุ่ม"
                required
              />
              <p className="text-xs text-gray-400 mb-4">Ask a member for the group ID / ถามสมาชิกในกลุ่มสำหรับรหัส</p>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 transition"
                >
                  {loading ? 'Joining...' : 'Join Group / เข้าร่วม'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinGroup(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-700/50 hover:bg-gray-700/70 transition"
                >
                  Cancel / ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
