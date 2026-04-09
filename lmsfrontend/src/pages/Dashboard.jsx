import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, Moon, Sun, User as UserIcon } from 'lucide-react';
import StudentDashboard from '../components/StudentDashboard';
import TeacherDashboard from '../components/TeacherDashboard';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(() => localStorage.getItem('dashboardTheme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('dashboardTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-10 font-sans transition-colors ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Profile Area */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}
        >
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <UserIcon className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                Welcome back, <span className="text-indigo-600 inline-block">{user.name}</span>!
              </h1>
              <p className={`font-medium mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                You are logged in as a <span className="uppercase font-bold text-indigo-500">{user.role}</span> &bull; {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border shadow-sm ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-indigo-200 border-slate-600' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'}`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors border border-rose-200 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.1 }}
        >
          {user.role === 'teacher' ? (
            <TeacherDashboard theme={theme} />
          ) : (
            <StudentDashboard theme={theme} />
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
