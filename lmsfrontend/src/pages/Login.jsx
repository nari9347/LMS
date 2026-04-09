import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, BookOpen, GraduationCap, NotebookPen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData.email?.trim(), formData.password);
        if (result.success) {
             navigate('/dashboard'); // redirect to a generic dashboard
        } else {
               alert(result.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-slate-950 p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.35),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.25),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.22),transparent_45%)]" />

            <motion.div
                className="absolute left-[10%] top-[18%] w-24 h-24 rounded-2xl border border-indigo-300/30 bg-indigo-400/10 backdrop-blur-sm flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ y: [0, -16, 0], rotateY: [0, 20, 0], rotateX: [0, 12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
                <BookOpen className="w-10 h-10 text-indigo-200" />
            </motion.div>

            <motion.div
                className="absolute right-[12%] top-[14%] w-28 h-28 rounded-full border border-sky-300/30 bg-sky-400/10 backdrop-blur-sm flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ y: [0, 20, 0], rotateY: [0, -28, 0], rotateX: [0, -10, 0] }}
                transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <GraduationCap className="w-11 h-11 text-sky-200" />
            </motion.div>

            <motion.div
                className="absolute left-[20%] bottom-[12%] w-20 h-20 rounded-xl border border-violet-300/30 bg-violet-400/10 backdrop-blur-sm flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ y: [0, -18, 0], rotateY: [0, 32, 0], rotateZ: [0, 8, 0] }}
                transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
            >
                <NotebookPen className="w-9 h-9 text-violet-200" />
            </motion.div>

            <motion.div
                className="absolute right-[18%] bottom-[10%] w-36 h-24 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ y: [0, 14, 0], rotateY: [0, -18, 0], rotateX: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 w-full max-w-md" style={{ perspective: '1200px' }}>
                <motion.div
                    className="absolute -inset-3 rounded-[28px] border border-indigo-300/20 bg-indigo-400/10 blur-md"
                    animate={{ y: [0, 8, 0], rotateY: [0, 6, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -inset-1 rounded-[24px] border border-cyan-200/25 bg-white/10"
                    animate={{ y: [0, -6, 0], rotateY: [0, -5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, rotateX: 8 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    whileHover={{ rotateX: 2, rotateY: -2 }}
                    transition={{ duration: 0.5 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="relative bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full border border-slate-100"
                >
                <div className="text-center mb-10">
                    <div className="flex justify-start mb-4">
                        <Link
                            to="/"
                            className="px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                            Go Home
                        </Link>
                    </div>
                    <div className="bg-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
                        <LogIn className="text-white w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Welcome Back</h2>
                    <p className="text-slate-500 mt-2">Sign in to continue your learning</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input 
                                type="email" 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                placeholder="name@company.com"
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input 
                                type="password" 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-600">
                    Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Register now</Link>
                </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
