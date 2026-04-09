import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, MessageSquare } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import PublicChatbot from './components/PublicChatbot';

const LandingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.40),transparent_42%),radial-gradient(circle_at_80%_18%,rgba(6,182,212,0.30),transparent_38%),radial-gradient(circle_at_55%_78%,rgba(217,70,239,0.24),transparent_42%)]" />

      <motion.div
        className="absolute -left-16 top-28 h-64 w-64 rounded-full bg-indigo-500/20 blur-2xl"
        animate={{ y: [0, 28, 0], x: [0, 14, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-36 h-72 w-72 rounded-full bg-cyan-400/20 blur-2xl"
        animate={{ y: [0, -30, 0], x: [0, -16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[35%] bottom-0 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-2xl"
        animate={{ y: [0, -18, 0], x: [0, 12, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <nav className="p-6 flex justify-between items-center bg-white/10 backdrop-blur-md sticky top-0 z-50 border-b border-white/15">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-indigo-300 w-8 h-8" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-cyan-200">
            LMS Pro
          </span>
        </div>
        <div className="flex gap-4 text-center items-center">
          <Link to="/login" className="px-5 py-2 text-indigo-100 font-medium hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="px-5 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-400 shadow-lg shadow-indigo-900/30 transition-all active:scale-95">
            Register
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="inline-flex items-center px-3 py-1 rounded-full border border-white/25 bg-white/10 text-sm font-semibold text-indigo-100 mb-6">
              Future-ready digital campus
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Learn, Track, and Grow
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-fuchsia-200">With a 3D Learning Experience</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100/90 mb-10 max-w-2xl leading-relaxed">
              Organize classes, manage assignments, monitor performance, and keep conversations active in one immersive LMS platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-indigo-500 text-white rounded-xl text-lg font-semibold hover:bg-indigo-400 shadow-xl shadow-indigo-900/30 transition-all hover:translate-y-[-2px]">
                Get Started Free
              </Link>
              <Link to="/login" className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl text-lg font-semibold hover:bg-white/15 transition-all">
                Sign In
              </Link>
            </div>
          </motion.div>

          <div className="relative h-[420px] md:h-[480px]" style={{ perspective: '1200px' }}>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0, rotateY: [-8, -2, -8], rotateX: [4, 0, 4] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-4 left-4 right-16 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-6 shadow-2xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-cyan-400/20 border border-cyan-200/30">
                  <BookOpen className="w-5 h-5 text-cyan-100" />
                </div>
                <p className="font-bold text-cyan-100">Course Progress</p>
              </div>
              <p className="text-sm text-indigo-100">AI & Data Structures</p>
              <div className="mt-3 h-2 w-full rounded-full bg-white/20">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-indigo-300"
                  initial={{ width: '20%' }}
                  animate={{ width: ['20%', '78%', '20%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, rotateY: [6, 0, 6], rotateX: [-4, 0, -4] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-40 left-16 right-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-6 shadow-2xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-violet-400/20 border border-violet-200/30">
                  <Users className="w-5 h-5 text-violet-100" />
                </div>
                <p className="font-bold text-violet-100">Class Activity</p>
              </div>
              <p className="text-sm text-indigo-100">28 students active today</p>
              <p className="text-sm text-indigo-100 mt-1">12 assignment submissions pending review</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, rotateY: [-5, 3, -5] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute bottom-4 left-8 w-56 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg p-5 shadow-2xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-emerald-200" />
                <p className="text-sm font-bold text-emerald-100">Live Chat</p>
              </div>
              <p className="text-xs text-indigo-100">Teacher: Exam starts Monday at 10 AM.</p>
            </motion.div>
          </div>
        </div>
      </main>
      <PublicChatbot />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
