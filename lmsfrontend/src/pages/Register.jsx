import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, ShieldCheck, BookOpen, GraduationCap, NotebookPen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', accessCode: '' });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
           const expectedCode = formData.role === 'teacher' ? 'baby143' : 'niha143';
           if ((formData.accessCode || '').trim() !== expectedCode) {
               alert('Invalid code for selected role.');
               return;
           }

           const result = await register(formData.name, formData.email, formData.password, formData.role, formData.accessCode);
           if (result.success) {
             navigate('/dashboard'); // redirect to a generic dashboard
        } else {
               alert(result.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-slate-950 p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(79,70,229,0.35),transparent_45%),radial-gradient(circle_at_82%_28%,rgba(6,182,212,0.25),transparent_40%),radial-gradient(circle_at_54%_85%,rgba(217,70,239,0.22),transparent_45%)]" />

            <motion.div
                className="absolute left-[12%] top-[16%] w-24 h-24 rounded-2xl border border-indigo-300/30 bg-indigo-400/10 backdrop-blur-sm flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ y: [0, -16, 0], rotateY: [0, 22, 0], rotateX: [0, 10, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <BookOpen className="w-10 h-10 text-indigo-200" />
            </motion.div>

            <motion.div
                className="absolute right-[10%] top-[12%] w-28 h-28 rounded-full border border-cyan-300/30 bg-cyan-400/10 backdrop-blur-sm flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ y: [0, 20, 0], rotateY: [0, -26, 0], rotateX: [0, -12, 0] }}
                transition={{ duration: 7.4, repeat: Infinity, ease: 'easeInOut' }}
            >
                <GraduationCap className="w-11 h-11 text-cyan-200" />
            </motion.div>

            <motion.div
                className="absolute left-[22%] bottom-[10%] w-20 h-20 rounded-xl border border-violet-300/30 bg-violet-400/10 backdrop-blur-sm flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ y: [0, -18, 0], rotateY: [0, 30, 0], rotateZ: [0, 8, 0] }}
                transition={{ duration: 6.9, repeat: Infinity, ease: 'easeInOut' }}
            >
                <NotebookPen className="w-9 h-9 text-violet-200" />
            </motion.div>

            <motion.div
                className="absolute right-[18%] bottom-[12%] w-36 h-24 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ y: [0, 14, 0], rotateY: [0, -20, 0], rotateX: [0, 10, 0] }}
                transition={{ duration: 8.2, repeat: Infinity, ease: 'easeInOut' }}
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
                        <UserPlus className="text-white w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
                    <p className="text-slate-500 mt-2">Join our learning platform</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input 
                                type="text" 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                placeholder="Your full name"
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input 
                                type="email" 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
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
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                placeholder="••••••••"
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">User Role</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <select 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {formData.role === 'teacher' ? 'Teacher Code' : 'Student Code'}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                placeholder={formData.role === 'teacher' ? 'Enter teacher code' : 'Enter student code'}
                                value={formData.accessCode}
                                onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all mt-4 active:scale-[0.98]"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-600">
                    Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login</Link>
                </p>
            </motion.div>
            </div>
        </div>
    );
};

export default Register;
