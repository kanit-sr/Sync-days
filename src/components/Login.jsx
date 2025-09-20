import React from 'react';
import { LogIn, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen dark-gradient-bg flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="glass-card rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              SyncDays
            </h1>
            <p className="text-gray-300">Calendar sync for groups</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-2"
            >
              <LogIn className="w-5 h-5 mr-3" />
              Sign in with Google
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Sign in to start syncing your calendar with friends and groups
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
